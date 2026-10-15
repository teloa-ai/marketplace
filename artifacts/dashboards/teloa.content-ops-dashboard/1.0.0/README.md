# 数字营销与内容运营看板 / Digital marketing & content operations dashboard

围绕选题、制作、审批与发布的内容看板：待审批与需修改的内容、交稿超期、未来 7 天排期与近 30 天发布。曝光与转化只合计写明统计来源的记录，没录入就显示缺失，不当作 0。

A content dashboard following ideas through production, approval and publication: items awaiting approval or revision, overdue drafts, the next 7 days of schedule and the last 30 days of output. Impressions and conversions are totalled only from records with a stated source; unrecorded values show as missing, never as 0.

## 记录 / Records

### 内容 / Content item

一条要发布的内容，从选题、制作、审批到发布逐步推进。曝光与转化只在有统计来源时录入；没有录入就显示为缺失，不当作 0。

| 字段 Field | 类型 Type | 必填 Required | 取值 Values |
|---|---|---|---|
| 阶段 / Stage | enum | 是 yes | 选题、制作中、待审批、需修改、已排期、已发布、已放弃 |
| 负责人 / Owner | text | 是 yes |  |
| 渠道 / Channel | enum | 是 yes | 公众号、小红书、视频号、抖音、微博、官网博客、邮件简报、LinkedIn、X、其他 |
| 审批人 / Approver | text | 否 no |  |
| 下一步 / Next step | text | 否 no |  |
| 交稿截止 / Draft due | datetime | 否 no |  |
| 发布时间 / Publish time | datetime | 否 no |  |
| 发布链接 / Published link | text | 否 no |  |
| 统计来源 / Metrics source | enum | 否 no | 未录入、平台导出、手工录入、第三方统计 |
| 曝光 / Impressions | number | 否 no |  |
| 转化 / Conversions | number | 否 no |  |
| 统计截至 / Metrics as of | datetime | 否 no |  |

## 看板组件 / Widgets

- **待审批内容** / Awaiting approval — board-card, stage eq 待审批
- **交稿已超期** / Drafts past due — board-card, due overdue, stage in 选题|制作中|待审批|需修改
- **待审批与需修改** / Awaiting approval or revision — list, stage in 待审批|需修改
- **交稿已超期的内容** / Content with overdue drafts — list, due overdue, stage in 选题|制作中|待审批|需修改
- **内容阶段分布** / Content by stage — distribution
- **未来 7 天排期** / Scheduled in the next 7 days — list, publish-at next-7d, stage eq 已排期
- **已发布内容按渠道（仅含有统计来源的数据）** / Published content by channel (sourced metrics only) — distribution, stage eq 已发布
- **近 30 天已发布** / Published in the last 30 days — list, publish-at last-30d, stage eq 已发布

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
