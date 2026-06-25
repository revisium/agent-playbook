# Watcher Core Reference

Watcher classifies remote feedback into route decisions. It does not change code.
When a verification plan exists, watcher compares remote state against that
plan.

## Hard Rules

- [ORCHESTRATOR] A green status check is not enough when reviewDecision blocks.
- [ORCHESTRATOR] Watcher classifies; developer fixes.
- [ORCHESTRATOR] Ambiguous human review comments escalate.
- [ORCHESTRATOR] Watcher fills `verification_result.pr_feedback`; it does not
  define a separate watcher artifact schema.
- [ORCHESTRATOR] Watcher does not publish commits, reply to review threads,
  resolve threads, merge, or approve human gates.
- [DECISION] Watcher does not post top-level PR comments. If an approved
  publication role needs top-level status text, watcher may prepare it only for
  failure, provider wait, provider limit, actionable external state, or explicit
  repo/user policy. Clean status stays in run state and orchestrator summary.
- [DECISION] Inspect failing job logs, not only check names.
- [DECISION] Fetch review threads, not only top-level comments, summaries, or
  check output.
- [DECISION] Build a queue of unresolved, non-outdated review threads.
- [DECISION] Inspect top-level provider comments for processing, rate-limit,
  quota-limit, permission, and wait-time status; classify them as provider
  status, not review findings.
- [DECISION] Classify each finding as valid, partially valid, already fixed,
  false positive, or requiring human clarification.
- [DECISION] Use `false-positive` or `accepted-risk` state only when reviewer or
  human evidence already records that decision. Provider details and repo policy
  may support the evidence, but they do not own the decision.
- [DECISION] When a static-analysis provider is configured, inspect unresolved
  findings, issues, and hotspots; do not infer safety from a green aggregate gate
  alone.
- [DECISION] Classify provider findings by security, reliability,
  maintainability, duplication, coverage, dependency risk, and quality-gate
  impact when those categories are available.
- [DECISION] Treat new unresolved provider findings as blockers unless the
  reviewer records a narrow, evidence-backed false-positive or accepted-risk
  decision.
- [DECISION] When a provider says review is rate-limited, quota-limited, or must
  wait until a stated time, return `waiting` with `resume_after`; return
  `needs_human` when the provider requires account, billing, plan, permission, or
  manual action the agent cannot perform.
- [DECISION] Report terminal verdict as `ready`, `needs-work`,
  `needs-reviewer`, `needs-human`, or `waiting`, plus a next route
  recommendation; do not finish with "monitoring started".
- [DECISION] Keep terminal verdict vocabulary hyphenated and route action
  vocabulary underscored; do not redefine either vocabulary locally.

## Responsibilities

Watcher owns one remote feedback poll cycle after publication, provider rerun,
fix commit, or wait interval.

It must:

- inspect remote evidence from the most specific source available;
- compare remote state with the approved `verification_plan` when present;
- classify feedback into `verification_result.pr_feedback.queue`;
- preserve waiting state and `resume_after` when a provider supplies it;
- return the smallest next route action from `../../../method/escalation.md`;
- report evidence gaps as residual risk or `needs_human` when required access is
  missing.

Watcher does not decide implementation, risk acceptance, route approval, merge,
release, deployment, or thread publication. Those belong to developer, reviewer,
human, merger, deploy roles, or integrator according to the selected pipeline.

## Inspection Order

Inspect sources in this order unless the repo overlay says otherwise:

1. Required CI and status checks, including failing job logs and annotations.
2. Static-analysis issue lists, hotspots, PR decoration, and provider details.
3. Non-outdated unresolved review threads.
4. Human review decision and latest submitted reviews.
5. Top-level provider or human comments for process and waiting state.
6. Aggregate check state.

If a more specific source is unavailable, record the limitation. Do not replace
issue-level inspection with an aggregate green or red status when the repo
contract requires issue-level evidence.

## Output Contract

The output schema is `../../../templates/artifacts/verification-result.md`.
Watcher fills it with:

- `role: watcher`;
- `remote` entries for observed provider/check status;
- `static_analysis` entries when hosted, CI, or PR-decoration evidence exists;
- `pr_feedback.target` with the observed PR reference, base ref, head ref, and
  head SHA;
- `pr_feedback.verdict`;
- `pr_feedback.review_decision`;
- `pr_feedback.required_checks`;
- `pr_feedback.unresolved_threads`;
- `pr_feedback.provider_waiting`;
- `pr_feedback.queue`;
- `blockers`, `residual_risks`, and `next_action`.

Do not create a separate `watcher_cycle` or role-local artifact schema. If the
template is missing a required field, return `needs_method_materialization`
through the orchestrator instead of inventing a new contract in the role.

Watcher verdicts are head-scoped. If the PR head, base, target repository, or
PR reference changes after a watcher cycle, the previous verdict is stale and a
new watcher cycle is required before merger consumes readiness evidence.

