---
id: local-change
---

# Pipeline: local-change

## Purpose

Make a small, local implementation change when requirements and architecture are
already clear enough that analyst and architect roles are not needed.

## Triggers

- Small code, docs, config, or test edit in one repository.
- Clear reviewer, watcher, CI, or human finding with an obvious fix.
- Repo-local maintenance that does not change product behavior, public
  contracts, data ownership, migration strategy, or release policy.

## Roles

`orchestrator`, `developer`, optional `reviewer`, optional `integrator`,
optional `watcher`.

## Steps

1. Orchestrator runs standard startup; see `../COMMON-STEPS.md`.
2. Orchestrator verifies that requirements, acceptance criteria, architecture
   boundaries, and verification expectations are clear from the request,
   repo-local instructions, or existing finding.
3. If product behavior, architecture, data ownership, security acceptance, or
   release policy is unclear, stop with the matching route action instead of
   using this pipeline.
4. Orchestrator prepares a compact implementation brief and verification plan.
5. Developer makes the smallest scoped change and runs applicable local gates.
6. Optional reviewer checks the diff when risk, ambiguity, or route approval
   requires an adversarial pass.
7. Optional integrator publishes the change when the run requests commit, push,
   or PR creation.
8. Optional watcher follows remote checks and review feedback when publication
   happened.

## Execution Policy

```yaml
execution_policy:
  recommended_model_levels:
    developer: standard
    reviewer: standard
    integrator: standard
    watcher: cheap
  model_level_rules:
    - role: reviewer
      level: standard
      when: selected
  consensus_defaults:
    - scope: default
      value: none
  consensus_escalations:
    - value: single-reviewer
      when: the change touches behavior, contracts, security, persistence, generated artifacts, or required verification gates
  iteration_cap: 1 developer/reviewer or developer/watcher loop before needs_human
```

- Recommended model levels: developer `standard`; reviewer `standard` when
  selected; integrator `standard`; watcher `cheap`.
- Default consensus: `none`.
- Escalate to `single-reviewer` when the change touches behavior, contracts,
  security, persistence, generated artifacts, or required verification gates.
- Default iteration cap: 1 developer/reviewer or developer/watcher loop before
  `needs_human`.

## Human Gates

- Any unclear requirement, acceptance criterion, product behavior, architecture
  boundary, data ownership, security acceptance, skipped required verification,
  merge, release, or deployment decision.
- Publication or merge approval unless explicitly authorized for the current
  run.

## Adapter Notes

Keep repo paths, commands, accounts, branch names, provider ids, and credentials
in run state or ignored local overlays. This pipeline records only placeholders
and role handoffs.
