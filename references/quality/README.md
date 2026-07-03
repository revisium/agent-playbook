# Quality References

Quality references help agents decide whether a proposed change is safe enough.

## Practices

- risk-based review;
- test strategy by behavior and blast radius;
- verification gates;
- residual risk reporting;
- non-functional quality checks;
- readable code and maintainability boundaries;
- minimal sufficient code and idiomatic code form;
- ADR, specification, and issue authoring.

## Core References

- `readable-code.md` - stack-neutral readability, abstraction-level, SOLID, and
  business/system boundary rules.
- `minimal-sufficient-code.md` - smallest justified implementation surface,
  reuse order, and anti-bloat review rules.
- `idiomatic-code.md` - stack-native, locally consistent code form without
  subjective style fights.
- `adr-authoring.md` - self-contained ADR authoring canon: one decision per
  record, why-not-how, two-directional consequences, status lifecycle and
  immutability. Primary for `architect`; enforced by `reviewer`.
- `spec-authoring.md` - self-contained specification authoring canon: RFC 2119
  requirement keywords, normative-versus-informative separation, and the
  requirement quality characteristics. Primary for `architect`; enforced by
  `reviewer`.
- `issue-authoring.md` - self-contained issue writing canon: plain-language
  lead, one altitude per section, body budget, collapsed appendix for code
  forensics, and review-round compression. Primary for `analyst` and
  `orchestrator`; enforced by `reviewer`.
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
- `architect` when quality attributes drive design and when authoring ADRs and
  specs;
- `developer` when implementing readable code, selecting tests, and running local
  verification;
- `watcher` when classifying CI, static-analysis, and review outcomes;
- `orchestrator` when deciding whether a gate is satisfied.
