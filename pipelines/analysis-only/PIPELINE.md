---
id: analysis-only
---

# Pipeline: analysis-only

## Purpose

Answer a technical question or produce a plan without editing code.

## Triggers

- Architecture review.
- Feasibility analysis.
- Source-backed explanation.
- Plan-map before role or pipeline work.

## Roles

`orchestrator`, `analyst`, optional `architect`, optional `reviewer`, optional
`knowledge-engineer`.

## Steps

1. Orchestrator runs standard startup; see `../COMMON-STEPS.md`.
2. Gather source files and existing docs.
3. Analyst produces findings or plan.
4. Optional architect produces architecture options or ADR candidate.
5. Optional reviewer checks hallucinated paths, line claims, and edge cases.
6. Orchestrator returns a concise decision or next-step proposal.

## Execution Policy

```yaml
execution_policy:
  recommended_model_levels:
    analyst: deep
    architect: deep
    reviewer: standard
  model_level_rules:
    - role: architect
      level: deep
      when: selected
    - role: reviewer
      level: deep
      when: factual or architectural risk is high
  consensus_defaults:
    - scope: default
      value: none
  consensus_escalations:
    - value: single-reviewer
      when: the answer cites source paths, line numbers, or irreversible architecture recommendations
  iteration_cap: 1 review/fix loop for produced artifacts
```

- Recommended model levels: analyst `deep`; architect `deep` when selected;
  reviewer `standard` or `deep` when factual or architectural risk is high.
- Default consensus: `none`.
- Escalate to `single-reviewer` when the answer cites source paths, line
  numbers, or irreversible architecture recommendations.
- Default iteration cap: 1 review/fix loop for produced artifacts.

## Human Gates

- Before converting analysis into code edits.
- Before promoting best-practice proposals into hard rules.

## Adapter Notes

Codex and Claude Code should run this read-only unless the user explicitly asks
to write artifacts.
