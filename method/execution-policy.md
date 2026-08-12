# Execution Policy

Execution policy defines how the orchestrator chooses runners, model levels,
review consensus, iteration caps, budgets, and human approval before a pipeline
starts.

Canonical method files use portable policy. Concrete model names, account names,
runner credentials, local paths, and provider-specific limits belong in ignored
local overlays or future runtime config.

## Policy Sources

The orchestrator builds execution policy from these sources, in order:

1. installed playbook role and pipeline catalogs;
2. canonical role and pipeline requirements;
3. consuming repo overlays and run request constraints;
4. local execution profile, for example `.agents/local.context.md` or a future
   runtime config;
5. user overrides during route approval.

The canonical method may recommend `cheap`, `standard`, or `deep`. It must not
hardcode current provider model names as required behavior.

Role production runner bindings come from installed playbook data, specifically
role `runner_id` values. Local or test execution profiles may override runner
ids for a run, for example `claude-code -> stub-agent`. Overrides select runner
implementations; they must not create separate stub roles or change pipeline
role ids.

## Runner Readiness

[DECISION] Runner availability and runner readiness are orthogonal. Availability
says that the resolved runner implementation exists. Readiness says that the
exact headless invocation is ready to be attempted in the launch context
selected for this run.

[DECISION] The canonical readiness map is keyed by resolved runner id:

```yaml
runner_readiness:
  "{{RUNNER_ID}}":
    status: ready | missing | ambiguous | unknown
    headless_invocation: supported | unsupported | unknown
    auth_status: configured | missing | ambiguous | not-required | unknown
    credential_source: cached-login | invocation-env | runtime-managed | not-required | unknown
    preflight_status: passed | failed | not-run | not-required
    evidence_source: live-preflight | execution-profile | runtime-config | unknown
```

[DECISION] `cached-login` means credential state persisted by the runner;
`invocation-env` means a credential injected only into the effective process
environment; `runtime-managed` means a runtime, platform, or configured helper
owns credential delivery; `not-required` means the runner needs no credential;
and `unknown` means the source could not be normalized.

- [DECISION] The launch context is the combination of working directory,
  effective environment and configuration, operating-system user or container,
  and launcher command or wrapper. Readiness evidence applies only to that same
  context.
- [DECISION] `status: ready` means ready to attempt the headless call; it does
  not prove that a provider will accept, refresh, or authorize the selected
  credential on the next request.
- [DECISION] A runner is `ready` only when headless invocation is `supported`,
  auth is `configured` or `not-required`, the credential source is known and
  matches the source declared by the launcher, preflight is `passed` or
  `not-required`, and the evidence is current for the same launch context.
- [DECISION] The preflight method is credential-source-specific: it must inspect
  the source declared by the launcher and detect competing effective sources. A
  storage-only status check cannot establish `invocation-env` readiness. A
  source mismatch or unresolved competing source is `ambiguous` unless explicit
  runtime configuration safely resolves the intended source before execution.
- [DECISION] An external CLI runner additionally requires a same-context live
  preflight before its first attempt. Execution-profile or runtime-config
  evidence may describe expected readiness, but it does not replace that live
  preflight.
- [DECISION] Only `status: ready` permits automatic execution. `missing`,
  `ambiguous`, and `unknown` block the automatic attempt and remain visible in
  capability output and the route plan.
- [DECISION] Any launch-context change invalidates prior readiness evidence. A
  new attempt after the change requires a new same-context preflight.
- [DECISION] An authentication failure from an attempted call invalidates the
  runner's readiness immediately. The adapter must not retry the call
  automatically, start an interactive login, persist a supplied credential,
  fall back to another provider or account, or silently change the execution
  profile.
- [DECISION] Readiness artifacts contain normalized status only. Keep secrets,
  account identifiers, raw identity or auth output, and private paths out of
  canonical artifacts and human-visible route evidence.

[DECISION] Public product runs must not expose runner selection as
user-facing `runnerMode`, `--stub`, or `--live` controls. Test execution uses a
test execution profile selected by the runtime or test harness, not a different
production route, role id, or pipeline definition.

## Model Levels

- `cheap` - low-cost monitoring, status classification, simple summarization,
  and low-risk follow-up routing.
- `standard` - ordinary implementation, integration, and non-ambiguous analysis.
- `deep` - requirements analysis, architecture, adversarial review, security,
  data migration, cross-repo work, and high-risk decisions.

Role `default_model_level` is a starting point. The orchestrator may recommend a
different level based on risk, repo overlay, user budget, or missing capability.

## Consensus Modes

- `none` - no reviewer consensus; suitable for tiny local tasks or direct human
  instructions.
- `single-reviewer` - one independent review voice.
- `dual-model` - two independent review voices using different model profiles or
  runners when available.
- `adversarial-consensus` - independent reviewers plus explicit adjudication of
  disagreements before progression.

Consensus is a pipeline or route policy, not hidden behavior inside the
`reviewer` role. A reviewer is one review voice. The orchestrator decides how
many voices are required for the current route.

## Pipeline Defaults

Per-pipeline defaults live in each `pipelines/<pipeline>/PIPELINE.md`
`Execution Policy` section. This file defines the policy vocabulary and
approval rules only.

Repo overlays and human route approval may override pipeline defaults.

## Route Approval Choices

Before execution, the orchestrator must show:

- selected pipeline;
- selected roles and omitted optional roles;
- selected runner binding per selected role and the source of any override;
- recommended model level per role;
- consensus mode per review gate;
- iteration cap;
- token or reported-cost budget when supplied;
- missing models, runners, or capabilities;
- human gates.

The human may answer:

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

If the human changes models, consensus, or budget, regenerate the route plan and
rerun capability check before execution.

## Budget Policy

Budget policy is advisory for manual Codex and Claude Code runs and enforceable
for future runtimes that own scheduling.

Use these fields:

- `iteration_cap` - maximum developer/reviewer or developer/watcher loops before
  escalation.
- `token_budget` - optional run budget in provider-reported tokens.
- `reported_cost_budget` - optional run budget in provider-reported currency.
- `budget_exhaustion_action` - `needs_human`, `stop`, or `degrade_models`.
  `degrade_models` is allowed only when route approval explicitly pre-approves
  the downgrade path; otherwise changing model levels because of budget
  exhaustion requires route-plan regeneration and human approval.

Do not compute cost from a committed price table. Use `usage-accounting.md`.

## Capability Rules

- If a required role is unavailable, recommend `method first`, `change roles`,
  or `analysis only`.
- If a recommended model level is unavailable, propose the closest available
  fallback and make reduced coverage visible before route approval.
- If `dual-model` or `adversarial-consensus` cannot be satisfied, ask the human
  to approve `single-reviewer`, change providers, or stop.
- Do not silently increase model level, consensus width, live access, write
  rights, or budget after route approval.
- Do not silently decrease model level after route approval unless
  `budget_exhaustion_action: degrade_models` and the specific downgrade path
  were approved in the route plan.
- Concrete model names may appear in run state only when they come from local
  overlays or runtime config.
- Resolved runner ids may appear in route plans and run state when they come
  from installed playbook role `runner_id` values, or from local, test, or
  runtime execution-profile overrides.
- Stub runners are test-profile bindings, not user-facing product modes.
- Runtime importers must not derive runner bindings from `rights`; `rights`
  controls access and tool policy only.
