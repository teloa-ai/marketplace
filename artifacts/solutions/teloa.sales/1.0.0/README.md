# 销售与商务 / Sales and Business Development

面向客户研究简报、方案书草案、会后跟进与报价核对的 Teloa 官方行业方案。岗位只基于你提供的客户材料、产品事实与价格表形成草案；报价、承诺、条款与对客户发送都由你确认。

A Teloa official solution for customer research briefs, proposal drafts, meeting follow-ups and quote verification. The role works only from the customer materials, product facts and price lists you provide; quotes, commitments, terms and anything sent to customers are confirmed by you.

---

## 现在可做 / What it can do now

上传材料后，岗位可以：

- **客户研究简报**：从客户公开资料与已授权材料中提取背景事实与已表达的需求，每条标来源与检索日期；推断的关注点写明依据；有产品事实库时给出「客户需求 → 我方能力」对应表与拜访待确认问题
- **方案书草案**：按需求理解、方案概述、能力对应（有对应 / 部分对应 / 待确认能否满足）、实施框架、案例、待确认事项起草；产品能力只取事实库，价格、折扣、交期、服务水平与条款全部留空
- **客户会议纪要与跟进**：区分客户需求、客户异议、我方承诺（含承诺人）与跟进事项；负责人与日期只取原文；客户口头表述不写成「已确认」
- **报价核对**：逐行对照报价单与价格表，列出单价差异、折扣是否在规则内、合计与税差异、缺失项；只列差异，不给建议价

After you upload materials, the role can:

- **Customer research brief**: extract background facts and stated needs from public and authorized customer materials, each with source and retrieval date; inferred concerns state their basis; with a product fact base it maps customer needs to your capabilities and lists questions to confirm
- **Proposal draft**: requirement understanding, overview, capability mapping (matched / partly matched / to be confirmed), delivery framework, cases and open items; capabilities come only from the fact base, and price, discount, timeline, service levels and terms are left blank
- **Customer meeting minutes and follow-ups**: separates customer needs, objections, our commitments (with the person committing) and follow-ups; owners and dates only from the transcript; verbal remarks are never written as confirmed
- **Quote verification**: checks the quote line by line against the price list, listing unit price differences, whether discounts fall within rules, total and tax differences and missing items; differences only, no suggested prices

---

## 还需你提供 / What you need to provide

- **客户材料**：官网快照、公开资料、招标文件、客户发来的需求说明；岗位不检索联系人个人社交账号，不读取未提供的邮箱、聊天记录或 CRM 数据
- **产品事实库与价格表**：产品说明、参数表、已授权引用的案例、价格表（含版本或生效日期）、折扣规则；没有事实库时方案书的能力对应留空，没有价格表时不做报价核对
- **会议转写**：客户会议的转写文本或记录，以及双方参会人与职务
- **用途说明**：本次研究为哪次拜访、方案书用于哪个阶段

- **Customer materials**: website snapshots, public documents, tender files, requirement notes from the customer; the role does not search contacts' personal social accounts or read mailboxes, chats or CRM data you have not provided
- **Product fact base and price list**: product description, spec sheet, authorized cases, price list (with version or effective date), discount rules; without a fact base the capability mapping stays blank, without a price list no quote check is done
- **Meeting transcript**: the customer meeting transcript or record, plus attendees and titles on both sides
- **Purpose**: which meeting the research prepares for, which stage the proposal serves

---

## 会请求的权限 / Permissions it asks for

本方案第一版只需要**读取你上传的文件**，不请求写权限、外部 API 或账号连接。

以下动作岗位会停下等你确认：

- 向客户或任何外部方发送邮件、消息、方案书或报价
- 把任何内容写入 CRM 或其他外部系统
- 方案书或跟进材料中出现价格、折扣、交期、服务水平或任何承诺表述
- 引用客户联系人姓名、职务以外的个人信息
- 修改、补写或解释合同条款文本
- 把会议中客户的口头表述写成「客户已确认」

