# ADR Authoring Reference

An Architecture Decision Record captures one significant decision: that it was
made, the forces behind it, and the consequences of living with it. It is a
durable record for the next maintainer, not a working document and not a
specification. Detail, contracts, and mechanics belong in the linked spec; the
ADR keeps the reasoning small enough to read in a few minutes.

This reference is stack-neutral. The rules below are self-contained: an author
or reviewer needs nothing beyond this file to write or judge an ADR. The
standards that informed these rules are named in the footer for provenance and
deeper reading only.

Related quality lenses:

- `spec-authoring.md` owns how the linked specification states normative
  contracts.
- `readable-code.md` owns the same "write for the next reader" discipline in
  code.

## Hard Rules

- [DECISION] One decision per ADR. Each ADR records a single decision with its
  own lifecycle. If a record carries two decisions that could be accepted,
  rejected, or superseded independently, split it.
- [DECISION] Keep it concise: target a document readable in about five minutes,
  roughly seventy lines or fewer. Supporting detail belongs in the linked spec,
  not in the ADR; overflow is almost always specification material.
- [DECISION] Focus on why, not how. An ADR states that a decision was made and
  why it was made. Every concrete contract token belongs in the linked spec, not
  the ADR: file or module paths, type, struct, field, or enum names, schemas,
  query or code documents, line numbers, and inline code. A sentence that ends
  "the exact X is in the spec" signals that the preceding paragraph is in the
  wrong document.
- [DECISION] Context states the forces and situation neutrally: the problem,
  constraints, and pressures that make a decision necessary. Do not bury the
  decision itself inside Context; the decision belongs in the Decision section.
- [DECISION] Consequences are two-directional. Name at least one accepted
  downside or trade-off and any follow-up work, not only the guardrails or rules
  the decision creates. A Consequences section that lists only benefits and new
  constraints is incomplete.
- [DECISION] List the considered alternatives, each with an honest reason it was
  rejected. Do not list strawmen that exist only to make the chosen option look
  inevitable. For a complex decision you MAY enrich this with explicit Decision
  Drivers and per-option pros and cons (the MADR shape); keep that optional, and
  never at the cost of the length discipline above.
- [DECISION] Follow the status lifecycle: Draft, then Accepted or Rejected, then
  Deprecated or Superseded. "Draft" and "Proposed" are aliases for the single
  pre-Accepted state; use Draft as the canonical term and treat Proposed as an
  accepted synonym. An Accepted ADR is immutable except for typo and link fixes.
  A changed decision is a new superseding ADR, never an edit to the accepted
  one.
- [DECISION] Declare relations (Refines, Supersedes, Amends) in the header with
  resolvable targets. State each relation once, in the header. Do not narrate
  the lifecycle in the body.
- [DECISION] Keep definition-of-done, acceptance criteria, and test plans out of
  the ADR. They are not architectural consequences; they live in the spec or the
  run's verification plan.
- [DECISION] Use plain professional prose and let structure carry emphasis. Do
  not use ALL CAPS or bold as shouting to mark importance; the section a sentence
  sits in already signals its weight.
- [DECISION] Stick to the canonical sections: Context, Decision, Alternatives
  Considered, Consequences, plus a Status header and an Open Questions section
  while the ADR is a draft. A non-canonical section such as "Examples",
  "Boundaries", or "Schema" that is doing specification work is a smell; move it
  to the spec.

## Review Blockers

Raise a finding when an ADR:

- leaks how into Context or Decision: paths, type or field names, enums,
  queries, schemas, inline code, or line numbers instead of a link to the spec;
- carries more than one independently lifecycle-bound decision;
- has one-directional consequences that list only benefits, guardrails, or new
  rules and name no accepted trade-off or follow-up;
- lists alternatives with no honest reason for rejection, or with strawman
  options;
- contains a non-canonical section that is doing specification work;
- uses ALL CAPS or bold for emphasis rather than letting structure carry it;
- declares a relation that is vague or whose target does not resolve, or narrates
  lifecycle changes in the body instead of the header;
- puts definition-of-done, acceptance criteria, or a test plan in the body;
- edits an already-Accepted ADR's decision instead of writing a superseding one;
- exceeds the length target because how-detail was written inline instead of
  linked.

## Authoring Check

Before handing off an ADR, scan it:

1. Can a reader name the single decision in one sentence?
2. Does Context describe forces without stating the decision?
3. Could every concrete token be removed because it lives in the linked spec?
4. Does Consequences name at least one accepted downside and any follow-up?
5. Does each alternative carry an honest rejection reason?
6. Do header relations resolve, and is the body free of lifecycle narration?

If the answer is no, move the offending material to the spec, split the record,
or rewrite the section before the ADR is accepted.

## Standards Referenced

Cited by name for provenance and deeper reading; every rule above is stated
inline and needs no external fetch.

- Michael Nygard, "Documenting Architecture Decisions" - the Context, Decision,
  Consequences shape, the one-decision-per-record discipline, and the baseline
  Considered Alternatives with an honest why-rejected.
- MADR (Markdown Any Decision Records) - the optional richer variant for complex
  decisions: explicit Decision Drivers and per-option pros and cons.
- AWS Prescriptive Guidance on architecture decision records - decision
  significance, status lifecycle, and immutability of accepted records.
