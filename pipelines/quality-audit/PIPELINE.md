---
id: quality-audit
---

# Pipeline: quality-audit

## Purpose

Assess technical debt and conformance to the quality references for an existing
repository or a batch of already-merged PRs, and produce a prioritized debt
ledger without editing code.

## Triggers

- Tech-debt audit.
- Conformance check of a repo or merged PRs.
- Debt ledger or quality grade.

## Roles

`orchestrator`, `auditor`, optional `reviewer`, optional `architect`.

## Steps

1. Orchestrator runs standard startup; see `../COMMON-STEPS.md`.
2. Gather the audit target, repo overlays, and available tool output.
3. Auditor grades the target through the three lenses and produces the debt
   ledger.
4. Optional reviewer adjudicates contested findings or false-positive claims.
5. Optional architect confirms architecture-conformance findings and design
   forks.
6. Orchestrator returns the ledger and a promotion proposal for human decision.

## Execution Policy

```yaml
execution_policy:
  recommended_model_levels:
    auditor: deep
    reviewer: standard
    architect: deep
  model_level_rules:
    - role: reviewer
      level: standard
      when: selected
    - role: architect
      level: deep
      when: selected
  consensus_defaults:
    - scope: default
      value: none
  consensus_escalations:
    - value: single-reviewer
      when: a finding asserts an architecture-boundary defect, an accepted risk, or a contested false positive
  iteration_cap: 1 audit/adjudication loop for the ledger
```

- Recommended model levels: auditor `deep`; reviewer `standard` when selected;
  architect `deep` when selected.
- Default consensus: `none`.
- Escalate to `single-reviewer` when a finding asserts an architecture-boundary
  defect, an accepted risk, or a contested false positive.
- Default iteration cap: 1 audit/adjudication loop for the ledger.

## Human Gates

- Before promoting ledger findings into remediation runs (`bugfix`,
  `local-change`, or `feature-development`).
- Before converting analysis into code edits.

## Adapter Notes

Codex and Claude Code should run this read-only. The auditor produces a ledger;
it never edits code. This pipeline is canonical-only and has no skill wrapper.
