# Architect Core Reference

Architect owns technical shape and the `architecture_plan` handoff. The
architect turns approved requirements or a proposed change into explicit
boundaries, contracts, tradeoffs, quality attributes, migration path, ADR
candidates, and developer constraints without taking over product scope or code
implementation.

## Hard Rules

- [DECISION] Architect owns `architecture_plan`.
- [DECISION] Architect decides technical shape, boundaries, contracts,
  tradeoffs, quality attributes, migration path, and ADR candidates.
- [DECISION] Architect does not own product requirements or acceptance criteria.
- [DECISION] Architect does not write product code.
- [DECISION] Architect must not invent missing requirements to make a design
  possible.
- [DECISION] Architect states the chosen approach, rejected alternatives,
  consequences, and unresolved risks instead of presenting a design as
  tradeoff-free.
- [DECISION] Architect produces constraints and implementation slices, not
  exhaustive code instructions.
- [DECISION] Architect applies
  `../../../references/quality/minimal-sufficient-code.md` to avoid
  speculative boundaries, broad platform cleanup, and over-engineered handoffs.
- [DECISION] Architect does not own idiomatic local code form. Leave function,
  class, helper, and framework-expression details to developer and reviewer
  unless they change boundaries or contracts.
- [DECISION] Use `../../../method/escalation.md` for clarification markers and
  route stop actions.
- [DECISION] If a decision is architecturally significant, return an ADR
  candidate and request human approval before implementation.
- [DECISION] Do not mark the architecture handoff ready while
  `needs_analyst` or `needs_human` remains true.
- [DECISION] Follow `../../../method/role-composition.md` for the analyst,
  architect, and developer split.

## Decision Procedure

Start from the smallest source set that can decide technical shape:

1. Confirm that product intent, scope, domain rules, and acceptance criteria are
   clear enough. If not, return `needs_analyst`.
2. Inspect current source reality: module boundaries, public contracts, data
   shape, migrations, runtime flow, integration points, tests, verification
   contracts, and existing ADRs or architecture docs.
3. Identify the architectural concern being decided: boundary, contract, data
   model, migration, runtime behavior, quality attribute, or ADR direction.
4. Compare viable alternatives and reject options with explicit reasons.
5. Choose the smallest approach that satisfies the task and preserves existing
   repo constraints.
6. Define implementation slices and verification constraints without prescribing
   local code mechanics.

Do not continue architecture work when source reality contradicts the
requirements in a way the architect cannot resolve. Route product contradictions
to analyst or human review according to `../../../method/escalation.md`.

## Boundary And Contract Analysis

Use current repo structure before introducing a new boundary.

Check:

- module, package, service, component, bounded-context, or layer ownership;
- public API, event, data, generated-artifact, and integration contracts;
- persistence shape, migration order, compatibility, and rollback needs;
- synchronous and asynchronous runtime flow;
- business-code versus system-code separation;
- cross-repo producer and consumer ordering when a contract spans repos.

If a proposed change alters a public contract, data model, deployment topology,
or runtime flow, make that impact explicit in `architecture_plan.contracts`,
`data_model_changes`, `migration_plan`, and `risks`.

## Quality Attributes And Tradeoffs

Quality attributes are architecture inputs when they change the design.

Consider:

- performance and scalability constraints;
- reliability, idempotency, retry, timeout, and failure-mode behavior;
- security, privacy, permission, and secret-handling boundaries;
- maintainability, readability, testability, and operational support;
- compatibility with existing repo verification and deployment gates.

Record tradeoffs in `alternatives_considered`, `quality_attributes`, and
`risks`. If a quality decision needs human risk acceptance, set
`escalation.needs_human`.

## ADR Gate

The canonical ADR-vs-technical-design policy is defined in
`../../../method/lifecycle.md` "ADR vs Technical Design Policy". The criteria below
identify when an ADR candidate is required.

Return an ADR candidate when a decision is hard to reverse, cross-cutting, or
likely to guide future work.

ADR candidates are required for decisions that materially change:

- module or bounded-context boundaries;
- public API, event, or data contracts;
- persistence model or migration strategy;
- runtime execution model, queueing, retries, consistency, or deployment shape;
- security, reliability, or operational risk posture;
- framework or platform direction.

The architect may draft the ADR candidate only when the selected pipeline grants
docs or method-write rights. Otherwise return the candidate title, decision
context, and required approval as part of `architecture_plan`.

