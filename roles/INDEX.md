# Role Catalog

This catalog is the discovery surface for orchestrator intake and future runtime
imports. Keep role behavior in `ROLE.md` and references; keep this file focused
on routing metadata.

## Catalog Format

Each record defines:

- `id` - canonical role id used by pipelines and route plans.
- `path` - role definition path.
- `surface` - primary work surface, or `any`.
- `capabilities` - short routing tags used during discovery.
- `rights` - read/write boundary summary.

Generated `catalog/roles.json` enriches these records with each role's
frontmatter `runner_id`; do not duplicate runner bindings in this markdown
catalog.

## Role Records

### `orchestrator`

- path: `roles/orchestrator/ROLE.md`
- surface: any
- capabilities: intake, routing, gates, clarification, state, handoffs
- rights: state and routing only

### `knowledge-engineer`

- path: `roles/knowledge-engineer/ROLE.md`
- surface: method
- capabilities: role design, references, pipelines, adapters
- rights: method repo edits after approval

### `analyst`

- path: `roles/analyst/ROLE.md`
- surface: any
- capabilities: task spec, requirements check, decomposition, source-backed analysis
- rights: read-only

### `architect`

- path: `roles/architect/ROLE.md`
- surface: any
- capabilities: architecture plan, boundaries, contracts, ADRs, tradeoffs
- rights: read-only

### `developer`

- path: `roles/developer/ROLE.md`
- surface: any
- capabilities: implementation, bugfix, scoped refactoring, local verification,
  route stops
- rights: working tree writes

### `developer-backend`

- path: `roles/developer-backend/ROLE.md`
- surface: backend
- capabilities: api, persistence, jobs, workers, migrations, backend tests,
  contract and integration behavior
- rights: working tree writes

### `developer-frontend`

- path: `roles/developer-frontend/ROLE.md`
- surface: frontend
- capabilities: ui, routing, forms, browser-visible behavior, frontend state,
  generated frontend contracts
- rights: working tree writes

### `reviewer`

- path: `roles/reviewer/ROLE.md`
- surface: any
- capabilities: adversarial review, risk finding, gate review
- rights: read-only

### `auditor`

- path: `roles/auditor/ROLE.md`
- surface: any
- capabilities: tech-debt audit, conformance grading, debt ledger
- rights: read-only

### `integrator`

- path: `roles/integrator/ROLE.md`
- surface: repo
- capabilities: commit, push, pull request publication, PR-maintenance publication
- rights: git and GitHub writes

### `watcher`

- path: `roles/watcher/ROLE.md`
- surface: repo
- capabilities: ci, quality gates, review comments, PR state
- rights: read-only PR inspection

### `merger`

- path: `roles/merger/ROLE.md`
- surface: repo
- capabilities: merge execution, approved source-head cleanup
- rights: GitHub merge and approved source-head cleanup

### `deploy-watcher`

- path: `roles/deploy-watcher/ROLE.md`
- surface: deployment
- capabilities: deployment verification, revision checks, health checks,
  post-merge QA handoff
- rights: read-only deployment inspection

### `qa-backend`

- path: `roles/qa-backend/ROLE.md`
- surface: backend
- capabilities: live API QA, runtime behavior checks, backend scenario evidence
- rights: approved API access

### `qa-frontend`

- path: `roles/qa-frontend/ROLE.md`
- surface: frontend
- capabilities: browser QA, workflow smoke checks, frontend scenario evidence
- rights: approved browser automation

## Composition Notes

- `developer-backend` and `developer-frontend` extend `developer`; see
  `../method/role-composition.md`.
- Stack and framework knowledge is selected separately from the role id.
- Shared practice references are selected separately from the role id.
- Local commands, accounts, paths, hosts, and secrets must come from a run overlay,
  not this catalog.
