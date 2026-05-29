# Arkie Brain

Project knowledge base for Arkie — the LLM-readable single source of truth for this project.

## What lives here

| Folder       | Purpose                                                                          |
| ------------ | -------------------------------------------------------------------------------- |
| `product/`   | Vision, who we're building for, how the product works, competition, monetisation |
| `decisions/` | Architecture and product decisions — the "why" behind choices                    |
| `meetings/`  | Meeting notes, dated, with decisions and action items                            |
| `tasks/`     | Feature and bug backlog — status, priority, linked PRs/commits                   |
| `research/`  | User research, usability testing, beta feedback                                  |
| `log/`       | Chronological event log — deploys, milestones, PR merges, releases               |

## How to add to the brain

- **Meeting notes** → `meetings/YYYY-MM-DD-topic.md` using `/meeting-notes` skill
- **New task / bug** → `tasks/backlog.md` or a dedicated `tasks/feature-name.md`
- **Decision** → `decisions/YYYY-MM-DD-topic.md`
- **Research** → `research/topic.md`
- **Anything shipped** → append to `log/changelog.md`

## Searching the brain

Use the `/brain` skill from Claude Code to search across all files here.

```
/brain sunny filter feature
/brain what did we decide about caching
/brain beta tester feedback
/brain PRs merged in May
```
