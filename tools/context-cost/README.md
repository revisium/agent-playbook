# Context Regression Checks

These dependency-free checks extract the static startup and lexical handoff
checks from the isolated context experiment. They do not execute a model or
change runtime configuration.

```sh
node tools/context-cost/measure-static.mjs --assert
node tools/context-cost/measure-handoff.mjs --assert
node tools/context-cost/measure-handoff.mjs --assert --file tools/context-cost/fixtures/good-review-handoff.md
```

The static gate checks every cataloged role wrapper for exactly one canonical
ROLE read and both intake skills for a single manual-run startup Read step. It
also checks role context sections and role-document budgets: 2,000 estimated
tokens per role, 4,000 for orchestrator. Estimates use UTF-8 bytes divided by
four, rounded up; these are regression budgets, not measured provider tokens,
cache savings, total session input, or costs. References loaded by action
triggers are intentionally outside the startup measurement.

The handoff gate runs known good/bad fixtures and independent version-pattern
cases. Optional repeated `--file` arguments inspect named files only; it has no
recursive scan or run-history discovery. In assertion mode a supplied file with
conflicting version patterns exits nonzero.

This is a lexical packing check for analysis-vN, architecture-vN, and
review-round-N patterns. It does not parse YAML, require finding fields, detect
all transcript attachments, or validate source IDs, finding identity, status,
artifact existence, snapshot freshness, or immutable pins. The orchestrator and
reviewer must validate those semantics against the canonical review handoff and
conformance contracts. A passing linter is not review approval.
