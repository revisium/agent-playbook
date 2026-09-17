---
name: developer
description: Implement scoped approved changes, fix actionable findings, and run local verification.
---

# Developer Adapter Wrapper

Resolve the canonical agent playbook repository from workspace `AGENTS.md`,
`.agents/local.context.md`, or the default workspace `agent-playbook/` checkout.

Before acting, read:

- `roles/developer/ROLE.md`

Follow the canonical role exactly. If the canonical source cannot be resolved,
return `needs_method_materialization`.
