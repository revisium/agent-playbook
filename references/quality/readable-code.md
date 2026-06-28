# Readable Code Reference

Readable code is code written for the next maintainer. It should make intent,
boundaries, and failure modes visible without forcing the reader to mentally
simulate unrelated layers at the same time.

This reference is stack-neutral. Surface and stack references may add stricter
rules, but they must not weaken these rules.

Related quality lenses:

- `minimal-sufficient-code.md` owns code-volume and abstraction-surface checks.
- `idiomatic-code.md` owns stack-native and locally consistent code-form checks.

## Hard Rules

- [DECISION] Write code for the reader first. Prefer explicit names, narrow
  functions, typed contracts, and boring control flow over clever compression.
- [DECISION] Keep one abstraction level per function, method, component, or
  handler. Do not mix protocol plumbing, persistence details, domain decisions,
  formatting, rendering, and lifecycle cleanup in the same block unless the repo
  has an approved local pattern for that boundary.
- [DECISION] Do not mix business code and system code. Business code owns domain
  decisions, policies, use cases, and acceptance behavior. System code owns
  transport, persistence, caching, lifecycle, concurrency, configuration,
  framework integration, and generic utilities.
- [DECISION] New or changed code that mixes abstraction levels is a review
  blocker when it makes behavior harder to verify, test, or safely change.
- [DECISION] The one-abstraction-level rule above covers presentation strings:
  do not build operator-facing or user-facing copy or presentation strings inline
  inside a domain-decision branch. Extract the presentation layer so the
  domain decision and the message it produces are not tangled in one block.
- [DECISION] Prefer small named operations over large comments. A name should
  explain what business step or technical step is happening.
- [DECISION] Comments are allowed for complex system constraints, protocol
  details, compatibility decisions, concurrency/lifecycle hazards, or surprising
  invariants. Avoid comments that restate obvious business code.
- [DECISION] A comment must be understandable to a reader who has only this
  repository. It may cite an artifact only when that artifact resolves in-repo:
  an in-repo spec, ADR, or doc, or a section of the same file. Do not anchor a
  comment's meaning to a transient or cross-repo planning artifact such as a
  plan, slice, ticket, or section id, or a doc in another repo. Inline the
  invariant or cite a stable in-repo reference instead.
- [DECISION] Apply SOLID pragmatically. SRP and ISP are expected by default.
  DIP and OCP are useful only when a real boundary, runtime variation, or test
  seam already exists or is part of the approved design.
- [DECISION] Do not add abstraction only because a future variation might exist.
  Add it when it removes real complexity, protects an existing boundary, or
  matches an established repo pattern.
- [DECISION] Represent expected failures as explicit statuses, typed results,
  domain errors, or repo-approved error models. Do not let expected business or
  data conditions crash through unrelated presentation or infrastructure code.
- [DECISION] Preserve local style. When the repo has a consistent boundary,
  naming, lifecycle, or error model, extend it instead of introducing a parallel
  pattern.

## Review Blockers

Raise a finding when new or modified code:

- combines low-level IO or framework mechanics with business decisions in one
  unreadable function;
- puts domain rules in a renderer, controller, adapter, migration helper, or
  generic utility without an approved repo pattern;
- hides important behavior behind vague names such as `handle`, `process`,
  `data`, or `helper` when a domain or technical intent name is possible;
- introduces a broad abstraction with one current use and no approved boundary;
- relies on comments to explain ordinary business behavior that should be
  visible through names, types, tests, or decomposition;
- anchors an explanatory comment to an unresolvable artifact pointer such as a
  plan, slice, ticket, or section id, or a cross-repo doc, instead of an in-repo
  reference or an inlined invariant;
- builds operator-facing or user-facing copy or presentation strings inline
  inside a domain-decision branch instead of extracting the presentation layer;
- converts a recoverable domain/data condition into an unrelated runtime crash;
- makes tests verify implementation mechanics while the behavior contract stays
  untested.

## Abstraction-Level Check

Before handing off code, scan each changed unit:

1. Can a reader state its single purpose in one sentence?
2. Are all statements at the same level of detail?
3. Are business decisions separated from system mechanics?
4. Are expected failures represented in the same layer that can handle them?
5. Would a behavior change affect only the expected file or layer?

If the answer is no and the code is not a tiny local adapter, split the code or
return `needs_architect` when the boundary is not obvious.

When the same level-mix recurs across many units in one area, treat it as a
missing boundary or layer rather than many isolated defects. Return
`needs_architect` to introduce the boundary once, instead of filing N separate
local fixes that re-create the same mix.

## System Code Versus Business Code

System code examples:

- framework adapters, controllers, route loaders, hooks, DI containers;
- persistence, transactions, generated clients, cache, queues, workers;
- lifecycle, disposal, SSR/hydration, retries, telemetry, feature flags;
- generic parsing, serialization, transport, and environment access.

Business code examples:

- use-case orchestration and domain decisions;
- validation and acceptance behavior;
- authorization or role policy when it depends on domain meaning;
- pricing, status transitions, reconciliation, availability, eligibility, and
  similar product rules;
- view-model read models that express product-visible state.

A thin adapter may call business code, but it should not become the place where
business behavior is invented.

## Stop Conditions

- Return `needs_architect` when a change requires moving a boundary, extracting
  a shared abstraction, changing ownership between layers, or defining a new
  error model.
- Return `needs_analyst` when code cannot stay readable because required
  behavior, acceptance criteria, or product language are unclear.
- Return `needs_human` when the repo has conflicting local patterns and choosing
  one would create a precedent.
