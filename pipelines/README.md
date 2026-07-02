# Pipelines

Portable pipelines define role order, state artifacts, gates, handoffs, and
execution-policy defaults.
Discovery metadata lives in `INDEX.md`.
Shared startup and route approval gate text lives in `COMMON-STEPS.md`.

The current base is deliberately small:

- `feature-development` - full spec to PR, with review and watcher loops.
- `bugfix` - reproduce, patch, review, PR.
- `local-change` - small local implementation when requirements and architecture
  are already clear.
- `analysis-only` - read-only investigation and recommendation.
- `quality-audit` - read-only technical-debt and conformance assessment.
- `post-merge-qa` - deploy verification and live QA loop.
- `method-development` - add or improve roles, stacks, pipelines, adapters, and
  references.

Runtime values, concrete models, provider accounts, and budgets use
placeholders and are resolved per run.
