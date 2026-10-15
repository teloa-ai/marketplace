# B2B 销售与客户跟进看板 / B2B sales & account follow-up dashboard

围绕客户账户、商机与双方承诺的跟进看板：逾期承诺、7 天内到期承诺、跟进已逾期与 30 天内预计成交的商机、风险客户与续约。金额按币种分列、不换算；阶段数量是当前分布，不当作转化漏斗或复购率。

A follow-up dashboard built on accounts, opportunities and commitments from both sides: overdue and soon-due commitments, opportunities with overdue follow-up or expected to close within 30 days, at-risk accounts and renewals. Amounts are shown per currency without conversion; stage counts are the current distribution, not a funnel or repeat-purchase rate.

## 记录 / Records

### 客户账户 / Account

一家正在接触或已合作的企业客户。健康度由负责人按事实判断填写，看板不自动打分；续约日期与下一步决定跟进先后。

| 字段 Field | 类型 Type | 必填 Required | 取值 Values |
|---|---|---|---|
| 客户关系 / Relationship | enum | 是 yes | 潜在、商机中、已签约、已流失 |
| 负责人 / Owner | text | 是 yes |  |
| 健康度 / Health | enum | 否 no | 良好、关注、风险、未评估 |
| 续约日期 / Renewal date | datetime | 否 no |  |
| 下一步 / Next step | text | 否 no |  |
| 行业 / Industry | text | 否 no |  |

### 商机 / Opportunity

一个具体的成交机会。金额必须带币种，不同币种分别合计、不做换算；各阶段数量只反映当前分布，不是转化漏斗。

| 字段 Field | 类型 Type | 必填 Required | 取值 Values |
|---|---|---|---|
| 客户 / Account | reference → account | 是 yes |  |
| 阶段 / Stage | enum | 是 yes | 线索确认、需求确认、方案报价、商务谈判、赢单、输单、暂停 |
| 负责人 / Owner | text | 是 yes |  |
| 预计金额 | money (CNY/USD/EUR) | 否 no |  |
| 预计成交 / Expected close | datetime | 否 no |  |
| 下一步 / Next step | text | 否 no |  |
| 下次跟进 / Next follow-up | datetime | 否 no |  |

### 承诺 / Commitment

通话或往来中双方答应要做的事。写清出处、负责人与到期日；完成或取消后更新状态，保留记录。

| 字段 Field | 类型 Type | 必填 Required | 取值 Values |
|---|---|---|---|
| 客户 / Account | reference → account | 是 yes |  |
| 承诺方 / Committed by | enum | 是 yes | 我方、客户方 |
| 负责人 / Owner | text | 是 yes |  |
| 到期 / Due | datetime | 是 yes |  |
| 状态 / Status | enum | 是 yes | 未完成、已完成、已取消 |
| 出处 / Source | text | 否 no |  |

## 看板组件 / Widgets

- **进行中商机** / Open opportunities — board-card, stage in 线索确认|需求确认|方案报价|商务谈判
- **已逾期承诺** / Overdue commitments — board-card, due overdue, status eq 未完成
- **风险客户** / Accounts at risk — board-card, health eq 风险
- **商机阶段与金额（按币种分列，不换算）** / Opportunities by stage, amounts per currency (no conversion) — distribution
- **已逾期承诺清单** / Overdue commitments — list, due overdue, status eq 未完成
- **未来 7 天到期承诺** / Commitments due in 7 days — list, due next-7d, status eq 未完成
- **跟进已逾期的商机** / Opportunities with overdue follow-up — list, next-at overdue, stage in 线索确认|需求确认|方案报价|商务谈判
- **30 天内预计成交** / Expected to close within 30 days — list, close-at next-30d, stage in 线索确认|需求确认|方案报价|商务谈判
- **需关注客户（按续约日期）** / Accounts to watch by renewal date — list, health in 风险|关注
- **30 天内续约** / Renewals within 30 days — list, renewal-at next-30d, relationship eq 已签约

## 口径 / Semantics

- 计数只统计当前未归档的记录；没有记录时显示空态，不显示虚构数字。
- 求和、最早/最晚等度量在没有取值时返回缺失（null），不当作 0；视图结果会列出用到但缺值的字段。
- 清单组件逐条列出符合条件的记录，可直接打开对应记录查看负责人与下一步。
- 资源不带数据源连接、同步、默认动作或示例数据；记录由你录入。

- Counts cover current, unarchived records; with no records the widgets show an empty state, never invented numbers.
- Sums and earliest/latest measures return missing (null) when no value is recorded, never 0; view results list fields that were used but missing.
- List widgets show each matching record, which opens to its owner and next step.
- The resource carries no data connections, sync, default actions or sample data; you enter the records.

## 许可 / License

Apache-2.0. 对象与流程参考 Grok Bot 模板库（cobusgreyling/grok-bot-templates，MIT）对应岗位职责；本资源文本与结构为 Teloa 原创。
