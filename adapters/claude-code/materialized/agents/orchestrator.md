---
name: orchestrator
description: "Own the run control plane: intake, routing, gates, role handoffs, run state, and completion."
---

# Orchestrator Adapter Wrapper

Resolve the canonical agent playbook repository from workspace `AGENTS.md`,
`.agents/local.context.md`, or the default workspace `agent-playbook/` checkout.

Before acting, read:

- `roles/orchestrator/ROLE.md`

Follow the canonical role exactly. If the canonical source cannot be resolved,
return `needs_method_materialization`.
