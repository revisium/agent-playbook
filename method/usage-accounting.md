# Usage Accounting

Usage accounting records runner-reported token and cost metadata without making
roles responsible for billing or provider pricing.

## Result Boundary

Roles emit only the portable `role_result` envelope defined in
`typed-contracts.md`:

```json
{
  "verdict": "continue",
  "output": "",
  "artifacts": [],
  "needsHuman": false,
  "lesson": "",
  "nextSteps": []
}
```

The orchestrator, adapter, or future runtime wraps that result with attempt
metadata, usage records, and ledger state.

## Attempt Metadata

```yaml
attempt:
  id: ""
  role: ""
  runner: codex | claude-code | revo-future | other
  runner_id: ""
  model_profile: cheap | standard | deep
  concrete_model: "{{MODEL_NAME_FROM_LOCAL_OVERLAY}}"
  started_at: ""
  completed_at: ""
  status: succeeded | failed | cancelled | needs_human
  result: {}
  usage_records: []
```

`concrete_model` is runtime metadata. Do not commit resolved model names in the
canonical method.

## Usage Record

```yaml
usage_record:
  runner: codex | claude-code | revo-future | other
  runner_id: ""
  model_profile: cheap | standard | deep
  concrete_model: "{{MODEL_NAME_FROM_LOCAL_OVERLAY}}"
  input_tokens: null
  cached_input_tokens: null
  output_tokens: null
  reasoning_output_tokens: null
  cache_tokens: null
  reported_cost: null
  reported_currency: null
  cost_source: self_reported | unavailable
```

## Rules

- Agents do not emit cost fields as part of their portable result.
- The orchestrator or adapter records usage from runner self-reported metadata.
- `runner_id` records the resolved role runner binding used for the attempt,
  including execution-profile overrides when present.
- Do not maintain a committed provider price table in this repository.
- If a runner reports tokens but not cost, record tokens and set
  `reported_cost: null`.
- If a runner reports cost, record the self-reported cost and source.
- Summaries may aggregate by role, runner, model profile, and concrete model
  when the concrete model came from local runtime data.
- Budget decisions must use recorded usage and the route plan budget policy.
- Missing usage metadata must not block correctness work by itself, but it must
  be visible in run state when budget tracking was requested.
