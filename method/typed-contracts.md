# Typed Contracts

This file defines portable typed contracts for role results, human gates, and artifact
references. These shapes are suitable for future Revo validation. Canonical field owners
are referenced, not duplicated: route/run schema is owned by `route-plan.md`; escalation
vocabulary is owned by `escalation.md`; output-contract semantics are owned by
`role-definition.md`.

Fillable templates for these contracts:

- Role/node result → `../templates/artifacts/role-result.md`
- Human gate → `../templates/artifacts/human-gate.md`
- Artifact ref → `../templates/artifacts/artifact-ref.md`

## Role / Node Result

Canonical schema owner: `role-definition.md` "Output Contract".
Escalation vocabulary owner: `escalation.md`.

```yaml
role_result:
  verdict: ""          # reuse route/verdict vocab from escalation.md:
                       # approved | changes_requested | blocker | clean | dirty |
                       # needs_analyst | needs_architect | needs_human |
                       # needs_developer | needs_reviewer | waiting | continue | stop
  output: ""           # short prose summary for the next consumer
  artifacts:           # list of artifact_ref (see below)
    - {}
  needsHuman: false    # true when the verdict requires human intervention
  lesson: ""           # optional one-line note for future attempts
  nextSteps:           # optional follow-up work items
    - {}
```

Revo may wrap this envelope with attempt id, token usage, cost metadata, model name, and
runtime progress records per `usage-accounting.md`. Roles emit no billing fields.

## Human Gate

Canonical schema owner: this file (`typed-contracts.md`).
Canonical policy owner: `route-approval.md`.
Escalation vocabulary owner: `escalation.md`.

```yaml
human_gate:
  id: ""               # stable gate id, e.g. route-approval-001
  type: ""             # route-approval | task-spec-approval | architecture-approval |
                       # adr-approval | merge | clarification
  scope: ""            # short description of what is being approved
  presented_artifact_ref:  # an artifact_ref (see below)
    artifact_type: ""
    slot: ""
    location: ""
    owner_role: ""
    schema_owner: ""
    status: ""
  status: ""           # open | approved | changed | rejected | cleared | blocked
  decision: ""         # reuse existing route decisions / markers from escalation.md
                       # and route-approval.md (e.g. approved | method first | stop)
  decided_by: ""       # role id or "human"
```

`run_state.gates` (owned by `route-plan.md`) is where gates live in run state. This is the
typed shape of a single gate entry. Do not duplicate the route/run schema here.

## Artifact Ref

Canonical schema owner: this file (`typed-contracts.md`).

```yaml
artifact_ref:
  artifact_type: ""    # e.g. task_spec | architecture_plan | implementation_brief |
                       # verification_plan | verification_result | developer_result
  slot: ""             # the canonical slot name in run state or upstream artifact
  location: ""         # placeholder or run-state ref, e.g. {{RUN_ARTIFACTS_PATH}}/task-spec.yaml
  owner_role: ""       # role id that owns this artifact, e.g. analyst | architect | developer
  schema_owner: ""     # relative path to the owning method/role file,
                       # e.g. ../../method/typed-contracts.md
  status: ""           # draft | ready | approved | superseded
  head_sha: ""         # optional; for head-scoped artifacts such as PR feedback
```

This shape generalizes the `*_ref` fields and `run_state.artifacts` entries owned by
`route-plan.md`. Do not duplicate the route/run schema.

## Route Option Presentation And Decision (Revo-Aware)

Canonical option-presentation block owner: `orchestrator-run.md` "Proposed Route Review".
Human choice vocabulary owner: `route-approval.md` "Human Choices".

When a runtime (such as Revo) receives a route plan:

1. The orchestrator presents options using the block defined in `orchestrator-run.md`.
2. The human gate of `type: route-approval` (see Human Gate above) captures the approval.
3. Before execution, the runtime validates:
   - the `route_plan` is well-formed per `route-plan.md`;
   - the `human_gate.status` is `approved` or `cleared`;
   - no blocking clarification markers remain (see `escalation.md`);
   - required runner implementations are present.
4. If validation fails, the route stops per `escalation.md` stop actions.

Do not restate the route schema here. Point to `route-plan.md` for all route/run fields.

For the pre-execution readiness gate see `lifecycle.md` Pre-Developer Consistency Check.
