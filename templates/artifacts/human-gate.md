# Human Gate

Canonical schema owner: `../../method/typed-contracts.md`.
Canonical policy owner: `../../method/route-approval.md`.
Escalation vocabulary owner: `../../method/escalation.md`.

Fillable template for a single gate entry in `run_state.gates`.

```yaml
human_gate:
  id: ""               # stable gate id, e.g. route-approval-001 or adr-approval-001
  type: ""             # route-approval | task-spec-approval | architecture-approval |
                       # adr-approval | merge | clarification
  scope: ""            # short description of what is being approved
  presented_artifact_ref:
    artifact_type: ""
    slot: ""
    location: ""       # placeholder or run-state ref
    owner_role: ""
    schema_owner: ""
    status: ""
  status: ""           # open | approved | changed | rejected | cleared | blocked
  decision: ""         # reuse decisions/markers from ../../method/route-approval.md
                       # and ../../method/escalation.md
  decided_by: ""       # role id or "human"
```

## Fill Rules

- Reuse existing decision vocabulary from `../../method/route-approval.md` "Human Choices"
  and `../../method/escalation.md`. Do not invent new decision tokens.
- Gates are stored in `run_state.gates` owned by `../../method/route-plan.md`; do not
  duplicate the route/run schema.
- `presented_artifact_ref` is an `artifact_ref`; see
  `../../templates/artifacts/artifact-ref.md`.
- Set `status: open` when the gate has not been decided; update to `approved` or
  `rejected` after the human acts.
- `decided_by: "human"` for any gate that required a human outside the automated pipeline.
