# Role Definition Format

Each portable role lives at `roles/<role>/ROLE.md`.

## Frontmatter

Each role file starts with YAML frontmatter:

```yaml
---
id: <role-id>
surface: any | backend | frontend | repo | deployment | method
rights: <rights>
default_model_level: cheap | standard | deep
runner_id: claude-code | codex | revo-integrator | revo-merger | revo-deterministic | other
---
```

- [DECISION] `id` must equal the role directory name and the `roles/INDEX.md`
  record.
- [DECISION] `surface` must equal the catalog surface.
- [DECISION] `rights` is a coarse importer/runtime capability class, not the
  full prose rights explanation. Allowed values: `read-only`,
  `write-working-tree`, `git-gh`, `deploy-read`, `qa-live`, or
  `deterministic-script`.
- [DECISION] `default_model_level` is the portable default. Prose may explain
  escalation cases, but it must include the frontmatter value and must not
  replace it with concrete provider models or runner types.
- [DECISION] `runner_id` is the portable production runner binding for the role.
  It names a runtime capability, not a provider account, model, token, or local
  executable path. Test and local overrides belong in an execution profile, not
  in a separate stub role.

## Required Sections

- `# Role: <id>`: stable kebab-case role id.
- `Purpose`: what this role owns.
- `When To Use`: trigger phrases and pipeline steps.
- `Rights`: read/write and external-action boundary summary.
- `Default Model Level`: portable recommendation using cheap, standard, or deep.
- `Inputs`: artifacts and placeholders the role needs.
- `Outputs`: structured result and artifacts the role returns.
- `Hard Rules`: behavior that must always hold.
- `References`: role-local and shared knowledge files to read on demand.

Specialized roles may include `Extends` between `Purpose` and `When To Use`.

## Optional Sections

- `Extends`: inheritance or composition links for specialized roles.

[DECISION] Do not add separate `practice_references` or `platform_notes`
sections as a second source of truth. Use `References` for knowledge files and
adapter docs for platform mechanics unless this format is changed first.

## Catalog Metadata

`roles/INDEX.md` owns routable metadata:

- stable role id;
- role file path;
- primary surface;
- routing capabilities;
- rights summary for route planning.

Do not duplicate catalog metadata as separate sections in every role file.
Future machine-readable imports should validate `roles/INDEX.md` against
`ROLE.md` frontmatter, role files, and adapter wrappers.

## Knowledge References

`ROLE.md` is the dispatcher. It should stay short. Detailed knowledge lives in
`roles/<role>/references/`.

Shared practices that apply to multiple roles live in top-level `references/`.
Role-local references describe duties and handoffs. Shared references describe
methods such as requirements engineering, ADRs, C4, BPMN, DDD, or test strategy.

Role `References` sections may include both role-local files and shared
practice references. Do not create a separate `practice_references` section
unless the role format is changed in this file first.

Use this split:

- `references/core.md` - role behavior and handoff rules.
- `references/review-checklist.md` - review dimensions or quality gates.
- `references/examples/` - good and bad examples.

Unapproved lessons and raw project evidence stay outside this repository. After
human approval, commit only the reusable abstraction to the canonical owner file.

## Source Labels

Every non-obvious rule should carry one source label:

- `[ORCHESTRATOR]` - extracted from existing `.agents` or pipeline docs.
- `[CODE]` - extracted from approved public/example source or current method repo
  files. Private project evidence must be aggregated outside this repository.
- `[BEST-PRACTICE]` - approved general practice that is not tied to one source.
- `[DECISION]` - approved human decision.
- `[TODO]` - unresolved or intentionally thin base placeholder.

## Output Contract

Portable roles return the `role_result` envelope owned by
`typed-contracts.md`.

Role `Outputs` sections list the artifacts and slots a role produces. They do
not redefine the portable result schema.

Adapters may wrap `role_result` for a platform by adding attempt metadata,
runtime progress, token usage, or cost records around the portable result.

Usage and cost metadata are recorded by the orchestrator or adapter according to
`usage-accounting.md`; roles do not emit billing fields.

## Model Policy

`default_model_level` frontmatter is a portable recommendation, not a concrete
provider model. Concrete model names are selected from local execution profiles
or future runtime config according to `execution-policy.md`.

Runner types such as deterministic scripts are not model levels. Put them in
rights, adapter docs, or execution profiles.

## Runner Binding

`runner_id` frontmatter is installed with the playbook so runtimes can bind a
role without deriving workflow semantics from `rights`. Use stable capability
ids such as `claude-code`, `codex`, `revo-integrator`, `revo-merger`, or
`revo-deterministic`. Do not create production stub roles. Test profiles may
override a runner id, for example `claude-code -> stub-agent`, while preserving
the same role ids and pipeline definitions.
