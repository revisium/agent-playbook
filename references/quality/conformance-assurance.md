# Conformance Assurance

Conformance assurance defines how a reviewer proves that a review target matches
its governing sources. It owns the semantics of `review_result`; the reviewer
owns each filled result and the independent evidence used to reach it.

`task_spec.source_requirements` is owned by
`../../roles/analyst/references/core.md`. This reference consumes that source set
without redefining it.

## Hard Rules

- [DECISION] Bind every `review_result` to an exact target snapshot with an
  immutable snapshot kind and value. A branch, tag, latest artifact, URL, or
  other mutable locator is not a snapshot pin.
- [DECISION] Bind every `review_result` to the exact reviewed
  `source_requirements` snapshot and the complete source-id-to-immutable-pin
  set. Consumers compare both with the current handoff before relying on the
  result.
- [DECISION] Set `validity: stale` and `overall: stale` when the target snapshot,
  source-requirements snapshot, source-pin set, reviewed requirement, or
  evidence used by the review changes. Replacing a pin alone does not refresh a
  result; the reviewer must issue a new review with revalidated evidence.
- [DECISION] Keep conformance, architecture, code-quality, and verification
  verdicts separate. One passing dimension must not mask a failed, blocked, or
  unreviewed applicable dimension.
- [DECISION] Conformance must not pass when required source requirements are
  missing, incomplete, unknown, mutably referenced, or not mapped into the
  conformance matrix.
- [DECISION] A `published-version` entry in `source_pin_set` is immutable only
  when `immutability_evidence` proves from source that the publishing system
  prevents replacement of that exact version.
- [DECISION] When negative behavior is applicable, evidence must come from a
  reviewer-executed case or an independent reviewer probe. Inspecting an
  existing test, developer-supplied evidence, or a green aggregate gate is
  insufficient.
- [DECISION] Every required independent check must pass before any dimension it
  governs can pass. A failed check fails its governed applicable dimensions; an
  unavailable capability or missing evidence blocks them or is recorded as an
  explicit limitation, and always prevents overall approval.
- [DECISION] When a requirement applies to a sibling class, or review discovers
  a defect class, the reviewer must enumerate and evidence the complete sibling
  population. Out-of-scope defective siblings remain recorded and route to
  analyst, orchestrator, or human as a separate approved task; review must not
  silently widen scope or drop them.
- [DECISION] Contract-heavy tasks require consuming-repository-owned golden
  input/output vector artifacts identified by path or ref and content digest,
  plus context axes, cases, and explicit exclusions with reasons and source
  evidence.
- [DECISION] `overall: approved` is allowed only while the result is current and
  every dimension is `passed` or `not-applicable`. `not-reviewed`, `failed`, or
  `blocked` in an applicable dimension prevents approval.

## Target Snapshot And Validity

`target.ref` is a human-readable locator. `target.snapshot` is the immutable
identity actually reviewed. Use the narrowest available snapshot kind:

- `commit` for a repository commit;
- `tree` for an exact repository tree, including a deliberately captured
  working-tree state;
- `content-digest` for content-addressed files or generated output;
- `artifact-revision` for an immutable revision supplied by an artifact system.

The review consumer compares the target snapshot, the exact
`source_requirements_snapshot`, and the normalized `source_pin_set` with the
current handoff before relying on the verdict. The source pin set is compared as
an order-independent mapping keyed by source id. Any mismatch makes the result
stale. Reusing previous evidence is allowed only when the reviewer revalidates
it against the new target and source bindings and records it in a new result.

## Conformance Matrix

- [DECISION] Create one matrix row for every applicable entry in
  `task_spec.source_requirements.requirements`.

- `implementation_evidence` points to the reviewed behavior, code, document,
  generated artifact, or configuration that implements the requirement.
- `verification_evidence` points to tests, checks, reviewer probes, or other
  evidence that can distinguish conformance from non-conformance.
