# Method Maintenance

This file tells agents how to update the method safely.

## Update Flow

1. Identify the source of the lesson:
   - repeated run failure;
   - review finding;
   - user decision;
   - source-code convention;
   - platform limitation.
2. Aggregate raw project evidence outside this repository. Do not commit
   project-specific notes, examples, paths, account names, PR ids, incident ids,
   hosts, or candidate lessons.
3. Ask for human approval on the reusable abstraction.
4. After approval, edit `ROLE.md`, `STACK.md`, `PIPELINE.md`, or the closest
   reference directly.
5. Keep the approved rule close to its owner:
   - role responsibility -> `roles/<role>/`;
   - language/ecosystem behavior -> `stacks/<stack>/`;
   - framework behavior -> framework reference;
   - workflow order/gates -> `pipelines/<pipeline>/`;
   - platform mechanics -> `adapters/<platform>/`;
   - fillable artifact shapes -> `templates/artifacts/`;
   - local values -> local overlay, never committed markdown.
6. Decide whether each touched reference is `core` or `conditional`.
   Conditional framework, tool, provider, and architecture-style references must
   be selected by route evidence, repo overlay, config, or human approval.
7. Update `roles/INDEX.md` or `pipelines/INDEX.md` when adding, removing, or
   changing routable roles or pipelines.
   Keep role and pipeline frontmatter aligned with the catalog and definition
   formats.
8. Run `node tools/validate.mjs --build-catalogs` when role, pipeline, or
   manifest inputs change.
9. Run the adapter materialization gate when a routable role,
   `platform_invocation: skill-wrapper` pipeline, or platform discovery behavior
   changes.
10. Run `checklists/role-development.md` when the change deepens, adds, splits,
   or reroutes a role.
11. Add or update a checklist/reference when the rule changes what an agent does.
12. Update artifact templates when canonical artifact schemas change.
13. Run `checklists/method-consistency.md` before publishing the PR.

## Adapter Materialization Gate

Run this gate when adding, removing, or renaming a routable role or a pipeline
with `platform_invocation: skill-wrapper`.

For routable roles:

- update `roles/INDEX.md`;
- update `adapters/codex/materialized/agents/<role>.toml`;
- update `adapters/claude-code/materialized/agents/<role>.md`;
- ensure each wrapper loads only the canonical `ROLE.md`, whose context
  triggers load core knowledge for relevant owned actions and other references
  when applicable;
- do not expose composed-only references as platform agents unless the role is
  explicitly routable.

For pipelines with `platform_invocation: skill-wrapper`:

- update `pipelines/INDEX.md`;
- update the relevant Codex skill wrapper under
  `adapters/codex/materialized/skills/`;
- update the relevant Claude Code skill wrapper under
  `adapters/claude-code/materialized/skills/`;
- keep the pipeline behavior canonical in `pipelines/<pipeline>/PIPELINE.md`.

If a wrapper is intentionally not added for a platform, document the reason in
the adapter README or the method-change PR. Silence is not an acceptable
materialization decision.

## Source Labels

Every new hard rule needs a source label:

- `[ORCHESTRATOR]` - extracted from existing runs or pipeline docs.
- `[CODE]` - backed by an approved public/example source or current method repo
  file. Private project evidence must be aggregated outside this repository
  before promotion.
- `[DECISION]` - approved by the human.
- `[BEST-PRACTICE]` - approved general practice that is not tied to one source.
- `[TODO]` - intentionally incomplete base rule.

## Promotion Rules

- Repeated issue: aggregate evidence outside this repository and propose the
  reusable rule for human approval.
- Approved reusable rule: commit it directly to the canonical owner file.
- Safety issue: propose immediate hardening.
- Env or secret leak risk: fix immediately and cite `env-boundary.md`.

## Do Not

- Do not duplicate the same rule across many roles.
- Do not encode run-specific values in method files.
- Do not commit raw project evidence or lesson-candidate files.
- Do not use `legacy/` as source material for new runtime behavior.
- Do not let adapters fork canonical behavior.
- Do not silently change merge, deploy, or secret-access rules.
- Do not commit best-practice suggestions before approval.

## Review Checklist For Method Changes

- Run `checklists/method-consistency.md` for the full self-review gate.
- Does this belong to role, stack, framework, pipeline, adapter, or local overlay?
- Is each touched reference correctly classified as core or conditional?
- Is the source label present?
- Are placeholders used instead of local values?
- Are discovery catalogs updated when routable roles or pipelines changed?
- Are adapter wrappers updated, removed, or explicitly omitted when routable
  roles or `platform_invocation: skill-wrapper` pipelines changed?
- Is the rule short in dispatcher files and detailed in references?
- Are fillable artifact templates updated when artifact schemas changed?
- If an archived idea was recovered, was it rebuilt as new canonical behavior
  without linking runtime docs to `legacy/`?
- If the source is project evidence, was raw evidence kept out of this repo and
  only the approved abstraction committed?
- Does the change remain usable by Codex, Claude Code, and future revo?
