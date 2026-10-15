# Product team · 软件产品团队

Teloa 市场候选，移植自 [cobusgreyling/grok-bot-templates@4f3f28b4e657](https://github.com/cobusgreyling/grok-bot-templates/tree/4f3f28b4e6578cd227ff7f4b78ec91d15fd091b5)（MIT，Copyright (c) 2026 Cobus Greyling）的 `teams/product`。原 PROFILE、template.yaml、team.yaml、skill.yaml 与示例逐字节保留在 `references/` 与 `skills/`；Teloa 的适配逐条列在 MODIFICATIONS.md。本包不是 xAI 官方内容，与原作者无关联声明以外的关系。

A Teloa market candidate ported from `teams/product` of the MIT repository above. Original files are kept byte for byte; every Teloa adaptation is listed in MODIFICATIONS.md.

## Lead and kickoff (from team.yaml)

- Lead: **product-performance** (Product Performance). The coordinator is declared by role-coordination links to each member; the original lead also remains in the source definition.
- Why: Latency, Slack asks, and launch day collide unless one Bot owns evidence, one clusters asks, and one refuses to publish.
- Group kickoff (original text): @Product Performance investigate the named latency spike with dashboards and traces. @Feature Ask Collator cluster Slack asks without filing. @Launch Coordinator keep the launch checklist honest and stop at go/no-go. Do not change production. Do not file issues. Do not publish.
- Autonomy: L1 · max bots 4

## Employees

| Employee | id | Title | Skills | Original plugins |
| --- | --- | --- | --- | --- |
| Product Performance (lead) | `product-performance` | Evidence-backed performance investigations | investigate-perf | GitHub, Slack |
| Feature Ask Collator | `feature-ask-collator` | Clustered product asks, not a roadmap | collate-feature-asks | Slack |
| Launch Coordinator | `launch-coordinator` | Go/no-go packet, never the publish | coordinate-launch | Slack, GitHub |

## Handoffs (original text; not executable relations in Teloa)

- Product Performance → evidence-packager (outside this team): A human needs a ship/block packet from this write-up
- Product Performance → bug-reproduction (outside this team): The hotspot needs a staging repro, not more charts
- Product Performance → issue-drafter (outside this team): The write-up should become an unsent issue
- Feature Ask Collator → issue-drafter (outside this team): A cluster is ready to become an unsent GitHub issue
- Feature Ask Collator → product-performance: The ask is actually a latency or error complaint
- Launch Coordinator → research-desk (outside this team): Claims in the launch still need a cited brief
- Launch Coordinator → changelog (outside this team): User-facing notes from merged PRs are the missing artifact
- Launch Coordinator → evidence-packager (outside this team): The packet is ready for a human ship/block verdict

## Optional business dashboard

`teloa.saas-delivery-dashboard@1.0.0` · 软件交付看板: 需求验收、未解除阻塞和发布准备. Adopt it separately after previewing the record fields and choosing a compatible business. This team does not create a business or sample data. See `references/teloa-dashboard-guide.md`.

## Connections

Only read-only GitHub / Notion connections are declared (optional, `required: false`); the owner configures them on the connections page. Tools for Slack are not declared by this package; provide material or configure the appropriate apps separately. Nothing is connected, scheduled or run by adding this package.

## License

MIT (see LICENSE). Attribution: Cobus Greyling, cobusgreyling/grok-bot-templates@4f3f28b4e6578cd227ff7f4b78ec91d15fd091b5.
