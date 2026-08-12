# Natural-Language Authoring Reference

Use this reference to write or review professional human-readable text in the
target language. It governs clarity and meaning, not literary taste. The target
language comes from the user's request, the existing document, repository
instructions, or the required artifact.

## Applicability

- [DECISION] Apply this reference whenever a selected role creates or reviews
  human-readable text. It must be available at least to `analyst`, `architect`,
  `developer`, `reviewer`, and `knowledge-engineer`.
- [DECISION] Apply it to `orchestrator` when the orchestrator creates a
  long-lived artifact. Routine routing messages and transient run-state updates
  do not require a separate editorial pass.

## Language Profile Selection

- [DECISION] Resolve the target output language before selecting a profile.
  Apply normal instruction precedence to explicit language requirements. An
  explicit non-Russian target vetoes incidental Russian evidence, including a
  Russian source or existing document.
- [DECISION] When no higher-priority instruction selects another target
  language, load `languages/russian.md` if at least one of these conditions
  establishes or presumes a Russian target:
  - the user requested Russian;
  - the existing document is written in Russian;
  - repository instructions require Russian;
  - the target artifact must be in Russian.
- [DECISION] Do not load the Russian profile when the resolved target is
  another language. Add future language profiles as conditional supplements;
  keep the language-neutral rules here.

## Hard Rules

- [DECISION] Write from the intended meaning directly in the target language.
  Understand the source first; do not preserve the syntax or sentence structure
  of another language through literal translation.
- [DECISION] Prefer direct constructions with an identifiable actor when the
  actor is known and relevant. Do not use passive or impersonal wording to hide
  ownership.
- [DECISION] Remove introductory filler, bureaucratic phrasing, and marketing
  judgments. State observable behavior, evidence, or the required action.
- [DECISION] Keep one level of abstraction within a section and develop one
  main idea per paragraph.
- [DECISION] Use lists and tables only when they make relationships, choices,
  or repeated fields easier to read than prose.
- [DECISION] Preserve accepted identifiers, status values, links, terminology,
  and responsibility boundaries exactly where they carry contractual meaning.
- [DECISION] Do not change meaning to improve the phrasing. Do not invent
  precision, certainty, actors, causality, or constraints that the source does
  not provide.
- [DECISION] Distinguish facts, decisions, proposals, hypotheses, and open
  questions explicitly. Do not present one category as another.
- [DECISION] Define a term once and use it consistently across the document and
  related documents. Do not alternate synonyms when they could imply different
  concepts or contracts.
- [DECISION] Preserve proper names and established technical terms. When a
  foreign word is neither a name nor an established term, use the natural local
  equivalent.
- [DECISION] Before handoff, reread the complete final text in context, not only
  the diff or the edited paragraph.

## Review Policy

- [DECISION] Review clarity and preservation of meaning, not subjective
  literary style. Raise a finding when:
  - a literal calque makes a requirement ambiguous;
  - the text does not identify who performs an action when that identity
    matters;
  - inconsistent terminology changes or obscures a contract;
  - translation mixes levels of abstraction and makes the boundary unclear;
  - marketing language or introductory filler replaces verifiable behavior;
  - the text reads like a machine translation and requires rereading to recover
    its meaning.
- [DECISION] Minor stylistic preferences are non-blocking. Do not turn this
  reference into a general style-policing rubric.

## Author Self-Review

Before handing off the text, check:

1. Did I formulate the meaning naturally in the target language rather than
   preserve source-language syntax?
2. Is the actor clear wherever ownership matters?
3. Does each section stay at one level of abstraction and each paragraph carry
   one main idea?
4. Are facts, decisions, proposals, hypotheses, and open questions distinct?
5. Are identifiers, statuses, links, terms, and responsibility boundaries
   preserved consistently?
6. Did I remove filler without removing meaning or inventing precision?
7. Did I reread the complete final text?
