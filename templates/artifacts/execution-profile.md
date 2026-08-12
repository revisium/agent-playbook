# Execution Profile Template

Canonical policy owner: `../../method/execution-policy.md`.

Use this template for ignored local overlays or future runtime config. It tells
the orchestrator which roles, runners, model profiles, and consensus providers
are actually available in the current workspace.

Do not commit a filled profile with personal accounts, concrete local paths,
private hostnames, tokens, secrets, or provider credentials.

Recommended ignored filled profile path: `.agents/local.execution-profile.md`.

```yaml
execution_profile:
  execution_modes:
    codex:
      available: true | false | unknown
      agents_available: true | false | unknown
      skills_available: true | false | unknown
    claude-code:
      available: true | false | unknown
      subagents_available: true | false | unknown
      skills_available: true | false | unknown
    revo-future:
      available: true | false | unknown

  available_roles: []
  available_pipelines: []

  available_runners:
    claude-code: available | missing | unknown
    codex: available | missing | unknown
    revo-integrator: available | missing | unknown
    revo-merger: available | missing | unknown
    revo-deterministic: available | missing | unknown
    # Test profiles may add `stub-agent: available`; production role
    # frontmatter must not use stub runner ids.

  # Orthogonal to `available_runners`: one entry per resolved runner id.
  # External CLI entries still need a same-context live preflight immediately
  # before automatic execution.
  runner_readiness:
    "{{RUNNER_ID}}":
      status: ready | missing | ambiguous | unknown
      headless_invocation: supported | unsupported | unknown
      auth_status: configured | missing | ambiguous | not-required | unknown
      credential_source: cached-login | invocation-env | runtime-managed | not-required | unknown
      preflight_status: passed | failed | not-run | not-required
      evidence_source: live-preflight | execution-profile | runtime-config | unknown

  # Test profile example:
  # runner_overrides:
  #   claude-code: stub-agent
  # Production profiles should usually leave overrides empty and use playbook
  # role runner_id bindings directly.
  runner_overrides: {}

  model_profiles:
    cheap:
      preferred_runner: codex | claude-code | revo-future | other | unknown
      concrete_model: "{{LOCAL_MODEL_NAME}}"
      availability: available | missing | unknown
    standard:
      preferred_runner: codex | claude-code | revo-future | other | unknown
      concrete_model: "{{LOCAL_MODEL_NAME}}"
      availability: available | missing | unknown
    deep:
      preferred_runner: codex | claude-code | revo-future | other | unknown
      concrete_model: "{{LOCAL_MODEL_NAME}}"
      availability: available | missing | unknown

  consensus_providers:
    reviewer:
      - runner: codex | claude-code | revo-future | other
        model_profile: cheap | standard | deep
        concrete_model: "{{LOCAL_MODEL_NAME}}"
        availability: available | missing | unknown

  budget_defaults:
    iteration_cap: null
    token_budget: null
    reported_cost_budget: null
    reported_currency: null
    budget_exhaustion_action: needs_human | stop | degrade_models
    approved_model_downgrades: []
```

- [DECISION] `runner_readiness` does not replace runner availability or binding;
  it is a separate input keyed by the resolved runner id.
- [DECISION] Filled profiles contain normalized readiness only. Do not copy
  secrets, account identifiers, raw auth or identity output, or private paths
  into the profile.
