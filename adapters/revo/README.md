# revo Import Spec

This adapter defines how the future revo agent-orchestrator imports the
canonical Revisium Agent Playbook.

The importer must use machine-readable playbook metadata for discovery. Markdown
files remain source material for prompts and human review; they are not the
catalog contract.

## Package Coordinates

- canonical repository: `revisium/agent-playbook`
- package name: `@revisium/agent-playbook`
- manifest path: `playbook.json`
- catalog paths are declared by `playbook.json.catalogs`

## Import Command

Target command:

```bash
revo playbook install revisium/agent-playbook
```

Package-based installation may use:

```bash
revo playbook install @revisium/agent-playbook
```

The installer resolves the source, reads `playbook.json`, validates the declared
catalogs, and stores a versioned playbook snapshot in the control plane.

## Source Of Truth

The importer reads these files for discovery:

1. `playbook.json`
2. `catalog/roles.json`
3. `catalog/pipelines.json`

The importer must not discover roles or pipelines by scanning `roles/`,
`pipelines/`, adapter wrappers, or markdown headings. Those files may be opened
only after catalog validation, for prompt composition or source display.

The installed playbook snapshot owns available roles, pipelines, pipeline role
sets, route gates, execution policy defaults, and production role `runner_id`
bindings. Runtime or test execution profiles may narrow availability or override
runner ids for a run, but they must not create production `stub-*` roles or
change pipeline role ids.

## Compatibility

`playbook.json.schema_version` is the import contract version. The importer must
refuse unknown schema versions instead of guessing or partially importing.

Current schema version: `2`. Version `2` requires role catalog records to carry
portable production `runner_id` bindings and requires runtimes to apply test
runner overrides through execution profiles, not production stub roles.

Minimum behavior:

```text
if schema_version not in supported_schema_versions:
  fail import with unsupported_schema_version
```

`playbook.json` intentionally has no `version` field. Runtime playbook version
comes from package/install metadata, for example the npm package version or an
explicit source revision pinned by the installer.

## Control-Plane Model

Minimum target table:

```text
playbooks
  name
  source
  version
  schema_version
```

Suggested source values:

- `github:revisium/agent-playbook#<ref>` for repository installs
- `npm:@revisium/agent-playbook@<version>` for package installs

Imported roles and pipelines must reference the installed playbook through
`playbook_id`. Role and pipeline ids are stable only inside a playbook version;
do not treat a bare role id as globally unique.

Every run must record the source playbook identity:

```yaml
playbook: "Revisium Agent Playbook@<version>"
```

## Role Import

For each record in `catalog/roles.json`, import or derive:

- `id`
- `runtime_name` from the mapping below;
- `path`
- `surface`
- `rights`
- `model_level` from `default_model_level`;
- `allowed_tools` from `rights`;
- `runner_id` from the role catalog;
- optional `prompt`

Mapping rules:

- `default_model_level` maps to runtime `model_level`.
- `rights` maps to `allowed_tools`.
- `runner_id` maps to the runtime runner binding, optionally through a local or
  test execution-profile override.
- `rights` must not be used to derive `runner_id`.
- `path` must point to the canonical role file inside the installed playbook.
- Wrapper paths are adapter metadata for Codex and Claude Code; revo must not use
  wrappers as role definitions.

Runtime name mapping:

| Playbook role id | revo runtime name |
| --- | --- |
| `analyst` | `analyst` |
| `architect` | `architect` |
| `developer` | `developer` |
| `reviewer` | `reviewer` |
| `watcher` | `pr-watcher` |
| `deploy-watcher` | `deploy-watcher` |
| `qa-backend` | `qa-backend` |
| `qa-frontend` | `qa-frontend` |

Role ids not listed above keep their playbook id unless this adapter defines a
future explicit mapping.

## Rights Mapping

| Playbook rights | revo allowed tools |
| --- | --- |
| `read-only` | `Read`, `Grep`, `Glob` |
| `write-working-tree` | `Read`, `Grep`, `Glob`, `Edit`, `Write`, `Bash` |
| `qa-live` | `Read`, `Bash`, plus platform tools from runtime config |
| `deploy-read` | `Read`, `Bash`, plus platform tools from runtime config |
| `git-gh` | engine-owned git and GitHub operations |
| `deterministic-script` | engine-owned deterministic operations |

