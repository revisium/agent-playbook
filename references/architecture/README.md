# Architecture References

Architecture references help agents decide the technical shape of a solution.

## Practices

- architecture description through views and concerns;
- module, component, and bounded-context boundaries;
- API, event, data, and integration contracts;
- quality attributes and tradeoffs;
- Architecture Decision Records;
- migration paths and risk handling.

## Used By

- `architect` as primary owner;
- `analyst` when requirements imply technical ambiguity;
- `developer` as constraints for implementation;
- `reviewer` when checking architecture or maintainability risk;
- `orchestrator` at route-selection depth only.

## Records

- `adr-0001-adopt-snapshot-bound-dimensioned-conformance-review-results.md` -
  requires snapshot-bound, dimensioned conformance review for bugfix work.

## Source Anchors

- ISO/IEC/IEEE 42010: architecture description concepts.
- C4 model: context, container, component, and code views.
- arc42: architecture documentation structure.
- Architecture Decision Records: decision, context, and consequences.
- Domain-Driven Design reference: domain language and bounded contexts.
