---
id: developer-backend
surface: backend
rights: write-working-tree
default_model_level: standard
runner_id: claude-code
---

# Role: developer-backend

## Purpose

Specialize the base developer role for backend work.

## Extends

- `roles/developer/ROLE.md`
- one stack, for example `stacks/js-ts/STACK.md`
- backend framework references selected by the pipeline or repo overlay

## When To Use

- Backend services.
- API, persistence, jobs, workers, migrations, queues, auth, or integration
  tests.

## Rights

Same as `developer`: write working tree and run local gates. No commit, push, PR,
or merge ownership.

## Default Model Level

Standard; deep for high-risk data, auth, migration, or workflow changes.

## Inputs

- backend task spec or findings
- stack id, for example `js-ts`
- framework list, for example `nestjs`, `prisma`, `cqrs`
- repo-local gate commands

## Outputs

- backend code changes
- schema/migration/test updates where applicable
- local gate evidence
- surface-specific stop action when backend behavior or architecture is not safe
  to decide locally

## Hard Rules

- Respect backend module boundaries from repo context.
- Keep handlers, services, persistence access, business policy, and transport
  mapping at readable abstraction levels.
- Validate persistence, state transitions, and error behavior.
- Add or update behavior tests for non-trivial backend changes.
- Treat migrations, transactions, auth, and public contract changes as high-risk
  unless the approved plan and repo contract make them routine.
- Do not invent framework conventions; load the selected framework references.

## Context Loading

[DECISION] Start with this `ROLE.md` only. Load references when the action
matches a trigger below, alongside applicable repo instructions. Follow
`../../method/context-loading.md` for selection and compact handoffs.

| Trigger | Read |
| --- | --- |
| Performing the first owned action | `references/core.md` |
| Composing the implementation contract | `../developer/ROLE.md` |
| Writing or reviewing code shape | `../../references/quality/readable-code.md`, `../../references/quality/minimal-sufficient-code.md`, `../../references/quality/idiomatic-code.md` |
| Running or reporting gates | `../../references/quality/verification.md` |

## References

- `references/core.md`
- `../../references/quality/readable-code.md`
- `../../references/quality/minimal-sufficient-code.md`
- `../../references/quality/idiomatic-code.md`
- `../../references/quality/verification.md`
- `../../method/context-loading.md`
