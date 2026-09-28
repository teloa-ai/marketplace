# 客户支持协作 / Customer Support

面向工单分诊、回复草案、FAQ 沉淀与升级摘要的 Teloa 官方行业方案。

A Teloa official solution for ticket triage, reply drafts, FAQ distillation, and escalation summaries.

---

## 现在可做 / What it does now

上传工单、产品事实库与支持政策后，客服知识协作员可以：

- **工单分诊**：按问题类型分类、定优先级（四档，写出依据）、判定处理路径（自助 / 一线回复 / 升级）；批量时聚出疑似共性问题
- **回复草案**：只对一线可答的工单起草，每条事实指向事实库或政策条目，附依据表与待确认项；不承诺退款、赔偿、修复时间
- **FAQ 沉淀**：从已解决工单聚类重复问题，核对到事实库后起草条目，去除全部客户个人信息，并标出与既有 FAQ 的重复、冲突与过期
- **升级摘要**：为需升级的工单整理问题、发生条件、影响范围、已尝试步骤、需对方决定的事项与时限
- **事实与措辞核对**：发送或发布前逐项核对事实、政策引用、承诺性措辞、禁用表述与个人信息

After you upload tickets, the product fact base and support policies, the support knowledge collaborator can:

- **Ticket triage**: categorize tickets, set a four-level priority with stated rationale, decide the handling path (self-service / first-line reply / escalation), and cluster likely common issues in batches
- **Reply drafts**: draft only for tickets a first-line agent can answer, with every fact pointing to a fact-base or policy entry, plus an evidence table and open items; no promises of refunds, compensation or fix dates
- **FAQ distillation**: cluster recurring questions from resolved tickets, draft entries checked against the fact base, strip all customer personal data, and flag duplicates, conflicts and outdated entries in the existing FAQ
- **Escalation summaries**: for tickets that need escalation, lay out the problem, conditions, impact, steps tried, decisions needed and deadline
- **Fact and wording check**: before sending or publishing, check facts, policy references, promissory wording, forbidden phrases and personal data line by line

---

## 还需你提供 / What you need to provide

- **文件**：工单或对话记录、产品事实库、支持政策（升级规则与 SLA）、既有 FAQ。岗位不会主动访问本次工作未提供的工单队列、CRM 或邮箱。
- **说明**：组织自己的分类与优先级规则（没有则用方案默认并注明）、回复渠道与语言、禁用表述清单、标准话术。

- **Files**: tickets or conversation records, the product fact base, support policies (escalation rules and SLA), the existing FAQ. The role will not access ticket queues, CRM or mailboxes you did not provide for the task.
- **Context**: your own category and priority rules (otherwise the solution's defaults are used and noted), reply channel and language, forbidden wording list, standard phrasing.

---

## 会请求的权限 / Permissions

本方案第一版仅需要**读取你上传的文件**，不请求任何写权限、外部 API 或账号连接。

以下动作岗位会先停下等待你确认：向客户发送任何回复；在工单系统中改状态、分派或关闭工单；回复中出现退款、赔偿、补偿、折扣、例外处理或修复时间的承诺（岗位只会写「已记录，将由负责人评估」）；引用或转发客户个人信息；把 FAQ 发布到面向客户或全员的渠道；把工单内容分享到组织外。

涉及退款与赔偿的决定始终由你做出；岗位只做分诊与摘要，不给结论。支付异常、账户被盗、数据泄露、法律或监管风险类工单，岗位标为最高优先级并停止起草对外文字。

This first version only needs to **read the files you upload**; it requests no write access, external APIs or account connections.

The role stops and waits for your confirmation before: sending any reply to a customer; changing status, assigning or closing tickets in the ticket system; including promises of refunds, compensation, discounts, exceptions or fix dates in a reply (it will only write "recorded; the owner will assess"); quoting or forwarding customer personal data; publishing FAQ entries to customer-facing or company-wide channels; sharing ticket content outside the organization.

Refund and compensation decisions always remain yours; the role only triages and summarizes, never concludes. For payment anomalies, account takeover, data leaks, or legal and regulatory risk, the role marks the ticket top priority and stops drafting outbound text.

---

## 推荐搭配 / Recommended pairings

以下连接器为**可选**，未在本包中声明，需要你另行添加、授权并配置：

- 飞书/Lark（`teloa.mcp-lark`）、钉钉（`teloa.mcp-dingtalk`）：读取客户群消息，或在你确认后发送回复
- 语雀（`teloa.mcp-yuque`）、Notion（`teloa.mcp-notion`，海外）：在你确认后把 FAQ 条目写入知识库
- Zapier（`teloa.mcp-zapier`，海外）：与工单系统之间的自动化，需你逐项授权

以上连接器均需应用凭据或密钥。

The following connectors are **optional**, not declared in this package, and must be added, authorized and configured separately:

- Feishu/Lark (`teloa.mcp-lark`) and DingTalk (`teloa.mcp-dingtalk`): read customer group messages, or send replies after your confirmation
- Yuque (`teloa.mcp-yuque`) and Notion (`teloa.mcp-notion`, overseas): write FAQ entries into a knowledge base after your confirmation
- Zapier (`teloa.mcp-zapier`, overseas): automation with ticket systems, each action authorized by you

All of these require application credentials or API keys.

---

## 已验证范围 / Verified scope

- 2026-09-25 已用真实模型（DeepSeek deepseek-flash，隔离宿主）验收：从市场添加、加载到业务、岗位上岗后，三个任务模板（工单分诊与回复草案、FAQ 沉淀、升级摘要）按 `examples/*-input.md` 建任务，产出结构与 `*-expected.md` 一致、事实逐条指向来源，未对外发送、未做承诺或决定；兼容状态已改为 `verified`，验收记录见 `docs/superpowers/reviews/2026-09-25-首批方案扩充真实模型验收.md`
- 连接器搭配（飞书、钉钉、语雀、Notion、Zapier）未做端到端验收

- Verified with a real model (DeepSeek deepseek-flash on an isolated host) on 2026-09-25: after adding from the market, loading into a business and taking the role, all three task templates (ticket triage with reply drafts, FAQ distillation, escalation summary) were run from `examples/*-input.md`; the output matched the structure of `*-expected.md` with facts traced to sources, nothing was sent externally and no commitments or decisions were made; compatibility is now `verified` (record: `docs/superpowers/reviews/2026-09-25-首批方案扩充真实模型验收.md`)
- Connector pairings (Feishu, DingTalk, Yuque, Notion, Zapier) have not been verified end to end

---

## 不包含 / Not included

- 直接向客户发送回复或消息（须另行授权）
- 写入或修改工单系统、CRM
- 退款、赔偿、补偿或例外处理的决定与承诺
- 以常识或网络搜索替代事实库与政策
- 生成 DOCX/XLSX/PPTX 等格式文件

- Sending replies or messages to customers directly (requires separate authorization)
- Writing to or modifying ticket systems or CRM
- Decisions or promises about refunds, compensation or exceptions
- Replacing the fact base and policies with general knowledge or web search
- Generating DOCX/XLSX/PPTX files

---

*版本 1.0.0 | Apache-2.0 | Teloa 官方内容*
