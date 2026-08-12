# Claude Code Adapter

Claude Code can run this method through subagents, skills, slash commands, and
hooks.

Official surfaces used by this adapter:

- `CLAUDE.md` for persistent project/workspace guidance.
- `.claude/agents/*.md` for project subagents.
- `.claude/skills/<skill>/SKILL.md` for project skills.
- `@AGENTS.md` import from `CLAUDE.md` when one shared instruction file should
  serve both Claude Code and Codex.

## Mapping

- `method/manual-run.md` is the main startup procedure.
- `method/bootstrap.md` explains how the consuming repo points to this method.
- `method/materialization.md` defines generated or linked Claude Code files.
- `roles/<role>/ROLE.md` generates `.claude/agents/<role>.md` adapter wrappers.
- `roles/<role>/references/` remain canonical references loaded on demand.
- `pipelines/<pipeline>/PIPELINE.md` becomes workflow skills when direct
  invocation is useful.
- Human gates are handled by the main Claude Code session or deterministic hooks.
- `method/execution-policy.md` maps portable model levels and consensus choices
  to local Claude Code capabilities through local overlays or runtime config.

## Discovery

Claude Code learns about available agents from generated or linked
`.claude/agents/*` files, but the canonical source remains `roles/INDEX.md`,
`roles/<role>/ROLE.md`, and `pipelines/INDEX.md`.

Generated Claude Code files should include enough pointers back to this method
for the main session to reload canonical references when behavior is ambiguous.

For a multi-repo workspace, launch Claude Code from the workspace root when
shared workspace subagents and skills should be visible while working across
child repositories. If Claude Code is commonly launched from inside a child
repository, add a thin child `CLAUDE.md` that points back to the workspace root
and canonical method.

## New Device Bootstrap

1. Make this repository available as `{{AGENTS_REPO_PATH}}`.
2. Open the consuming workspace as `{{WORKSPACE_ROOT}}`.
3. Ensure `CLAUDE.md` points Claude Code to `method/manual-run.md` and
   `method/bootstrap.md`.
4. Symlink workspace `.claude/agents` to
   `{{AGENTS_REPO_PATH}}/adapters/claude-code/materialized/agents`.
5. Symlink workspace `.claude/skills` to
   `{{AGENTS_REPO_PATH}}/adapters/claude-code/materialized/skills`.
6. Use `method/materialization.md` before generating or refreshing adapter
   wrappers.
7. Generate or link `.claude/agents/*` only from adapter wrappers that point to
   canonical role definitions.

## Subagent Constraint

- [DECISION] If a Claude Code subagent cannot prompt for interactive approval,
  do not give it authority that depends on approval prompts.
- [DECISION] Use read-only subagents for review and analysis only when they are
  the selected role capability.
- [DECISION] Writes and other role-owned actions must run through explicitly
  authorized role capabilities. The main session remains the orchestrator only.
- [DECISION] Main-session writes or role-owned actions are allowed only when the
  approved route plan records and approves a scoped `role_action_fallbacks`
  entry that names the exact role, action, missing capability, fallback actor,
  scope, and risk.

## Headless Runner Mechanics

These mechanics follow the official Claude Code
[CLI reference](https://code.claude.com/docs/en/cli-reference) and
[authentication precedence](https://code.claude.com/docs/en/authentication#authentication-precedence).

- [CODE] Use `claude -p` for a non-interactive attempt. Automation should request
  JSON output, disable session persistence, select the approved permission mode,
  and apply the route's turn bound, for example:

  ```sh
  claude -p --output-format json --permission-mode plan \
    --no-session-persistence --max-turns 1 "{{PROMPT}}"
  ```

- [CODE] Run `claude auth status --json` as the zero-cost auth preflight in the
  exact working directory, effective environment and config, operating-system
  user or container, and launcher that will run `claude -p`. Exit zero means a
  credential is configured; it does not provider-validate that credential.
- [CODE] Claude Code applies documented credential precedence across cloud
  provider credentials, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_API_KEY`,
  `apiKeyHelper`, `CLAUDE_CODE_OAUTH_TOKEN`, profiles or federation, and cached
  login.
- [DECISION] The normalized active source must match the credential source
  declared by the launcher; conflicting or unaccounted-for sources are
  `ambiguous`. Use the credential-source meanings from
  `../../method/execution-policy.md`: environment injection is
  `invocation-env`, persisted `/login` state is `cached-login`, and delivery
  owned by a runtime, platform, or configured helper is `runtime-managed`.
- [DECISION] Normalize the status JSON to the canonical readiness fields in
  `../../method/execution-policy.md`, then discard the raw response. Never
  retain account identifiers, raw identity output, or secrets.
- [CODE] `--bare` skips normal discovery of `CLAUDE.md`, skills, hooks, plugins,
  MCP servers, auto memory, and related project context.
- [DECISION] Use `--bare` only when an explicit local execution profile or
  runtime config selects bare execution and records the reduced context;
  canonical playbook execution is non-bare by default.
- [DECISION] Run `claude -p` automatically only when readiness is `ready` and
  the execution context still matches the preflight context.
- [DECISION] After an auth failure, do not retry automatically, automate
  `/login` or `claude auth login`, switch accounts or providers, use a fallback
  model/provider, fall back to another credential source, or silently change
  profiles. Invalidate readiness and return the failure to the orchestrator.

## Rules

- Do not commit local settings or resolved accounts.
- Generated `.claude/*` files should be reproducible from canonical definitions.
- Generated `.claude/*` files must include canonical source pointers when they
  mirror roles, pipelines, or skills.
- Claude Code usage metadata belongs to the adapter/runtime attempt record; keep
  portable role results free of cost fields.
- Do not symlink canonical `roles/` directly into `.claude/agents`; use adapter
  wrappers.
- If a platform limitation requires a deviation, record it here, not inside the
  role's core behavior.