- [DECISION] `passed` requires both sufficient implementation and verification
  evidence.
- [DECISION] `blocked` means the reviewer cannot judge the requirement from
  available sources or access.
- [DECISION] `not-applicable` requires source-backed evidence that the
  requirement does not govern the target.

The matrix is requirement-oriented rather than file-oriented. Multiple files
may implement one requirement, and one file may participate in several rows.

## Independent Checks

### Negative Cases

- [DECISION] Use negative cases to prove rejection, failure, permission,
  boundary, rollback, or invalid-state behavior. The reviewer selects the
  applicable cases and executes each case or an independent probe. Existing
  tests may inform case selection, but inspecting them is not independent
  evidence. If the reviewer cannot execute a required case or probe, the check
  and every governed verdict are `blocked`.

### Sibling Audit

- [DECISION] Use a sibling audit when the changed rule applies across adapters,
  variants, handlers, generators, providers, consumers, or another identifiable
  class, and whenever review evidence reveals a defect class. Define the class,
  record discovery evidence, enumerate the complete `population`, and record an
  inspection outcome and evidence for every member.
- [DECISION] For a bugfix, accept `sibling_audit.applicability: not-applicable`
  only when defect analysis provides source evidence that the defect is a
  singleton and reviewer audit confirms that evidence. Missing or insufficient
  singleton evidence makes the sibling audit `blocked`.

Out-of-scope defective siblings stay in the audit. Each requires a reason,
evidence, next owner, and separate follow-up task reference with approval state.
An unapproved or missing follow-up blocks the audit. A passing audit accounts for
every population member without expanding the current task silently. Create one
class entry for every governing or discovered defect class.

- [DECISION] A passing class audit has exactly one inspected outcome for every
  population ref. Every out-of-scope `defect` outcome also appears in
  `out_of_scope_defects` with an approved follow-up task.

### Golden Vectors And Context Matrices

- [DECISION] For contract-heavy tasks, store each golden input/output vector as
  a consuming-repository-owned artifact with a reloadable path or ref and
  content digest. The review records the artifact, input and expected-output
  refs, execution evidence, and verdict.
- [DECISION] For contract-heavy tasks, record context axes and cases, plus every
  excluded context with a reason and source evidence. A context is neither
  covered nor excluded unless it appears in those fields.

Contract-heavy changes include public or cross-component schemas,
serialization, parsing, generation, protocol behavior, compatibility surfaces,
and other changes where prose-only review cannot reliably expose drift.

## `review_result`

Fillable copy: `../../templates/artifacts/review-result.md`.

