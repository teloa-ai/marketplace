# Sales team · 销售协作团队

Teloa 市场候选，移植自 [cobusgreyling/grok-bot-templates@4f3f28b4e657](https://github.com/cobusgreyling/grok-bot-templates/tree/4f3f28b4e6578cd227ff7f4b78ec91d15fd091b5)（MIT，Copyright (c) 2026 Cobus Greyling）的 `teams/sales`。原 PROFILE、template.yaml、team.yaml、skill.yaml 与示例逐字节保留在 `references/` 与 `skills/`；Teloa 的适配逐条列在 MODIFICATIONS.md。本包不是 xAI 官方内容，与原作者无关联声明以外的关系。

A Teloa market candidate ported from `teams/sales` of the MIT repository above. Original files are kept byte for byte; every Teloa adaptation is listed in MODIFICATIONS.md.

## Lead and kickoff (from team.yaml)

- Lead: **sales-outbound** (Outbound). The coordinator is declared by role-coordination links to each member; the original lead also remains in the source definition.
- Why: Outbound volume is useless if the next call is unbriefed and the recap never gets written down before it is sent.
- Group kickoff (original text): @Outbound research the named account list and stop at a review list. @Meeting Prep brief the next booked call as INTERNAL. @Call Follow-up wait for notes, then draft an unsent recap. Do not send. Do not enroll anyone. Do not book the next meeting.
- Autonomy: L1 · max bots 4

## Employees

| Employee | id | Title | Skills | Original plugins |
| --- | --- | --- | --- | --- |
| Outbound (lead) | `sales-outbound` | Account research and review-ready outreach | research-accounts | Gmail, LinkedIn |
| Meeting Prep | `meeting-prep` | Pre-call brief from CRM, mail, and calendar | prep-meeting | Gmail, Google Calendar, Slack |
| Call Follow-up | `call-followup` | Unsent recap and tasks after a call | draft-call-followup, log-promises | Gmail, Google Calendar |

## Handoffs (original text; not executable relations in Teloa)

- Outbound → meeting-prep: A meeting is booked and needs a pre-call brief
- Outbound → call-followup: A call happened and needs an unsent recap
- Meeting Prep → call-followup: The meeting happened and needs an unsent recap
- Meeting Prep → sales-outbound: The brief surfaces a net-new contact that needs research, not a meeting
- Call Follow-up → meeting-prep: A next meeting is already on the calendar and needs a brief
- Call Follow-up → sales-outbound: The call produced a net-new contact that needs research

## Optional business dashboard

`teloa.b2b-sales-followup-dashboard@1.0.0` · 销售跟进看板: 商机、待履行承诺和按币种区分的金额. Adopt it separately after previewing the record fields and choosing a compatible business. This team does not create a business or sample data. See `references/teloa-dashboard-guide.md`.

## Connections

Only read-only GitHub / Notion connections are declared (optional, `required: false`); the owner configures them on the connections page. Tools for Gmail, Google Calendar, LinkedIn, Slack are not declared by this package; provide material or configure the appropriate apps separately. Nothing is connected, scheduled or run by adding this package.

## License

MIT (see LICENSE). Attribution: Cobus Greyling, cobusgreyling/grok-bot-templates@4f3f28b4e6578cd227ff7f4b78ec91d15fd091b5.
