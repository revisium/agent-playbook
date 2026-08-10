# Review Result Template

Canonical schema owner:
`../../references/quality/conformance-assurance.md`.
Escalation vocabulary owner: `../../method/escalation.md`.

The reviewer fills this artifact against an exact target snapshot. Reviewer
finding records remain defined by `../../roles/reviewer/references/core.md`.

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

- [DECISION] Bind `target.snapshot` to immutable content, not a mutable branch, tag, URL,
  or latest artifact.
- [DECISION] Mark the result stale when the target, source requirements, pins,
  requirements, or reviewed evidence changes; rerun the affected review.
- [DECISION] Compare both `source_requirements_snapshot` and `source_pin_set`;
  replacing a pin alone never refreshes the result.
- [DECISION] Reject `published-version` as immutable without source-backed
  evidence that the publishing system prevents exact-version replacement.
- [DECISION] Keep all four verdict dimensions explicit.
- [DECISION] Use the independent checks required by
  `../../references/quality/conformance-assurance.md`.
- [DECISION] Do not pass a dimension until every required independent check
  mapped to it passes. Record missing capability or evidence as a limitation.
- [DECISION] Give every required independent check at least one applicable
  dimension in `applies_to`.
- [DECISION] Negative-case evidence must come from a reviewer-executed case or
  independent probe. Unavailable execution blocks governed dimensions.
- [DECISION] Use `sibling_audit: not-applicable` for a bugfix only with audited
  source evidence that the defect is a singleton.
- [DECISION] For contract-heavy tasks, require both repository-owned digested
  golden vector artifacts and a context matrix with axes, cases, and evidenced
  exclusions.
- [DECISION] Attach actionable reviewer findings separately when a dimension fails or is
  blocked.
