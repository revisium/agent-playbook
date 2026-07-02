# Role Composition

Roles are composed, not exploded into one role per technology.

## Axes

- `role`: what the agent owns, for example `developer`, `reviewer`, `analyst`,
  or `architect`.
- `surfaces`: where the work happens, for example `backend`, `frontend`,
  `infra`, `docs`, `library`.
- `stack.primary` and `stack.secondary`: language and ecosystem catalogs, for
  example `js-ts`, `dotnet`, `python`, or `unknown`.
- `frameworks`: concrete tools, for example `nestjs`, `prisma`, `react`,
  `graphql-codegen`.
- `tooling`: optional tool/provider categories such as static analysis,
  structure checks, browser automation, or CI providers.
- `verification_capabilities`: generic availability signals used to build a
  run-specific verification plan.
- `practice_references`: route-selected reusable practices, for example
  `requirements`, `adr`, `c4`, `ddd`, `bpmn`, or `test-strategy`. This is
  route/run context, not a `ROLE.md` field or section.
- `repo_overlay`: local commands, paths, env values, and deployment facts.

## Example

```yaml
role: developer
surfaces:
  - backend
stack:
  primary: js-ts
  secondary: []
frameworks:
  - nestjs
  - prisma
practice_references:
  - cqrs
  - test-strategy
```

The example is a resolved route context. Canonical role files still list
knowledge files only in their `References` sections.

The adapter builds context in this order:

1. `roles/developer/ROLE.md`
2. `roles/developer-backend/ROLE.md`
3. selected `stacks/<stack>/STACK.md` and its core references
4. conditional framework and pattern references selected by route evidence
5. tooling references
6. shared practice references
7. repo-local overlay
8. pipeline step input

## Rule

Do not create names like `developer-backend-js-ts-nestjs-prisma` as the canonical
unit. Use composition. A pipeline may still cache a resolved route for runtime
convenience, but the method source stays composed.

Do not treat practices as stacks. SOLID, DDD, CQRS, C4, BPMN, ADRs, event
storming, requirements engineering, and test strategy are practice references.
They may be used by several roles.

Do not treat framework references as stack defaults. React, Vue, Svelte, NestJS,
Prisma, TypeORM, GraphQL Code Generator, FSD, and similar concrete references
are loaded only when repo evidence, route approval, or overlay config selects
them. Once selected, they may add stricter rules for that run.

Prefer granular references over large technology bundles. A common frontend
route may compose React, MobX, MVVM, DI, and FSD references. A common backend
route may compose backend testing, API layers, NestJS, Prisma, CQRS, GraphQL,
and jobs references. The route is the bundle; the references remain
independently selectable.

## Developer Surface Specialization

Use:

- `developer` for the universal implementation contract;
- `developer-backend` for backend responsibilities;
- `developer-frontend` for frontend responsibilities;
- `stacks/<stack>` for language, ecosystem, package-manager, test, lint, build,
  and stack-specific verification knowledge.

Future languages add stacks, not new base developer roles.

## Analyst, Architect, Developer Split

Use:

- `analyst` for `what` and `why`: requirements, flows, constraints, acceptance
  criteria, ambiguity, and task decomposition.
- `architect` for technical shape: boundaries, contracts, tradeoffs, quality
  attributes, migration path, and ADR candidates.
- `developer` for local implementation details inside the approved task and
  architecture constraints.

If a developer cannot proceed without requirements clarity, return
`needs_analyst`. If a developer would need to decide architecture, return
`needs_architect`.

## Handoff Contract

Each role hands off the smallest artifact that lets the next role proceed
without rereading every upstream source.

- Analyst produces `task_spec` and `requirements_check`. This owns product
  intent, scope, acceptance criteria, open questions, human actions, and whether
  architecture is required.
- Architect consumes an approved or source-backed `task_spec` and produces
  `architecture_plan`. This owns technical shape, constraints, implementation
  slices, tradeoffs, ADR candidates, and architecture stop conditions.
- Orchestrator prepares `implementation_brief` only after blocking markers are
  resolved. This compresses approved requirements and architecture into a
  developer-ready contract.
- Developer consumes the brief and owns local code-shape decisions inside the
  approved scope and constraints.

Do not duplicate entire upstream artifacts into downstream handoffs. Preserve
stable identifiers, paths, short summaries, constraints, and stop conditions so
the receiving role can reload evidence only when needed.

Developer execution is blocked when the handoff asks the developer to decide
product behavior, public contracts, data ownership, migration strategy, security
acceptance, release policy, or skipped verification gates.
