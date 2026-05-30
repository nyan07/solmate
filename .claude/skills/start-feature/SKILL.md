---
name: start-feature
description: >
  Full feature lifecycle skill for the Arkie project. Use this skill whenever the user wants to start new work, a new feature, a fix, or any change that should end up as a pull request. Triggers on phrases like "start a feature", "let's build X", "I want to add X", "new branch", "start work on", "open a PR", "finish feature", "I'm done, PR please". Also use when the user just describes something they want to change and it's clear they're starting a new task rather than continuing existing work.
---

# start-feature

This skill manages the full lifecycle of a feature: creating a branch → doing the work → committing → opening a PR.

## Phase 1 — Start

When the user invokes this skill to start new work:

1. Ask (in one message, keep it short):
   - What is the feature / fix / change? (one sentence is fine)
   - What type is it? (`feat`, `fix`, `refactor`, `chore`, `docs`, `i18n`) — suggest based on what they described

2. Derive a branch name from their answer using the format `type/short-kebab-description` (e.g. `feat/add-open-now-filter`, `fix/camera-reset-on-detail`, `i18n/install-prompt-copy`). Keep it short and lowercase.

3. Create the branch and confirm:
   ```
   git checkout -b <branch-name>
   ```

4. Tell the user the branch is ready and they can start working. Remind them to say something like "I'm done" or "/start-feature finish" when they want to open a PR.

## Phase 2 — Finish (PR)

When the user says they're done (e.g. "done", "open PR", "I'm finished", "create PR"):

1. Check git status to see what changed:
   ```
   git status
   git diff --stat
   ```

2. If there are uncommitted changes, stage and commit them. Follow Conventional Commits:
   - Format: `type(scope): short imperative summary`
   - Common scopes for Arkie: `explorer`, `places`, `api`, `i18n`, `ui`, `build`
   - Example: `feat(places): add open-now filter chip`
   - Always append the co-author trailer:
     ```
     Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
     ```
   - Use a HEREDOC to pass the commit message to avoid shell escaping issues.

3. Push the branch:
   ```
   git push -u origin <branch-name>
   ```

4. Show the user the GitHub PR creation URL from the push output (it looks like `https://github.com/<owner>/<repo>/pull/new/<branch>`). Tell them to click it to open the PR.

5. Suggest a short PR title and a 2–3 bullet summary they can paste into the PR description.

## Notes

- The pre-commit hook runs Prettier, ESLint, tsc, and the full test suite. If it fails due to a Vitest worker timeout (workers never start, no tests actually ran), that's a known flaky infrastructure issue — the user may choose to commit with `--no-verify` and note it in the PR.
- Follow Conventional Commits and the `@/` import alias rule from CLAUDE.md.
- Never push to `main` directly.
- If `gh` CLI is not available (which it isn't in this project), always use the URL from the push output for PR creation.
