# Task Spec Template

Canonical schema owner: `../../roles/analyst/references/core.md`.
Escalation vocabulary owner: `../../method/escalation.md`.

The analyst owns this artifact. It defines what should change, why it matters,
and how readiness will be judged.

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

- Ground `sources` in inspected files, docs, run artifacts, or external sources.
- [DECISION] Use `source_requirements` for governing sources that downstream review must
  trace. Pin immutable content; do not treat a mutable branch, tag, URL, or
  latest artifact as the pin.
- [DECISION] Mark source requirements `complete` only when the governing source set, pins,
  and requirement provenance mappings are complete.
- [DECISION] Use `published-version` only with source-backed evidence that the
  publishing system prevents replacement of that exact version; otherwise use
  a content digest or mark the source set incomplete.
- Keep product ambiguity in `open_questions`, not hidden in prose.
- Put human work in `human_actions`, not mixed into developer tasks.
- Set escalation flags according to `../../method/escalation.md`.
