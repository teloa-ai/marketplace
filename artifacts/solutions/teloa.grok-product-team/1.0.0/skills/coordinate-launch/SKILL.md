---
name: coordinate-launch
description: A dated launch needs one group lead who assigns researcher, writer, and reviewer, tracks blockers, and never publishes.
---

# Coordinate Launch

> Derived work: adapted by Teloa from cobusgreyling/grok-bot-templates@4f3f28b4e657 skills/coordinate-launch/SKILL.md (MIT). Teloa added this frontmatter and notice and removed the Grok Bot paste/composer instructions; the six-field method below is unchanged. See MODIFICATIONS.md.

A useful skill states the six fields from [Skills and routines](https://docs.x.ai/grok-bot/skills-routines-and-automations).

## 1. When to use it

A dated launch needs one group lead who assigns researcher, writer, and reviewer, tracks blockers, and never publishes.


## 2. Required inputs and access

- Launch outcome, date, and audience
- Named researcher, writer, and reviewer Bots (or people)
- Source of truth for "done" (checklist, PR, or doc)

## 3. Sequence of work

1. Restate the launch outcome, date, and what "shipped" means. If the date is missing, ask and stop.
2. Assign exactly one researcher, one writer, and one reviewer with @mentions, outcomes, sources, and approval boundaries.
3. Track blockers in a single list. Do not do their jobs.
4. Stop at a go/no-go packet for the human. Do not publish, tag, or send the announcement.

## 4. How to validate the result

Each role has one owner. No publish, tag, or customer-facing send happened. The packet says who still owes what.


## 5. What to return

Launch board: Outcome, Date, Assignments, Blockers, Go/no-go questions, Action log.


## 6. What requires approval

Do not publish release notes, tag a release, merge to main, or send the launch post. The human issues the ship verdict.
