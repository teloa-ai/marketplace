# 软件与 SaaS 产品交付看板 / Software & SaaS delivery dashboard

围绕需求、阻塞与发布准备的交付看板：哪些需求的验收条件还没确认、哪些已过计划完成、哪些阻塞未解除、待发布版本的检查清单与回滚方案是否就绪。交付是否成立按验收条件判断，不用任务数量冒充完成率。

A delivery dashboard built on requirements, blockers and release readiness: which requirements lack confirmed acceptance criteria, which are past their planned date, which blockers are open, and whether upcoming releases have their checklist and rollback plan ready. Delivery is judged by acceptance criteria, never by task counts.

## 记录 / Records

### 需求 / Requirement

一项要交付给用户的能力。写清阶段、负责人、验收条件与下一步；交付是否成立看验收条件，不看任务数量。

| 字段 Field | 类型 Type | 必填 Required | 取值 Values |
|---|---|---|---|
| 阶段 / Stage | enum | 是 yes | 待澄清、已排期、开发中、待验收、已交付、已搁置 |
| 负责人 / Owner | text | 是 yes |  |
| 验收条件 / Acceptance criteria | enum | 是 yes | 未写、待确认、已确认 |
| 优先级 / Priority | enum | 是 yes | P0、P1、P2、P3 |
| 下一步 / Next step | text | 否 no |  |
| 目标版本 / Target release | text | 否 no |  |
| 计划完成 / Planned completion | datetime | 否 no |  |

### 阻塞 / Blocker

妨碍需求或发布推进的问题。写清影响、负责人与预计解除时间；解除后改为已解除，保留记录。

| 字段 Field | 类型 Type | 必填 Required | 取值 Values |
|---|---|---|---|
| 状态 / Status | enum | 是 yes | 未解除、已解除 |
| 影响 / Impact | enum | 是 yes | 阻断发布、阻断需求、有替代方案 |
| 负责人 / Owner | text | 是 yes |  |
| 关联需求或版本 / Related requirement or release | text | 否 no |  |
| 下一步 / Next step | text | 否 no |  |
| 提出时间 / Raised at | datetime | 是 yes |  |
| 预计解除 / Expected resolution | datetime | 否 no |  |

### 发布 / Release

一次计划中的版本发布。检查清单、回滚方案与发布说明齐备后，由负责人作出放行决定；看板只呈现准备情况，不替你放行。

| 字段 Field | 类型 Type | 必填 Required | 取值 Values |
|---|---|---|---|
| 准备状态 / Readiness | enum | 是 yes | 准备中、待放行决定、已放行、已发布、已推迟 |
| 负责人 / Owner | text | 是 yes |  |
| 计划发布 / Planned release | datetime | 是 yes |  |
| 检查清单 / Checklist | enum | 是 yes | 未开始、部分完成、全部完成 |
| 回滚方案 / Rollback plan | enum | 是 yes | 未准备、已准备 |
| 发布说明 / Release notes | enum | 是 yes | 未写、草稿、已审 |
| 放行结论 / Go/no-go decision | text | 否 no |  |
| 下一步 / Next step | text | 否 no |  |

## 看板组件 / Widgets

- **未解除阻塞** / Open blockers — board-card, status eq 未解除
- **验收条件未确认的进行中需求** / In-progress requirements without confirmed acceptance — board-card, stage in 待澄清|已排期|开发中|待验收; acceptance ne 已确认
- **待验收需求** / Requirements awaiting acceptance — board-card, stage eq 待验收
- **待发布版本（按计划时间）** / Upcoming releases by plan date — list, readiness in 准备中|待放行决定
- **待发布版本的检查清单** / Checklist of upcoming releases — distribution, readiness in 准备中|待放行决定
- **未解除阻塞（最早提出在前）** / Open blockers, oldest first — list, status eq 未解除
- **已过计划完成的需求** / Requirements past planned completion — list, due overdue, stage in 待澄清|已排期|开发中|待验收
- **需求阶段分布** / Requirements by stage — distribution
- **待验收需求清单** / Requirements awaiting acceptance — list, stage eq 待验收

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
