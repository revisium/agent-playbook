# Orchestrator Run Contract

This contract defines how an orchestrator turns a user request into an approved
pipeline run.

This file is the canonical owner of run lifecycle phase order. Other method,
role, and pipeline files may point here, but they must not restate the full
phase sequence.

For manual Codex and Claude Code execution, the main session acts as the
orchestrator. For future revo execution, the runtime owns the same state machine
and may add transport, worker, attempt, or cost fields around it.

## Purpose

- Route the request to a catalog-backed pipeline.
- Bind required, alternative, and optional roles.
- Expose missing capabilities before execution.
- Ask for human route approval before mutation.
- Stop at clarification gates before downstream roles guess missing intent.
- Keep run state portable across Codex, Claude Code, and future revo.

The orchestrator is a coordination layer. Codex and Claude Code may execute the
contract, but they are not the canonical source for roles or pipelines.

## Inputs

- user request;
- selected execution mode: `codex`, `claude-code`, or `revo-future`;
- consuming repo entrypoint, for example `AGENTS.md` or `CLAUDE.md`;
- canonical checkout at `{{AGENTS_REPO_PATH}}`;
- optional local overlay values from the consuming repo;
- role, pipeline, stack, tooling, method, and adapter catalogs.
- execution profile from ignored local overlay or future runtime config when
  available.

## Phases

### 1. Load Context

Read:

- `constitution.md`;
- `bootstrap.md`;
- `materialization.md` when adapter files are generated or linked;
- `manual-run.md` for Codex or Claude Code execution;
- consuming repo entrypoints and overlays.

Only identify local values at this phase. Do not resolve secrets or mutate the
working tree.

### 2. Classify Request

Run `intake.md`.

The output must include work type, candidate pipeline, surfaces, stack
candidates, frameworks, tooling categories, verification capabilities, required
roles, optional roles, alternative role groups, and local values needed later.

### 3. Discover Route

Run `discovery.md`.

Use `pipelines/INDEX.md` and `roles/INDEX.md` as catalogs. Do not invent role or
pipeline ids. Unknown values stay visible in the candidate route.

### 4. Check Capabilities

Run `capability-check.md`.

Required roles, unresolved alternative role groups, selected stacks, selected
framework references, selected tooling references, selected pipeline, and
selected adapter must be available before automatic execution can proceed.

Missing optional roles reduce coverage but do not block by default.

### 5. Build Route Plan

Create `route_plan` using `route-plan.md`.
Use `../templates/artifacts/route-plan.md` as the fillable artifact.

The plan must show:

- selected pipeline and reason;
- execution mode;
- required roles;
- alternative role groups and resolution;
- optional roles and reduced coverage;
- selected surfaces, stacks, frameworks, and tooling categories;
- verification capabilities;
- local values needed later;
- missing capabilities;
- model-level recommendations and concrete-model source;
- runner policy, including selected role runner bindings, binding or override
  source, missing runners, and normalized readiness evidence keyed by resolved
  runner id;
- consensus policy for review gates;
- iteration cap and budget policy;
- usage-accounting policy;
- role-owned action fallbacks, when a selected role capability is unavailable;
- human gates before and inside the selected pipeline.

### 6. Ask For Human Route Approval

Run `route-approval.md`.

Show a concise proposed route and wait for one of the route decisions:

- `approve`;
- `change pipeline`;
- `change roles`;
- `change models`;
- `change execution profile`;
- `change consensus`;
- `set budget`;
- `analysis only`;
- `method first`;
- `stop`.

Do not start mutating pipeline steps before route approval.

Approval of a work order, task spec, architecture plan, review note, or other
non-route artifact is not route approval. If the last approval did not answer an
explicit proposed route gate, treat it as approval to continue routing, build or
refresh the route plan, and stop again at this phase.

### 7. Prepare Run State And Check Clarification

After approval, create or update `run_state` using `route-plan.md`.
Use `../templates/artifacts/run-state.md` when run state is recorded outside
chat.

Resolved local values may enter run state only when the pipeline needs them.
Committed method docs keep placeholders only.

Before developer execution, verify `../checklists/requirements.md` for any
available `task_spec`. If the requirements check is not `ready`, stop with the
matching next action defined in the checklist's Status Rules section.

When analysis or architecture steps ran and clarification is clear, prepare a
compact `implementation_brief` for the developer from approved `task_spec`,
`architecture_plan`, findings, and route constraints.
Use `../templates/artifacts/implementation-brief.md` as the fillable artifact.

Before developer execution, also prepare `verification_plan` from the approved
route, repo overlay, quality-gate docs, stack references, tooling references,
and upstream risk notes. Use
`../templates/artifacts/verification-plan.md` as the fillable artifact.

Compact means 200-400 words or the equivalent in concise YAML. Include only:
goal, upstream artifact references, required behavior, files or modules to
inspect first, architecture constraints, implementation slices, acceptance
criteria, required tests, risks, out-of-scope items, and stop conditions.
Summarize findings; do not paste raw review text or full upstream artifacts.

The verification plan is allowed to contain concrete commands only when they
come from the consuming repo or run overlay. The canonical method records
generic gate categories and placeholders, not JavaScript, package-manager,
Sonar, CI-provider, or framework assumptions.

### 8. Execute Pipeline

Read the approved `pipelines/<pipeline>/PIPELINE.md` and execute its steps.

[DECISION] Before each external CLI runner's first attempt, and again after any
relevant context change:

1. Resolve the exact working directory, effective environment and config,
   operating-system user or container, and launcher command or wrapper.
