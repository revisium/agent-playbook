# Intake

Intake is the first step of every multi-agent run. It turns a user request into
a candidate route before any pipeline executes.

## Goals

- Classify the work type.
- Select a candidate pipeline.
- Read catalog metadata for pipeline and role discovery.
- Infer required roles, surfaces, stacks, frameworks, tooling categories, and
  verification capabilities.
- Identify local values that must be resolved from overlays.
- Run a capability check.
- Produce a proposed run plan for human review.

## Work Types

Use these initial categories:

- `feature-development` - feature, multi-repo change, or planned implementation.
- `bugfix` - known defect, failing behavior, or concrete regression.
- `local-change` - small local implementation when requirements and architecture
  boundaries are already clear.
- `analysis-only` - research, review, plan, explanation, or source-backed answer.
- `quality-audit` - read-only tech-debt or conformance assessment of existing
  code or merged changes.
- `post-merge-qa` - deployment or live behavior verification after merge.
- `method-development` - creating or improving roles, stacks, pipelines, adapters,
  or references.

## Intake Output

```yaml
request_summary: ""
work_type: feature-development
selected_pipeline: feature-development
why: ""
surfaces: [] # backend | frontend | infra | docs | library | method | repo
stack:
  primary: unknown
  secondary: []
frameworks: []
tooling:
  static_analysis: []
  structure_checks: []
  ci_providers: []
verification_capabilities:
  primary_local_gate: available | missing | unknown
  typecheck: available | missing | unknown | not-applicable
  lint: available | missing | unknown | not-applicable
  tests: available | missing | unknown | not-applicable
  build_or_package: available | missing | unknown | not-applicable
  architecture_or_structure: available | missing | unknown | not-applicable
  static_analysis: configured | optional | unavailable | unknown
  remote_ci: available | missing | unknown
required_roles: []
ambiguity:
  - field: ""
    reason: ""
    candidates: []
alternative_roles:
  - group_id: ""
    roles: []
    resolution: at_least_one
optional_roles: []
local_values_needed: []
missing_capabilities: []
recommended_next_step: route-approval | method-development | needs_human
```

## Field Definitions

- `alternative_roles`: role-group objects discovered from
  `../pipelines/INDEX.md`. Each group has `group_id`, `roles`, and
  `resolution: at_least_one`; at least one role from each group must be
  available for the route to proceed.
- `ambiguity`: structured discovery notes with `field`, `reason`, and
  `candidates` when route selection cannot be made confidently.
- `verification_capabilities`: generic availability signals. Do not put exact
  commands here; exact commands belong to repo overlays or `verification_plan`.

## Rules

- If the request is about roles, pipelines, references, or this repository's
  method, choose `method-development`.
- If the request says "only research", "review only", or equivalent, prefer
  `analysis-only`.
- To select candidate routes, read `discovery.md` for the process, then read
  `../pipelines/INDEX.md` for pipeline `triggers`, `required_roles`,
  `alternative_roles`, and `optional_roles`, then read `../roles/INDEX.md` to
  confirm role ids, surfaces, capabilities, and rights.
- If the target stack, framework, tool, or verification capability is unknown, do
  not guess silently; mark it `unknown` and ask for route approval with the
  ambiguity visible.
- Do not resolve local values during intake. Only list what will be needed.
