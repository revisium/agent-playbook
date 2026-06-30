# Spec Template

Canonical policy owner: `../../references/quality/spec-authoring.md`.

The architect owns this artifact. A spec states the contract precisely: the
concrete tokens an ADR leaves out (paths, fields, enums, schemas, behavior).
Requirements are normative and use the RFC 2119 keywords; examples, notes, and
roadmap are informative and kept apart. Replace the angle-bracket placeholders
and delete the HTML-comment guidance before handing off.

```markdown
# <name> spec

- **Status:** Draft
  <!-- Status is an enum value: Draft | Accepted | Superseded. Replace the
       default above with one of these. Put any nuance in a sentence below this
       field, not in the field itself. -->
- **Version:** v1
- **Owners:** <role or team, placeholder>
- **Source files:** <resolvable paths the contract governs, placeholder>
- **Related ADRs:** <resolvable links to the decision records, or "none">

## Scope

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, MAY, REQUIRED, and OPTIONAL
are interpreted following RFC 2119 and BCP 14: MUST / MUST NOT is an absolute
requirement / prohibition; SHOULD / SHOULD NOT is recommended / discouraged,
with deviation allowed only for a stated reason; MAY is truly optional; REQUIRED
is a synonym of MUST and OPTIONAL a synonym of MAY.

<!-- What this spec covers and what it explicitly does not. -->

## Current Contract

<!-- Normative. Present tense for behavior that exists today. One atomic rule
     per statement and per table cell. Use the keywords sparingly, only where
     correctness, contract, or interop truly requires them. No ALL CAPS for
     emphasis, no weasel words ("generally", "as needed", "best-effort") inside
     a normative statement. -->

## Target Migration

<!-- Approved-but-not-yet-shipped contract. Normative about the intended end
     state, written in the future tense, and kept apart from Current Contract so
     the not-yet-true never reads as today's behavior. State the path from the
     current contract to it. -->

## Validation

<!-- How conformance is checked: tests, inspections, observations that decide
     whether each requirement holds. -->

## Compatibility

<!-- Backward/forward compatibility, shared enums (must match peer specs exactly
     or carry an explicit mapping), and migration constraints. -->

## Examples

<!-- Informative only. Illustrations, never the source of a normative rule. -->

## Changelog

- v1 - <date> - initial draft.
```

## Fill Rules

- Reserve ALL CAPS for the requirement keywords; use italics or rewording for
  emphasis.
- Keep one atomic rule per statement and per table cell; split compound
  sentences.
- Keep informative content (examples, notes, provenance, roadmap) out of
  normative definitions.
- Define each term once; keep shared enums matched across specs or explicitly
  mapped.
- See `../../references/quality/spec-authoring.md` for the full rules and review
  blockers.
