# Revo Import Contract

This adapter records the current authoring boundary and the draft import target
for loading the canonical Revisium Agent Playbook into Revo. It does not claim
that the current package is executable by the shipped Revo runtime end to end.

## Status Boundary

### Current Authoring Contract

The current authoring package exposes:

1. `playbook.json` with `schema_version: 2`;
2. `catalog/roles.json` for role discovery and portable runner bindings;
3. `catalog/pipelines.json` for pipeline discovery, role sets, route gates, and
   execution-policy recommendations.

The generated pipeline catalog does not contain an executable graph. Canonical
Markdown remains human-reviewable source material for prompts, method semantics,
and manual execution; it is not a machine-readable execution graph.

`playbook.json.supported_runtimes` declares the intended adapter target. A
`revo` entry does not by itself prove that the shipped importer can install and
execute this package.

### Current Revo Compatibility

The current `@revisium/agent-playbook` package is not runnable end to end by the
shipped Revo importer:

- Revo currently requires explicit `allowed_tools` in each role catalog record,
  while this package's generated role catalog carries `rights` and leaves the
  rights-to-tools mapping to the adapter/runtime.
- Revo currently preserves imported role ids and requires registered runner
  implementations; the runtime-name mapping and `revo-*` runner capability ids
  below are target mappings, not evidence of current implementations.
- Revo run creation currently requires an executable
  `execution_policy.template_json`, while this package's pipeline catalog carries
  only discovery, routing, and execution-policy recommendation fields.

The executable templates bundled under Revo's product-owned default playbook
are shipped bootstrap data. They must not become a second canonical authoring
source for this package.

### Draft Target

```text
authoring package
  -> validated documents + catalogs + executable graph
  -> immutable PlaybookVersion
  -> fully resolved and pinned ExecutionPlan
  -> worktree playbook/context materialization
```

The installer/compiler validates the package, resolves executable references and
capability bindings, and records immutable execution-affecting content. Route
planning produces the resolved `ExecutionPlan`; execution and recovery use that
pin rather than mutable package HEAD, a source checkout, or a live registry.

The exact authoring representation for the executable graph, effect capability
references, artifact schemas, and future fragment references remains owned by
the Draft contracts in `revisium/orchestrator`. This adapter does not define a
schema-v3 field set. If those fields are added to the authoring package, they
require an explicit schema-version bump rather than an implicit extension of
schema v2.

### Later

Reusable graph fragments and trusted custom scripts may extend the package only
after the internal graph and script/effect contracts stabilize. Custom scripts
are trusted build/install-time code, not arbitrary untrusted runtime snippets.

## Package Coordinates

- canonical repository: `revisium/agent-playbook`
- package name: `@revisium/agent-playbook`
- manifest path: `playbook.json`
- catalog paths are declared by `playbook.json.catalogs`

## Target Import Command

These commands describe the target installation UX. They are not current
end-to-end compatibility claims for this package.

Target command:

```bash
revo playbook install revisium/agent-playbook
```

Package-based installation may use:

```bash
revo playbook install @revisium/agent-playbook
```

The target installer resolves the source, reads `playbook.json`, validates all
declared machine-readable artifacts, and stores an immutable playbook version in
the control plane.

## Discovery Sources

The importer reads these files for discovery:

1. `playbook.json`
2. `catalog/roles.json`
3. `catalog/pipelines.json`

The importer must not discover roles or pipelines by scanning `roles/`,
`pipelines/`, adapter wrappers, or Markdown headings. Those files may be opened
only after catalog validation, for prompt composition or source display.

The runtime must not ask an LLM to parse `PIPELINE.md` prose into executable
topology. A runnable package requires a separately validated machine-readable
graph declared by the authoring contract.

The target installed `PlaybookVersion` owns available roles, pipelines, pipeline
role sets, route gates, execution policy defaults, executable graph content, and
production role `runner_id` bindings. Runtime or test execution profiles may
narrow availability or override runner ids for a run, but they must not create
production `stub-*` roles or change pipeline role ids.

## Authoring Schema Compatibility

`playbook.json.schema_version` is the import contract version. The importer must
refuse unknown schema versions instead of guessing or partially importing.

The current authoring schema version is `2`. Version `2` requires role catalog
records to carry portable production `runner_id` bindings and requires runtimes
to apply test runner overrides through execution profiles, not production stub
roles. Schema support alone is not an end-to-end compatibility guarantee: the
runtime must also support every required catalog field, executable artifact, and
resolved runner capability.

Minimum behavior:

```text
if schema_version not in supported_schema_versions:
  fail import with unsupported_schema_version
```

`playbook.json` intentionally has no `version` field. Runtime playbook version
comes from package/install metadata, for example the npm package version or an
explicit source revision pinned by the installer.

## Draft Runtime Storage Boundary

The exact storage schema is owned by Revo's Draft playbook-storage and
execution-plan contracts. This adapter requires an immutable installed
`PlaybookVersion` identity and a fully resolved per-run `ExecutionPlan`; it does
not duplicate the product's table definitions.

Suggested source values:

- `github:revisium/agent-playbook#<ref>` for repository installs
- `npm:@revisium/agent-playbook@<version>` for package installs

Imported roles, pipelines, documents, and executable artifacts must resolve
inside the same installed version. Role and pipeline ids are stable only inside
a playbook version; do not treat a bare role id as globally unique.

Every target run records the immutable playbook identity and resolved execution
pin. A compact display value may look like:

```yaml
playbook: "Revisium Agent Playbook@<version>"
```

