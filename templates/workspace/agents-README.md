# .agents

This directory is the workspace-local overlay for the canonical agent playbook.

## Source

- canonical playbook: `{{AGENTS_REPO_PATH}}`
- manual run protocol: `{{AGENTS_REPO_PATH}}/method/manual-run.md`
- bootstrap protocol: `{{AGENTS_REPO_PATH}}/method/bootstrap.md`
- materialization protocol: `{{AGENTS_REPO_PATH}}/method/materialization.md`
- artifact templates: `{{AGENTS_REPO_PATH}}/templates/artifacts/`

## Expected Symlinks

- `.agents/skills -> {{AGENTS_REPO_PATH}}/adapters/codex/materialized/skills`
- `.codex/agents -> {{AGENTS_REPO_PATH}}/adapters/codex/materialized/agents`
- `.claude/agents -> {{AGENTS_REPO_PATH}}/adapters/claude-code/materialized/agents`
- `.claude/skills -> {{AGENTS_REPO_PATH}}/adapters/claude-code/materialized/skills`

## Refresh After Method Update

After pulling or changing the canonical agent playbook repository, validate the
source before using newly added roles, pipelines, agents, or skills:

```sh
cd {{AGENTS_REPO_PATH}}
node tools/validate.mjs
```

Then verify this workspace still links to adapter materialized directories, not
to canonical `roles/` or `pipelines/`. If wrappers are stale or missing, follow
`{{AGENTS_REPO_PATH}}/method/materialization.md`; do not patch generated files
directly in the workspace.

## Local Files

Use ignored files for concrete local values:

- `.agents/local.env`
- `.agents/local.context.md`
- `.agents/runs/`

Use `{{AGENTS_REPO_PATH}}/templates/artifacts/execution-profile.md` as the
template for available roles, runners, model profiles, consensus providers, and
budget defaults. Save the filled profile as
`.agents/local.execution-profile.md`. Keep the filled profile ignored unless the
workspace explicitly wants to commit non-sensitive defaults.

If this workspace root is versioned, merge
`{{AGENTS_REPO_PATH}}/templates/workspace/gitignore` into its ignore rules.

Example `.agents/local.context.md`:

```md
agents_repo_path: <local checkout of the canonical agent playbook repository>
workspace_root: <local checkout of this workspace>
execution_profile: .agents/local.execution-profile.md
```

## Rules

- Do not copy the full canonical playbook into this directory.
- Keep generated skills or adapter files reproducible from
  `{{AGENTS_REPO_PATH}}`.
- Keep run artifacts out of reusable method changes unless the workspace
  explicitly commits them.
- PR bodies are empty only by default at creation time. Do not clear or
  overwrite a PR body later, including automation-populated text, unless an
  explicit human-approved PR-maintenance action or repo overlay requires it.
