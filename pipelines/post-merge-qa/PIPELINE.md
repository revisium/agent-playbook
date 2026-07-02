---
id: post-merge-qa
---

# Pipeline: post-merge-qa

## Purpose

Verify that merged work deployed and behaves correctly in the target environment.

## Triggers

- A PR was merged.
- A runtime-only behavior needs confirmation.

## Roles

`orchestrator`, `deploy-watcher`, `qa-backend` or `qa-frontend`, optional
`developer`, optional `integrator`, optional `watcher`, optional `merger`.

## Steps

1. Orchestrator runs standard startup; see `../COMMON-STEPS.md`.
2. Deploy-watcher verifies the merged change is live for the selected target
   environment and expected revision or release marker.
3. If deployment is still progressing, record `waiting` with `resume_after` when
   available.
4. If deployment is absent, stale, unhealthy, ambiguous, or inaccessible, route
   to the smallest owner: human for access/approval gaps, developer for
   application bugs with evidence, or `waiting` for provider progress.
5. QA role runs approved scenarios only after deploy-watcher returns
   `deployed-ready` for the expected target environment and revision or release
   marker.
6. If QA finds reproducible code bugs, route to developer or the selected
   developer specialization and repeat the PR cycle.
7. If QA findings need risk classification, false-positive judgment, accepted
   risk, visual approval, or security/compatibility interpretation, route to
   reviewer or human according to the run gate.
8. If QA finds environment, access, credential, target, or tool blockers,
   escalate to human unless the blocker is a provider wait state.
9. Record final deploy and QA outcome with source refs, evidence, and residual
   risk.

## Execution Policy

```yaml
execution_policy:
  recommended_model_levels:
    deploy-watcher: cheap
    watcher: cheap
    qa-backend: standard
    qa-frontend: standard
    developer: standard
  model_level_rules:
    - role: developer
      level: standard
      when: follow-up fixes are needed
  consensus_defaults:
    - scope: default
      value: none
  consensus_escalations:
    - value: single-reviewer
      when: QA findings require code-risk classification or accepted-risk judgment
  iteration_cap: 1 QA/follow-up classification loop before route back to bugfix or feature-development
```

- Recommended model levels: deploy-watcher `cheap`; watcher `cheap`;
  qa-backend `standard`; qa-frontend `standard`; developer `standard` when
  follow-up fixes are needed.
- Default consensus: `none`.
- Escalate to `single-reviewer` when QA findings require code-risk
  classification or accepted-risk judgment.
- Default iteration cap: 1 QA/follow-up classification loop before route back to
  bugfix or feature-development.

## Human Gates

- Any secret or live-system access beyond the pipeline grant.
- Infra mutation.
- Destructive test-data setup or direct data mutation.
- Visual approval, product-copy approval, accepted risk, or compatibility break
  approval.
- Merge approval for follow-up PRs unless explicit auto-merge is recorded.

## Adapter Notes

Resolved environment coordinates, test credentials, release markers, and secret
references belong in run state or ignored local overlays. This pipeline only
names placeholders such as `{{TARGET_ENV}}` and `{{ADMIN_SECRET_REF}}`.
