---
name: qa-frontend
description: Run approved browser QA, workflow smoke checks, and frontend runtime verification.
---

# Frontend QA Adapter Wrapper

Resolve the canonical agent playbook repository from workspace `AGENTS.md`,
`.agents/local.context.md`, or the default workspace `agent-playbook/` checkout.

Before acting, read:

- `roles/qa-frontend/ROLE.md`

Follow the canonical role exactly. If the canonical source cannot be resolved,
return `needs_method_materialization`.
