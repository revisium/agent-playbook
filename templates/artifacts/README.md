# Artifact Templates

These templates are fillable copies of canonical run artifacts.

## Purpose

- Keep Codex, Claude Code, and future revo runs using the same artifact shapes.
- Make role handoffs compact and predictable.
- Keep concrete local values out of committed method files.

## Templates

- `route-plan.md` - route proposal and approval artifact (also the route-proposal
  template; no separate route-proposal template is needed).
- `run-state.md` - portable run-state snapshot.
- `execution-profile.md` - local/runtime model, runner, consensus, and budget
  capability profile.
- `task-spec.md` - analyst-owned requirements artifact.
- `requirements-check.md` - readiness gate for `task_spec`.
- `architecture-plan.md` - architect-owned technical-shape artifact.
- `adr.md` - architect-owned architecture decision record; one decision,
  why-not-how, mirrors `../../references/quality/adr-authoring.md`.
- `spec.md` - architect-owned specification; normative contract with RFC 2119
  keywords, mirrors `../../references/quality/spec-authoring.md`.
- `implementation-brief.md` - compact developer handoff.
- `verification-plan.md` - generic local, conditional, optional, and remote gate
  plan.
- `verification-result.md` - developer, integrator, or watcher evidence from
  executed gates and PR feedback.
- `role-result.md` - role / node result envelope (typed contract).
- `human-gate.md` - single human gate entry in `run_state.gates` (typed contract).
- `artifact-ref.md` - artifact reference; generalizes `*_ref` fields and
  `run_state.artifacts` entries (typed contract).
- `debt-ledger.md` - auditor-owned retrospective tech-debt and conformance
  ledger.

## Canonical Sources

The templates mirror schemas from these source files:

- `../../method/route-plan.md`;
- `../../method/orchestrator-run.md`;
- `../../method/execution-policy.md`;
- `../../method/usage-accounting.md`;
- `../../method/lifecycle.md`;
- `../../method/typed-contracts.md`;
- `../../roles/analyst/references/core.md`;
- `../../checklists/requirements.md`;
- `../../roles/architect/references/core.md`;
- `../../roles/auditor/references/core.md`;
- `../../roles/developer/references/core.md`;
- `../../roles/deploy-watcher/references/core.md`;
- `../../roles/qa-backend/references/core.md`;
- `../../roles/qa-frontend/references/core.md`;
- `../../references/quality/verification.md`.

If a template conflicts with a canonical schema, the canonical schema wins.

## Rules

- Use placeholders for local paths, accounts, hosts, credentials, deployment
  targets, and environment-specific values.
- Store filled artifacts in chat, run state, or a consuming repo artifact
  location selected by the run.
- Do not copy filled run artifacts back into this repository.
- Keep templates adapter-neutral; Codex and Claude Code materialization may wrap
  them but must not rename canonical fields.
