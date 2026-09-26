---
name: internal-comms
description: Resources for writing internal communications in the formats a company prefers. Use whenever asked to write internal communications such as status reports, leadership updates, 3P updates, company newsletters, FAQs, incident reports or project updates.
---

> Adapted for Teloa from anthropics/skills@33375500bcea skills/internal-comms (Apache-2.0). Changes: see the Teloa catalog entry `anthropic.internal-comms`.

## When to use this skill
To write internal communications, use this skill for:
- 3P updates (Progress, Plans, Problems)
- Company newsletters
- FAQ responses
- Status reports
- Leadership updates
- Project updates
- Incident reports

## How to use this skill

To write any internal communication:

1. **Identify the communication type** from the request
2. **Load the appropriate guideline file** from the `examples/` directory:
    - `examples/3p-updates.md` - For Progress/Plans/Problems team updates
    - `examples/company-newsletter.md` - For company-wide newsletters
    - `examples/faq-answers.md` - For answering frequently asked questions
    - `examples/general-comms.md` - For anything else that doesn't explicitly match one of the above
3. **Follow the specific instructions** in that file for formatting, tone, and content gathering

If the communication type doesn't match any existing guideline, ask for clarification or more context about the desired format.

## Keywords
3P updates, company newsletter, company comms, weekly update, faqs, common questions, updates, internal comms

## Teloa note
This skill drafts text only. It does not send, post or publish anything; hand the draft back to the user, and use a sending tool only when the user explicitly asks and the tool is authorized.
