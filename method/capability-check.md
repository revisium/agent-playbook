# Capability Check

Capability check verifies that the selected route can actually run with the
available method definitions.

## Inputs

- intake output;
- selected pipeline;
- required role ids;
- alternative role groups;
- role and pipeline catalog rows;
- selected surfaces;
- selected stack catalogs;
- selected framework references;
- selected tooling references;
- selected practice references;
- adapter target: Codex, Claude Code, or revo.
- local execution profile when available.
- runner readiness evidence keyed by resolved runner id.

## Checks

1. Pipeline id exists in `pipelines/INDEX.md`.
2. Pipeline file exists at `pipelines/<pipeline>/PIPELINE.md`.
3. Every required role id exists in `roles/INDEX.md`.
4. Every required role file exists at `roles/<role>/ROLE.md`.
5. Each alternative role group has at least one role present in
   `roles/INDEX.md`; groups with zero present roles are unresolved.
6. Surface-specific role exists when required, for example
   `developer-backend` or `developer-frontend`.
7. Each selected stack exists at `stacks/<stack>/STACK.md`.
8. Framework references exist when the pipeline requires them.
9. Tooling references exist when the pipeline requires them.
10. Practice references exist under `references/` when selected.
11. Adapter notes exist for the selected execution mode.
12. Local values are placeholders only and are listed for run-time resolution.
13. Required model profiles exist or are listed as missing.
14. Required consensus providers exist or are listed as missing.
15. Budget constraints are compatible with the recommended route or require
    human approval.
16. Selected role `runner_id` values resolve to available runner implementations
    after execution-profile overrides are applied.
17. Selected role execution capabilities are available for the chosen adapter,
    or the route plan records an explicit role-owned action fallback for human
    approval.
18. [DECISION] Every selected runner supports a headless invocation for the
    intended launcher.
19. [DECISION] Every selected runner has current readiness evidence from the
    same working directory, effective environment and config, operating-system
    user or container, and launcher command or wrapper that will execute it.
20. [DECISION] The normalized auth status and credential source match the source
    declared by the launcher. A configured status check is readiness-to-attempt
    evidence, not proof that the provider will accept the credential.

## Output

```yaml
capability_status: ready | missing | ambiguous
missing_capabilities:
  - kind: role
    id: ""
    impact: ""
recommendation: proceed | run-method-development-first | needs_human
```

Allowed `kind` values: `role`, `role-group`, `stack`, `framework`, `tooling`,
`practice`, `pipeline`, `adapter`, `local-value`, `model-profile`, `runner`,
`runner-invocation`, `runner-auth`, `consensus-provider`, `budget`,
`role-action-capability`.

## Rules

- Missing optional roles do not block the route; list them as reduced coverage.
- Missing required roles, unresolved alternative role groups, selected stacks,
  selected required tooling, or selected pipeline blocks execution. Unresolved
  means zero roles from the group are present in `roles/INDEX.md`.
- Missing conditional framework, tooling, or pattern references block execution
  only when the route selected them as required for this run.
- Missing model profiles or consensus providers require human approval before
  the orchestrator degrades models or narrows consensus.
- Missing selected runners require human approval before the orchestrator
  changes runner bindings or switches to a different execution profile.
- [DECISION] Record `runner-invocation` when the resolved runner's headless
  invocation is missing, unsupported, or unknown. Record `runner-auth` when
  auth, credential-source matching, preflight, same-context evidence, or
  readiness is missing, ambiguous, failed, stale, or unknown.
- [DECISION] Any selected runner whose normalized readiness is not `ready`
  blocks automatic execution. Do not substitute an interactive entrypoint,
  login flow, provider, account, credential source, runner binding, or
  execution profile.
- Budget constraints that would change model level, consensus mode, or iteration
  cap require route-plan regeneration and human approval.
- [DECISION] Missing selected role execution capability blocks automatic
  execution of that role-owned action. The run may proceed only when the
  fallback is recorded in `route_plan.role_action_fallbacks` and explicitly
  approved at route approval.
- [DECISION] A selected role execution capability is unavailable only when the
  selected adapter lacks the materialized role agent or wrapper, the wrapper
  cannot resolve the canonical source, or role invocation returns
  `needs_method_materialization`.
- If a missing capability is itself method work, route to
  `method-development`.
- Do not substitute a generic role for a missing specialization without human
  route approval.
