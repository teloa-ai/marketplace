# Marketing team · 内容营销团队

Teloa 市场候选，移植自 [cobusgreyling/grok-bot-templates@4f3f28b4e657](https://github.com/cobusgreyling/grok-bot-templates/tree/4f3f28b4e6578cd227ff7f4b78ec91d15fd091b5)（MIT，Copyright (c) 2026 Cobus Greyling）的 `teams/marketing`。原 PROFILE、template.yaml、team.yaml、skill.yaml 与示例逐字节保留在 `references/` 与 `skills/`；Teloa 的适配逐条列在 MODIFICATIONS.md。本包不是 xAI 官方内容，与原作者无关联声明以外的关系。

A Teloa market candidate ported from `teams/marketing` of the MIT repository above. Original files are kept byte for byte; every Teloa adaptation is listed in MODIFICATIONS.md.

## Lead and kickoff (from team.yaml)

- Lead: **competitor-watch** (Competitor Watch). The coordinator is declared by role-coordination links to each member; the original lead also remains in the source definition.
- Why: Competitor noise, channel variants, and the weekly issue get mixed until someone diffs, remixes, and still does not publish.
- Group kickoff (original text): @Competitor Watch diff the named set since last snapshot and stay quiet on unchanged pages. @Content Remix turn the accepted brief into DRAFT variants. @Newsletter Desk assemble the next issue unsent. Do not publish. Do not post to Slack or X. Do not send the issue.
- Autonomy: L1 · max bots 4

## Employees

| Employee | id | Title | Skills | Original plugins |
| --- | --- | --- | --- | --- |
| Competitor Watch (lead) | `competitor-watch` | Material-change competitor watch | diff-competitors | Slack |
| Content Remix | `content-remix` | Draft-only social and email variants | remix-content | Notion |
| Newsletter Desk | `newsletter-desk` | Unsent weekly newsletter from saved links | draft-newsletter | Gmail, Google Docs |

## Handoffs (original text; not executable relations in Teloa)

- Competitor Watch → paid-media (outside this team): A pricing or packaging change should inform budget recommendations
- Competitor Watch → content-remix: A messaging change needs draft variants, not a live post
- Content Remix → newsletter-desk: The source should become a weekly newsletter section instead of social
- Content Remix → brand-watch (outside this team): A variant would reply to a mention rather than start from owned draft
- Newsletter Desk → content-remix: One section should become social variants instead of remaining in the issue

## Optional business dashboard

`teloa.content-ops-dashboard@1.0.0` · 内容运营看板: 内容排期、待审稿件和有来源的渠道统计. Adopt it separately after previewing the record fields and choosing a compatible business. This team does not create a business or sample data. See `references/teloa-dashboard-guide.md`.

## Connections

Only read-only GitHub / Notion connections are declared (optional, `required: false`); the owner configures them on the connections page. Tools for Gmail, Google Docs, Slack are not declared by this package; provide material or configure the appropriate apps separately. Nothing is connected, scheduled or run by adding this package.

## License

MIT (see LICENSE). Attribution: Cobus Greyling, cobusgreyling/grok-bot-templates@4f3f28b4e6578cd227ff7f4b78ec91d15fd091b5.