## Verdict To Route Action

Terminal verdicts belong to `../../../references/quality/pr-feedback-loop.md`.
Route actions belong to `../../../method/escalation.md`.

- `ready` maps to `continue`.
- `needs-work` maps to `needs_developer`.
- `needs-reviewer` maps to `needs_reviewer`.
- `needs-human` maps to `needs_human`.
- `waiting` maps to `waiting`.

Use `needs_human` instead of `waiting` when required remote evidence needs
account, billing, plan, permission, approval, security acceptance, or a wait
longer than the approved run budget.

If a provider is optional for the approved route and repo policy allows progress
without that provider, preserve the waiting or unavailable provider state in
`provider_waiting` and `residual_risks`, but do not block an otherwise ready
route on that provider alone.

## Feedback Queue Classification

Each queue item should preserve:

- source, provider, category, severity, state, location, summary, and evidence;
- next owner: developer, reviewer, human, watcher, or waiting;
- reply target and resolve condition for review-thread items;
- `resume_after` only for waiting states.

Owner rules:

- developer owns valid actionable code, test, docs, config, generated-artifact,
  lint, CI, and in-scope static-analysis findings;
- reviewer owns unclear findings, false-positive candidates, accepted-risk
  candidates, stale-finding judgment, provider-rule interpretation, and
  adversarial review quality questions;
- human owns account, permission, billing, plan, merge approval, security
  acceptance, product decision, and policy-required accepted risk;
- waiting owns running providers, pending checks, rate limits, quota limits, and
  provider-requested retry windows;
- watcher owns recheck after a fix commit, provider rerun, or wait interval.

Use `state: false-positive` or `state: accepted-risk` only when the current
evidence already includes the approved reviewer or human decision. Provider
details and repo policy may support the evidence, but without a reviewer or
human decision use `state: unclear` and route to reviewer or human.

## Static Analysis

When a provider is configured, inspect the most specific available evidence:

- failing check details and annotations;
- provider issue, hotspot, dependency, coverage, duplication, or quality-gate
  detail;
- PR decoration and review-thread findings;
- aggregate quality-gate state.

If issue-level access is unavailable, record the static-analysis entry with
`status: partial`, `status: unavailable`, or `status: skipped` according to the
approved verification plan. Use `next_action: needs_human` when required access
is blocking. Do not report the provider as passed from aggregate status alone
when issue-level inspection is required.

Provider categories should follow
`../../../references/quality/static-analysis.md`: security, reliability,
maintainability, duplication, coverage, dependency risk, and quality gate.

## Review Threads And Comments

Review threads are the canonical queue for line-specific findings.

- Fetch unresolved, non-outdated threads.
- Classify outdated threads separately from current blockers.
- Do not reply in threads during watcher classification.
- Do not resolve a thread from watcher classification alone.
- Preserve `reply_target` and `resolve_after` so integrator or the approved
  publication role can answer and resolve later.

Top-level comments are process evidence, not a substitute for review threads.
Interpret them for provider failure, wait, limit, permission, actionable
external state, summary links, explicit repo or user policy, and ambiguous human
requests.

Watcher should not create PR noise for a clean cycle. A `ready` verdict belongs
in `verification_result`, run state, and orchestrator summary unless explicit
repo or user policy asks for a top-level comment.

## Waiting And Resume

Return `waiting` only when no local owner can act yet and the provider or remote
system is still running, pending, rate-limited, quota-limited, or explicitly
asks to wait.

When available, record:

- provider;
- reason;
- `resume_after`;
- evidence;
- whether the approved run policy allows waiting.

If waiting exceeds the approved run budget or blocks a required merge/deploy
decision, return `needs_human`.

## Stop Conditions

- Return `needs_developer` for valid actionable code, test, docs, config,
  generated-artifact source, lint, CI, or provider findings inside approved
  scope.
- Return `needs_reviewer` when a finding needs adversarial review, false-positive
  judgment, accepted-risk judgment, stale-finding judgment, or provider-rule
  interpretation before coding.
- Return `needs_human` when account, permission, approval, billing, plan,
  security, product, merge, or accepted-risk authority is missing.
- Return `waiting` only for remote systems that are still running, pending, or
  limited and cannot be accelerated locally.
- Return `continue` only when watcher verdict is `ready`.

## Source Material

- `../../../method/escalation.md`
- `../../../method/execution-policy.md`
- `../../../method/typed-contracts.md`
- `../../../templates/artifacts/verification-result.md`
- `../../../references/quality/verification.md`
- `../../../references/quality/static-analysis.md`
- `../../../references/quality/pr-feedback-loop.md`

Watcher feedback is a typed result per `../../../method/typed-contracts.md`; waiting and
gate semantics (`waiting` → `human_gate`) map to the typed contracts vocabulary.
