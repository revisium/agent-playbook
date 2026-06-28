# Debt Ledger Template

Canonical schema owner: `../../roles/auditor/references/core.md`.
Escalation vocabulary owner: `../../method/escalation.md`.

The auditor owns this artifact. It records a retrospective assessment of
technical debt and conformance for an existing repository or a batch of
already-merged PRs. It is analysis, not a route to edits.

```yaml
debt_ledger:
  date: ""
  target:
    kind: repo | merged-prs
    ref: ""
  coverage:
    statement: ""
    examined: []
    skipped: []
    fully_covered: true
  tool_sources: []
  tool_vs_human_note: ""
  items:
    - id: ""
      title: ""
      lens: code-level | architecture-conformance | readability-comprehension
      taxonomy_category: >
        architectural | structural | test | documentation |
        low-internal-quality | code-complexity | code-smell | coding-style |
        technological-gap
      taxonomy_cause: >
        deliberate-prudent | deliberate-reckless | inadvertent-prudent |
        inadvertent-reckless
      location: ""
      severity: high | med | low
      remediation_size: S | M | L
      violated_reference: ""
      automatable: tool | human
      impact: ""
      remediation_direction: ""
      status: open | recorded-decision | needs-confirmation
  top_prioritized: []
  gate_agenda:
    proposed_runs: []
    needs_human: []
  residual_risks: []
  next_action: continue | needs_architect | needs_analyst | needs_human | stop
```

## Fill Rules

- State coverage honestly. Set `fully_covered: false` and list `skipped` when the
  target was sampled rather than fully examined. Never truncate silently.
- Record the `tool_sources` used and a short `tool_vs_human_note` describing what
  was delegated to tools and what the auditor judged directly.
- Tie every item to a `violated_reference`, a `taxonomy_category`, and a
  `taxonomy_cause`.
- Set `automatable: tool` when a configured tool already grades the finding;
  inherit its result and any remediation number. Set `automatable: human` for
  readability, comprehension, architecture-fit, and minimal-sufficiency findings.
- Keep `location` as `file:line` for code findings; use PR and artifact ids only
  when no concrete line is available.
- Map an inherited tool remediation number onto `remediation_size`; mark a guess
  as an estimate when no tool number exists.
- Put proposed bugfix or refactor runs and human decisions in `gate_agenda`. Do
  not start remediation; a human approves which findings convert into runs.
- Use `next_action` values from `../../method/escalation.md`.
