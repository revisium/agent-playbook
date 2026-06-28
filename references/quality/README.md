# Quality References

Quality references help agents decide whether a proposed change is safe enough.

## Practices

- risk-based review;
- test strategy by behavior and blast radius;
- verification gates;
- residual risk reporting;
- non-functional quality checks;
- readable code and maintainability boundaries;
- minimal sufficient code and idiomatic code form.

## Core References

- `readable-code.md` - stack-neutral readability, abstraction-level, SOLID, and
  business/system boundary rules.
- `minimal-sufficient-code.md` - smallest justified implementation surface,
  reuse order, and anti-bloat review rules.
- `idiomatic-code.md` - stack-native, locally consistent code form without
  subjective style fights.
- `debt-taxonomy.md` - shared technical-debt classification vocabulary: landscape
  categories and the deliberate/inadvertent cause quadrant. Core for `auditor`
  and available to `reviewer`.
- `verification.md` - generic verification planning and result contract.
- `static-analysis.md` - provider-backed findings, local/hosted modes, and
  issue-level triage rules.
- `pr-feedback-loop.md` - remote PR feedback, review-thread, provider-status,
  waiting, and merge-readiness loop.

## Used By

- `reviewer` as primary owner;
- `auditor` when grading existing tech debt and conformance to these references;
- `architect` when quality attributes drive design;
- `developer` when implementing readable code, selecting tests, and running local
  verification;
- `watcher` when classifying CI, static-analysis, and review outcomes;
- `orchestrator` when deciding whether a gate is satisfied.
