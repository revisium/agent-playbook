---
id: method-development
---

# Pipeline: method-development

## Purpose

Create or improve the agent method itself: roles, stacks, framework references,
pipelines, adapters, and maintenance rules.

## Triggers

- A requested route is missing a required capability.
- The user asks to improve roles, pipelines, or agent behavior.
- A repeated run failure has been aggregated outside this repository and
  approved as a reusable rule.
- A new language, framework, surface, or adapter is needed.

## Roles

`orchestrator`, `knowledge-engineer`, optional `architect`, optional
`reviewer`, optional `integrator`, optional `watcher`.

## State

- proposed method change summary;
- affected role, stack, pipeline, or adapter paths;
- source labels for every new hard rule;
- route approval record;
- review findings when requested.

## Steps

1. Orchestrator runs standard startup; see `../COMMON-STEPS.md`.
2. Confirm the approved route is `method-development`.
3. Capability check output identifies missing or weak definitions.
4. Knowledge-engineer extracts source material and drafts the change.
5. Reviewer checks structure, source labels, env-boundary compliance, and
   adapter neutrality.
6. Knowledge-engineer fixes blocking findings.
7. Integrator publishes the small method change when requested.
8. Optional watcher follows CI and review state after publication.

## Execution Policy

```yaml
execution_policy:
  recommended_model_levels:
    knowledge-engineer: deep
    architect: deep
    reviewer: standard
  model_level_rules:
    - role: architect
      level: deep
      when: selected
    - role: reviewer
      level: deep
      when: role, pipeline, or adapter boundary changes are in scope
  consensus_defaults:
    - scope: default
      value: single-reviewer
  consensus_escalations:
    - value: dual-model
      when: adding routable roles, changing human gates, changing materialization behavior, or changing result/usage contracts
  iteration_cap: 2 knowledge-engineer/reviewer loops
```

- Recommended model levels: knowledge-engineer `deep`; architect `deep` when
  selected; reviewer `standard` by default and `deep` for role, pipeline, or
  adapter boundary changes.
- Default consensus: `single-reviewer`.
- Use `dual-model` when adding routable roles, changing human gates, changing
  materialization behavior, or changing result/usage contracts.
- Default iteration cap: 2 knowledge-engineer/reviewer loops.

## Human Gates

- approval before adding or changing hard method rules;
- merge approval.

## Adapter Notes

- Manual Codex or Claude Code runs may edit this repository directly after
  route approval.
- Future revo runs should treat method changes as ordinary repository work,
  while loaded runtime definitions remain generated/imported from this source.