折扣超出规则、价格表无对应项、客户提出付款或法律条款要求时，岗位只列出事实并停下，由你裁定。

This first version only **reads the files you upload**; it asks for no write access, external API or account connection.

The role stops and waits for your confirmation before:

- sending email, messages, a proposal or a quote to the customer or any external party
- writing anything into a CRM or other external system
- placing a price, discount, timeline, service level or any commitment in a proposal or follow-up
- quoting contact details beyond a contact's name and title
- changing, adding to or interpreting contract wording
- writing a customer's verbal remark as "confirmed by the customer"

When a discount exceeds the rules, the price list has no matching item, or the customer raises payment or legal terms, the role lists the facts and stops for your decision.

---

## 推荐搭配（可选）/ Recommended companions (optional)

以下连接器与技能均为可选，**本包未声明为必需项**，需你另行添加与授权：

- **检索连接器**：`teloa.mcp-exa`（海外，需密钥；检索客户组织的公开信息，检索词会发往服务方）
- **内部协同**：`teloa.mcp-lark`、`teloa.mcp-dingtalk`（国内，需应用凭据；把纪要与跟进清单发到内部群或工作通知——发送始终是确认点）
- **上游技能**：`ivangdavila.market-research`（市场资料整理）、`ivangdavila.word-docx`、`ivangdavila.powerpoint-pptx`（把方案书草案排成文件）

The following connectors and skills are optional and **not declared as required by this package**; add and authorize them separately:

- **Search connector**: `teloa.mcp-exa` (overseas, key required; public information about the customer organization, search terms are sent to the service)
- **Internal collaboration**: `teloa.mcp-lark`, `teloa.mcp-dingtalk` (China, app credentials required; deliver minutes and follow-up lists to internal groups or work notices — sending is always a confirmation point)
- **Upstream skills**: `ivangdavila.market-research` (market material organization), `ivangdavila.word-docx`, `ivangdavila.powerpoint-pptx` (lay the proposal draft out as a file)

---

## 已验证范围 / Verified scope

- 2026-09-25 已用真实模型（DeepSeek deepseek-flash，隔离宿主）验收：从市场添加、加载到业务、岗位上岗后，三个任务模板（客户研究简报、方案书草案、会后跟进与报价核对）按 `examples/*-input.md` 建任务，产出结构与 `*-expected.md` 一致、事实逐条指向来源，未对外发送、未做承诺或决定；兼容状态已改为 `verified`，验收记录见 `docs/superpowers/reviews/2026-09-25-首批方案扩充真实模型验收.md`
- 检索、消息与 CRM 连接尚未在本版本中进行端到端验收

- Verified with a real model (DeepSeek deepseek-flash on an isolated host) on 2026-09-25: after adding from the market, loading into a business and taking the role, all three task templates (customer research brief, proposal draft, meeting follow-up with quote verification) were run from `examples/*-input.md`; the output matched the structure of `*-expected.md` with facts traced to sources, nothing was sent externally and no commitments or decisions were made; compatibility is now `verified` (record: `docs/superpowers/reviews/2026-09-25-首批方案扩充真实模型验收.md`)
- Search, messaging and CRM connections have not been end-to-end tested in this version

---

## 不包含 / Not included

- 代替你定价、给折扣建议或承诺交期与服务水平
- 起草、修改或解释合同条款
- 直接联系客户或代表你发送任何材料
- 写入 CRM 或任何外部系统
- 检索或汇总客户联系人的个人信息
- 生成 DOCX/XLSX/PPTX 等格式文件

- Setting prices, suggesting discounts or committing to timelines and service levels for you
- Drafting, changing or interpreting contract terms
- Contacting customers directly or sending any material on your behalf
- Writing to a CRM or any external system
- Searching for or compiling personal information about customer contacts
- Generating DOCX/XLSX/PPTX files

---

*版本 1.0.0 | Apache-2.0 | Teloa 官方内容*