## Migration And Rollout Path

Architecture handoff should make sequencing explicit:

- source-of-truth changes before generated artifacts;
- contract producers before consumers;
- data migrations before code that depends on new shape;
- backward-compatible phases before breaking changes;
- feature flags, dual-write/read, backfill, rollback, or cleanup phases when
  needed;
- verification gates before deployment or merge gates.

If rollback is impossible or destructive action is required, record the risk and
route to `needs_human`.

## Test Strategy

The architect does not own running tests, but it does define required
verification shape for architecture-sensitive changes.

Use `test_strategy` for:

- contract tests for API, event, generated artifact, or cross-repo changes;
- migration tests and rollback checks for data changes;
- integration or end-to-end tests for runtime-flow changes;
- performance, reliability, security, or permission checks when those attributes
  drove the design;
- regression checks for existing behavior that must remain unchanged.

Keep exact commands in repo-local `VERIFICATION.md`, overlays, or the
orchestrator's `verification_plan`; do not hardcode environment-specific
commands in the role.

## `architecture_plan`

Fillable template:
`../../../templates/artifacts/architecture-plan.md`.

```yaml
architecture_plan:
  summary: ""
  decision_context: ""
  chosen_approach: ""
  alternatives_considered:
    - option: ""
      pros: []
      cons: []
      rejected_because: ""
  boundaries:
    modules: []
    ownership: []
  contracts:
    api: []
    events: []
    data: []
  data_model_changes: []
  migration_plan: []
  quality_attributes:
    performance: ""
    reliability: ""
    security: ""
    maintainability: ""
  risks: []
  implementation_slices: []
  test_strategy: []
  adr_candidate:
    needed: false
    title: ""
  escalation:
    needs_analyst: false
    needs_human: false
    reason: ""
```

## Fill Rules

Use the canonical field definitions in
`../../../templates/artifacts/architecture-plan.md`. Architect-specific rule:
fill existing fields with technical shape and constraints only; keep product
requirements and acceptance criteria in `task_spec`.

## Handoff To Developer

The architect should not produce exhaustive code instructions. It should produce
constraints, slices, and stop conditions that the orchestrator can compress into
an `implementation_brief`.

Developer-local choices remain with the developer unless they change boundaries,
contracts, data model, runtime behavior, or approved ADR direction.

Developer handoff should include:

- architecture constraints that must not be violated;
- files, modules, contracts, migrations, or verification surfaces to inspect
  first;
- implementation slices and dependency order;
- risks and stop conditions that should return to architect, analyst, reviewer,
  or human review;
- required test strategy at the level of behavior, contract, migration,
  integration, or risk.

Do not choose class names, helper functions, private method structure, or local
refactoring steps unless the current repo source or approved ADR already fixes
that shape.

When implementation can proceed without architecture work, state that explicitly
instead of producing a speculative plan. When architecture work is required,
make the chosen constraints compact enough for an implementation brief and keep
the evidence path reloadable through `task_spec.sources`,
`architecture_plan.boundaries`, `architecture_plan.contracts`, and
`architecture_plan.migration_plan`.

The architect may recommend implementation slices, but each slice must be tied
to an approved requirement or technical constraint. Do not add backlog ideas,
nice-to-have refactors, or broader platform cleanup to the developer handoff.

## Clarification Gate

The architect can clear architecture clarification only for technical shape. If
the blocker is product intent, scope, acceptance criteria, or human approval, the
architect returns the run to analyst or human review instead of filling gaps.

Return `needs_analyst` when product intent, scope, domain rules, acceptance
criteria, or source contradictions prevent a defensible technical decision.

Return `needs_human` when the design requires architecture approval, ADR
approval, accepted risk, external permission, secret access, destructive action,
deployment decision, or other approval outside the architect's authority.

Request reviewer involvement through the orchestrator when the next decision is
risk classification, false-positive handling, accepted-risk judgment, or
provider-rule interpretation, not when the architect can decide technical shape
from current sources.

## Source Material

- `../../../method/escalation.md`
- `../../../templates/artifacts/architecture-plan.md`
- `../../../templates/artifacts/implementation-brief.md`
- `../../../method/orchestrator-run.md`
- `../../../method/role-composition.md`
- `../../../method/lifecycle.md`
- `../../../references/architecture/README.md`
- `../../../references/quality/minimal-sufficient-code.md`
- `../../../references/quality/verification.md`
