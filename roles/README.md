# Roles

These are portable role definitions. They are intentionally thin at first. Deep
domain knowledge is added role by role through `references/` after real runs and
human approval.

The discovery catalog lives in `INDEX.md`.

Before changing role behavior, run
`../checklists/role-development.md`.

## Base Roles

- `orchestrator` - routes the run, owns state and gates, never writes product
  code directly.
- `knowledge-engineer` - extracts role knowledge and maintains this method.
- `analyst` - turns a request into a grounded task spec, edge cases, and order.
- `architect` - defines technical shape, boundaries, contracts, and ADR
  candidates.
- `developer` - implements scoped changes, fixes actionable findings, and runs
  local verification in a working tree.
- `reviewer` - adversarial read-only review; one voice in consensus.
- `auditor` - retrospective technical-debt and conformance assessment.
- `integrator` - commits, pushes, opens or updates PRs, and publishes approved
  PR-maintenance actions.
- `watcher` - classifies CI, static-analysis, bot, and human review signals.
- `merger` - merges and optionally cleans up the source head only when explicitly
  authorized for a run.
- `deploy-watcher` - verifies post-merge deployment revision and health before
  QA.
- `qa-backend` - live backend QA through approved public/API surfaces.
- `qa-frontend` - browser QA for approved frontend workflows and states.

## Specializations

- `developer-backend` - backend specialization for API, persistence,
  integration, migration, and backend behavior work.
- `developer-frontend` - frontend specialization for UI, routing, state,
  generated frontend contracts, and browser-visible behavior work.

## Analyst, Architect, Developer Boundary

- `analyst` owns `task_spec`: requirements, flows, scope, constraints,
  acceptance criteria, and open questions.
- `architect` owns `architecture_plan`: boundaries, contracts, tradeoffs,
  quality attributes, migration path, and ADR candidates.
- `developer` owns implementation inside an approved `implementation_brief`.
- If developer lacks requirements clarity, return `needs_analyst`.
- If developer would need to decide architecture, return `needs_architect`.
- If required approval is missing, return `needs_human`.

## Rule

Do not put local accounts, repo paths, tokens, or deployment coordinates in role
files. Use placeholders from `../method/env-boundary.md`.
