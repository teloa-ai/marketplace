---
name: grok-sales-1-0-1-draft-call-followup
description: A call just happened and the owner needs an unsent recap, split tasks, and a suggested next window — not a sent email.
---

# Draft Call Follow-up

> Derived work: adapted by Teloa from cobusgreyling/grok-bot-templates@4f3f28b4e657 skills/draft-call-followup/SKILL.md (MIT). Teloa added this frontmatter and notice and removed the Grok Bot paste/composer instructions; the six-field method below is unchanged. See MODIFICATIONS.md.

A useful skill states the six fields from [Skills and routines](https://docs.x.ai/grok-bot/skills-routines-and-automations).

## 1. When to use it

A call just happened and the owner needs an unsent recap, split tasks, and a suggested next window — not a sent email.


## 2. Required inputs and access

- Call notes, transcript, or recording
- Calendar event for attendees and time
- Prior mail thread with the account when present
- Promise log in /workspace when present

## 3. Sequence of work

1. Read the notes. If they are missing, ask and stop.
2. List attendees from the calendar event. If the event is missing, mark attendees unknown.
3. Draft a recap of what was said. Separate facts from inferences.
4. Split owner tasks from customer tasks. Dates not in the notes stay unknown.
5. Propose a next window from free/busy. Do not book it.
6. Label the recap DRAFT. Do not send.

## 4. How to validate the result

Recap is labeled DRAFT. No email was sent. No calendar event was created. Every dated commitment has a source quote, or the date is unknown.


## 5. What to return

After-call pack: recap, owner tasks, customer tasks, suggested window, CRM note draft, action log.


## 6. What requires approval

Do not send the recap. Do not book or move meetings. Do not create CRM records unless the owner names that action later.