## Draft Role Import Mapping

For each record in `catalog/roles.json`, the target importer imports or derives:

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

Draft runtime-name mapping:

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

## Draft Rights Mapping

| Playbook rights | revo allowed tools |
| --- | --- |
| `read-only` | `Read`, `Grep`, `Glob` |
| `write-working-tree` | `Read`, `Grep`, `Glob`, `Edit`, `Write`, `Bash` |
| `qa-live` | `Read`, `Bash`, plus platform tools from runtime config |
| `deploy-read` | `Read`, `Bash`, plus platform tools from runtime config |
| `git-gh` | engine-owned git and GitHub operations |
| `deterministic-script` | engine-owned bounded script/effect operations |

`git-gh` and `deterministic-script` rights describe access. The executable
runner binding still comes from `runner_id`. Engine-owned runner ids such as
`revo-integrator`, `revo-merger`, and `revo-deterministic` may be implemented by
Revo code. The coarse `deterministic-script` rights name does not make external
Git, GitHub, filesystem, or network outcomes deterministic; deterministic
routing consumes the recorded typed result of a bounded effect. Prompt
materialization is optional for code-backed capabilities and must not be
required for their execution.

The canonical catalog currently declares target engine-owned runner bindings
for:

- `integrator`
- `merger`

That declaration does not prove the shipped Revo runtime has registered those
runner ids. Current Revo product flows execute Git and GitHub lifecycle work
through named `script:*` handlers. The future compiler must resolve role and
effect capabilities explicitly instead of treating catalog presence as runtime
availability.

## Draft Prompt Composition

For prompt-backed roles, the target base prompt is composed from:

1. the body of `roles/<role>/ROLE.md` after stripping YAML frontmatter;
2. `roles/<role>/references/core.md`.

Conditional references, shared quality references, stack references, and
repo-local overlays are not part of the base prompt. They are added at route
time according to the selected pipeline, stack, surface, repo overlay, and human
approval state.

The importer may store prompt source paths and content hashes for provenance,
but it must preserve the immutable installed content used by each run.

## Current Pipeline Discovery And Draft Execution Import

The current v2 catalog provides these discovery and route-planning fields for
each pipeline record:

- `id`
- `path`
- `triggers`
- `required_roles`
- `alternative_roles`
- `optional_roles`
- `route_gates`
- `platform_invocation`
- `execution_policy`

These fields do not define executable topology. In the Draft target, the
installer/compiler also loads a validated executable graph declared by a future
authoring contract. Whether the package declares an inline graph, a graph path,
or another validated representation remains open in the Revo product contract;
this adapter does not add that field to schema v2.

`execution_policy.recommended_model_levels` maps to route-time model
recommendations. It must not hard-code provider model names. Concrete model
names, pricing, credentials, rate limits, and runner availability come from
runtime config or ignored local overlays.

Pipeline Markdown may be opened after catalog validation to display the
canonical workflow to a human or to compose a route-plan explanation. It is
neither the discovery source nor executable topology.

Pipeline role sets come from the imported `required_roles`, `alternative_roles`,
and `optional_roles` fields. A test run that uses stubs keeps those role ids and
selects stub implementations only through execution-profile runner overrides.

## Draft Route-Time Behavior

The Revo orchestrator selects a pipeline from an immutable installed
`PlaybookVersion`, verifies that required roles and executable capability
references resolve inside that version, applies approved execution-profile
overrides, and compiles a fully resolved `ExecutionPlan`. It proposes model
levels and consensus settings from `execution_policy` and asks for human
approval when the route contract requires it.

Public product runs must not depend on a user-facing `runnerMode`, `--stub`, or
`--live` switch. Production uses installed playbook runner bindings; tests use a
test execution profile such as `claude-code -> stub-agent`.

The durable route decision should pin the resolved execution-affecting content.
The portable route-plan view records:

- immutable playbook version and content identity;
- selected pipeline id;
- executable graph identity;
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

### Future Headless Runner Readiness

- [DECISION] A future Revo runner adapter exposes
  `probe(context) -> normalized runner_readiness` and
  `execute(request, same context)`. The execution call is permitted only when
  the resolved runner entry is `ready` under
  `../../method/execution-policy.md`.
- [DECISION] `context` covers working directory, effective environment and
  config, operating-system user or container, and launcher. A changed context or
  an auth failure invalidates probe evidence before another attempt.
- [DECISION] Durable Revo state pins only the runtime configuration reference
  and the readiness evidence source label. It must not store a secret, raw auth
  or identity response, account identifier, or private config path in portable
  route evidence.
- [DECISION] This future probe/execute contract is adapter behavior only. It
  does not add a field to the current authoring schema and does not justify a
  `playbook.json` schema-version bump.

## Draft Route Decision And Readiness

### Route Option Presentation

When Revo receives a user request, the orchestrator presents route options using
the block defined in `../../method/orchestrator-run.md` "Proposed Route Review".
The human reviews the options and responds using the vocabulary in
`../../method/route-approval.md` "Human Choices". The approval is captured as a
`human_gate` of `type: route-approval` per `../../method/typed-contracts.md`.

### Pre-Execution Validation

Before starting pipeline execution, Revo must validate:

1. The `route_plan` is well-formed per `../../method/route-plan.md`.
2. The `human_gate` for route approval has `status: approved`.
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

Roles emit portable results without cost fields. Revo owns attempt ids, token
usage, cost metadata, model names, and runtime progress records. Use
`../../method/usage-accounting.md` as the semantic boundary.
