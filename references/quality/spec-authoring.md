# Specification Authoring Reference

A specification states the contract: what the system must do precisely enough
that an implementer, a reviewer, and a test can agree on whether it is met. It
is where the concrete tokens live that an ADR deliberately leaves out: paths,
fields, enums, schemas, and exact behavior. A good spec is normative, testable,
and unambiguous; reliability commentary, examples, and roadmap notes are
informative and kept clearly apart from the rules.

This reference is stack-neutral. The rules below are self-contained: an author
or reviewer needs nothing beyond this file to write or judge a spec. The
standards that informed these rules are named in the footer for provenance and
deeper reading only.

Related quality lenses:

- `adr-authoring.md` owns the linked decision record that explains why a spec
  exists.
- `readable-code.md` owns the same precision discipline in code.

## Hard Rules

- [DECISION] Express requirements with the keywords MUST, MUST NOT, SHOULD,
  SHOULD NOT, MAY, REQUIRED, and OPTIONAL, interpreted as follows:
  - MUST / MUST NOT - an absolute requirement / an absolute prohibition.
  - SHOULD / SHOULD NOT - recommended / discouraged; deviating is allowed only
    with a stated, weighed reason.
  - MAY - truly optional; either choice is conformant.
  - REQUIRED is a synonym of MUST; OPTIONAL is a synonym of MAY.
  The same words in lowercase carry ordinary English meaning and make no
  normative claim. Use the keywords sparingly, only where they are truly
  required for correctness, contract, or interoperability, never to impose style
  preferences.
- [DECISION] Add a one-line conventions note to each spec: "The key words MUST,
  MUST NOT, SHOULD, SHOULD NOT, MAY, REQUIRED, and OPTIONAL are interpreted as
  defined in this spec's conventions, following RFC 2119 and BCP 14." The
  meanings live inline (above and in the template) and need no external fetch.
  Without the note, a capitalized keyword has no defined force.
- [DECISION] ALL CAPS is reserved exclusively for the requirement keywords.
  Never use ALL CAPS for emphasis; it collides with the keywords and turns an
  ordinary word into a false normative signal. Use italics or reword instead.
- [DECISION] Make each requirement unambiguous: it admits exactly one
  interpretation. If two readers could reasonably read it differently, rewrite
  it.
- [DECISION] Make each requirement verifiable: a test, inspection, or
  observation can decide whether it holds. A requirement that cannot be checked
  is not a requirement.
- [DECISION] Make each requirement singular and atomic: one rule per statement.
  Split compound or comma-chained sentences, and keep one atomic meaning per
  table cell.
- [DECISION] Make each requirement complete and necessary: no dangling TBD, and
  no filler that states nothing checkable. Every normative statement earns its
  place.
- [DECISION] Make each requirement appropriate: stated at the right level of
  abstraction, with no needless implementation detail that over-constrains the
  implementer.
- [DECISION] Keep the requirement set consistent and conforming: no two
  statements contradict each other, and the document follows the spec template.
- [DECISION] Separate normative from informative content. Examples, notes,
  provenance, probe or observation logs, and roadmap notes go in clearly labeled
  informative blocks. Never place informative content inside a normative
  definition.
- [DECISION] Separate not-yet-shipped contract from the current contract in a
  clearly labeled future-work section (for example, a `Target Migration`
  heading). That section states an approved-but-not-yet-shipped contract: it is
  normative about the intended end state, written in the future tense, and kept
  apart from the current normative text so the not-yet-true never reads as
  describing today's behavior.
- [DECISION] Keep no weasel words inside a normative statement: "generally", "as
  needed", "typically", "high", "best-effort", and the like. They defeat
  verifiability. Move reliability or performance commentary to a Note.
- [DECISION] Write current behavior in the present tense. Reserve the future
  tense and the labeled future-work section for behavior that does not exist
  yet.
- [DECISION] Define each term once and use it consistently. Do not let synonyms
  drift across the document. Enums shared across specs must match exactly or
  carry an explicit mapping.
- [DECISION] Record Status as an enum value: Draft, Accepted, or Superseded. Put
  any nuance in a sentence below the field, not in the field itself. Every spec
  carries a Version line.

## Review Blockers

Raise a finding when a spec:

- uses ALL CAPS for emphasis instead of reserving it for the requirement
  keywords;
- states a contractual rule with a lowercase "must" while no RFC 2119 / BCP 14
  convention is declared, leaving the rule's force undefined;
- packs more than one rule into a single statement or a single table cell;
- contains a normative statement that is un-testable, circular, or hedged with a
  weasel word;
- interleaves informative content, an example, a note, or a roadmap aside inside
  a normative definition;
- lets a term or a shared enum drift between definitions or across specs without
  an explicit mapping;
- records Status as prose rather than an enum value, or omits the Version line.

## Authoring Check

Before handing off a spec, scan each normative statement:

1. Does it use a capitalized keyword only where correctness truly requires it,
   under a declared RFC 2119 / BCP 14 convention?
2. Can exactly one interpretation be read from it?
3. Can a test or inspection decide whether it holds?
4. Is it a single atomic rule, free of weasel words?
5. Is every example, note, and roadmap aside outside the normative definitions?
6. Are terms and shared enums used consistently, with Status as an enum and a
   Version present?

If the answer is no, split the statement, move the informative content out, or
declare the missing convention before the spec is accepted.

## Standards Referenced

Cited by name for provenance and deeper reading; every rule above is stated
inline and needs no external fetch.

- RFC 2119 and BCP 14 - the requirement keywords and their interpretation.
- ISO/IEC/IEEE 29148 - requirement quality characteristics: unambiguous,
  verifiable, singular, complete, necessary, appropriate, consistent, and
  conforming.
