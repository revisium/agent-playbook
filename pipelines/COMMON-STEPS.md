# Pipeline Common Steps

This file defines reusable pipeline steps. Pipeline-specific files link here
instead of restating the same orchestration gates.

## Standard Startup

Every multi-role pipeline starts with the lifecycle in
`../method/orchestrator-run.md`. This file is the canonical owner of phase order.

The selected pipeline continues only after the route, model policy, consensus
policy, and budget policy are approved or changed by the human.

## Standard Human Gate

Route approval before execution is defined in `../method/route-approval.md`.
Pipeline files should list only gates that are specific to that pipeline.

## Standard Clarification Gate

Before developer execution, the orchestrator checks
`../checklists/requirements.md` and `../method/escalation.md`. The pipeline
continues only when blocking clarification markers are resolved.

## Standard Verification Planning

Before developer execution, the orchestrator prepares `verification_plan` from
route capabilities, repo-local quality docs, selected stack references, selected
tooling references, and upstream risk notes.

`VERIFICATION.md` is the default repo-local verification contract. The
orchestrator looks for it or a repo-declared equivalent first. If neither exists,
the orchestrator composes an inferred plan from scripts, CI config,
static-analysis config, source layout, and selected stack references, then
records `fallback_used: true` and a follow-up to add the repo-local contract.

Developer, integrator, and watcher gate results should be reported through
`verification_result`. Developer implementation handoff, deploy-watcher
verification, and QA scenario reports use their role-owned result contracts and
are stored as separate run-state handoffs.

When static analysis is selected by repo evidence, the plan records provider
state, local or hosted mode, issue-level access, finding categories, and the
false-positive or accepted-risk policy. Missing provider access is a skipped or
`needs_human` state, not a passed gate.

## Standard Review Assurance

Before a reviewer gate, the orchestrator supplies the exact target snapshot and,
when source requirements apply, the exact analyst-owned source-requirements
snapshot plus its source-id-to-immutable-pin set. The reviewer returns
`review_result` according to
`../references/quality/conformance-assurance.md`.

- [DECISION] A reviewer gate passes only with a current `review_result` whose
  applicable verdict dimensions and every required independent check governing
  them pass. A later target, source-requirements snapshot, or source-pin-set
  change makes the result stale and requires a new review of affected evidence.
