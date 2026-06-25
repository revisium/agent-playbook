# Role Result

Canonical schema owner: `../../method/role-definition.md`.
Related lifecycle contract: `../../method/typed-contracts.md`.

Fillable template for the role / node result envelope returned by any prompt-backed role.

```yaml
role_result:
  verdict: ""          # reuse verdict/route vocab from ../../method/escalation.md
  output: ""           # short prose summary for the next consumer
  artifacts:
    - artifact_type: ""
      slot: ""
      location: ""     # placeholder or run-state ref
      owner_role: ""
      schema_owner: ""
      status: ""
  needsHuman: false
  lesson: ""           # optional
  nextSteps:           # optional
    - {}
```

## Fill Rules

- Reuse existing verdict/route vocabulary from `../../method/escalation.md` and
  `../../method/route-approval.md`. Do not invent new verdict tokens.
- Do not include billing, cost, model name, token count, or attempt id fields.
  Revo wraps the result with those fields per `../../method/usage-accounting.md`.
- Each entry in `artifacts` is an `artifact_ref`; see
  `../../templates/artifacts/artifact-ref.md`.
- `needsHuman: true` is appropriate when `verdict` is `needs_human` or `adr-approval`
  is pending.
- `lesson` is one line; store it for future playbook improvement, not for the current run.
