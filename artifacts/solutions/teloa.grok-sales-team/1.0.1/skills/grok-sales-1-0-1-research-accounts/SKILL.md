---
name: grok-sales-1-0-1-research-accounts
description: A list of accounts must be scored against an ICP and recent intent, with contacts and draft outreach, stopping at a review list.
---

# Research Accounts

> Derived work: adapted by Teloa from cobusgreyling/grok-bot-templates@4f3f28b4e657 skills/research-accounts/SKILL.md (MIT). Teloa added this frontmatter and notice and removed the Grok Bot paste/composer instructions; the six-field method below is unchanged. See MODIFICATIONS.md.

A useful skill states the six fields from [Skills and routines](https://docs.x.ai/grok-bot/skills-routines-and-automations).

## 1. When to use it

A list of accounts must be scored against an ICP and recent intent, with contacts and draft outreach, stopping at a review list.


## 2. Required inputs and access

- CRM view, spreadsheet, or pasted account list
- ICP definition (ask once if missing, then save)
- Style examples for outreach if the owner attached them

## 3. Sequence of work

1. Confirm the account list and ICP. Do not expand the list silently.
2. Research each account from current sources. Skip anyone already in an active sequence if that field exists.
3. Score against ICP and recent intent with evidence links.
4. Identify up to three relevant contacts per account.
5. Draft email and LinkedIn outreach in the attached style. Do not send.

## 4. How to validate the result

Every score has a source. Skipped accounts are listed with why. Drafts are clearly labeled DRAFT. No message is sent.


## 5. What to return

A review list: account, score, evidence, contacts, drafts, skips.


## 6. What requires approval

Do not send email, InMail, or enroll anyone in a sequence. Do not create CRM records unless the owner names that action later.
