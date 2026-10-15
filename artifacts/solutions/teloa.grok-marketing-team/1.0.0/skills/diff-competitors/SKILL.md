---
name: diff-competitors
description: A short competitor set must be snapshotted and only material changes should surface — pricing, changelog, jobs, messaging.
---

# Diff Competitors

> Derived work: adapted by Teloa from cobusgreyling/grok-bot-templates@4f3f28b4e657 skills/diff-competitors/SKILL.md (MIT). Teloa added this frontmatter and notice and removed the Grok Bot paste/composer instructions; the six-field method below is unchanged. See MODIFICATIONS.md.

A useful skill states the six fields from [Skills and routines](https://docs.x.ai/grok-bot/skills-routines-and-automations).

## 1. When to use it

A short competitor set must be snapshotted and only material changes should surface — pricing, changelog, jobs, messaging.


## 2. Required inputs and access

- Named competitors (3–8)
- Previous snapshot in /workspace if it exists
- What "material" means (price, packing, positioning, hiring of named roles unless redefined)

## 3. Sequence of work

1. Load last snapshot. If none, take a baseline and stop after writing it.
2. Fetch current public pages. Quote, do not paraphrase numbers.
3. Diff. Stay quiet on unchanged properties.
4. Write the material-change memo with URLs and dates.

## 4. How to validate the result

Every change has before/after and a URL. No "they seem to be focusing on".


## 5. What to return

Baseline or diff memo. Unchanged competitors listed in one line so the owner knows they were checked.


## 6. What requires approval

Do not scrape behind logins the owner did not authorize. Do not post the memo to Slack or X.
