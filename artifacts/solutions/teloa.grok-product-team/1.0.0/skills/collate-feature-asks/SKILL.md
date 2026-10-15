---
name: collate-feature-asks
description: The same product request is living in many Slack threads and needs one cluster with quotes, frequency, and a suggested issue — not a roadmap decision.
---

# Collate Feature Asks

> Derived work: adapted by Teloa from cobusgreyling/grok-bot-templates@4f3f28b4e657 skills/collate-feature-asks/SKILL.md (MIT). Teloa added this frontmatter and notice and removed the Grok Bot paste/composer instructions; the six-field method below is unchanged. See MODIFICATIONS.md.

A useful skill states the six fields from [Skills and routines](https://docs.x.ai/grok-bot/skills-routines-and-automations).

## 1. When to use it

The same product request is living in many Slack threads and needs one cluster with quotes, frequency, and a suggested issue — not a roadmap decision.


## 2. Required inputs and access

- Slack channels or exported threads the owner named
- Time window
- Existing issue tracker (to de-dupe)

## 3. Sequence of work

1. Search the named channels for asks in the window.
2. Cluster by underlying job-to-be-done, not by the requester's wording.
3. Attach representative quotes with links.
4. Check the tracker for an existing issue.
5. Draft a problem statement. Do not prioritize.

## 4. How to validate the result

Every cluster has at least one link. Frequency is a count of threads, not a vibe. No commitment language ("we will ship").


## 5. What to return

Cluster table: job, count, quotes, existing issue or none, draft problem statement.


## 6. What requires approval

Do not file issues, change the roadmap, or reply in Slack.
