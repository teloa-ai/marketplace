# 研发事件响应 / Engineering Incident Response

面向线上服务事件的分级初判、缓解变更说明、事件时间线、无责复盘与值班交接的 Teloa 官方行业方案。

A Teloa official solution for production incident triage, mitigation change notes, incident timelines, blameless postmortems and on-call handovers.

---

## 现在可做 / What it does now

上传文件后，事件值班协作员可以：

- **事件分级与初判**：从告警、日志、用户反馈与值班群消息判定是否构成事件，按你的分级规则（未提供时用默认 P1–P4 表并注明）给出建议等级、置信度、支持与反对证据、证据缺口；列出异常前 24 小时内的疑似关联变更并算出时间差，只标「疑似」
- **缓解变更与回滚说明**：为建议的回滚、开关、配置、扩容或重启起草说明：当前与目标版本、影响范围、风险与前提、描述性执行与验证步骤、变更失败时的回退，以及留给执行人填写的字段；不含可直接执行的命令
- **事件时间线与无责复盘**：把多来源记录排成五阶段时间线（UTC 与原时区双列、来源与可信度、四个关键用时、缺口），再起草无责复盘：影响、三层原因、做得好的地方、运气因素、与促成因素一一对应的改进建议；原因只归到系统与流程
- **值班交接**：活跃事件与接班后第一步、本班关键动作、临时缓解到期项、下一班次的发布窗口、工具状态、等待确认的挂起动作

After you upload files, the incident duty collaborator can:

- **Triage and severity**: decide from alerts, logs, user reports and on-call chat whether this is an incident, suggest a level under your severity policy (or a default P1–P4 table, stated as such), with confidence, supporting and opposing evidence and evidence gaps; list changes in the 24 hours before the anomaly with time offsets, marked only as "suspected"
- **Mitigation change and rollback notes**: draft notes for a proposed rollback, flag, config, scaling or restart: current and target versions, impact, risks and prerequisites, descriptive execution and verification steps, fallback if the change itself fails, and fields for the executor to fill in; no ready-to-run commands
- **Timeline and blameless postmortem**: order multi-source records into a five-phase timeline (UTC plus original zone, sources and confidence, four key durations, gaps), then draft a blameless postmortem: impact, three-layer causes, what went well, luck factors, and improvement suggestions mapped one-to-one to contributing factors; causes are attributed to systems and process only
- **On-call handover**: active incidents with the first next step, key actions this shift, expiring temporary mitigations, release windows in the next shift, tool status, and pending actions awaiting confirmation

---

## 还需你提供 / What you need to provide

- **文件**：告警导出、错误日志摘录、部署与配置变更记录、值班群或事件频道消息、用户或客服反馈、事件工单与负责人说明。岗位不会主动访问本次工作未提供的生产环境、代码仓库、监控系统或聊天记录。
- **说明**：组织的事件分级规则、服务与环境、时区、受影响用户或请求数等影响说明、复盘模板（如有）。

- **Files**: alert exports, error log excerpts, deployment and configuration change records, on-call or incident channel messages, user or support reports, incident tickets and owner notes. The role will not access production, repositories, monitoring or chats you did not provide for the task.
- **Context**: your severity policy, service and environment, time zone, impact notes such as affected users or requests, and a postmortem template if you have one.

---

## 会请求的权限 / Permissions

本方案第一版仅需要**读取你上传的文件**，不请求任何写权限、外部 API 或账号连接。

以下动作岗位不会执行，只起草说明并停下等待你确认、由授权人员执行：回滚、重启、扩容、开关切换或配置变更；更新状态页、发布事故公告或联系客户与合作方；在事件、工单或告警系统中创建、升级、关闭或抑制事项；把事件判为正常波动并建议关闭；发送复盘报告或交接记录；报告中出现以个人为原因的描述、个人评价或客户个人信息。

This first version only needs to **read the files you upload**; it requests no write access, external APIs or account connections.

The role never performs the following itself; it only drafts notes and stops for your confirmation, with authorized staff doing the work: rollbacks, restarts, scaling, flag switches or configuration changes; status page updates, incident announcements or contacting customers and partners; creating, escalating, closing or silencing items in incident, ticket or alerting systems; closing an event as normal fluctuation; sending postmortems or handover records; including individuals as causes, personal evaluations or customer personal data in a report.

---

## 推荐搭配 / Recommended pairings

以下连接器为**可选**，未在本包中声明，需要你另行添加、授权并配置：

- **连接器**：Sentry（`teloa.mcp-sentry`）用于读取错误事件；PagerDuty（`teloa.mcp-pagerduty`）用于读取事件与值班表；GitHub（`teloa.mcp-github`）用于读取部署、提交与发布记录。三者均为海外服务，均需密钥。

The following connectors are **optional**, not declared in this package, and must be added, authorized and configured separately:

- **Connectors**: Sentry (`teloa.mcp-sentry`) to read error events; PagerDuty (`teloa.mcp-pagerduty`) to read incidents and on-call schedules; GitHub (`teloa.mcp-github`) to read deployments, commits and releases. All three are overseas services and require credentials.

---

## 已验证范围 / Verified scope

- 2026-09-26 已用真实模型（DeepSeek deepseek-flash，隔离宿主）验收：从市场添加、加载到业务、岗位上岗后，三个任务模板（分级初判含变更说明、时间线与无责复盘、值班交接）按 `examples/*-input.md` 建任务，产出结构与 `*-expected.md` 一致、每个时间与结论指向来源，回滚、重启、对外公告与等级裁定只列待确认，个人归责表述未写入原因分析；兼容状态已改为 `verified`，验收记录见 `docs/superpowers/reviews/2026-09-26-第二批方案真实模型验收.md`
- 连接器搭配（Sentry、PagerDuty、GitHub）未做端到端验收

- Verified with a real model (DeepSeek deepseek-flash on an isolated host) on 2026-09-26: after adding from the market, loading into a business and taking the role, all three task templates (triage with change notes, timeline and blameless postmortem, on-call handover) were run from `examples/*-input.md`; the output matched the structure of `*-expected.md` with every time and conclusion traced to sources, rollbacks, restarts, announcements and the final level were left as open items, and blame statements stayed out of the cause analysis; compatibility is now `verified` (record: `docs/superpowers/reviews/2026-09-26-第二批方案真实模型验收.md`)
- Connector pairings (Sentry, PagerDuty, GitHub) have not been verified end to end

---

## 不包含 / Not included

- 执行回滚、重启、扩容、开关或配置变更，或生成可直接执行的命令
- 更新状态页、发布事故公告、起草对客户的通告或联系客户
- 在事件、工单或告警系统中创建、升级、关闭或抑制事项
- 对个人的归责、评价或处分建议
- 生成 DOCX/XLSX/PPTX 等格式文件

- Executing rollbacks, restarts, scaling, flag or configuration changes, or producing ready-to-run commands
- Updating status pages, publishing incident announcements, drafting customer notices or contacting customers
- Creating, escalating, closing or silencing items in incident, ticket or alerting systems
- Blaming, evaluating or proposing sanctions for individuals
- Generating DOCX/XLSX/PPTX files

---

*版本 1.0.0 | Apache-2.0 | Teloa 官方内容*
