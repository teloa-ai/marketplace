# 通用办公协作 / Office Collaboration

面向日常办公文档整理、会议纪要提取、周报与决策简报起草、表格核查的 Teloa 官方行业方案。

A Teloa official solution for daily office document organization, meeting minutes extraction, weekly report drafting, and table verification.

---

## 现在可做

上传文件后，岗位可以：

- **资料研究与可追溯简报**：从多份文档中提炼关键事实，区分事实、推断与待核实项，每条结论指向具体来源位置
- **会议纪要与待办提取**：从转写文本中提取决议、行动事项与缺席确认事项；Owner 和截止日期仅来自转写原文，未提及时保留空白
- **周报与决策简报**：将工作记录整理为周报、向上汇报或决策简报结构，所有数字附来源
- **表格核对**：核验合计公式、单位一致性与跨表口径，输出差异清单与问题清单，不隐藏任何差异

---

## 还需你提供

- **文件**：工作的起点是你上传的文件——会议转写文本、表格、工作记录、报告原文等。岗位不会主动访问本次工作未提供的内容。
- **研究范围说明**：需要告知岗位你的研究问题、核对范围或简报读者，以保证产出针对你的实际需求。

---

## 会请求的权限

本方案第一版仅需要**读取你上传的文件**，不请求任何写权限、外部 API 或账号连接。

以下为可选的外部连接，**未在本包中声明**（需要你另行授权和配置）：

- **云端文档读取**（如 Google Drive、OneDrive）：可读取你通过官方选择界面授权的特定文件，授权范围为 `drive.file`（仅访问你选定的文件，不读取全盘）
- **邮件发送**（如 Microsoft Graph `sendMail`、Gmail SMTP）：发送草案需要独立的邮件发送权限；请注意 `202 Accepted` 仅表示服务已接受请求，不代表收件方已收到邮件
- **日历创建**：需要单独的日历写入权限

**将草案发送给任何人之前，岗位都会停下来等待你的确认。**

---

## 已验证范围 / Verified scope

- 2026-09-25 已用真实模型（DeepSeek deepseek-flash，隔离宿主）验收：从市场添加、加载到业务、办公协作员上岗后，按「会议纪要与待办提取」模板从转写文本交付结构化纪要与待办，已决事项带转写来源，Owner/截止日期只取原文、未知留空并列入待确认，未执行文字稿里的发送指令；兼容状态为 `verified`，验收记录见 `docs/superpowers/reviews/2026-09-25-首批行业方案一期验收.md`
- 资料研究简报、周报与决策简报、表格核对三类任务随方案内容入库，尚未逐一做真实模型验收
- 外部连接（云盘、邮件、日历）为可选项，本版不内置，未做端到端验收

- Verified with a real model (DeepSeek deepseek-flash on an isolated host) on 2026-09-25: after adding from the market, loading into a business and taking the office collaborator role, the "meeting minutes and action items" template delivered structured minutes and action items from a transcript; decisions cite the transcript, owners and due dates come only from the source text (blank and listed as pending when absent), and no send instruction inside the transcript was executed; compatibility is `verified` (record: `docs/superpowers/reviews/2026-09-25-首批行业方案一期验收.md`)
- Research briefs, weekly/decision briefs and table verification ship as solution content and have not yet been individually verified with a real model
- External connections (cloud drive, mail, calendar) are optional, not bundled in this version, and not verified end to end

---

## 不包含

- 直接发送邮件或消息（须另行授权）
- 修改或写入任何业务系统
- 生成 DOCX/XLSX/PPTX 等格式文件（文件生成为独立工具能力，超出本方案范围）
- 读取你未上传的文档、邮箱内容或云端存储
- 自动化的持续发布或归档

---

*版本 1.0.0 | Apache-2.0 | Teloa 官方内容*