`git-gh` and `deterministic-script` rights describe access. The executable
runner binding still comes from `runner_id`. Engine-owned runner ids such as
`revo-integrator`, `revo-merger`, and `revo-deterministic` may be implemented by
revo code. Prompt materialization is optional for code-backed roles and must not
be required for execution.

Current code-backed roles:

- `integrator`
- `merger`

## Prompt Composition

For prompt-backed roles, the base prompt is composed from:

1. the body of `roles/<role>/ROLE.md` after stripping YAML frontmatter;
2. `roles/<role>/references/core.md`.

Conditional references, shared quality references, stack references, and
repo-local overlays are not part of the base prompt. They are added at route
time according to the selected pipeline, stack, surface, repo overlay, and human
approval state.

The importer may store prompt source paths and content hashes so the runtime can
detect drift, but it must preserve the installed playbook snapshot used by each
run.

## Pipeline Import

For each record in `catalog/pipelines.json`, import:

- `id`
- `path`
- `triggers`
- `required_roles`
- `alternative_roles`
- `optional_roles`
- `route_gates`
- `platform_invocation`
- `execution_policy`

`execution_policy.recommended_model_levels` maps to route-time model
recommendations. It must not hard-code provider model names. Concrete model
names, pricing, credentials, rate limits, and runner availability come from
runtime config or ignored local overlays.

Pipeline markdown may be opened after catalog validation to display the
canonical workflow to a human or to compose a route plan. It is not the discovery
source.

Pipeline role sets come from the imported `required_roles`, `alternative_roles`,
and `optional_roles` fields. A test run that uses stubs keeps those role ids and
selects stub implementations only through execution-profile runner overrides.

## Route-Time Behavior

The revo orchestrator should select a pipeline from the imported catalog, verify
that required roles exist for the installed playbook, resolve selected
`runner_id` values after execution-profile overrides, propose model levels and
consensus settings from `execution_policy`, and ask for human approval when the
route contract requires it.

Public product runs must not depend on a user-facing `runnerMode`, `--stub`, or
`--live` switch. Production uses installed playbook runner bindings; tests use a
test execution profile such as `claude-code -> stub-agent`.

The route plan should record:

- playbook identity;
- selected pipeline id;
- selected role ids and runtime names;
- model levels and resolved runner choices;
- runner binding source for each selected role: playbook binding or
  execution-profile override;
- execution-profile runner overrides, when present;
- missing runner implementations or override targets, when present;
- consensus policy;
- human gates and unresolved clarification markers.

If a required role is absent, rights cannot be mapped, schema version is
unsupported, a selected runner implementation is missing, an execution-profile
override target is missing, or a blocking clarification marker remains, the
route must stop instead of degrading silently.

## Route Decision And Readiness

### Route Option Presentation

When Revo receives a user request, the orchestrator presents route options using
the block defined in `../../method/orchestrator-run.md` "Proposed Route Review".
The human reviews the options and responds using the vocabulary in
`../../method/route-approval.md` "Human Choices". The approval is captured as a
`human_gate` of `type: route-approval` per `../../method/typed-contracts.md`.

### Pre-Execution Validation

Before starting pipeline execution, Revo must validate:

1. The `route_plan` is well-formed per `../../method/route-plan.md`.
2. The `human_gate` for route approval has `status: approved` or `status: cleared`.
3. No blocking clarification markers remain per `../../method/escalation.md`.
4. Required runner implementations are present and resolved.

If any validation step fails, the route stops with the matching stop action from
`../../method/escalation.md` instead of degrading silently.

### Pre-Developer Readiness Gate

Before the developer node executes, Revo verifies the Pre-Developer Consistency Check
defined in `../../method/lifecycle.md`. All items must be clear before implementation
begins. If any item is unresolved, route to the matching owner from
`../../method/escalation.md`.

### Typed Contracts

The typed shapes for role results, human gates, and artifact references are defined in
`../../method/typed-contracts.md`. Fillable templates:

- `../../templates/artifacts/role-result.md` — role / node result envelope.
- `../../templates/artifacts/human-gate.md` — single gate entry in `run_state.gates`.
- `../../templates/artifacts/artifact-ref.md` — artifact reference (generalizes `*_ref`
  fields and `run_state.artifacts` entries).

Route proposal artifacts use `../../templates/artifacts/route-plan.md`.

## Usage Accounting

Roles emit portable results without cost fields. revo owns attempt ids, token
usage, cost metadata, model names, and runtime progress records. Use
`method/usage-accounting.md` as the semantic boundary.
