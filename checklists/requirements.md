# Requirements Checklist

This checklist is the readiness gate for `task_spec`. It helps the analyst and
orchestrator decide whether implementation can proceed, architecture is needed,
or clarification must stop the run.

Fillable template: `../templates/artifacts/requirements-check.md`.
Escalation vocabulary owner: `../method/escalation.md`.

## When To Run

- [DECISION] Analyst runs this checklist before marking `task_spec` ready.
- [DECISION] Orchestrator reruns or verifies it before preparing
  `implementation_brief`.
- [DECISION] Reviewer may use it to check consistency between requirements,
  architecture, tasks, and code.

## Checklist

- [ ] Sources inspected and listed with why each source was used.
- [ ] [DECISION] Source-requirement applicability is explicit.
- [ ] [DECISION] Every applicable governing source has a stable id, reloadable
  locator, and immutable pin.
- [ ] [DECISION] Every `published-version` pin has source-backed evidence that
  the publishing system prevents replacement of that exact version.
- [ ] [DECISION] Every applicable source requirement maps to its governing
  source and narrow source locator.
- [ ] [DECISION] Source-requirement completeness is `complete` only when the
  governing source set, pins, and provenance mappings are complete; gaps are
  blockers.
- [ ] Problem, goal, and desired behavior are clear.
- [ ] Scope has explicit in-scope and out-of-scope items.
- [ ] Current behavior is captured when the work changes existing behavior.
- [ ] Functional requirements are testable.
- [ ] Non-functional requirements are captured when relevant.
- [ ] User or operator flows are described when behavior crosses interactions.
- [ ] System flows are described when behavior crosses services or modules.
- [ ] Edge cases, constraints, and dependencies are visible.
- [ ] Acceptance criteria are concrete enough for review and tests.
- [ ] Human-action items are separated from code tasks.
- [ ] Open questions are either resolved or marked as blockers.
- [ ] `needs_architect` is true when the task needs boundary, contract,
  data-shape, runtime-flow, migration, quality-attribute, or ADR decisions.
- [ ] No blocking clarification markers remain before developer execution.

## Output

```yaml
requirements_check:
  status: ready | needs_analyst | needs_architect | needs_human
  blockers: []
  evidence: []
  source_requirements:
    ref: task_spec.source_requirements
    applicability: required | not-applicable
    completeness: complete | incomplete | unknown | not-applicable
    unpinned_source_ids: []
    unproven_published_version_source_ids: []
    unmapped_requirement_ids: []
  unresolved_markers:
    open_questions: []
    human_actions: []
    escalation: []
```

## Status Rules

- [DECISION] Use `ready` only when requirements are implementable without
  guessing and no blocking clarification markers remain.
- [DECISION] When source requirements are applicable, use `ready` only when
  their completeness is `complete`, every governing source has an immutable
  pin, and every applicable requirement has provenance.
- [DECISION] A `published-version` pin without source-backed non-replacement
  evidence keeps the requirements check from becoming `ready`.
- [DECISION] Use route stop actions according to `../method/escalation.md`.

## Clarification Markers

Blocking clarification markers are defined by `../method/escalation.md`.

Developer execution must not start while any blocking marker remains.
