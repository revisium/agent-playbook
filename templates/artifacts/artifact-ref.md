# Artifact Ref

Canonical schema owner: `../../method/typed-contracts.md`.

Fillable template for a reference to a run artifact. Generalizes the `*_ref` fields and
`run_state.artifacts` entries owned by `../../method/route-plan.md`.

```yaml
artifact_ref:
  artifact_type: ""    # e.g. task_spec | architecture_plan | implementation_brief |
                       # verification_plan | verification_result | developer_result
  slot: ""             # canonical slot name in run state or upstream artifact
  location: ""         # placeholder or run-state path, e.g. {{RUN_ARTIFACTS_PATH}}/task-spec.yaml
  owner_role: ""       # role id that produced this artifact, e.g. analyst | architect | developer
  schema_owner: ""     # relative path to the owning method/role file,
                       # e.g. ../../roles/analyst/references/core.md
  status: ""           # draft | ready | approved | superseded
  head_sha: ""         # optional; include for head-scoped artifacts such as PR feedback
```

## Fill Rules

- Do not duplicate the route/run schema; point to `../../method/route-plan.md` for all
  route and run-state fields.
- `location` must use placeholders from `../../method/env-boundary.md` for any
  environment-specific path. Do not commit concrete local paths.
- `schema_owner` is a relative path to the owning method or role file, not a URL or
  absolute path.
- Include `head_sha` only for artifacts whose content is scoped to a specific commit,
  such as watcher PR-feedback snapshots.
- `status: superseded` marks an artifact that has been replaced by a newer version in
  the same run.
