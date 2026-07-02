# Shared References

Shared references hold reusable practices that can be loaded by multiple roles.

They are not roles, stacks, pipelines, or local overlays.

## What Belongs Here

- requirements and analysis methods;
- architecture and decision methods;
- modeling notations and collaboration methods;
- quality, risk, readable-code, minimal-sufficient-code, idiomatic-code, and
  review practices.

## What Belongs Elsewhere

- role duties stay in `roles/<role>/ROLE.md`;
- role-specific behavior stays in `roles/<role>/references/`;
- language and runtime knowledge stays in `stacks/`;
- framework and tool mechanics stay in stack or framework references;
- workflow order stays in `pipelines/`;
- local commands, paths, accounts, and secrets stay in ignored overlays.

## Reference Selection

References are knowledge modules, not defaults. A reference may be:

- `core`: safe to load whenever the owning role, stack, or practice is selected;
- `conditional`: loaded only when the route, repo overlay, config, package
  metadata, or human approval selects the matching framework, tool, pattern, or
  practice.

Core references may mention examples, but they must not make a framework,
library, ORM, architecture style, UI renderer, package manager, CI provider, or
static-analysis tool mandatory. Conditional references may be strict after they
are selected.

When a concrete tool or pattern is uncertain, keep it as a candidate in route
planning and return `needs_human` if selecting it would create a repo precedent.

## Granular And Composite References

Prefer granular references for concrete technologies, frameworks, tools, and
patterns. A granular reference should describe one selectable concern.

Composite references may exist as route recipes. They describe a common
combination, but they must not hide the individual selection decisions.

Examples:

- frontend route: React UI boundary + MVVM + MobX reactivity + frontend
  DI/composition + FSD when each concern is selected;
- backend route: backend testing + API layers + NestJS + Prisma + CQRS +
  GraphQL when each concern is selected;
- verification route: local scripts + tests + static analysis + optional Sonar
  when each gate is selected.

The route is the bundle. References remain independently selectable so a repo can
use React without MobX, MobX without FSD, Prisma without CQRS, or GraphQL without
NestJS.

## Reference Families

- `analysis/` - requirements, task specs, decomposition, acceptance criteria.
- `architecture/` - architecture plans, boundaries, ADRs, quality attributes.
- `modeling/` - diagrams, domain/process modeling, shared understanding tools.
- `quality/` - readable code, minimal sufficient code, idiomatic code, risk
  review, test strategy, and verification confidence.

## Reuse Rules

- A route plan may select shared practices under `practice_references`; role
  files list shared practice files in their `References` section.
- Shared references explain a practice; they do not grant rights.
- A role decides when the practice is relevant for its current step.
- If a shared reference changes role behavior, update the role reference too.
- Do not duplicate the same practice across many role-local references.
- Add concrete practice files only when the practice is approved and has enough
  structure to guide agent behavior.
- Keep conditional framework/tool references out of core behavior unless the rule
  is phrased as conditional on repo evidence.
