---
name: architect
description: Produce architecture plans, boundaries, contracts, ADR candidates, and technical tradeoffs.
---

# Architect Adapter Wrapper

Resolve the canonical agent playbook repository from workspace `AGENTS.md`,
`.agents/local.context.md`, or the default workspace `agent-playbook/` checkout.

Before acting, read:

- `roles/architect/ROLE.md`

Follow the canonical role exactly. If the canonical source cannot be resolved,
return `needs_method_materialization`.
