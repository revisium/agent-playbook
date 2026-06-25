# Agent Method Base

This directory defines the portable method used by Codex, Claude Code, and the
future revo agent-orchestrator runtime.

## Principle

The same source should drive three execution modes:

- Codex: skills and direct prompts.
- Claude Code: subagents, skills, commands, and hooks.
- revo: role and pipeline rows loaded into the orchestrator control plane.

The canonical source is not any one platform file. It is the method definition in
this repository:

- constitution rules live in `constitution.md`;
- roles live in `roles/<role>/ROLE.md`;
- role knowledge lives in `roles/<role>/references/`;
- shared practice references live in `references/`;
- stack knowledge lives in `stacks/<stack>/`;
- requirements readiness is checked with `../checklists/requirements.md`;
- verification planning is defined by
  `../references/quality/verification.md`;
- fillable run artifacts live in `../templates/artifacts/`;
- pipelines live in `pipelines/<pipeline>/PIPELINE.md`;
- catalog-backed discovery is defined by `discovery.md`, `roles/INDEX.md`, and
  `pipelines/INDEX.md`;
- route selection is defined by `intake.md`, `discovery.md`,
  `capability-check.md`, `route-plan.md`, and `route-approval.md`;
- escalation marker semantics are defined by `escalation.md`;
- execution policy is defined by `execution-policy.md`;
- usage accounting is defined by `usage-accounting.md`;
- the delivery lifecycle stages, variants, ADR-vs-technical-design policy, and
  pre-developer consistency check are defined by `lifecycle.md`;
- typed result/gate/artifact contracts suitable for Revo validation are defined by
  `typed-contracts.md`;
- the orchestrator run lifecycle is defined by `orchestrator-run.md`;
- manual execution and consuming-repo setup are defined by `manual-run.md` and
  `bootstrap.md`;
- adapter materialization into consuming-repo files is defined by
  `materialization.md`;
- platform-specific generation and invocation rules live in `adapters/`;
- local values live outside committed markdown, per `env-boundary.md`.

## Build Order

1. Keep the constitution explicit and small.
2. Keep the base schema small.
3. Add thin role definitions with explicit references.
4. Introduce shared practice references and role composition rules.
5. Layer stack and specialization guidance through `role-composition.md`.
6. Establish pipelines with gates and handoff contracts.
7. Require route approval and clarification gates before execution.
8. Maintain catalogs for discovery and capability checks.
9. Add execution policy, consensus, model-level, budget, and usage contracts.
10. Create a route plan and run-state contract.
11. Add verification plan and result contracts.
12. Add fillable artifact templates for the canonical contracts.
13. Specify manual run and consuming-repo bootstrap.
14. Describe adapter materialization for Codex and Claude Code.
15. Set the orchestrator run contract.
16. Exercise the method manually in Codex and Claude Code.
17. Fold repeated lessons into references after human approval.
18. Later, add a revo importer that loads the same definitions into
   agent-orchestrator.

## Non-Goals

- Do not store run logs here.
- Do not store project-specific facts here unless they are examples.
- Do not store local env values or secrets here.
- Do not fork role behavior separately for Codex and Claude Code.
