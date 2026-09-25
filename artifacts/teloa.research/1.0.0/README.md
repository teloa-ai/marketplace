# 知识库与研究 / Knowledge and Research

面向多源资料研究、来源对比、知识库条目与术语表沉淀的 Teloa 官方行业方案。每条结论标来源与检索日期，事实与推断分开；写入知识库需你确认。

A Teloa official solution for multi-source research, source comparison, knowledge base articles and glossary building. Every conclusion carries its source and retrieval date, facts are kept apart from inferences, and writing to a knowledge base requires your confirmation.

---

## 现在可做 / What it can do now

上传资料并说明研究问题后，岗位可以：

- **研究简报**：从多份资料中提取关键事实，每条标文件位置或访问地址与检索日期；事实、推断、待核实项分开陈述，末尾给可执行的核验动作
- **多源对比**：就同一问题把两个以上来源按统一维度逐格对比，输出一致项、分歧项（含可能原因）与缺失项；不替你裁定哪个来源正确
- **知识库条目**：把已确认的结论、流程或常见问题整理为固定结构的条目草案，含适用范围、来源清单、最近核对日期与维护人占位；与已有条目冲突时并列差异
- **术语表**：从文档或对话记录中提取术语，定义附来源，别名合并，定义冲突并列

After you upload materials and state the question, the role can:

- **Research brief**: extract key facts with file location or URL plus retrieval date; facts, inferences and open items are kept apart, ending with concrete verification steps
- **Multi-source comparison**: compare two or more sources cell by cell along fixed dimensions; agreed, disputed (with possible causes) and missing items are listed without deciding which source is right
- **Knowledge base article**: turn confirmed findings, procedures or FAQs into a fixed-structure draft with scope, source list, last-checked date and a maintainer placeholder; conflicts with an existing article are shown side by side
- **Glossary**: extract terms from documents or conversations, each definition sourced, aliases merged, conflicting definitions listed side by side

---

## 还需你提供 / What you need to provide

- **资料**：文档、报告、网页快照或对话记录。岗位只使用你本次提供的内容；如你授权检索连接器，只检索与问题直接相关的公开内容并记录检索日期
- **研究问题与读者**：一句话说清要回答什么、结论给谁用
- **可选**：对比维度、来源优先级（如「以官方文档为准」）、知识库模板、已有条目或术语表

- **Materials**: documents, reports, web snapshots or conversation records. The role uses only what you provide; if you authorize a search connector, it searches only public content directly related to the question and records the retrieval date
- **Question and audience**: one sentence on what to answer and who reads it
- **Optional**: comparison dimensions, source priority (such as "official docs prevail"), knowledge base template, existing article or glossary

---

## 会请求的权限 / Permissions it asks for

本方案第一版只需要**读取你上传的文件**，不请求写权限、外部 API 或账号连接。

以下动作岗位会停下等你确认：

- 将草案写入知识库、Wiki、文档系统或任何外部系统
- 将草案发送给任何收件人或分享给任何范围
- 把带有个人信息、未公开商业信息或客户信息的内容写进简报或条目
- 把某一来源判定为「权威」并据此覆盖其他来源
- 引用尚未取得转载许可的资料对外发布

This first version only **reads the files you upload**; it asks for no write access, external API or account connection.

The role stops and waits for your confirmation before:

- writing a draft into a knowledge base, wiki, document system or any external system
- sending a draft to any recipient or sharing it with any audience
- putting personal data, unpublished business information or customer information into a brief or article
- treating one source as authoritative and overriding others on that basis
- publishing material for which reproduction rights have not been obtained

---

## 推荐搭配（可选）/ Recommended companions (optional)

以下连接器与技能均为可选，**本包未声明为必需项**，需你另行添加与授权：

- **检索连接器**：`teloa.mcp-context7`、`teloa.mcp-deepwiki`（无需密钥，查公开技术文档与开源仓库）；`teloa.mcp-exa`（需密钥，公开网页检索）。均为海外服务，检索内容会发往服务方
- **知识库写入**：`teloa.mcp-notion`（海外，需密钥）、`teloa.mcp-yuque`（国内，需 Token）。写入始终是确认点
- **技能**：`hermes.grounded-citations`（引用规范）；上游 `ivangdavila.memory`、`shaw555.ocr-local`（扫描件识别）

The following connectors and skills are optional and **not declared as required by this package**; add and authorize them separately:

- **Search connectors**: `teloa.mcp-context7`, `teloa.mcp-deepwiki` (no key; public technical docs and open-source repositories); `teloa.mcp-exa` (key required; public web search). All are overseas services and receive your search terms
- **Knowledge base writing**: `teloa.mcp-notion` (overseas, key required), `teloa.mcp-yuque` (China, token required). Writing is always a confirmation point
- **Skills**: `hermes.grounded-citations` (citation practice); upstream `ivangdavila.memory`, `shaw555.ocr-local` (scanned document recognition)

---

## 已验证范围 / Verified scope

- 本方案标注为 `content-only`：**尚未真实模型验收**。待按 `examples/*-input.md` 建任务、产出结构与 `*-expected.md` 一致后更新状态
- 检索连接器与知识库写入连接尚未在本版本中进行端到端验收

- This solution is marked `content-only`: **not yet accepted with a real model**. Status will be updated after tasks built from `examples/*-input.md` produce output matching `*-expected.md`
- Search connectors and knowledge base write connections have not been end-to-end tested in this version

---

## 不包含 / Not included

- 直接写入知识库、Wiki 或任何外部系统
- 发送邮件或消息、分享链接
- 采集个人信息或未授权的内部资料
- 生成 DOCX/XLSX/PPTX 等格式文件
- 裁定哪个来源正确

- Writing directly to a knowledge base, wiki or any external system
- Sending email or messages, sharing links
- Collecting personal data or unauthorized internal material
- Generating DOCX/XLSX/PPTX files
- Deciding which source is correct

---

*版本 1.0.0 | Apache-2.0 | Teloa 官方内容*
