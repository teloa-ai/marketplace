# 产品运营与增长分析 / Product Ops & Growth

面向指标口径核对、实验结论整理、用户反馈归类与增长周报的 Teloa 官方行业方案。

A Teloa official solution for metric definition checks, experiment readouts, user feedback clustering and growth weekly reports.

---

## 现在可做 / What it does now

上传文件后，产品运营分析员可以：

- **指标口径核对**：按指标词典逐项抄录定义，用原始计数复算仪表盘数字，差异按「报告值 − 复算值」带符号写出并附算式；并列跨来源口径冲突、单位与时间窗口问题、缺失口径；不裁定哪种口径正确
- **实验结论整理**：抄录实验设计，核对周期、样本量与分流比例，复算各组主指标与护栏指标，逐条对照预设决策规则，结论只写「符合 / 不符合 / 无法判定预设放量条件」；显著性只转录分析平台给出的值，不建议全量或回滚
- **用户反馈归类**：先为每条原始反馈写一行标注（模块、类型、情绪、严重程度、主题、是否重复及指向），再只由标注表推出去重数、有效条数与主题条数占比（合计等于有效条数、逐项可对账），附脱敏原文摘录；安全、越权、数据泄露等单列「需立即转交」
- **增长周报**：核心指标表（本周、上周、变化、口径来源；计数写百分比变化，比率写百分点差，两周分母定义不同才写「不可比」），实验进展、反馈要点、本周动作与结果、下周计划与需决策事项；原因只取材料原文

After you upload files, the product ops analyst can:

