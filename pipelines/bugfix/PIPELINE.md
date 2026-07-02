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

`orchestrator`, `analyst` or `reviewer`, `developer`, `integrator`, `watcher`,
optional `architect`, optional `qa-backend` or `qa-frontend`.

## Steps

1. Orchestrator runs standard startup; see `../COMMON-STEPS.md`.
2. Resolved defect-analysis role reproduces or source-checks the defect.
3. Resolved defect-analysis role defines the minimal expected behavior and
   affected scope.
4. Optional architect checks boundary, contract, or data-shape impact for
   cross-module defects.
5. Orchestrator prepares the implementation brief and verification plan.
6. Developer fixes the defect and adds regression coverage where practical.
7. Reviewer verifies root cause, fix, and regression test.
8. Integrator publishes.
9. Watcher follows checks and review.
10. Optional QA verifies the live/user-facing path.

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
