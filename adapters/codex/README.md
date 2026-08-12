# Codex Adapter

Codex can run this method directly through skills and prompts.

Official surfaces used by this adapter:

- `AGENTS.md` for persistent repo/workspace instructions.
- `.agents/skills/<skill>/SKILL.md` for repo-scoped skills.
- `.codex/agents/*.toml` for project-scoped custom agents.

## Mapping

- `method/manual-run.md` is the main startup procedure.
- `method/bootstrap.md` explains how the consuming repo points to this method.
- `method/materialization.md` defines generated or linked Codex-facing files.
- `roles/<role>/ROLE.md` becomes a `.codex/agents/<role>.toml` adapter wrapper.
- `roles/<role>/references/` are loaded progressively as needed.
- `pipelines/<pipeline>/PIPELINE.md` is exposed through `.agents/skills/*`
  wrappers when a workflow should be directly invokable.
- The main session owns human gates and writes run artifacts when requested.
- `method/execution-policy.md` maps portable model levels and consensus choices
  to local Codex capabilities through local overlays or runtime config.

## Discovery

Codex reads `AGENTS.md` for persistent instructions and scans `.agents/skills`
for skills. Codex custom agents live under `.codex/agents/*.toml`.

For a multi-repo workspace, launch Codex from the workspace root when shared
workspace agents and skills should be visible while working across child
repositories. If Codex is commonly launched from inside a child repository, add
a thin child `AGENTS.md` that points back to the workspace root and canonical
method.

Repo-local skills should call back to canonical method files instead of
redefining role behavior.

## New Device Bootstrap

1. Make this repository available as `{{AGENTS_REPO_PATH}}`.
2. Open the consuming workspace as `{{WORKSPACE_ROOT}}`.
3. Ensure `AGENTS.md` points Codex to `method/manual-run.md` and
   `method/bootstrap.md`.
4. Symlink workspace `.agents/skills` to
   `{{AGENTS_REPO_PATH}}/adapters/codex/materialized/skills`.
5. Symlink workspace `.codex/agents` to
   `{{AGENTS_REPO_PATH}}/adapters/codex/materialized/agents`.
6. Use `method/materialization.md` before generating or refreshing adapter
   wrappers.
7. Start Codex from the workspace root for shared multi-repo work.
8. Keep concrete paths and accounts in ignored local overlays.

## Headless Runner Mechanics

These mechanics follow the official
[Codex CLI reference](https://developers.openai.com/codex/cli/reference) and
the installed CLI's supported auth environment.

- [CODE] Use `codex exec` for a non-interactive attempt. Automation should use
  JSONL output and an explicit sandbox, for example:

  ```sh
  codex exec --ephemeral --sandbox read-only --json "{{PROMPT}}"
  ```

- [CODE] `codex exec` can read `CODEX_API_KEY` from its effective invocation
  environment. `codex login status` inspects cached or stored login state; it
  does not inspect `CODEX_API_KEY` and therefore cannot establish readiness for
  an invocation-environment credential.
- [CODE] For `credential_source: cached-login`, run `codex login status` as the
  zero-cost auth preflight. Exit zero means cached or stored auth is configured;
  it does not provider-validate the credential.
- [DECISION] For `credential_source: cached-login`, also verify without exposing
  a value that `CODEX_API_KEY` is absent or empty in the launch environment; a
  present, non-empty value means both sources exist.
- [DECISION] For `credential_source: invocation-env`, the launcher verifies only
  that `CODEX_API_KEY` is present and non-empty in the exact environment that
  will launch `codex exec`. A value-safe shell check is:

  ```sh
  [ "${CODEX_API_KEY:+present}" = present ]
  ```

  The preflight must not print, persist, hash, record, or otherwise inspect the
  value. Keep shell tracing and command echoing disabled around credential
  handling.
- [DECISION] In the invocation-environment case, `codex login status` may run
  only as a storage-conflict check, not as evidence for `CODEX_API_KEY`. Exit
  zero means a cached or stored source also exists.
- [DECISION] Treat simultaneous cached-login and invocation-environment sources,
  an unaccounted higher-priority or otherwise effective source, or a mismatch
  with the launcher's declared source as `ambiguous` unless explicit runtime
  configuration safely resolves the intended source before execution.
- [DECISION] Run the source-specific preflight in the exact working directory,
  effective environment and config, operating-system user or container, and
  launcher that will run `codex exec`. Execute without changing that context.
- [DECISION] Normalize preflight output to the canonical readiness fields in
  `../../method/execution-policy.md`, then discard raw auth or identity output.
  Never record secrets, credential values, or account identifiers.
- [DECISION] Run `codex exec` automatically only when readiness is `ready` and
  the execution context still matches the preflight context.
- [DECISION] After an auth failure, do not retry automatically, automate
  `codex login`, switch accounts or providers, fall back to another credential
  source, or change profiles. Invalidate readiness and return the failure to the
  orchestrator.

## Rules

- Use placeholders from `method/env-boundary.md`.
- Keep review-only Codex calls non-interactive and read-only.
- Generated `.agents/*` and `.codex/*` files must include canonical source
  pointers when they mirror roles, pipelines, or skills.
- Do not rely on Codex-specific output fields in canonical role definitions.
- Platform wrappers may add envelope fields, but the portable role result remains
  `output`, `artifacts`, `needsHuman`, and `lesson`.
- Codex token usage is adapter metadata; record it according to
  `method/usage-accounting.md` and do not make roles emit cost fields.
- Do not symlink canonical `roles/` directly into `.codex/agents`; use adapter
  wrappers.
