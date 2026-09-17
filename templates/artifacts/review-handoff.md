# Review Handoff

Canonical policy owner: `../../method/context-loading.md`.

The orchestrator supplies this compact transport alongside the review task.
Include concrete scope, source, repository, and test instructions. The complete
review evidence still follows `review-result.md` and its canonical owner.

```yaml
review_handoff:
  mode: task-spec | architecture | code | re-review | conformance
  scope: ""             # approved review scope; include underlying mode on re-review
  instructions: []       # concrete target/source/test instructions and constraints
  current_pins:
    analysis:            # omit when not required by the mode or approved route
      path: ""
      snapshot:
        kind: content-digest | artifact-revision
        value: ""
        digest_algorithm: ""
        digest_algorithm_explanation: ""
    architecture:        # omit when not required by the mode or approved route
      path: ""
      snapshot:
        kind: content-digest | artifact-revision
        value: ""
        digest_algorithm: ""
        digest_algorithm_explanation: ""
    target:
      ref: ""
      snapshot:
        kind: commit | tree | content-digest | artifact-revision
        value: ""
        digest_algorithm: ""
        digest_algorithm_explanation: ""
  source_requirements:   # omit only when the review mode has no source requirements
    ref: ""             # current analyst-owned artifact with its immutable source-id pin set
    snapshot:
      kind: content-digest | artifact-revision
      value: ""
      digest_algorithm: ""
      digest_algorithm_explanation: ""
  delta_from_previous_pin: ""  # initial review: no previous pin; otherwise changed/unchanged summary
  open_findings: []      # inline entries with all fields below when unresolved findings exist
  # - id: ""
  #   owner: ""
  #   severity: blocker | high | medium | low | info
  #   status: open | claimed_fixed | needs_clarification
  #   claim: ""
  #   evidence: ""      # named artifact or source location
  #   verification_expectation: ""
```

## Fill Rules

- [DECISION] Supply one current pin per applicable kind; never attach competing
  current versions or prior review transcripts. Analysis, architecture, and
  source requirements may be absent only when the selected mode and approved
  route do not require them. Always pin the target. Preserve the exact
  source-requirements snapshot and source-id-to-immutable-pin set required by
  `../../references/quality/conformance-assurance.md`; reference that set through
  its current artifact rather than duplicating it.
- [DECISION] Use the snapshot identity rules of that same reference, including
  immutable `artifact-revision` identities. Populate digest fields only for
  `content-digest`; leave them empty for commit, tree, and artifact-revision
  identities. A path alone is not a pin.
- [DECISION] State `initial review: no previous pin` when there is no prior
  review. Otherwise give a short changed/unchanged summary. The delta does not
  narrow the approved review scope or replace evidence needed for verification.
- [DECISION] Preserve every unresolved finding id from all independent voices,
  including producer-claimed fixes. Each entry requires `id`, `owner`, `severity`,
  `status`, `claim`, `evidence`, and `verification_expectation`. Map the existing
  finding's `next_owner` to `owner` and `summary` to `claim`; derive missing
  transport fields from named evidence or return them to their owner.
- [DECISION] `claimed_fixed` is a producer claim. Only independent reviewer
  evidence against the current snapshot permits `verified_fixed` and removal
  from the unresolved index; keep the closure evidence in the review result.
- [DECISION] Missing fields or conflicting pins return to the orchestrator for
  transport repair under `../../method/context-loading.md`. Do not guess lost
  finding semantics, turn transport repair into subject approval, or bypass
  genuine human-information and approval gates.
- [DECISION] Open older evidence only by a named pointer required for a current
  finding. Do not attach history chains or recursively search run artifacts.
