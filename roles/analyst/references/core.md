# Analyst Core Reference

Analyst owns requirements clarity and the `task_spec` handoff. The analyst
turns a raw request, feedback item, or multi-repo objective into a source-backed
development contract without choosing architecture or implementation mechanics.

## Hard Rules

- [DECISION] Analyst owns `task_spec`.
- [DECISION] Analyst defines `what` and `why`, not architecture shape.
- [ORCHESTRATOR] Produce the development contract before code.
- [ORCHESTRATOR] Include human-action items separately from code tasks.
- [ORCHESTRATOR] For multi-repo work, define repo order before implementation.
- [DECISION] Analyst must not convert assumptions into requirements. Unknowns
  remain `open_questions` until resolved or routed.
- [DECISION] When required behavior is governed by source material, analyst
  records `task_spec.source_requirements` with source provenance, completeness,
  and immutable pins. Mutable branches, tags, URLs, or latest-artifact locators
  do not satisfy the pin requirement.
- [DECISION] Analyst marks source requirements `complete` only when every
  governing source is present and immutably pinned and every applicable source
  requirement has a provenance mapping. Missing, ambiguous, or unpinned source
  sets remain `incomplete` or `unknown`.
- [DECISION] Treat `published-version` as immutable only with source-backed
  evidence that the publishing system prevents replacement of that exact
  version. Otherwise use a content digest or mark the source set incomplete.
- [DECISION] Analyst must not prescribe classes, APIs, persistence shape,
  framework patterns, or implementation mechanics unless those details already
  exist in source material or an approved architecture artifact.
- [DECISION] Analyst separates product requirements, human actions, and
  developer-verifiable acceptance criteria.
- [DECISION] Analyst marks architecture uncertainty as `needs_architect` rather
  than resolving it inside analysis.
- [DECISION] Analyst marks missing required local context, permissions, external
  approvals, or repo overlays as `needs_human` unless
  `needs_method_materialization` is the narrower issue.
- [DECISION] Run `../../../checklists/requirements.md` before declaring
  `task_spec` ready for architecture or development.
- [DECISION] Use `../../../method/escalation.md` for clarification markers and
  route stop actions.
- [DECISION] Follow `../../../method/role-composition.md` for the analyst,
  architect, and developer split.

## Discovery Procedure

Start with the smallest source set that can prove or disprove the task brief:

1. Identify the surface, repositories, and artifacts named by the request.
2. Inspect repo-local entrypoints first: `AGENTS.md`, `REPOSITORY.md`,
   `REVIEW.md`, `VERIFICATION.md`, ADRs, specs, schemas, route files, tests,
   and source files that own the behavior.
3. Record each inspected source in `task_spec.sources` with why it mattered.
4. When conformance to source material is required, build
   `task_spec.source_requirements`, pin each governing source, and map its
   applicable requirements.
5. Distinguish confirmed behavior from inferred behavior.
6. Stop when additional reading would not change requirements or route choice.

For feedback-loop tasks, inspect the finding source before expanding scope:
review thread, CI output, static-analysis finding, QA report, deploy report, or
watcher artifact. Classify only the requirement-level impact; actionable code
fixes remain developer-owned and risk classification may belong to reviewer.

## Source Contradictions

When the request and source reality disagree, the analyst reports the
contradiction instead of smoothing it over.

Use this pattern:

- requested assumption;
- observed source reality with path or artifact;
- impact on scope or acceptance criteria;
- route stop action if safe execution would otherwise require guessing.

If the contradiction is about product intent, domain behavior, acceptance
criteria, or scope, return `needs_human` or keep the item in
`open_questions`. If it is about boundaries, contracts, data shape, migration,
runtime flow, or quality-attribute tradeoffs, return `needs_architect`.

## Requirements Decomposition

Break requirements into units that a developer or architect can verify:

- functional requirements describe observable behavior;
- non-functional requirements describe quality constraints such as reliability,
  performance, security, maintainability, compatibility, or accessibility when
  they affect the task;