- **Metric definition check**: copy each definition from the metric dictionary, recompute dashboard figures from raw counts, and write signed differences as "reported − recomputed" with formulas; list cross-source definition conflicts, unit and time-window issues and missing definitions side by side, without ruling which definition is correct
- **Experiment readout**: copy the experiment design, check duration, sample size and split ratio, recompute primary and guardrail metrics per group, and check each pre-registered decision rule; the verdict is only "meets / does not meet / cannot determine the pre-set rollout conditions"; significance is transcribed from the analytics platform, and it never recommends shipping or rolling back
- **User feedback clustering**: first write one tagging row per raw item (module, type, sentiment, severity, theme, and any duplicate pointer), then derive duplicate, valid and per-theme counts and shares only from that table (summing to the valid count and reconcilable item by item), and quote anonymized excerpts; security, unauthorized access and data leak reports are listed separately for immediate hand-off
- **Growth weekly report**: a core metrics table (this week, last week, change, definition source; counts as percentage change, rates as percentage points, "not comparable" only when the two weeks' denominators differ), plus experiment progress, feedback highlights, actions and results, next week's plan and open decisions; causes come only from the materials

---

## 还需你提供 / What you need to provide

- **文件**：指标词典或口径说明、仪表盘导出或原始计数表、实验计划与结果导出、用户反馈导出与模块清单、运营动作记录、上周周报。岗位不会主动访问本次工作未提供的分析平台、数据库、工单系统或群聊。
- **说明**：统计周期与时区、报告精度、周报读者（团队或管理层）、实验的预设决策规则。

- **Files**: metric dictionary or definition notes, dashboard exports or raw count tables, experiment plans and result exports, user feedback exports with a module list, operations logs, last week's report. The role will not access analytics platforms, databases, ticket systems or chats you did not provide for the task.
- **Context**: reporting period and time zone, reporting precision, report audience (team or management), and the experiment's pre-registered decision rules.

---

## 会请求的权限 / Permissions

本方案第一版仅需要**读取你上传的文件**，不请求任何写权限、外部 API 或账号连接。

以下动作岗位不会自行执行，会先停下等待你确认：发送报告、清单或结论给任何收件人；在分析平台中新建、修改或删除指标定义、埋点事件、仪表盘或线上配置；对外发布实验结论，或执行实验全量、扩量、回滚；在工单、应用商店、社区等渠道回复用户；把数据或反馈原文上传到外部平台；把某一种口径写成「正确口径」或修改指标词典；产出中出现用户个人可识别信息或成员绩效评价。

This first version only needs to **read the files you upload**; it requests no write access, external APIs or account connections.

The role never does the following on its own and stops for your confirmation first: sending reports, checklists or conclusions to anyone; creating, editing or deleting metric definitions, tracking events, dashboards or live configuration in analytics platforms; publishing experiment conclusions externally, or shipping, ramping up or rolling back an experiment; replying to users in tickets, app stores, communities or any other channel; uploading data or feedback text to external platforms; declaring one definition "correct" or editing the metric dictionary; including users' personally identifiable information or team members' performance evaluations in the output.

---

## 推荐搭配 / Recommended pairings

以下连接器与技能为**可选**，未在本包中声明，需要你另行添加、授权并配置：

- **连接器**：PostHog（`teloa.mcp-posthog`）用于读取指标趋势与实验结果；Exa（`teloa.mcp-exa`）用于检索公开的竞品与行业资料，结果只作参考并标注来源，不写入指标表。两者均为海外服务，均需密钥。
- **技能**：上游 `ivangdavila.data-analysis`（数据分析）、`ivangdavila.excel-xlsx`（电子表格处理）。

The following connectors and skills are **optional**, not declared in this package, and must be added, authorized and configured separately:

- **Connectors**: PostHog (`teloa.mcp-posthog`) to read metric trends and experiment results; Exa (`teloa.mcp-exa`) to search public competitor and industry material, used for reference with sources noted and never written into the metrics table. Both are overseas services and require credentials.
- **Skills**: upstream `ivangdavila.data-analysis` (data analysis) and `ivangdavila.excel-xlsx` (spreadsheet handling).

---

## 已验证范围 / Verified scope

- 2026-09-26 已用真实模型（DeepSeek deepseek-flash，隔离宿主）验收：从市场添加、加载到业务、岗位上岗后，四个任务模板（指标口径核对、实验结论整理、用户反馈归类、增长周报）按 `examples/*-input.md` 建任务各跑两轮，产出结构与 `*-expected.md` 一致、数字可复算并指向来源；反馈归类先写逐条标注表再由其推出统计，两轮去重、有效条数与主题编号均与标注表对账一致；周报激活率按两周同分母的词典口径算出 +1.5 个百分点；口径裁定、实验放量与回滚只列待确认；兼容状态已改为 `verified`，验收记录见 `docs/superpowers/reviews/2026-09-26-第二批方案真实模型验收.md`
- 连接器搭配（PostHog、Exa）未做端到端验收

- Verified with a real model (DeepSeek deepseek-flash on an isolated host) on 2026-09-26: after adding from the market, loading into a business and taking the role, all four task templates (metric definition check, experiment readout, feedback clustering, growth weekly report) were run twice from `examples/*-input.md`; the output matched the structure of `*-expected.md` with recomputable, sourced numbers; feedback clustering writes a per-item tagging table first and derives the statistics from it, and in both runs the duplicate count, valid count and theme IDs reconciled with that table; the weekly report computed activation as +1.5 percentage points from dictionary values sharing the same denominator definition in both weeks; definition rulings, rollouts and rollbacks were left as open items; compatibility is now `verified` (record: `docs/superpowers/reviews/2026-09-26-第二批方案真实模型验收.md`)
- Connector pairings (PostHog, Exa) have not been verified end to end

---

## 不包含 / Not included

- 修改埋点、事件、指标定义、仪表盘或任何线上配置
- 决定实验全量、扩量、延长或回滚，或对外发布实验结论
- 自行计算 p 值、置信区间或统计功效
- 回复用户或在任何反馈渠道发言
- 生成 DOCX/XLSX/PPTX 等格式文件

- Changing tracking, events, metric definitions, dashboards or any live configuration
- Deciding to ship, ramp up, extend or roll back an experiment, or publishing experiment conclusions externally
- Computing p-values, confidence intervals or statistical power itself
- Replying to users or posting in any feedback channel
- Generating DOCX/XLSX/PPTX files

---

*版本 1.0.0 | Apache-2.0 | Teloa 官方内容*
