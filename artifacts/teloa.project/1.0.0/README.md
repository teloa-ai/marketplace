# 项目管理协作 / Project Management

面向项目周状态报告、项目会议纪要、风险台账维护与里程碑核对的 Teloa 官方行业方案。

A Teloa official solution for weekly project status reports, project meeting minutes, risk register upkeep, and milestone checks.

---

## 现在可做 / What it does now

上传文件后，项目协调员可以：

- **项目周状态报告**：把任务记录、看板导出与状态材料整理为团队周报、干系人汇报或管理层简报；整体状态分三档并写出判定依据，数字与日期附来源
- **项目会议纪要与待办**：从转写中提取决议、计划变更、行动事项与上次待办闭环；负责人和截止日期只取原文，未提及时留空
- **项目风险台账**：登记与更新风险条目（描述、触发条件、影响对象、评分、应对、状态、来源），输出变更清单与摘要；接受、关闭与降级只在你确认后标注
- **里程碑核对**：计划与实际逐条对照，输出偏差天数、判定、依赖影响与需你决策的事项；不重排计划、不提出新日期

After you upload files, the project coordinator can:

- **Weekly status report**: turn task records, board exports and status notes into a team weekly, stakeholder update or management brief; overall status uses three levels with stated rationale, and every figure and date is sourced
- **Meeting minutes and action items**: extract decisions, plan changes, action items and follow-through on last meeting's items; owners and due dates come only from the transcript and stay blank when not stated
- **Risk register**: add and update risk entries (description, trigger, affected items, scores, response, status, source) with a change list and summary; acceptance, closure and downgrades are marked only after you confirm
- **Milestone check**: compare plan against actuals line by line, with variance in days, verdict, dependency impact and items needing your decision; it never reschedules or proposes new dates

---

## 还需你提供 / What you need to provide

- **文件**：项目计划或里程碑表、任务清单或看板导出、会议转写、风险台账、上周报告。岗位不会主动访问本次工作未提供的看板、群聊或邮箱。
- **说明**：报告类型与读者、容忍范围（如「偏差 ≤2 天视为按计划」）、哪些日期已对外承诺。

- **Files**: project plan or milestone table, task list or board export, meeting transcripts, risk register, last week's report. The role will not access boards, chats or mailboxes you did not provide for the task.
- **Context**: report type and audience, tolerance range (for example "variance ≤2 days counts as on plan"), and which dates have been committed externally.

---

## 会请求的权限 / Permissions

本方案第一版仅需要**读取你上传的文件**，不请求任何写权限、外部 API 或账号连接。

以下动作岗位会先停下等待你确认：发送报告或纪要给任何收件人；在项目管理工具中创建、修改或关闭事项；变更计划基线、里程碑日期、范围或资源；以项目名义对客户或上级承诺日期；把风险标为「已接受」或「已关闭」；报告中出现成员个人信息或绩效评价。

This first version only needs to **read the files you upload**; it requests no write access, external APIs or account connections.

The role stops and waits for your confirmation before: sending reports or minutes to anyone; creating, editing or closing items in project tools; changing the plan baseline, milestone dates, scope or resources; committing dates to clients or management on the project's behalf; marking a risk as accepted or closed; including personal or performance information about team members in a report.

---

## 推荐搭配 / Recommended pairings

以下连接器与技能为**可选**，未在本包中声明，需要你另行添加、授权并配置：

- **连接器**：Linear（`teloa.mcp-linear`）、Atlassian Jira & Confluence（`teloa.mcp-atlassian`）用于读取事项与看板；飞书/Lark（`teloa.mcp-lark`）、钉钉（`teloa.mcp-dingtalk`）用于读取群消息或在你确认后发送报告。Linear 与 Atlassian 为海外服务，均需密钥。
- **技能**：`hermes.meeting-action-items`（会议行动项提取）、上游 `othmanadi.planning-with-files`（用文件做计划）。

The following connectors and skills are **optional**, not declared in this package, and must be added, authorized and configured separately:

- **Connectors**: Linear (`teloa.mcp-linear`) and Atlassian Jira & Confluence (`teloa.mcp-atlassian`) to read issues and boards; Feishu/Lark (`teloa.mcp-lark`) and DingTalk (`teloa.mcp-dingtalk`) to read group messages or send reports after your confirmation. Linear and Atlassian are overseas services and both require credentials.
- **Skills**: `hermes.meeting-action-items` (meeting action item extraction) and upstream `othmanadi.planning-with-files` (file-based planning).

---

## 已验证范围 / Verified scope

- 本方案**尚未真实模型验收**，标注为 `content-only`；四个任务模板均附合成样例（`examples/`），验收通过后更新状态
- 连接器搭配（Linear、Atlassian、飞书、钉钉）未做端到端验收

- This solution has **not yet been verified with a real model** and is marked `content-only`; all four task templates ship with synthetic samples in `examples/`, and the status will be updated after verification
- Connector pairings (Linear, Atlassian, Feishu, DingTalk) have not been verified end to end

---

## 不包含 / Not included

- 直接发送报告、纪要或消息（须另行授权）
- 写入或修改任何项目管理系统
- 重排计划、提出新目标日期或调整范围与资源
- 成员绩效评价或个人责任归因
- 生成 DOCX/XLSX/PPTX 等格式文件

- Sending reports, minutes or messages directly (requires separate authorization)
- Writing to or modifying any project management system
- Rescheduling, proposing new target dates, or adjusting scope and resources
- Performance evaluation or individual blame attribution
- Generating DOCX/XLSX/PPTX files

---

*版本 1.0.0 | Apache-2.0 | Teloa 官方内容*
