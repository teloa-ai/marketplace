---
name: grok-marketing-1-0-1-draft-newsletter
description: A weekly issue must be collated from links and notes the owner already saved, and left unsent.
---

# Draft Newsletter

> Derived work: adapted by Teloa from cobusgreyling/grok-bot-templates@4f3f28b4e657 skills/draft-newsletter/SKILL.md (MIT). Teloa added this frontmatter and notice and removed the Grok Bot paste/composer instructions; the six-field method below is unchanged. See MODIFICATIONS.md.

> Teloa versioned method name: `grok-marketing-1-0-1-draft-newsletter` corresponds to upstream `draft-newsletter`. Only its name/frontmatter and this notice change; the six-field method and original skill.yaml stay unchanged. See MODIFICATIONS.md.

A useful skill states the six fields from [Skills and routines](https://docs.x.ai/grok-bot/skills-routines-and-automations).

## 1. When to use it

A weekly issue must be collated from links and notes the owner already saved, and left unsent.


## 2. Required inputs and access

- Saved links and notes (Google Docs, a Gmail label, /workspace)
- Prior issues for voice
- Working title if the owner named one

## 3. Sequence of work

1. Open the saved pile. If it is empty or missing, say so and stop. Do not browse the open web to pad.
2. Drop dead links and duplicates into a skipped list.
3. Draft sections that cite each remaining item.
4. Match attached prior-issue voice. Keep length honest to the pile.
5. Leave a Google Doc draft unpublished. Do not send Gmail.

## 4. How to validate the result

Every used item has a citation. Skipped items are listed. No send, no public Doc share, no list change.


## 5. What to return

Unsent issue with title, cited sections, skipped list, word count, and action log.


## 6. What requires approval

Do not send the newsletter. Do not schedule a send. Do not publish the Google Doc. Do not add subscribers.
