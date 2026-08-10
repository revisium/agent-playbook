---
id: bugfix
---

# Pipeline: bugfix

## Purpose

Fix a known defect with enough analysis to avoid patching the wrong layer.

## Triggers

- User reports a bug.
- QA, watcher, CI, or review returns a concrete defect.

## Roles

`orchestrator`, `reviewer`, `developer`, `integrator`, `watcher`, optional
`analyst` when source requirements must be created or clarified, optional
`architect`, optional `qa-backend` or `qa-frontend`.

## Steps

1. Orchestrator runs standard startup; see `../COMMON-STEPS.md`.
2. Reviewer reproduces or source-checks the defect and
   identifies whether conformance to governing sources is applicable.
3. [DECISION] When source requirements must be created or clarified,
   orchestrator selects analyst and returns `needs_analyst`; the pipeline
   resumes only after analyst produces a complete, immutably pinned source set
   that passes the requirements gate.
4. [DECISION] Reviewer defines the defect class and complete sibling population,
   or provides source evidence that the defect is a singleton. Out-of-scope
   siblings remain recorded for routing under the common review-assurance
   contract.
5. Reviewer defines the minimal expected behavior and affected scope from
   available evidence. Product ambiguity routes to analyst or human.
6. Optional architect checks boundary, contract, or data-shape impact for
   cross-module defects.
7. Orchestrator prepares the implementation brief and verification plan and,
   when conformance is applicable, confirms that the analyst-owned pinned source
   requirements are complete.
8. Developer fixes the defect and adds regression coverage where practical.
9. [DECISION] Reviewer always audits the defect class or singleton evidence,
   verifies root cause, fix, regression coverage, and out-of-scope routing, then
   emits the snapshot-bound `review_result` from the common review-assurance
   step.
10. [DECISION] Integrator publishes only after the reviewer gate has a current
   passing result.
11. Watcher follows checks and review.
12. Optional QA verifies the live/user-facing path.

## Execution Policy

```yaml
execution_policy:
  recommended_model_levels:
    developer: standard
    reviewer: standard
    watcher: cheap
    architect: deep
  model_level_rules:
    - role: architect
      level: deep
      when: selected
  consensus_defaults:
    - scope: default
      value: single-reviewer
  consensus_escalations:
    - value: dual-model
      when: root cause, data loss, security, concurrency, migration, or architecture boundary risk is unclear
  iteration_cap: 3 developer/reviewer or developer/watcher loops
```

- Recommended model levels: developer `standard`; reviewer `standard`; watcher
  `cheap`; architect `deep` when selected.
- Default consensus: `single-reviewer`.
- Escalate to `dual-model` when root cause, data loss, security, concurrency,
  migration, or architecture boundary risk is unclear.
- Default iteration cap: 3 developer/reviewer or developer/watcher loops.

## Human Gates

- Missing reproduction with risky fix.
- Behavior/product decision.
- Merge approval unless explicitly authorized.

## Adapter Notes

Keep local values in overlays. Do not bake the reporter, account, target host, or
cluster into this pipeline.