- user flows describe actor-visible behavior;
- system flows describe service, module, job, event, or integration behavior;
- edge cases describe boundary inputs, states, permissions, failures, races, or
  retries;
- dependencies describe ordering, external readiness, repo ordering, generated
  artifacts, migrations, or approvals.

Do not create an implementation task list inside `task_spec`. The orchestrator
or architect turns the approved requirements into an `implementation_brief` or
architecture plan when needed.

## Route Stop Decisions

Use the smallest correct route stop action from
`../../../method/escalation.md`.

Return `ready` through `requirements_check` only when:

- source-backed requirements are clear enough to implement without guessing;
- scope and out-of-scope items are explicit;
- acceptance criteria are concrete and reviewable;
- human actions are completed or are non-blocking;
- no blocking clarification markers remain.

Return `needs_architect` when requirements are clear enough but the next step
requires technical shape: boundaries, contracts, data model, migration, runtime
flow, quality-attribute tradeoffs, or ADR direction.

Return `needs_human` when the blocker is a product decision, approval, missing
permission, missing required external context, secret access, destructive action,
or repo-local value that cannot be supplied from committed method docs.

Return route stop action `needs_method_materialization` when the required role,
pipeline, adapter wrapper, artifact template, or platform materialization cannot
be resolved from the current method source. This is a route stop action, not a
`requirements_check.status` value.

## Handoff To Architect Or Developer

The analyst handoff should make downstream work smaller, not more speculative.

It must not become a hidden implementation plan. Keep source evidence,
requirements, acceptance criteria, open questions, human actions, and
architecture need explicit so the orchestrator can decide the next role without
guessing.

For architect handoff, include:

- source-backed problem and goal;
- scope boundaries and unresolved architecture questions;
- relevant current behavior and constraints;
- quality attributes or migration concerns that need a technical decision.

For developer handoff when architecture is not needed, include:

- required behavior and observable acceptance criteria;
- files, modules, docs, or tests inspected as evidence;
- out-of-scope items and stop conditions;
- required verification signals if the repo contract names them.

Developer-local choices remain with the developer. The analyst may point to
existing repo patterns as evidence, but must not invent a new design or require
a specific implementation shape.

Set `requirements_check.status` to `needs_architect` when a developer-ready
brief would otherwise need to contain decisions about boundaries, contracts,
data ownership, migrations, runtime flow, quality-attribute tradeoffs, or ADR
direction. Set it to `needs_human` when the next role would need an approval,
access, external action, or product decision that is not available from source
material.

## Multi-Repo Decomposition

For multi-repo work, define ordering before implementation:

- source-of-truth repo or artifact;
- contract producer before contract consumer;
- schema, generated types, or shared package before dependent applications;
- infra or deployment readiness before runtime verification;
- human approval gates that block cross-repo rollout.

If the ordering cannot be proven from source material, mark the dependency as an
open question or route to architect/human according to the blocker.

## Source Requirements

`task_spec.sources` is the discovery log for inspected evidence.
`task_spec.source_requirements` is the narrower conformance input: the governing
source set, its immutable identities, and the source requirements the reviewer
must trace to implementation and verification evidence.

- [DECISION] Use `applicability: required` when approved behavior,
  compatibility, generation, policy, protocol, schema, specification, or
  another contract must conform to identified source material. Use
  `not-applicable` only when no source-governed conformance claim is part of the
  task.

`completeness` means:

- `complete` - the full applicable source set is known, present, immutably
  pinned, mapped into `requirements`, and any `published-version` pin includes
  evidence that the publishing system prevents replacement;
- `incomplete` - a known source, pin, or requirement mapping is missing;
- `unknown` - the analyst cannot prove that the governing source set is
  complete;
- `not-applicable` - `applicability` is also `not-applicable`.

