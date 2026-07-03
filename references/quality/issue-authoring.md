# Issue Authoring Reference

An issue is durable project context written for a human reader first and an
agent second. It states the problem, the ask, the evidence, and what closes it.
It is not an ADR, not a specification, and not a forensic log; those artifacts
are linked from the issue, not inlined into it.

This reference is stack-neutral. The rules below are self-contained: an author
or reviewer needs nothing beyond this file to write or judge an issue. Concrete
issue forms (bug, delivery slice, decision) live in each repository's issue
template directory and must stay consistent with these rules.

Related quality lenses:

- `adr-authoring.md` owns the decision record an accepted decision issue
  produces.
- `spec-authoring.md` owns the normative contract when the outcome is a spec.
- `readable-code.md` owns the same one-abstraction-level discipline in code.

## Hard Rules

- [DECISION] Lead with a plain-language story. The first paragraph states what
  happened or what must change, why it matters now, and what is being asked,
  without code tokens. A reader who stops after the first paragraph should
  still know what the issue is about.
- [DECISION] Keep one altitude per section. The issue body carries the problem,
  the ask, the options, and the outcome. Code-level forensics — file paths,
  line numbers, call chains, literal values, inline schemas — belong in a
  collapsed appendix (`<details>`) at the end or in a linked artifact, never
  inline in the body sections.
- [DECISION] Budget the body. The non-appendix body of a decision issue targets
  roughly six hundred words, readable in about three minutes; a bug report
  targets half of that. Overflow is a signal that ADR, spec, or delivery-slice
  material is being written in the wrong place.
- [DECISION] Write one claim per sentence by default. Do not chain state
  transitions with arrows as sentence syntax; name each transition with a verb.
  A sentence that needs three kinds of markup to parse is two sentences.
- [DECISION] Expand project-internal jargon on first use. A term that only
  makes sense with the engine's mental model in your head (for example a park,
  an ordinal, a short-circuit) gets a half-sentence gloss the first time it
  appears.
- [DECISION] Use emphasis sparingly: bold at most one load-bearing statement
  per section, and never bold inline code tokens. When every line carries
  emphasis, none does.
- [DECISION] Review rounds must compress, not accrete. Multi-voice or consensus
  revision may add missing facts, but the final pass removes qualifiers whose
  only purpose was to pre-empt a reviewer objection; the answered objection
  lives in the review thread or the appendix. A document that only grows across
  review rounds is a review smell in itself.
- [DECISION] A decision issue states the question, the recommended direction,
  and honest alternatives. The full normative contract — schemas, exhaustive
  matrices, keyword requirements — is drafted in the linked ADR or spec. A
  compact pinned table is acceptable in the issue only when consumers must
  reconcile against it before the spec exists.
- [DECISION] Keep the closing checklist verifiable: each item is an observable
  outcome that closes the issue, not a hidden implementation plan. Slice-level
  task lists belong in child delivery-slice issues.

## Review Blockers

Raise a finding when an issue:

- opens with code tokens, an error literal, or engine jargon instead of a
  plain-language paragraph;
- carries line numbers, call chains, or inline schemas in body sections instead
  of a collapsed appendix or linked artifact;
- exceeds the body budget because decision, spec, or slice material was written
  inline;
- chains transitions with arrow syntax or packs several claims and parentheses
  into single sentences throughout;
- uses bold or capitals as routine emphasis rather than for one load-bearing
  statement per section;
- grew monotonically across review rounds, keeping every objection-pre-empting
  qualifier in the final text;
- hides an implementation plan inside the closing checklist.

## Authoring Check

Before publishing an issue, scan it:

1. Does the first paragraph alone tell a newcomer what this is and why it
   matters?
2. Is every line number, call chain, and schema either linked or collapsed in
   an appendix?
3. Is the non-appendix body within budget for its kind?
4. Can each sentence be read once, without backtracking, by someone who has not
   read the code?
5. After the last review round, did an editorial pass remove what the review
   added only for the reviewers?

If the answer is no, move material to the appendix, the ADR or spec draft, or a
child issue, and compress before publishing.
