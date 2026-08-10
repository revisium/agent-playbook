# Verification Planning

Verification planning is the generic contract between orchestration, developer
execution, review, PR watching, and QA. It answers what must be checked without
assuming a specific language, package manager, CI provider, or static-analysis
tool.

## Responsibilities

- Orchestrator prepares `verification_plan` from the approved route, repo-local
  quality docs, stack references, tooling references, and upstream risk notes.
- Developer runs required and applicable conditional gates before handing off.
- Integrator may rerun publish-time gates when the pipeline assigns that right.
- Watcher compares remote CI, static analysis, bot reviews, and human review
  threads against the same plan.
- QA roles add live or user-facing evidence after merge or deploy when the
  pipeline requires it through their role-owned result contracts.

## Gate Classes

- `required`: gates that must pass for this run, usually the repo's primary local
  verification command or an equivalent command set.
- `conditional`: gates that apply only to touched surfaces, for example frontend
  structure checks, backend contract tests, migration checks, package checks, or
  docs linters.
- `optional_configured`: provider gates that run only when the repo has config
  and the environment has access, for example static analysis or external
  quality platforms.
- `remote_after_push`: checks only visible after branch or PR publication, for
  example hosted CI, code review bots, static-analysis PR decoration, and review
  threads.

## Capability Mapping

Route planning records generic capability states:

```yaml
verification_capabilities:
  primary_local_gate: available | missing | unknown
  typecheck: available | missing | unknown | not-applicable
  lint: available | missing | unknown | not-applicable
  tests: available | missing | unknown | not-applicable
  build_or_package: available | missing | unknown | not-applicable
  architecture_or_structure: available | missing | unknown | not-applicable
  static_analysis: configured | optional | unavailable | unknown
  remote_ci: available | missing | unknown
```

Stack and tool references translate those capabilities into candidate checks.
Repo overlays translate candidate checks into exact commands.

## Source Priority

Use repo-local evidence before generic assumptions. `VERIFICATION.md` is the
default repo-local verification contract expected by this method. Its absence is
not a failure by itself, but it means the agent must use discovery fallback and
record a documentation follow-up.

1. `VERIFICATION.md`, when present.
2. Existing equivalent repo docs, for example `docs/quality-gates.md`, README
   verification sections, or CI/review docs.
3. Package/build scripts, static-analysis config, and CI workflow definitions.
4. Stack references and shared quality references from the canonical method.
5. Agent inference from source inspection.

Repo overlay wins for exact commands, blocking status, provider requirements,
and environment constraints. If a repo-local source is missing or stale, record
the uncertainty in `verification_plan` instead of guessing.

## Default Contract Behavior

- [DECISION] Always look for `VERIFICATION.md` or a repo-declared equivalent
  before selecting commands.
- [DECISION] If `VERIFICATION.md` exists, treat it as authoritative for local
  gates, conditional gates, static-analysis requirements, remote gates, and
  reporting format unless current repo evidence proves it stale.
- [DECISION] If `VERIFICATION.md` is missing, compose a temporary verification
  plan from scripts, CI, static-analysis config, repo docs, and stack
  references. Mark `fallback_used: true` in the plan and add a follow-up to
  create the repo-local verification contract.
- [DECISION] If `VERIFICATION.md` conflicts with scripts or CI, do not silently
  choose one. Record the mismatch, use the safest repo-current command set for
  the run, and return `needs_human` when the conflict changes what is blocking.
- [DECISION] Do not encode local accounts, tokens, hosts, namespaces, machine
  paths, or secret values in `VERIFICATION.md`. Put those values in ignored
  overlays or runtime environment.

## Provider Rules

- Do not assume a provider exists because similar repos use it.
- Treat configured static analysis as optional until the consuming repo declares
  it required and required access is available.
- Use `static-analysis.md` to classify provider states, finding categories,
  local mode, hosted mode, false positives, and accepted risks.
- A provider's green aggregate status is evidence, not a complete review. When
  the provider exposes issue-level findings, unresolved new findings must be
  inspected.
