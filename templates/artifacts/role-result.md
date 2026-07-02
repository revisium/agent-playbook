# Role Result

Canonical schema owner: `../../method/typed-contracts.md`.
Related lifecycle contract: `../../method/typed-contracts.md`.

Fillable template for the role / node result envelope returned by any prompt-backed role.

```yaml
role_result:
  verdict: ""          # reuse the role-result verdict enum from ../../method/typed-contracts.md
  output: ""           # short prose summary for the next consumer
  artifacts:
    - artifact_type: ""
      slot: ""
      location: ""     # placeholder or run-state ref
      owner_role: ""
      schema_owner: ""
      status: ""
      head_sha: ""
  needsHuman: false
  lesson: ""           # optional
  nextSteps:           # optional
    - {}
```

## Fill Rules

- Reuse the `role_result.verdict` enum from `../../method/typed-contracts.md`.
  Do not invent new verdict tokens.
- Do not include billing, cost, model name, token count, or attempt id fields.
  Revo wraps the result with those fields per `../../method/usage-accounting.md`.
- Each entry in `artifacts` is an `artifact_ref`; see
  `../../templates/artifacts/artifact-ref.md`.
- `needsHuman: true` when the role verdict is `needs_human`. Gate state such as a pending `adr-approval` is tracked in `run_state.gates` via the `human_gate` contract, not in the role result.
- `lesson` is one line; store it for future playbook improvement, not for the current run.