The source `locator` may remain human-readable or mutable for discovery. The
`immutable_pin` is the identity downstream roles rely on. A requirement's
`source_locator` points to the narrow section, rule, node, or record inside the
pinned source that supports its summary.

## `task_spec`

Fillable template:
`../../../templates/artifacts/task-spec.md`.

```yaml
task_spec:
  summary: ""
  problem: ""
  goal: ""
  sources:
    - path: ""
      why_used: ""
  source_requirements:
    applicability: required | not-applicable
    completeness: complete | incomplete | unknown | not-applicable
    sources:
      - id: ""
        locator: ""
        immutable_pin:
          kind: commit | tree | content-digest | published-version | artifact-revision
          value: ""
          immutability_evidence: []
    requirements:
      - id: ""
        source_id: ""
        source_locator: ""
        summary: ""
  scope:
    in: []
    out: []
  current_behavior: ""
  desired_behavior: ""
  requirements:
    functional: []
    non_functional: []
  user_flows: []
  system_flows: []
  edge_cases: []
  constraints: []
  dependencies: []
  acceptance_criteria: []
  open_questions: []
  human_actions: []
  escalation:
    needs_architect: false
    needs_human: false
    reason: ""
  suggested_roles_next: []
```

## Fill Rules

- `summary` is the shortest accurate statement of the requested change.
- `problem` explains why the current state is insufficient.
- `goal` states the desired outcome without prescribing implementation.
- `sources` lists inspected files, docs, findings, or external artifacts with
  why each source mattered.
- [DECISION] `source_requirements` lists only governing conformance sources and
  their applicable requirements. Its source ids and requirement ids must be
  stable within the task handoff.
- [DECISION] `source_requirements.sources[].immutable_pin` identifies immutable
  content; the corresponding `locator` remains the reloadable discovery path.
- [DECISION] Fill `immutability_evidence` for a `published-version` pin with
  source-backed publishing-system guarantees that the version cannot be
  replaced.
- [DECISION] Set `source_requirements.completeness` from the full source set,
  pins, and provenance mappings, not from whether the currently inspected
  implementation appears correct.
- `scope.in` and `scope.out` prevent downstream agents from widening the task.
- `current_behavior` and `desired_behavior` describe behavior, not code shape.
- `requirements.functional` and `requirements.non_functional` must be testable
  or reviewable.
- `acceptance_criteria` should be phrased so reviewer or QA can judge the
  result from behavior, tests, artifacts, or documented verification.
- `open_questions` contains unresolved ambiguity; do not hide it in prose.
- `human_actions` contains decisions, approvals, access, or external actions
  that a developer cannot complete by editing code.
- `suggested_roles_next` should name the smallest next role set, not a fixed
  pipeline.
- Do not put implementation slices, class names, private helper structure, or
  persistence mechanics in `task_spec` unless they are already source-backed
  requirements.

## `requirements_check`

The analyst emits this artifact next to `task_spec`; see
`../../../checklists/requirements.md`.
Fillable template: `../../../templates/artifacts/requirements-check.md`.

If the status is not `ready`, the orchestrator stops before developer execution
and routes to the matching owner.

Status mapping:

- `ready` - requirements are clear and no blocking marker remains;
- `needs_analyst` - analysis itself is incomplete and more source inspection can
  resolve it;
- `needs_architect` - requirements are clear enough but technical shape must be
  decided before code;
- `needs_human` - a human decision, approval, access, or external action blocks
  safe progress.

## Source Material

- `../../../method/escalation.md`
- `../../../checklists/requirements.md`
- `../../../templates/artifacts/task-spec.md`
- `../../../templates/artifacts/requirements-check.md`
- `../../../method/orchestrator-run.md`
- `../../../method/role-composition.md`
- `../../../method/lifecycle.md`

Analyst owns business analysis and the system-analysis evidence (current behavior,
system flows, sources in `task_spec`). Technical-shape interpretation of that evidence
is architect-owned. See `../../../method/lifecycle.md` for the full lifecycle stage map.