2. Confirm the launcher's declared credential source.
3. Invalidate readiness evidence created in a different context.
4. Run the adapter's zero-cost auth/status preflight in the same context,
   normalize the result into `runner_readiness`, and discard raw auth or
   identity output.
5. Execute the headless command in that unchanged context only when normalized
   readiness is `ready`.

[DECISION] A status preflight establishes readiness to attempt, not provider
credential validity. If the attempted call fails authentication, invalidate
readiness and stop automatic execution without retrying the call, starting an
interactive login, persisting a credential, falling back to another provider or
account, or silently changing the execution profile.

[DECISION] The orchestrator may prepare handoffs, launch or coordinate selected
roles, receive role outputs, classify gates, and maintain run state.

[DECISION] The orchestrator delegates role-owned actions to the selected role
capability when available. It must not write product code, stage files, commit,
push, create or update PRs, post PR comments, reply to or resolve review
threads, perform code or adversarial review, publish watcher status externally,
merge, deploy, or perform QA or watcher inspection as the main session unless
the approved route plan records an explicit `role_action_fallbacks` exception
for that role action.

### 9. Handle Gates And Completion

Stop at configured human gates, unresolved ambiguity, missing capability, or
pipeline completion. Store artifacts, blockers, next action, and lessons in run
state or the requested run artifact.

## State Machine

```yaml
orchestrator_run:
  run_id: "{{RUN_ID}}"
  execution_mode: codex | claude-code | revo-future
  status: received
  allowed_statuses:
    - received
    - proposed
    - approved
    - executing
    - waiting-human
    - blocked
    - completed
    - stopped
  route_plan: {}
  capability_status: ready | missing | ambiguous
  current_pipeline_step: ""
  role_bindings:
    required: []
    alternative: []
    optional: []
  execution_policy:
    model_policy: {}
    runner_policy:
      role_runner_ids: {}
      runner_bindings_source: playbook-catalog | execution-profile | runtime-config | mixed | unknown
      runner_overrides: {}
      missing_runners: []
      runner_readiness: {}
    consensus_policy: {}
    budget_policy: {}
    usage_accounting: {}
  handoffs:
    task_spec: {} # see roles/analyst/references/core.md
    requirements_check: {} # see checklists/requirements.md
    architecture_plan: {} # see roles/architect/references/core.md
    implementation_brief: {} # see roles/developer/references/core.md
    verification_plan: {} # see references/quality/verification.md
    verification_result: {} # see references/quality/verification.md
    developer_result: {} # see roles/developer/references/core.md
    deploy_watcher_result: {} # see roles/deploy-watcher/references/core.md
    qa_backend_result: {} # see roles/qa-backend/references/core.md
    qa_frontend_result: {} # see roles/qa-frontend/references/core.md
  gates: []
  artifacts: []
  blockers: []
  usage_summary:
    attempts: []
    totals_by_role: {}
    totals_by_runner_id: {}
    totals_by_model_profile: {}
    cost_unreported_for: []
  next_action: route-approval
  allowed_next_actions:
    - route-approval
    - execute-pipeline
    - needs_analyst
    - needs_architect
    - needs_human
    - method-development
    - stop
```

Adapters may wrap this object but must not rename canonical fields.

## Proposed Route Review

Before execution, present the route in a short human-review block:

```md
Proposed route:
- pipeline: <pipeline id>
- why: <short reason>
- roles: <required and selected alternative roles>
- optional coverage: <included or omitted optional roles>
- surfaces/stacks/tooling: <generic route summary>
- verification capabilities: <ready, missing, or unknown gates>
- model policy: <role -> model level, concrete source>
- runner policy: <role -> runner id, binding source, overrides, missing runners>
- runner readiness: <runner id -> normalized readiness and evidence source>
- consensus policy: <none, single-reviewer, dual-model, adversarial-consensus>
- budget policy: <iteration cap, token budget, reported-cost budget>
- missing capabilities: <none or list>
- role action fallbacks: <none or explicit role/action/scope requiring approval>
- clarification blockers: <none or list>
- local values needed later: <placeholder names only>
- first gate: route approval

Decision needed: approve, change pipeline, change roles, change models,
change execution profile, change consensus, set budget, analysis only, method
first, or stop.
```

## Rules

- Route approval is required before every multi-role pipeline execution.
- If a human changes pipeline or roles, regenerate the route plan and rerun
  capability check.
- If a human changes model policy, consensus, or budget, regenerate the route
  plan and rerun capability check.
- If a human changes execution profile, runner availability, or runner
  overrides, regenerate the route plan and rerun capability check.
- [DECISION] Automatic external CLI execution requires current `ready` evidence
  produced by a preflight in the same launch context. Context changes and auth
  failures invalidate that evidence.
- If blocking capabilities are missing, recommend `method first` or
  `analysis only`.
- [DECISION] Role-owned actions must run through the selected role capability
  when available.
- [DECISION] If a selected role capability is unavailable and the main session
  would need to execute that role's action, record the fallback in
  `route_plan.role_action_fallbacks` and get explicit route approval before the
  action runs.
- [DECISION] Without an approved fallback entry, the orchestrator must not execute
  developer, reviewer, integrator, watcher, merger, deploy-watcher, QA, or other
  role-owned actions as the main session.
- Follow `constitution.md` section 3 for blocking clarification markers.
- Keep runtime values in run state or ignored overlays, never in committed
  method files.
- Future revo import reads canonical method, role, and pipeline files; it does
  not infer behavior from generated Codex or Claude Code files.
