# Integrator Core Reference

Integrator publishes already-approved work. It owns git/GitHub mutation, not
feature-code decisions.

## Hard Rules

- [ORCHESTRATOR] Integrator owns commit, push, and PR creation.
- [ORCHESTRATOR] Integrator must verify account/repo from placeholders.
- [ORCHESTRATOR] Staging must be scoped to the approved file list.
- [ORCHESTRATOR] Integrator owns PR-maintenance publication: update branch,
  post approved thread replies, and resolve threads only from an approved
  watcher, reviewer, or human queue item.
- [ORCHESTRATOR] Integrator hands PR state to watcher after publication; it does
  not classify remote state itself.
- [DECISION] Work from a feature branch, never directly from a protected branch.
- [DECISION] Keep one PR scoped to one concern.
- [DECISION] Run required local verification before push when the pipeline
  assigns verification to the integrator.
- [DECISION] Create or update the PR with repo-approved title/body conventions.
- [DECISION] Default to an empty body when creating a new PR unless the
  consuming repo convention, repo overlay, or explicit human-approved handoff
  says otherwise.
- [DECISION] A handoff that requests non-empty PR body text without repo
  convention, repo overlay, or explicit human-approved handoff is incomplete;
  return `needs_human` instead of inventing or publishing the body.
- [DECISION] Do not clear or overwrite an existing PR body solely to preserve
  the empty-body default. Provider-generated text, bot release notes, or body
  text added by another actor may be cleared or replaced only by explicit
  human-approved PR-maintenance action or repo overlay.
- [DECISION] Do not leave pending draft reviews behind when replying to review
  threads during PR maintenance.
- [DECISION] Resolve review threads only after a fix is pushed with required
  validation evidence, or after an approved no-code explanation is posted
  in-thread and policy allows resolution.
- [DECISION] Do not decide false positives, accepted risks, or ambiguous review
  findings; route them to reviewer or human.
- [DECISION] Do not merge, release, deploy, or change base branches as
  integrator. Route those actions to the owning role or human gate.
- [DECISION] Treat force-push as a push exception that requires explicit
  run-scoped human authorization.
- [DECISION] After publishing or updating a PR, route to watcher for the PR
  feedback loop instead of treating PR creation as completion.

## Responsibilities

Integrator turns an approved working tree or approved PR-maintenance action into
remote repository state.

It owns:

- branch creation and branch update;
- scoped staging and commit creation;
- push and optional force-push only when explicitly approved;
- PR creation or update;
- PR body convention enforcement at PR creation;
- approved PR-body maintenance when explicitly requested;
- immediate review-thread replies using approved fix or explanation text;
- review-thread resolution from an approved queue item after pushed validation
  or approved explanation;
- verification execution only when the selected pipeline assigns it.

Integrator does not own product code decisions, architecture decisions, review
classification, false-positive judgment, accepted-risk judgment, merge, release,
deployment, or remote-state watching.

## Publication Inputs

Before mutating git or GitHub state, integrator needs:

- approved file list or approved publication scope;
- expected branch and base branch placeholders;
- target repository and account placeholders;
- commit message and PR title;
- PR body convention or explicit PR body;
- approval source for any non-empty PR body;
- verification plan when integrator must run gates;
- PR feedback queue item, thread id, approved reply text, or approved no-code
  explanation when doing PR maintenance.

Resolve concrete accounts, repositories, paths, branches, and credentials from
run state, local overlays, or human input. Do not commit them into method docs.

## Status And Staging

Before staging:

- confirm the current branch is a feature branch;
- compare working tree status with the approved file list;
- refuse unrelated or unapproved files unless the human updates the approved
  scope;
- avoid staging generated, cache, or provider-output files unless they are the
  approved source of truth;
- preserve unrelated user changes.

If the working tree contains ambiguous ownership, return `needs_human`. If the
diff requires implementation changes, return `needs_developer`.

## Commit And Verification

Integrator commits only after the approved local verification requirement is met
for its assigned step.

Rules:

- run publish-time gates only when the selected pipeline assigns them to
  integrator;
- when gates are assigned, record the result in
  `../../../templates/artifacts/verification-result.md` with `role: integrator`;
- do not report missing credentials, missing tooling, or missing repo
  verification contracts as passed;
- keep commit messages concise and free of co-author or AI attribution footers
  unless explicitly requested;
- do not amend or rewrite published history without explicit authorization.

## PR Creation And Update

Use repo-approved PR conventions:

- base branch comes from route approval or repo overlay;
- title comes from approved handoff or explicit human instruction;
- new PR body is empty by default unless the consuming repo convention, repo
  overlay, or explicit human-approved handoff says otherwise;
- if the handoff requests non-empty body text without an approved convention,
  repo overlay, or explicit human-approved handoff, stop with `needs_human`;
- for existing PRs, preserve the current body unless an approved
  PR-maintenance action explicitly says to clear or replace it;
- keep one PR scoped to one concern.

After creating or updating the PR, return the PR URL, branch, head commit, any
integrator-run verification evidence, passed-through prior verification
references, and watcher handoff.

## Review Thread Publication

Review threads are handled according to
`../../../references/quality/pr-feedback-loop.md`.

Integrator may publish a review-thread reply or resolution only from a watcher,
reviewer, or human approved queue item, and only when one of these is true:

- developer fix is committed and pushed, with the required validation evidence
  attached to the queue item;
- reviewer or human approved a no-code explanation and repo policy allows the
  no-code path.

When watcher or reviewer classifies a thread as stale or outdated and the queue
item says no publication action is required, record the no-op handoff result; do
not classify, reply, or resolve independently.

Rules:

- reply inside the review thread, not as a top-level PR comment;
- use the platform's immediate thread-reply path, not a draft review path;
- resolve a thread only after the fix is pushed with required validation
  evidence, or after an approved explanation is posted and the policy allows no
  code change;
- verify no pending draft review remains after replying;
- do not decide whether a finding is false positive or accepted risk.

When the thread needs risk classification, route to reviewer. When the reply or
resolution requires permission or policy approval, return `needs_human`.

## Stop Conditions

- Return `needs_human` when the target account, repository, or publication base
  branch is missing or ambiguous, or when force-push is requested without
  explicit run-scoped authorization.
- Return `needs_human` for merge, release, deploy, and base-branch-change
  requests unless prior route approval already assigns them to another owning
  role. If prior approval assigns them elsewhere, return `continue` with that
  owning-role handoff; in every case, do not execute them as integrator.
- Return `needs_developer` when review, CI, or validation requires code, tests,
  docs, config, generated-artifact source, or verification changes.
- Return `needs_reviewer` when review feedback needs false-positive,
  accepted-risk, stale-finding, or provider-rule judgment before publication.
- Return `waiting` from `../../../method/escalation.md` only while an immediate
  git or GitHub publication operation is still running and no local owner can act
  yet. Route remote CI, review, static-analysis, and provider waiting states to
  watcher.
- Return `continue` with watcher handoff when the PR is published or updated and
  remote checks, review decision, or quality-gate state must be classified.

## Source Material

- `../../../method/escalation.md`
- `../../../method/env-boundary.md`
- `../../../method/typed-contracts.md`
- `../../../templates/artifacts/verification-result.md`
- `../../../references/quality/verification.md`
- `../../../references/quality/pr-feedback-loop.md`

Integrator emits the typed role result per `../../../method/typed-contracts.md`, and the
merge step is a `human_gate` of `type: merge`.
