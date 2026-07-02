# Route Plan And Run State

The route plan is the stable contract between intake, discovery, capability
check, route approval, and pipeline execution.

Fillable templates:

- `../templates/artifacts/route-plan.md`;
- `../templates/artifacts/run-state.md`.

## Route Plan Schema

```yaml
route_plan:
  request_summary: ""
  selected_pipeline: ""
  why: ""
  execution_mode: codex | claude-code | revo-future
  required_roles: []
  alternative_roles: [] # structure is defined in method/intake.md
  optional_roles: []
  surfaces: [] # backend | frontend | infra | docs | library | method | repo
  stack:
    primary: unknown
    secondary: []
  frameworks: []
  tooling:
    static_analysis: []
    structure_checks: []
    ci_providers: []
  practice_references: []
  verification_capabilities:
    primary_local_gate: available | missing | unknown
    typecheck: available | missing | unknown | not-applicable
    lint: available | missing | unknown | not-applicable
    tests: available | missing | unknown | not-applicable
    build_or_package: available | missing | unknown | not-applicable
    architecture_or_structure: available | missing | unknown | not-applicable
    static_analysis: configured | optional | unavailable | unknown
    remote_ci: available | missing | unknown
  execution_policy:
    execution_profile_ref: ""
    model_policy:
      role_levels: {} # role id -> cheap | standard | deep
      concrete_models_source: local-overlay | runtime-config | unknown
      missing_model_profiles: []
    runner_policy:
      role_runner_ids: {} # role id -> resolved runner id for this run
      runner_bindings_source: playbook-catalog | execution-profile | runtime-config | mixed | unknown
      runner_overrides: {} # production runner id -> selected runner id
      missing_runners: []
    consensus_policy:
      task_spec_review: none | single-reviewer | dual-model | adversarial-consensus
      architecture_review: none | single-reviewer | dual-model | adversarial-consensus
      code_review: none | single-reviewer | dual-model | adversarial-consensus
      other_gates: {} # gate id -> consensus mode
      provider_requirements: []
      missing_consensus_capabilities: []
    budget_policy:
      iteration_cap: null
      token_budget: null
      reported_cost_budget: null
      reported_currency: null
      budget_exhaustion_action: needs_human | stop | degrade_models
      approved_model_downgrades: [] # required when action is degrade_models
    usage_accounting:
      record_attempts: true
      record_usage: when_available
      cost_policy: self_reported_only
  local_values_needed: []
  missing_capabilities: []
  role_action_fallbacks:
    - role: ""
      action: ""
      missing_capability: ""
      fallback_actor: main-session
      scope: ""
      risk: ""
      approval_required: true
      approved: false
  clarification_blockers: []
  human_gates: []
  first_artifacts: []
  approval:
    status: proposed | approved | changed | rejected
    decision: >
      approve | change pipeline | change roles | change models |
      change execution profile | change consensus | set budget |
      analysis only | method first | stop
    notes: ""
```

## Manual Run State

Manual Codex or Claude Code runs may keep run state in chat or in a run artifact
when the consuming repo asks for one. Future revo runs should store the same
fields in runtime state.

```yaml
run_state:
  run_id: "{{RUN_ID}}"
  route_plan: {}
  current_pipeline_step: ""
  handoffs:
    task_spec: {}
    requirements_check: {}
    architecture_plan: {}
    implementation_brief: {}
    verification_plan: {}
    verification_result: {}
    developer_result: {} # see roles/developer/references/core.md
    deploy_watcher_result: {} # see roles/deploy-watcher/references/core.md
    qa_backend_result: {} # see roles/qa-backend/references/core.md
    qa_frontend_result: {} # see roles/qa-frontend/references/core.md
  gates:
    - id: route-approval
      status: open | approved | rejected
      decision: ""
    - id: clarification
      status: open | cleared | blocked
      decision: needs_analyst | needs_architect | needs_human | ""
  artifacts: []
  blockers: []
  execution_policy: {}
  usage_summary:
    attempts: []
    totals_by_role: {}
    totals_by_runner_id: {}
    totals_by_model_profile: {}
    cost_unreported_for: []
  next_action: route-approval
```

## Rules

- Do not start mutating pipeline steps until `approval.status` is `approved`.
- If the human changes the pipeline or roles, regenerate the route plan and rerun
  capability check before execution.
- If the human changes models, consensus, or budget, regenerate the route plan
  and rerun capability check before execution.
- If runner availability or runner overrides change, regenerate the route plan
  and rerun capability check before execution.
- Use `consensus_policy.other_gates` for pipeline-specific review gates that do
  not fit task spec, architecture, or code review.
- If `missing_capabilities` contains blocking items, recommend `method first` or
  `analysis only`.
- [DECISION] Keep `role_action_fallbacks` empty when selected role capabilities are
  available. Add an entry only when a selected role capability is unavailable and
  the main session is proposed to execute that role-owned action.
- [DECISION] A role-owned action fallback is executable only when its entry is
  explicit, scoped, and approved during route approval.
- If `clarification_blockers` contains blocking items, stop with
  `needs_analyst`, `needs_architect`, or `needs_human`.
- Keep route planning generic. Do not encode stack-specific commands, package
  managers, static-analysis vendors, or CI provider names as core assumptions.
  Store exact commands in repo overlays or filled verification artifacts.
- Keep role-specific result schemas with the owning role reference. Run state may
  store named handoff slots, but it must not duplicate those schemas.
- Store resolved local values only in run state, never in committed method docs.
- Keep this schema portable; adapters may wrap it but must not rename canonical
  fields.
- Concrete model names may enter run state only from local overlays or runtime
  config.
- Production runner bindings come from installed playbook role `runner_id`
  values. Local or test profiles may override runner ids without changing role
  ids, pipeline role ids, or route gates.
- Stub runners may appear only as execution-profile overrides, not as production
  role ids or public product run modes.
- `budget_exhaustion_action: degrade_models` may run without another human gate
  only when `approved_model_downgrades` names the pre-approved downgrade path.
- Usage accounting follows `usage-accounting.md`; do not compute costs from a
  committed provider price table.
