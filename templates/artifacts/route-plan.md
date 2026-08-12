# Route Plan Template

Canonical schema owner: `../../method/route-plan.md`.

Use this artifact after intake, discovery, and capability check, before route
approval.

```yaml
route_plan:
  request_summary: ""
  selected_pipeline: ""
  why: ""
  execution_mode: codex | claude-code | revo-future
  required_roles: []
  alternative_roles: []
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
      role_levels: {}
      concrete_models_source: local-overlay | runtime-config | unknown
      missing_model_profiles: []
    runner_policy:
      role_runner_ids: {}
      runner_bindings_source: playbook-catalog | execution-profile | runtime-config | mixed | unknown
      runner_overrides: {}
      missing_runners: []
      runner_readiness:
        "{{RUNNER_ID}}":
          status: ready | missing | ambiguous | unknown
          headless_invocation: supported | unsupported | unknown
          auth_status: configured | missing | ambiguous | not-required | unknown
          credential_source: cached-login | invocation-env | runtime-managed | not-required | unknown
          preflight_status: passed | failed | not-run | not-required
          evidence_source: live-preflight | execution-profile | runtime-config | unknown
    consensus_policy:
      task_spec_review: none | single-reviewer | dual-model | adversarial-consensus
      architecture_review: none | single-reviewer | dual-model | adversarial-consensus
      code_review: none | single-reviewer | dual-model | adversarial-consensus
      other_gates: {}
      provider_requirements: []
      missing_consensus_capabilities: []
    budget_policy:
      iteration_cap: null
      token_budget: null
      reported_cost_budget: null
      reported_currency: null
      budget_exhaustion_action: needs_human | stop | degrade_models
      approved_model_downgrades: []
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

## Fill Rules

- Include only placeholder names in `local_values_needed`.
- Keep `missing_capabilities` and `clarification_blockers` visible.
- [DECISION] Keep `role_action_fallbacks` empty unless a selected role capability is
  unavailable and the human must approve the main session executing that
  role-owned action.
- Keep recommended model levels, consensus mode, and budget policy visible before
  approval.
- Keep selected role runner bindings and any execution-profile overrides visible
  before approval.
- [DECISION] Keep normalized readiness evidence visible beneath `runner_policy`
  for every resolved runner id. Include only the canonical fields; omit raw auth
  or identity output, account identifiers, secrets, and private paths.
- [DECISION] Only a `ready` entry permits automatic runner execution. Context
  changes and auth failures invalidate the entry and require a refreshed
  preflight, capability check, and route plan.
- Put pipeline-specific review gates in `consensus_policy.other_gates`.
- Fill `approved_model_downgrades` when `budget_exhaustion_action` is
  `degrade_models`; otherwise model downgrades require a new route approval.
- Keep commands and provider-specific settings out of this route artifact unless
  they are placeholders copied from the consuming repo overlay.
- Concrete model names may be filled only from a local overlay or runtime config.
- Stub runners may be filled only from a test execution profile, not from a
  production role id or public product run flag.
- Do not set approval to `approved` until the human explicitly approves.
- [DECISION] Do not mark a role-owned fallback as approved unless the route approval
  explicitly approves that fallback.
