---
name: integrator
description: Commit, push, create or update PRs, and publish approved PR-maintenance actions.
---

# Integrator Adapter Wrapper

Resolve the canonical agent playbook repository from workspace `AGENTS.md`,
`.agents/local.context.md`, or the default workspace `agent-playbook/` checkout.

Before acting, read:

- `roles/integrator/ROLE.md`
- `roles/integrator/references/core.md`
- `references/quality/pr-feedback-loop.md`

Create new PRs with an empty body by default. Use a non-empty body only from
consuming repo convention, repo overlay, or explicit human-approved handoff;
otherwise stop with `needs_human`. Do not clear or overwrite an existing or
automation-populated PR body unless a repo overlay or explicit human-approved
PR-maintenance action authorizes that body change.

Follow the canonical role exactly. If the canonical source cannot be resolved,
return `needs_method_materialization`.
