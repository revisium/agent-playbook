# Pipeline Catalog

This catalog is the discovery surface for selecting candidate pipelines during
intake. Keep detailed execution order in each `PIPELINE.md`; keep this file
focused on routing metadata.

## Catalog Format

Each record defines:

- `id` - canonical pipeline id.
- `path` - pipeline definition path.
- `triggers` - request patterns that make the pipeline a candidate.
- `required_roles` - roles that must exist before automatic execution.
- `alternative_roles` - role-group objects where at least one role must exist.
- `optional_roles` - roles that improve coverage but do not block by default.
- `route_gates` - pipeline-specific human gates after standard startup.
- `platform_invocation` - whether this pipeline is exposed as a direct platform
  skill wrapper (`canonical-only` or `skill-wrapper`).

## Pipeline Records

### `feature-development`

- path: `pipelines/feature-development/PIPELINE.md`
- triggers: new feature, multi-repo change, task-to-PR work
- required_roles: `orchestrator`, `analyst`, `reviewer`, `developer`,
  `integrator`, `watcher`
- alternative_roles: []
- optional_roles: `architect`, `merger`, `deploy-watcher`, `qa-backend`,
  `qa-frontend`
- route_gates: task spec approval, human-action items, merge approval,
  ambiguous architecture/product/security decisions
- platform_invocation: `canonical-only`

### `bugfix`

- path: `pipelines/bugfix/PIPELINE.md`
- triggers: known defect, QA finding, watcher finding, CI or review defect
- required_roles: `orchestrator`, `developer`, `integrator`, `watcher`
- alternative_roles:
  - group_id: defect-analysis
    roles: `analyst`, `reviewer`
    resolution: at_least_one
- optional_roles: `architect`, `qa-backend`, `qa-frontend`
- route_gates: risky missing reproduction, behavior/product decision,
  merge approval
- platform_invocation: `canonical-only`

### `local-change`

- path: `pipelines/local-change/PIPELINE.md`
- triggers: small local edit, obvious fix, repo-local maintenance
- required_roles: `orchestrator`, `developer`
- alternative_roles: []
- optional_roles: `reviewer`, `integrator`, `watcher`
- route_gates: unclear requirements, architecture boundary, skipped required
  verification, publication approval, merge approval
- platform_invocation: `canonical-only`

### `analysis-only`

- path: `pipelines/analysis-only/PIPELINE.md`
- triggers: architecture review, feasibility analysis, source-backed
  explanation, plan-map
- required_roles: `orchestrator`, `analyst`
- alternative_roles: []
- optional_roles: `architect`, `reviewer`, `knowledge-engineer`
- route_gates: converting analysis into edits, promoting best-practice
  proposals into hard rules
- platform_invocation: `canonical-only`

### `quality-audit`

- path: `pipelines/quality-audit/PIPELINE.md`
- triggers: tech-debt audit, conformance check of a repo or merged PRs,
  debt ledger / quality grade
- required_roles: `orchestrator`, `auditor`
- alternative_roles: []
- optional_roles: `reviewer`, `architect`
- route_gates: promoting findings into remediation runs, converting
  analysis into edits
- platform_invocation: `canonical-only`

### `post-merge-qa`

- path: `pipelines/post-merge-qa/PIPELINE.md`
- triggers: merged PR, deployed behavior verification, runtime-only confirmation
- required_roles: `orchestrator`, `deploy-watcher`
- alternative_roles:
  - group_id: live-qa
    roles: `qa-backend`, `qa-frontend`
    resolution: at_least_one
- optional_roles: `developer`, `integrator`, `watcher`, `merger`
- route_gates: extra live-system access, infra mutation, follow-up PR merge
  approval
- platform_invocation: `canonical-only`

### `method-development`

- path: `pipelines/method-development/PIPELINE.md`
- triggers: method change, missing capability, role or pipeline improvement,
  new stack or adapter
- required_roles: `orchestrator`, `knowledge-engineer`
- alternative_roles: []
- optional_roles: `architect`, `reviewer`, `integrator`, `watcher`
- route_gates: approved hard-rule changes, merge approval
- platform_invocation: `canonical-only`

## Standard Startup

Every multi-role pipeline uses the startup and route approval contract in
`COMMON-STEPS.md`.

## Selection Notes

- `analysis-only` is the default when the user asks only for research, review,
  planning, or explanation.
- `quality-audit` is the default when the user asks to grade existing tech debt
  or check conformance of a repo or merged PRs without editing code.
- `method-development` is the default when the request changes this method repo
  or adds missing agent capability.
- Optional roles can be dropped only when the reduced coverage is visible in the
  proposed run plan.
