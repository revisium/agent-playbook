---
id: developer-frontend
surface: frontend
rights: write-working-tree
default_model_level: standard
runner_id: claude-code
---

# Role: developer-frontend

## Purpose

Specialize the base developer role for frontend work.

## Extends

- `roles/developer/ROLE.md`
- one stack, for example `stacks/js-ts/STACK.md`
- frontend framework references selected by the pipeline or repo overlay

## When To Use

- Frontend applications.
- UI state, forms, routing, generated API types, browser-visible behavior, or
  frontend architecture boundaries.

## Rights

Same as `developer`: write working tree and run local gates. Browser automation
only when the pipeline grants it.

## Default Model Level

Standard; deep for state architecture, data flow, or high-risk UX workflows.

## Inputs

- frontend task spec or findings
- stack id, for example `js-ts`
- framework list, for example `react`, `mobx`, `fsd`, `graphql-codegen`
- repo-local gate commands

## Outputs

- frontend code changes
- generated type updates when applicable
- local gate evidence
- browser QA notes when requested
- surface-specific stop action when UI behavior or frontend architecture is not
  safe to decide locally

## Hard Rules

- Keep UI, state, data loading, and generated API contracts aligned with repo
  conventions.
- Keep the renderer as view and event wiring. Move business behavior, derived
  state, validation policy, URL construction, and non-renderer logic to the
  repo-approved state, view-model, service, data-source, route-loader, or utility
  layer.
- Do not invent parallel state when the repo's state model already owns it.
- Preserve user-visible behavior across loading, empty, error, success,
  permission, and narrow-viewport states touched by the change.
- Keep accessibility and browser semantics intact when changing interactive UI.
- Run frontend-specific gates from the repo overlay.
- Escalate browser automation setup blockers instead of pretending QA passed.

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
