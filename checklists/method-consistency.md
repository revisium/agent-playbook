# Method Consistency Checklist

This checklist is the self-review gate for changes to the canonical method.
Run it before publishing a method PR.

## When To Run

- [DECISION] Run for any PR that changes `method/`, `roles/`, `pipelines/`,
  `references/`, `stacks/`, `adapters/`, `templates/`, or `checklists/`.
- [DECISION] Run after local markdown validation and before publishing or
  merging the PR.
- [DECISION] Run again after review-comment fixes when the fix changes routing,
  wrappers, gates, or source-of-truth order.

## Checklist

- [ ] `node tools/validate.mjs` passes.
- [ ] The change belongs to the edited owner: role, stack, framework reference,
  shared reference, pipeline, adapter, template, or local overlay.
- [ ] `roles/INDEX.md` matches routable role files.
- [ ] Role frontmatter fields `id`, `surface`, `rights`,
  `default_model_level`, and `runner_id` match `method/role-definition.md`,
  `roles/INDEX.md`, and
  generated role catalog data.
- [ ] Routable role wrappers match `roles/INDEX.md` in:
  - `adapters/codex/materialized/agents/`
  - `adapters/claude-code/materialized/agents/`
- [ ] `pipelines/INDEX.md` matches pipeline files.
- [ ] Pipeline frontmatter `id` matches `method/pipeline-definition.md` and
  `pipelines/INDEX.md`.
- [ ] `playbook.json`, `catalog/roles.json`, and `catalog/pipelines.json` are
  regenerated and pass staleness validation.
- [ ] `platform_invocation: skill-wrapper` pipelines have matching skill
  wrappers in Codex and Claude Code adapters, or the omission is documented.
- [ ] Adapter wrappers point back to canonical sources and do not redefine role
  or pipeline behavior.
- [ ] Route plan, run state, and artifact templates agree on execution policy,
  runner policy, consensus, budget, and usage fields.
- [ ] Production runner bindings come from installed playbook role `runner_id`
  values.
- [ ] [DECISION] Execution policy, execution-profile input, route-plan owner,
  and route-plan template use the same normalized `runner_readiness` fields and
  key entries by resolved runner id.
- [ ] [DECISION] Runner readiness remains orthogonal to runner availability and
  binding; only `ready` permits automatic execution.
- [ ] [DECISION] External CLI readiness requires a live preflight in the same
  cwd, effective env/config, OS user or container, and launcher as execution;
  context changes and auth failures invalidate the evidence.
- [ ] [DECISION] Auth status is described as ready-to-attempt evidence, not
  provider credential validation, and auth failure cannot trigger interactive
  login, persistence, provider/account fallback, or silent profile switching.
- [ ] [CODE] Codex and Claude Code adapter docs name their verified headless and
  status commands, normalize and discard raw status output, and declare how the
  launcher selects the credential source.
- [ ] [DECISION] Route and execution-profile artifacts exclude secrets, account
  identifiers, raw auth/identity output, and private paths.
- [ ] [DECISION] Revo documents same-context `probe` then `execute` behavior
  without changing the current authoring schema.
- [ ] `rights` never derive or imply runner bindings.
- [ ] Local and test execution profiles only override runner availability or
  bindings.
- [ ] Stub runners appear only as test-profile overrides, not production role
  bindings.
- [ ] Public product contracts do not expose `runnerMode`, `--stub`, or `--live`
  controls.
- [ ] Pipeline execution-policy defaults do not hardcode concrete provider model
  names.
- [ ] Usage accounting keeps cost and token metadata outside portable
  `AgentResult`.
- [ ] Source labels are present for new hard rules.
- [ ] Core and conditional references are classified correctly.
- [ ] Shared rules are not duplicated across many roles.
- [ ] Artifact templates are updated when artifact schemas change.
- [ ] `legacy/` is not used as runtime knowledge.
- [ ] No committed file contains concrete local paths, accounts, tokens, hosts,
  namespaces, deployment coordinates, or secrets.
- [ ] README remains human-facing; `AGENTS.md` remains agent-facing; detailed
  procedures stay in `method/`.
- [ ] The result remains usable by Codex, Claude Code, and future revo import.

## Output

```yaml
method_consistency_check:
  status: ready | needs_fix | needs_human
  checked_files: []
  blockers: []
  documented_omissions: []
```
