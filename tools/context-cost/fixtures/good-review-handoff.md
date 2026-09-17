# Current review transport

```yaml
review_handoff:
  mode: re-review
  scope: code correctness and existing review findings
  instructions:
    - Read current changed files and run the applicable verification checks.
  current_pins:
    analysis:
      path: "{{RUN}}/analysis-v2.md"
      snapshot:
        kind: content-digest
        value: "{{ANALYSIS_DIGEST}}"
        digest_algorithm: sha256
        digest_algorithm_explanation: SHA-256 of the analysis artifact bytes
    target:
      ref: "{{REPO}}"
      snapshot:
        kind: commit
        value: "{{TARGET_COMMIT}}"
        digest_algorithm: ""
        digest_algorithm_explanation: ""
  source_requirements:
    ref: "{{RUN}}/analysis-v2.md"
    snapshot:
      kind: content-digest
      value: "{{ANALYSIS_DIGEST}}"
      digest_algorithm: sha256
      digest_algorithm_explanation: SHA-256 of the artifact containing the source-id pin set
  delta_from_previous_pin: Fixed lower-bound handling; public contract unchanged.
  open_findings:
    - id: R1
      owner: developer
      severity: high
      status: claimed_fixed
      claim: Values below the lower bound are returned unchanged.
      evidence: "{{REPO}}/clamp.js:4"
      verification_expectation: Independently verify lower-bound and sibling cases on the current target.
```

The approved route has no architecture artifact. All identifiers are placeholders;
this fixture tests lexical packing, not evidence validity.
