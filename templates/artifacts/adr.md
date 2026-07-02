# ADR Template

Canonical policy owner: `../../references/quality/adr-authoring.md`.

The architect owns this artifact. One ADR records one decision: that it was
made and why. Concrete contract tokens (paths, fields, enums, schemas, code)
belong in the linked spec, not here. Target a document readable in about five
minutes, roughly seventy lines or fewer. Replace the angle-bracket placeholders
and delete the HTML-comment guidance before handing off.

```markdown
# ADR-NNNN - <short decision title>

- **Status:** Draft
  <!-- Lifecycle: Draft -> Accepted/Rejected -> Deprecated/Superseded. "Draft"
       is the canonical pre-Accepted state; "Proposed" is an accepted alias.
       An Accepted ADR is immutable except typo/link fixes; a changed decision
       is a new superseding ADR, not an edit to this one. -->
- **Decision date:** <YYYY-MM-DD, set when Accepted>
- **Relations:** <Refines / Supersedes / Amends + resolvable target, or "none">
  <!-- State each relation once, here in the header. Do not narrate lifecycle
       in the body. -->
- **Spec:** <resolvable link to the linked specification, or "none yet">

## Context

<!-- State the forces, constraints, and pressures neutrally. Describe the
     situation that makes a decision necessary. Do not state the decision here,
     and do not include paths, field names, enums, schemas, or inline code. -->

## Decision

<!-- State the single decision and why it was made. Keep it to the reasoning;
     the exact contract lives in the linked spec. If a sentence ends "the exact
     X is in the spec", the surrounding detail probably belongs in the spec. -->

## Alternatives Considered

<!-- Each alternative carries an honest reason it was rejected; no strawmen. For
     a complex decision you MAY add Decision Drivers and per-option pros/cons
     (the MADR shape), but never at the cost of the ~70-line length target. -->

- **<option>:** <why it was rejected>
- **<option>:** <why it was rejected>

## Consequences

<!-- Two-directional. Name at least one accepted downside or trade-off and any
     follow-up work, not only the guardrails or benefits the decision creates.
     Keep definition-of-done, acceptance criteria, and test plans out of the
     ADR. -->

- Positive: <what improves>
- Trade-off: <accepted downside>
- Follow-up: <work this decision creates, or "none">

## Open Questions

<!-- Drafts only. Remove this section when the ADR is Accepted. -->

- <unresolved question>
```

## Fill Rules

- Keep concrete contract tokens (paths, fields, enums, schemas, queries, code,
  line numbers) in the linked spec, not in the ADR.
- Use plain professional prose; let structure carry emphasis, not ALL CAPS or
  bold.
- Stick to the canonical sections above. A non-canonical section doing
  specification work belongs in the spec.
- Do not edit an Accepted ADR's decision; write a new superseding ADR instead.
- See `../../references/quality/adr-authoring.md` for the full rules and review
  blockers.
