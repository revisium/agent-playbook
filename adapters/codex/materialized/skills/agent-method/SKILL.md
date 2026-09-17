---
name: agent-method
description: Run the canonical agent playbook from a workspace root; use for routing tasks, bootstrapping agents, or selecting roles and pipelines.
---

# Agent Method

Use this skill when the user asks to run the canonical agent playbook, choose a
pipeline, select roles, bootstrap a workspace, or continue a multi-role run.

## Steps

1. Resolve the canonical agent playbook repository from workspace `AGENTS.md`,
   `.agents/local.context.md`, or the default workspace `agent-playbook/` checkout.
2. Read `method/manual-run.md` only, then follow its action-specific context
   triggers and the canonical lifecycle. Do not preload its linked references.
3. Before any multi-role execution or working-tree mutation, show the explicit
   proposed route and wait for route approval as required by the manual protocol.
   Approval of a work order, plan, review note, or another non-route artifact
   permits route planning; it does not authorize implementation.
4. When setup, method updates, role changes, pipeline invocation changes, or
   missing platform agents/skills are involved, run the materialization
   freshness check from `method/materialization.md` before declaring readiness.
5. Use repo-local overlays for concrete commands, verification gates, review
   policy, domain facts, and environment boundaries.

If the canonical source cannot be resolved, return
`needs_method_materialization` and ask for the agents checkout location.