- Failed or warning provider gates must be expanded into issue-level findings
  when access exists before routing the work back to developer, reviewer, or
  human.
- Suppression or accepted risk requires narrow evidence and reviewer or human
  approval according to the consuming repo policy.
- Missing credentials, project access, or provider config must be reported as
  skipped or `needs_human`; never report the provider gate as passed.

## Assurance-Driven Test Selection

When `task_spec.source_requirements` is applicable, select verification that can
distinguish conformance from superficial success. The resulting evidence feeds
the conformance matrix and independent checks in `conformance-assurance.md`.

- [DECISION] Select direct verification evidence for every applicable source
  requirement; aggregate suite success alone does not prove requirement-level
  conformance.
- [DECISION] Include negative cases for invalid input, rejected state,
  permissions, boundaries, failures, or rollback behavior when those outcomes
  are part of the governing contract.
- [DECISION] When a rule applies to a sibling class, select coverage that
  accounts for the full applicable population rather than one representative.
- [DECISION] For contract-heavy tasks, store golden input/output vectors as
  consuming-repository-owned artifacts with reloadable paths or refs and content
  digests. Select context axes and cases and record excluded contexts with
  reasons and source evidence.
- [DECISION] A changed target snapshot, source pin, source requirement, or
  governing context invalidates affected evidence and requires the affected
  checks to be rerun.

## `verification_plan`

`verification_plan` is the concrete gate plan prepared before developer
execution. It maps generic route capabilities to repo-local commands only when
the consuming repo or run overlay provides them.

Fillable copy: `../../templates/artifacts/verification-plan.md`.

```yaml
verification_plan:
  source_inputs:
    route_plan_ref: ""
    repo_verification_contract:
      path: "VERIFICATION.md"
      status: present | missing | stale | equivalent
      equivalent_path: ""
      fallback_used: false
    repo_quality_docs: []
    stack_references: []
    tooling_references: []
    risk_notes: []
  required:
    - id: primary-local-gate
      capability: primary_local_gate
      command: "{{LOCAL_VERIFY_COMMAND}}"
      source: repo-overlay
      evidence_required: command_output_summary
  conditional:
    - id: changed-surface-gate
      capability: architecture_or_structure
      applies_when: []
      command: "{{CHANGED_SURFACE_CHECK_COMMAND}}"
      source: repo-overlay
      evidence_required: command_output_summary
  optional_configured:
    - id: static-analysis
      provider: "{{STATIC_ANALYSIS_PROVIDER}}"
      capability: static_analysis
      provider_state: >
        not_configured | configured_local | configured_hosted |
        configured_unavailable | unknown
      mode: local | hosted | ci | pr-decoration | unknown
      scope: changed-code | new-code | full-project | unknown
      blocking: false
      command: "{{STATIC_ANALYSIS_COMMAND}}"
      hosted_check: "{{STATIC_ANALYSIS_HOSTED_CHECK}}"
      issue_level_access: required | best-effort | unavailable | unknown
      categories:
        - security
        - reliability
        - maintainability
        - duplication
        - coverage
        - dependency_risk
        - quality_gate
      skip_if_missing:
        - credential
        - project_access
        - provider_config
      evidence_required: issue_summary_with_gate_status
      false_positive_policy: reviewer_or_human_required
  remote_after_push:
    - id: remote-ci
      provider: "{{CI_PROVIDER}}"
      evidence_required: status_checks
    - id: hosted-static-analysis
      provider: "{{STATIC_ANALYSIS_PROVIDER}}"
      applies_when: static_analysis.provider_state == configured_hosted
      evidence_required: issue_summary_with_gate_status
    - id: review-threads
      provider: "{{REVIEW_THREAD_PROVIDER}}"
      evidence_required: unresolved_thread_count
  documentation_followups: []
  stop_and_escalate_if: []
```

## `verification_result`

`verification_result` is the shared gate and PR-feedback evidence artifact for
developer, integrator, and watcher work. It is not the generic envelope for every
role result.

Developer may also return `developer_result` for implementation handoff. Deploy
watcher and QA roles return their role-owned result contracts. Run state stores
those handoffs as separate fields that point back to the owning role reference.

