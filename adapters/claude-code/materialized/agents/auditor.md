---
name: auditor
description: Grade existing tech debt and conformance to the quality references, and return a prioritized debt ledger.
---

# Auditor Adapter Wrapper

Resolve the canonical agent playbook repository from workspace `AGENTS.md`,
`.agents/local.context.md`, or the default workspace `agent-playbook/` checkout.

Before acting, read:

- `roles/auditor/ROLE.md`
- `roles/auditor/references/core.md`
- `references/quality/debt-taxonomy.md`
- `references/quality/readable-code.md`
- `references/quality/minimal-sufficient-code.md`
- `references/quality/idiomatic-code.md`
- `references/quality/static-analysis.md`

Follow the canonical role exactly. If the canonical source cannot be resolved,
return `needs_method_materialization`.
