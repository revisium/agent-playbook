# Requirements Check Template

Canonical schema owner: `../../checklists/requirements.md`.
Escalation vocabulary owner: `../../method/escalation.md`.

The analyst emits this artifact next to `task_spec`. The orchestrator verifies
it before developer execution.

```yaml
requirements_check:
  status: ready | needs_analyst | needs_architect | needs_human
  blockers: []
  evidence: []
  source_requirements:
    ref: task_spec.source_requirements
    applicability: required | not-applicable
    completeness: complete | incomplete | unknown | not-applicable
    unpinned_source_ids: []
    unproven_published_version_source_ids: []
    unmapped_requirement_ids: []
  unresolved_markers:
    open_questions: []
    human_actions: []
    escalation: []
```

## Fill Rules

- Use `ready` only when implementation can proceed without guessing.
- [DECISION] When source requirements apply, use `ready` only when they are complete,
  immutably pinned, and mapped to provenance.
- [DECISION] Treat `published-version` as immutable only when source evidence
  proves that the publishing system prevents replacement of the exact version.
- Use route stop actions according to `../../method/escalation.md`.
