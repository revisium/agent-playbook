# Delivery Lifecycle

This file names the delivery lifecycle stages, their variants, the ADR-vs-technical-design
policy, and the pre-developer consistency check. It consolidates by reference — canonical
phase order is owned by `orchestrator-run.md`; role definitions are owned by their
respective `ROLE.md` files.

## Lifecycle Stages

| Stage | Owning Role | Produced Artifact | Next Consumer |
| --- | --- | --- | --- |
| Business analysis | analyst | `task_spec` (product intent, scope, requirements, acceptance criteria, user flows, human actions) | architect or developer |
| System analysis | analyst (evidence) → architect (interpretation) | `task_spec.current_behavior` / `system_flows` / `sources` | architect |
| Architecture & ADR | architect | `architecture_plan` + `adr_candidate` | orchestrator / human gate |
| Technical design | architect | `architecture_plan` (boundaries, contracts, data model, migration, slices, test strategy) | orchestrator |
| Implementation brief | orchestrator | `implementation_brief` | developer |
| Implementation | developer | `developer_result` + `verification_result` | reviewer |
| Verification | developer / integrator / watcher / QA | `verification_result` | integrator / watcher |
| Watcher feedback | watcher | `verification_result.pr_feedback` | developer or integrator |

**System-analysis boundary clarification.** Analyst captures observed current-system
behavior, flows, and constraints as evidence in `task_spec`. No new role is created.
Technical-shape interpretation of that evidence is architect-owned. See
`role-composition.md` for the full analyst / architect / developer split.

Fillable templates for produced artifacts:

- `task_spec` → `../templates/artifacts/task-spec.md`
- `architecture_plan` → `../templates/artifacts/architecture-plan.md`
- `implementation_brief` → `../templates/artifacts/implementation-brief.md`
- `verification_result` → `../templates/artifacts/verification-result.md`

## Lifecycle Variants

Describe the path; do not restate phase order (owned by `orchestrator-run.md`). For
concrete pipeline steps see `../pipelines/feature-development/PIPELINE.md`.

- **Lightweight path** — analyst → developer. Architect is skipped when requirements are
  clear and no technical-shape decision is needed (no new boundaries, contracts, data model,
  migration, or ADR-level risk).
- **Architecture-required path** — analyst → architect → developer. Triggered when
  `requirements_check.status` is `needs_architect`.
- **ADR-required path** — analyst → architect → human-approval gate → developer. Triggered
  when `architecture_plan.adr_candidate` is present and requires `needs_human` approval
  before implementation proceeds. See ADR vs Technical Design Policy below.
- **Feedback-loop path** — watcher → developer / reviewer. Triggered when watcher routes PR
  feedback; developer fixes actionable items; reviewer may classify ambiguous findings first.

## ADR vs Technical Design Policy

Technical design and ADR are related but distinct:

- **Technical design** = the full `architecture_plan` (boundaries, contracts, data model,
  migration, slices, test strategy). Produced for any non-trivial technical-shape change.
- **ADR** = the durable, hard-to-reverse, cross-cutting subset surfaced as
  `architecture_plan.adr_candidate`. Requires `needs_human` approval before implementation
  because the decision affects multiple components, is costly to reverse, or crosses team
  or domain boundaries.

Relationship: every ADR is anchored in a technical design. Not every technical design
needs an ADR.

Architect drafts the ADR record only when the architect role has docs/method-write rights;
otherwise architect returns the `adr_candidate` and the orchestrator routes the approval
gate. ADR Gate criteria are owned by `../roles/architect/references/core.md`. Escalation
vocabulary is owned by `escalation.md`.

## Pre-Developer Consistency Check

This checklist consolidates by reference the gate owned by `escalation.md` "Blocking
Clarification Markers" and `../checklists/requirements.md`. It is a derived view, not an
independent owner.

Before developer execution, verify:

- [ ] `requirements_check.status` is `ready`.
- [ ] `task_spec.open_questions` is empty or all items are resolved.
- [ ] `task_spec.human_actions` are completed or explicitly non-blocking.
- [ ] Architecture / ADR approvals resolved (no pending `needs_human` from architect).
- [ ] `implementation_brief` is present with no `stop_and_escalate_if` entries active.
- [ ] `verification_plan` is present (inferred or repo-declared).
- [ ] Required capabilities and roles are resolved.
- [ ] Required local values are supplied (placeholders from `env-boundary.md` replaced in
  run state, not committed markdown).

If any item is unresolved, route to the owning marker from `escalation.md` instead of
starting implementation.

## Lifecycle In The Route

The orchestrator maps lifecycle stages to route-plan fields and pipeline steps:

- Phase order and run lifecycle → `orchestrator-run.md` (canonical owner).
- Route plan and run-state contract → `route-plan.md`.
- Human gate approval and route decisions → `route-approval.md`.
- Typed result / gate / artifact contracts → `typed-contracts.md`.
- Revo-aware route decision and readiness → `../adapters/revo/README.md`.
