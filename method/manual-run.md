# Manual Run Protocol

Manual run is the current execution mode for Codex and Claude Code before the
future orchestrator imports roles and pipelines directly.

## Inputs

- user request;
- consuming repo guidance, for example `AGENTS.md` or `CLAUDE.md`;
- recommended repo overlay docs, for example `REVIEW.md`,
  `VERIFICATION.md`, or `REPOSITORY.md`;
- canonical method checkout at `{{AGENTS_REPO_PATH}}`;
- optional local overlay values from the consuming repo;
- selected execution adapter: Codex or Claude Code.

## Startup Sequence

1. Read `constitution.md`; its rules apply to every manual run.
2. Resolve `{{AGENTS_REPO_PATH}}` from the consuming repo overlay or ask the
   human for it.
3. Read `bootstrap.md` and `materialization.md` to confirm how the consuming repo
   points to the canonical method and adapter entrypoints.
4. Follow `orchestrator-run.md` as the run lifecycle contract.
5. Keep run state in chat or in the consuming repo's run artifact according to
   `route-plan.md` and `../templates/artifacts/run-state.md`.

## Codex Runtime Shape

- The main Codex session acts as orchestrator for manual runs.
- The main Codex session is not the default worker for role-owned actions.
- Codex reads canonical method files directly from `{{AGENTS_REPO_PATH}}`.
- Repo-local Codex skills may wrap common workflows, but they must point back to
  canonical roles and pipelines.
- Codex should stop at route approval and other configured human gates.

## Claude Code Runtime Shape

- The main Claude Code session acts as orchestrator for manual runs.
- The main Claude Code session is not the default worker for role-owned actions.
- Claude Code may use generated subagents or skills, but generated files must be
  reproducible from canonical roles and references.
- Subagents should not own human approval gates unless the platform can surface
  that approval reliably.
- The main session remains responsible for route approval and run state.

## Manual Role Delegation

- [DECISION] In manual Codex and Claude Code runs, the main session is the
  orchestrator only. It must delegate developer, reviewer, integrator, watcher,
  merger, deploy-watcher, QA, and other role-owned actions to the selected role
  capability when that capability is available.
- [DECISION] A main-session fallback for a role-owned action is allowed only
  when the route plan records `role_action_fallbacks` with the role, action,
  missing capability, fallback actor, scope, and risk, and the human explicitly
  approves that fallback at the route approval gate.
- [DECISION] If the role capability is unavailable and the route plan does not
  contain an approved fallback, the main session must stop with route planning
  or `needs_method_materialization`; it must not silently act as the role.

## Agent Discovery

Agents discover available capabilities in this order:

1. `method/constitution.md` for always-on rules.
2. Consuming repo `AGENTS.md` or `CLAUDE.md` for local entrypoint instructions.
3. Consuming repo overlay docs such as `VERIFICATION.md`, `REVIEW.md`,
   `REPOSITORY.md`, or existing equivalents such as `docs/quality-gates.md`.
4. `roles/INDEX.md` for role ids, surfaces, capabilities, and rights.
5. `pipelines/INDEX.md` for route candidates and role requirements.
6. `stacks/README.md` and selected stack files for language knowledge.
7. `templates/artifacts/` for fillable handoff artifacts.
8. `adapters/<platform>/README.md` for platform mechanics.
9. Ignored consuming repo overlays for local paths, credentials, and targets.

## Output

```yaml
manual_run:
  route_plan: {}
  approved: false
  execution_adapter: codex | claude-code
  run_state_location: chat | consuming-repo-artifact | future-revo-state
  execution_policy: {}
  next_step: route-approval | execute-pipeline | needs_human | stop
```

## Rules

- Do not execute a multi-role pipeline before route approval.
- In manual Codex or Claude Code runs, do not treat approval of a work order,
  plan, task spec, architecture note, review finding, or implementation brief as
  permission for single-agent implementation. After any non-route approval,
  build or refresh the route plan and stop at the route approval gate.
- [DECISION] Do not let the main session execute a role-owned action merely
  because it can technically perform the action. Use the selected role
  capability, or record and approve an explicit `role_action_fallbacks` entry
  first.
- Do not start implementation while blocking clarification markers remain.
- Do not copy concrete local values into canonical method files.
- If generated platform files disagree with canonical roles or pipelines, the
  canonical method wins.
- If canonical templates disagree with current repo-specific commands, review
  policy, or structure, the repo overlay wins.
- Manual runs implement `orchestrator-run.md` with the main session acting as
  orchestrator.
- If the consuming repo lacks an entrypoint, create or propose a minimal
  `AGENTS.md`, `CLAUDE.md`, and `.agents/README.md` bootstrap. Add
  `REVIEW.md`, `VERIFICATION.md`, or `REPOSITORY.md` when the repository needs
  explicit local review, verification, or structure guidance.
- If generated adapter files are stale or ambiguous, refresh them from
  `materialization.md` before using them as instructions.
