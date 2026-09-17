# Context Loading

Operational policy for selecting context and transporting role results. Existing
rights, approval gates, verification requirements, and reference applicability
remain in force.

## Role Startup And Reference Selection

- [DECISION] Adapter wrappers load only the canonical `ROLE.md`. Its
  `Context Loading` section selects further reads for the current action.
  Repository instructions and the constitution remain applicable.
- [DECISION] Load role core knowledge when the owned action requires it. Load each
  additional reference when its trigger applies, including all required quality
  references for the active work. A startup reduction is not permission to skip
  evidence, independent review, or verification.
- [DECISION] A References list is a discovery index, not a preload manifest.
  Select stack, framework, tool, and practice references from route evidence and
  their applicability rules. Stop loading unrelated material once the current
  action has the context it needs.

## Child Results And Parent Context

- [DECISION] Return the portable `role_result` from `typed-contracts.md` with a
  short routing summary, artifact references, and named evidence pointers.
  Persist complete specialist artifacts under their existing schemas. Do not
  paste child transcripts or duplicate complete artifacts into the parent.
- [DECISION] Routine orchestration consumes compact run state, the latest role
  result, current artifact metadata, and applicable transition/gate rules. After
  a stage boundary or compaction, use that state as the resumption point.
- [DECISION] The orchestrator may open named evidence when preparing an owned
  handoff, checking a gate, or resolving a concrete dispute. It delegates subject
  decisions to their owner and preserves approval, rights, iteration, and
  verification gates. Compact transport does not make a success claim sufficient
  evidence for a gate.

## Review Inputs

- [DECISION] Use `../templates/artifacts/review-handoff.md` for review context:
  one current pin per applicable artifact kind, a short delta (or an explicit
  initial-review statement), and inline unresolved findings. Preserve the
  target/source snapshots and immutable source-id pin set required by
  `../references/quality/conformance-assurance.md`.
- [DECISION] Keep concrete target, source, scope, repository, and test
  instructions in the handoff. References supplement those instructions; they
  do not replace specialist evidence or the approved review scope.
- [DECISION] Do not attach chains of superseded analysis, architecture, or full
  review transcripts. An unresolved finding carries its id, owner, severity,
  status, claim, evidence pointer, and verification expectation. A specialist may
  open a named older artifact when a current finding requires that evidence.
- [DECISION] Missing transport fields, conflicting current pins, or appended
  history chains require orchestrator repair before subject work. The reviewer
  returns `changes_requested`, `needsHuman: false`, and a `nextSteps` item owned
  by `orchestrator`. This is not a completed subject review and cannot satisfy
  the review gate. Genuine missing human information or approval still follows
  `escalation.md`; transport repair cannot resolve it.
- [DECISION] Preserve finding identities across iterations. A producer's
  `claimed_fixed` status is not closure; `verified_fixed` requires independent
  reviewer evidence against the current snapshot.

## Artifact Access

- [DECISION] Open run artifacts by named path. Do not recursively search run
  history to reconstruct handoffs. Ask the orchestrator to repair missing
  context, and use current state plus the relevant delta instead.