```yaml
review_result:
  mode: task-spec | architecture | code | re-review | conformance
  target:
    ref: ""
    snapshot:
      kind: commit | tree | content-digest | artifact-revision
      value: ""
  source_requirements_ref: ""
  source_requirements_snapshot:
    kind: content-digest | artifact-revision
    value: ""
  source_pin_set:
    - source_id: ""
      immutable_pin:
        kind: commit | tree | content-digest | published-version | artifact-revision
        value: ""
        immutability_evidence: []
  source_requirements_complete: false
  conformance_matrix:
    - requirement_id: ""
      implementation_evidence: []
      verification_evidence: []
      verdict: passed | failed | blocked | not-applicable
  verdicts:
    conformance: passed | failed | blocked | not-applicable | not-reviewed
    architecture: passed | failed | blocked | not-applicable | not-reviewed
    code_quality: passed | failed | blocked | not-applicable | not-reviewed
    verification: passed | failed | blocked | not-applicable | not-reviewed
  validity: current | stale
  limitations:
    - dimension: conformance | architecture | code_quality | verification
      reason: ""
      missing_capability_or_evidence: ""
      evidence: []
  independent_checks:
    negative_cases:
      applicability: required | not-applicable
      applies_to: []
      reason: ""
      cases:
        - id: ""
          condition: ""
          expected: ""
          execution_kind: reviewer-executed-case | independent-probe
          execution_evidence: []
          verdict: passed | failed | blocked
      verdict: passed | failed | blocked | not-applicable
    sibling_audit:
      applicability: required | not-applicable
      applies_to: []
      reason: ""
      singleton_evidence: []
      classes:
        - id: ""
          definition: ""
          discovery_evidence: []
          population:
            - ref: ""
              scope: in-scope | out-of-scope
              evidence: []
          inspected:
            - ref: ""
              outcome: conforming | defect | not-applicable
              evidence: []
          out_of_scope_defects:
            - ref: ""
              reason: ""
              source_evidence: []
              next_owner: analyst | orchestrator | human
              follow_up_task_ref: ""
              approval_status: pending | approved | rejected
      evidence: []
      verdict: passed | failed | blocked | not-applicable
    golden_vectors:
      applicability: required | not-applicable
      applies_to: []
      reason: ""
      vectors:
        - id: ""
          artifact_owner: consuming-repository
          artifact_path_or_ref: ""
          artifact_digest:
            algorithm: ""
            value: ""
          input_ref: ""
          expected_output_ref: ""
          evidence: []
          verdict: passed | failed | blocked
      verdict: passed | failed | blocked | not-applicable
    context_matrix:
      applicability: required | not-applicable
      applies_to: []
      reason: ""
      axes:
        - id: ""
          values: []
      cases:
        - id: ""
          coordinates: []
          expected: ""
          evidence: []
          verdict: passed | failed | blocked
      exclusions:
        - coordinates: []
          reason: ""
          source_evidence: []
      verdict: passed | failed | blocked | not-applicable
  overall: approved | changes-requested | blocked | stale
```

## Fill Rules

- [DECISION] Set `source_requirements_complete: true` only when the referenced
  source requirements are `complete`, or when their applicability and
  completeness are both `not-applicable`.
- [DECISION] Treat a mismatch in `source_requirements_snapshot` or any
  `source_pin_set` entry as stale even when `source_requirements_ref` is
  unchanged. A replacement pin requires a new review and revalidated evidence.
- [DECISION] Do not pass conformance when a `published-version` source pin lacks
  source-backed non-replacement evidence.
- [DECISION] Map every required independent check to its governed dimensions
  through `applies_to`. All mapped checks must pass before a dimension passes.
- [DECISION] A required independent check must list at least one applicable
  dimension in `applies_to`.
- [DECISION] A required negative-case check must contain reviewer execution or
  independent-probe evidence for every case. Unavailable execution sets the
  check and governed dimensions to `blocked`; a limitation cannot substitute.
- [DECISION] Use only `conformance`, `architecture`, `code_quality`, and
  `verification` in `applies_to`.
- [DECISION] Record unavailable capability or evidence in `limitations` and use
  `blocked` or `not-reviewed` for the affected dimension. Any limitation on an
  applicable dimension prevents `overall: approved`.
- [DECISION] Set both `golden_vectors.applicability` and
  `context_matrix.applicability` to `required` for contract-heavy tasks. Missing
  repository-owned vector artifacts, digests, context coverage, or evidenced
  exclusions blocks their governed dimensions.
- [DECISION] Use `changes-requested` when current evidence proves a failed
  applicable dimension, `blocked` when a required judgment cannot be completed,
  and `stale` whenever validity is stale.
- [DECISION] A `not-reviewed` dimension is explicit missing coverage, not an
  approval-neutral state. Use `not-applicable` only after judging applicability.
- [DECISION] `review_result` accompanies the reviewer finding records defined in
  `../../roles/reviewer/references/core.md`; it does not replace actionable
  findings, locations, severities, or route actions.

## Used By

- `reviewer` produces `review_result` and owns independent review evidence;
- `analyst` establishes the pinned source requirements consumed by the result;
- `orchestrator` rejects stale or incomplete review handoffs;
- `developer`, `integrator`, and `watcher` use the separated verdicts and
  findings without rewriting reviewer judgment.
