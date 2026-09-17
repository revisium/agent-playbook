# Role Development Checklist

This checklist prepares role-focused PRs. Use it when deepening an existing
role, adding a role, splitting a role, or changing role boundaries.

## When To Run

- [DECISION] Knowledge Engineer runs it before editing role behavior.
- [DECISION] Reviewer runs it during self-review of a role PR.
- [DECISION] Orchestrator uses it when deciding whether a missing capability is
  a role change, a stack/reference change, or only repo-local context.

## Inputs

- selected role ids and current `roles/INDEX.md` records;
- relevant `ROLE.md` files and `references/core.md` files;
- approved reusable behavior or approved best-practice summary;
- shared references, stacks, pipelines, and artifacts affected by the role;
- adapter materialization requirements for Codex and Claude Code.

Raw project evidence must be aggregated outside this repository before being
promoted into reusable role behavior.

## Checklist

- [ ] The role owns a responsibility, not a technology bundle.
- [ ] Stack, framework, tooling, and practice rules stay in references or
  `stacks/`, not hardcoded into the role unless they are role-invariant.
- [ ] `ROLE.md` states purpose, rights, inputs, outputs, escalation markers,
  handoffs, and prohibited actions.
- [ ] `default_model_level` is portable (`cheap`, `standard`, or `deep`) and
  does not name a provider-specific concrete model.
- [ ] `references/core.md` contains operating knowledge loaded for relevant owned
  actions; `ROLE.md` declares triggers for other applicable references and
  wrappers load only `ROLE.md`.
- [ ] Shared knowledge used by more than one role lives under `references/`.
- [ ] The role returns `needs_analyst`, `needs_architect`, `needs_human`, or
  `needs_method_materialization` instead of guessing outside its boundary.
- [ ] Human gates and write permissions are not weakened.
- [ ] Consensus requirements are expressed in pipeline or route policy, not
  hidden inside one role.
- [ ] `roles/INDEX.md` is updated when a routable role is added, removed,
  renamed, or materially rerouted.
- [ ] Adapter materialization gate from `method/maintenance.md` is complete.
- [ ] Affected pipelines and artifact templates are updated when handoff
  contracts change.
- [ ] The role remains portable across Codex, Claude Code, and future revo.
- [ ] No local environment values or project-specific raw evidence are committed.

## Output

```yaml
role_development_check:
  status: ready | needs_fix | needs_human
  roles: []
  owner_decisions: []
  affected_references: []
  affected_adapters: []
  blockers: []
```
