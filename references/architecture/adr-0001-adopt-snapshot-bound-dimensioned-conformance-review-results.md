# ADR-0001 - Adopt snapshot-bound, dimensioned conformance review results

- **Status:** Accepted
- **Decision date:** 2026-08-10
- **Relations:** none
- **Spec:** [Conformance assurance](../quality/conformance-assurance.md)

## Context

Green verification can coexist with drift from governing requirements. This is
especially likely when sources change, review relies on implementation-provided
tests, or one member of an affected defect class is missed. Publication based
on verification alone therefore cannot establish current conformance.

## Decision

[DECISION] Adopt an independent, snapshot-bound conformance review with
immutable requirement provenance and separate verdict dimensions. The reviewer
executes negative evidence and audits the complete defect-class sibling
population. Reviewer participation is required for bugfix work; Analyst remains
conditional when requirement sources must be created or clarified. Detailed
behavior remains owned by the linked specification.

## Alternatives Considered

- **Optional Reviewer with verification-only publication:** Rejected because
  passing verification does not prove requirements alignment, independent
  negative behavior, or complete sibling coverage.

## Consequences

- Positive: publication decisions remain tied to the exact reviewed target and
  governing sources, with distinct risk dimensions visible.
- Trade-off: every bugfix incurs reviewer cost, and any target or source change
  stales the verdict and requires a new review.
- Follow-up: Analyst remains conditional. A future runtime may automate the
  mechanics, but the canonical specification remains the behavior owner.
