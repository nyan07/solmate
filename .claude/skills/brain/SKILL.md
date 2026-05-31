---
name: brain
description: Search and update the Arkie project brain — the LLM knowledge base in brain/. Use for finding past decisions, meeting notes, task status, research, changelog entries, and PR references. Trigger on any question about project history, "what did we decide about X", "what's the status of Y", "log this", or "add to the brain".
---

# Arkie Brain Skill

The brain lives in `brain/` at the project root. It is the single source of truth for project knowledge — decisions, research, tasks, meetings, and the changelog.

## Structure

```
brain/
  README.md              — index and usage guide
  product/
    vision.md            — what Arkie is, who it's for, how it works
    competition.md       — competitor landscape
    monetisation.md      — revenue ideas
    features.md          — ideas backlog (not yet scheduled)
    tools-and-costs.md   — services, costs, admin links
  decisions/
    adr-001-*.md         — Architecture Decision Records
    adr-002-*.md
    YYYY-MM-DD-topic.md  — product decisions
  meetings/
    YYYY-MM-DD-topic.md  — structured meeting notes
  tasks/
    backlog.md           — full task backlog with status + PR/commit refs
  research/
    user-profile.md      — target users, usability test script
    beta-feedback.md     — tester feedback and issues
  log/
    changelog.md         — chronological shipped work + milestones
```

## Searching

When asked to search the brain:

1. Use `grep -r` or `Read` across `brain/` for the query terms
2. Return the most relevant sections with file references
3. If multiple files match, summarise each hit

```bash
grep -ri "query" brain/
```

For broader questions, read the relevant file(s) in full.

## Adding content

### Meeting notes → `brain/meetings/YYYY-MM-DD-topic.md`

Use this format:

```markdown
# [Topic] — YYYY-MM-DD

**Attendees:** ...

## Decisions

- ...

## Action Items

| Item | Owner | Due |
| ---- | ----- | --- |

## Notes

...
```

### Task completed → update `brain/tasks/backlog.md`

Move the task from its current status section to Completed. Add the PR number or commit hash in the PR/Commit column.

### Something shipped → append to `brain/log/changelog.md`

```markdown
## YYYY-MM-DD — [title]

- What shipped
- PR: #N or commit: `abc1234`
```

### New decision → `brain/decisions/YYYY-MM-DD-topic.md`

Document the context, the decision, and the consequences.

## Typical queries and where to look

| Query                                     | File                                                              |
| ----------------------------------------- | ----------------------------------------------------------------- |
| "What did we decide about X?"             | `decisions/`                                                      |
| "What's the status of feature Y?"         | `tasks/backlog.md`                                                |
| "What was discussed in the last meeting?" | `meetings/` (latest file)                                         |
| "What has shipped recently?"              | `log/changelog.md`                                                |
| "Who are our users?"                      | `research/user-profile.md`                                        |
| "What do competitors do?"                 | `product/competition.md`                                          |
| "What's the vision?"                      | `product/vision.md`                                               |
| "What PR fixed X?"                        | `tasks/backlog.md` or `log/changelog.md` — search by feature name |