Fillable copy: `../../templates/artifacts/verification-result.md`.

```yaml
verification_result:
  plan_ref: ""
  role: developer | integrator | watcher
  status: passed | failed | partial | blocked | skipped
  source:
    repo_verification_contract_status: present | missing | stale | equivalent
    fallback_used: false
  executed:
    - id: ""
      command: ""
      status: passed | failed
      evidence: ""
  skipped:
    - id: ""
      reason: >
        not-applicable | missing-credential | missing-config |
        missing-tooling | human-required
      evidence: ""
  static_analysis:
    - id: ""
      provider: ""
      mode: local | hosted | ci | pr-decoration | unknown
      status: passed | failed | partial | skipped | unavailable | pending
      provider_state: >
        not_configured | configured_local | configured_hosted |
        configured_unavailable | unknown
      issue_level_access: available | unavailable | not-supported | unknown
      quality_gate: passed | failed | not-reported | unknown
      categories:
        security: passed | failed | not-reported | unknown
        reliability: passed | failed | not-reported | unknown
        maintainability: passed | failed | not-reported | unknown
        duplication: passed | failed | not-reported | unknown
        coverage: passed | failed | not-reported | unknown
        dependency_risk: passed | failed | not-reported | unknown
      findings:
        - rule: ""
          severity: ""
          category: ""
          location: ""
          state: new | existing | fixed | false-positive | accepted-risk | unclear
          next_owner: developer | reviewer | human | waiting
          evidence: ""
  remote:
    - id: ""
      provider: ""
      status: passed | failed | pending | unavailable
      evidence: ""
  pr_feedback:
    target:
      pr_ref: ""
      base_ref: ""
      head_ref: ""
      head_sha: ""
    verdict: ready | needs-work | needs-reviewer | needs-human | waiting | unknown
    review_decision: >
      approved | changes-requested | review-required | blocked | unknown
    required_checks: passed | failed | pending | unavailable | unknown
    unresolved_threads: 0
    provider_waiting:
      - provider: ""
        reason: rate-limit | quota-limit | processing | provider-maintenance | unknown
        resume_after: ""
        evidence: ""
    queue:
      - id: ""
        source: >
          ci | static-analysis | review-thread | human-review |
          bot-comment | provider-status
        provider: ""
        category: >
          code | test | docs | config | security | coverage |
          duplication | process | access | wait
        severity: blocker | high | medium | low | info
        state: >
          valid | partial | already-fixed | false-positive |
          accepted-risk | unclear | waiting
        location: ""
        summary: ""
        evidence: ""
        next_owner: developer | reviewer | human | watcher | waiting
        reply_target: thread | none
        resolve_after: fix-pushed | explanation-posted | wait-complete | human-decision
        resume_after: ""
  blockers: []
  residual_risks: []
  next_action: continue | needs_developer | needs_reviewer | needs_human | waiting
```

### Fill Rules

- Summarize evidence; do not paste full logs unless the consuming repo asks for
  them.
- Preserve whether the plan came from `VERIFICATION.md`, an equivalent repo
  contract, or fallback discovery.
- Failed required gates block completion.
- Skipped optional configured gates are acceptable only with a concrete reason.
- For configured static analysis, record issue-level findings when available and
  preserve any access limitation as `partial`, `unavailable`, `skipped`, or
  `needs_human`.
- For PR feedback, preserve unresolved threads separately from top-level
  provider status comments. Provider rate limits, quota limits, or wait
  instructions are `waiting` states with `resume_after` when available.
- Tie `pr_feedback` to the exact PR reference, base ref, head ref, and head SHA
  observed during the watcher cycle. A later head change makes the verdict
  stale.
- A missing credential, project access, or external permission is `needs_human`
  when the approved pipeline requires that gate.
- Use `continue`, `needs_developer`, `needs_reviewer`, `needs_human`, and
  `waiting` according to `../../method/escalation.md`.

## Artifacts

- `../../templates/artifacts/verification-plan.md`
- `../../templates/artifacts/verification-result.md`
- `static-analysis.md`
