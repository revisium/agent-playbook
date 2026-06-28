# Technical Debt Taxonomy

This reference is the shared classification vocabulary for technical debt. It
gives auditor and reviewer one stable way to name a finding's kind and its
cause, so debt is comparable across repositories and over time.

This reference is stack-neutral. It names categories, not fixes. Surface and
stack references may map their own terms onto these categories, but they must not
rename or weaken them.

Related quality lenses:

- `readable-code.md` owns readability, abstraction-level, and business/system
  boundary rules.
- `minimal-sufficient-code.md` owns code-volume and abstraction-surface checks.
- `idiomatic-code.md` owns stack-native and locally consistent code-form checks.
- `static-analysis.md` owns provider-backed finding categories and triage.

## Two Axes

Classify every debt finding on two independent axes:

- `category` - what kind of debt it is, from the debt landscape below.
- `cause` - why the debt exists, from the deliberate/inadvertent quadrant below.

A finding without both axes is incomplete. The category drives the remediation
direction; the cause drives whether the debt is a justified choice or an
accident worth correcting.

## Debt Landscape Categories

Use these categories, derived from the SEI technical-debt landscape, to name what
the debt is:

- `architectural` - structure, boundaries, dependency direction, layering, or
  coupling that resists change at the system level.
- `structural` - module, package, or file-level organization that does not match
  responsibility, including misplaced or tangled code.
- `test` - missing, weak, brittle, or untrustworthy tests, or coverage that does
  not exercise the behavior contract.
- `documentation` - missing, stale, or misleading documentation, comments, ADRs,
  or contracts that a maintainer needs.
- `low-internal-quality` - poor readability, naming, or maintainability that
  raises the cost of the next change without being a single code smell.
- `code-complexity` - excessive cyclomatic or cognitive complexity, deep
  nesting, or long units that resist comprehension and testing.
- `code-smell` - recognized local smell patterns such as duplicated logic, large
  units, feature envy, primitive obsession, or dead code.
- `coding-style` - formatting, layout, or convention drift that tooling should
  own but currently is not enforcing.
- `technological-gap` - outdated, deprecated, unsupported, or
  policy-blocked dependencies, runtimes, frameworks, or platform versions.

Map a finding to the single most specific category. When a finding spans several
categories, name the dominant one and note the others in evidence.

## Cause Quadrant

Use Fowler's technical-debt quadrant to name why the debt exists. The quadrant
crosses intent (deliberate or inadvertent) with judgment (prudent or reckless):

- `deliberate-prudent` - a knowing, justified shortcut taken to ship now, with
  the cost understood and ideally recorded.
- `deliberate-reckless` - a knowing shortcut taken without weighing the cost,
  for example skipping a needed boundary because it felt faster.
- `inadvertent-prudent` - debt discovered only in hindsight from learning, where
  the original choice was reasonable with the knowledge available then.
- `inadvertent-reckless` - debt from not knowing or not applying a known
  practice, for example an avoidable structural mistake.

The cause changes the recommendation. A `deliberate-prudent` choice is flagged as
a recorded, justified decision rather than asserted as a defect. A reckless cause
strengthens the case for remediation.

## Application

- Auditor: `references/core.md` requires every ledger item to carry a category
  and a cause from this reference.
- Reviewer: use these categories to name maintainability and architecture
  findings so review output and audit output share one vocabulary.
- Do not invent new top-level categories in a finding. If a finding does not fit,
  record the closest category and explain the gap in evidence, then propose a
  taxonomy change through `../../method/maintenance.md`.

## Source Material

- `readable-code.md`
- `minimal-sufficient-code.md`
- `idiomatic-code.md`
- `static-analysis.md`
- `../../method/maintenance.md`
