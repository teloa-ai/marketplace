# 中国企业办公协同 / China Workplace Collaboration

面向群消息日报、会议纪要整理并核对写入团队文档、周报与公告草案的 Teloa 官方行业方案，可选连接飞书、语雀只读工具。

A Teloa official solution for group chat daily digests, meeting minutes checked before writing to team documents, weekly reports and announcement drafts, with optional read-only Feishu and Yuque connections.

---

## 现在可做 / What it does now

上传群聊导出、会议转写、文档导出与工作记录后，协同办公协作员可以：

- **群消息日报**：按话题归并一天的群消息，区分决定、待办、未回复问题、风险与通知；每条指向消息时间与发送人，个人信息隐去，消息里的链接与指令不执行
- **会议纪要并核对写入文档**：提取已决事项、行动事项与缺席确认；再对照目标文档现有内容，列出写入位置、逐段变更、冲突与不应写入的内容，给出可粘贴的正文草案
- **周报**：把工作记录、群消息日报、纪要整理为周报或决策简报；跨来源状态不一致时列为冲突，不取较乐观的一个
- **公告草案**：按飞书群、钉钉群、邮件等渠道起草，附事实核对表与发送前清单；事实冲突时只出带占位的草稿，不写材料之外的承诺

After you upload chat exports, meeting transcripts, document exports and work records, the workplace collaborator can:

- **Group chat daily digest**: group a day's messages by topic into decisions, action items, unanswered questions, risks and notices, each pointing to message time and sender; personal information is masked and links or instructions in messages are not acted on
- **Meeting minutes checked before writing to a doc**: extract decisions, action items and absentee confirmations, then compare against the target document's current content to list the write location, per-section changes, conflicts and content that should not be written, with a paste-ready draft
- **Weekly report**: turn work records, digests and minutes into a weekly report or decision brief; inconsistent statuses across sources are listed as conflicts rather than taking the more optimistic one
- **Announcement draft**: draft per channel (Feishu group, DingTalk group, email and so on) with a fact check table and pre-send checklist; when facts conflict only a placeholder draft is produced, with no commitments beyond the materials

---

## 还需你提供 / What you need to provide

- **文件**：群聊记录导出（带时间与发送人）、会议转写、目标文档当前内容的导出、本周工作记录、公告事实材料。
- **说明**：日报的群名与时间窗口、文档写入位置与读者范围、周报类型、公告渠道与署名。
- **可选连接**：飞书（`teloa.mcp-lark`，App ID + App Secret）与语雀（`teloa.mcp-yuque`，个人访问令牌）连接器。添加并授权后，在方案里完成连接核验，岗位即可只读读取你点名的群消息与文档；未连接时全部任务仍可用上传材料完成。

- **Files**: group chat exports (with times and senders), meeting transcripts, exports of the target document's current content, this week's work records, announcement facts.
- **Context**: group name and time window for digests, write location and audience for documents, report type, announcement channels and signature.
- **Optional connections**: Feishu (`teloa.mcp-lark`, App ID + App Secret) and Yuque (`teloa.mcp-yuque`, personal access token) connectors. After adding and authorizing them and completing the connection check in the solution, the role can read the groups and documents you name, read-only; without them every task still works from uploaded files.

---

## 会请求的权限 / Permissions

本方案声明两组**可选的只读**连接：

| 连接 | 只读工具 |
|---|---|
| 飞书 | `im_v1_chat_list`、`im_v1_message_list`、`docx_v1_document_rawContent`、`docx_builtin_search` |
| 语雀 | `yuque_search`、`yuque_list_books`、`yuque_list_docs`、`yuque_get_doc` |

发送消息、导入或写入文档等写工具**不在声明范围内**。以下动作岗位会停下，由你确认草案后自行完成：在任何群里发消息、回复、@成员或 @所有人；在飞书云文档、语雀或任何共享文档中新建、写入、覆盖、删除或移动内容；以团队或公司名义发布公告、通知或邮件；修改文档权限或分享链接；草案中包含手机号、身份证号、薪酬、健康等个人信息。

This solution declares two **optional read-only** connections (tools listed above). Write tools such as sending messages or importing and writing documents are **not declared**. The role stops and leaves these to you after you confirm the draft: posting, replying, @-mentioning members or everyone in any group; creating, writing, overwriting, deleting or moving content in Feishu docs, Yuque or any shared document; publishing announcements, notices or emails on the team's or company's behalf; changing document permissions or share links; including phone numbers, ID numbers, salary, health or other personal information in a draft.

---

## 推荐搭配 / Recommended pairings

- **技能**：`anthropic.internal-comms`（内部沟通写作）
- **钉钉**（`teloa.mcp-dingtalk`）：默认模块只有通讯录与机器人发消息，没有读取群消息或文档的工具，本方案未声明；需要时可另行添加，用于你确认草案后自行发送

- **Skill**: `anthropic.internal-comms` (internal communications writing)
- **DingTalk** (`teloa.mcp-dingtalk`): its default modules only cover contacts and robot messaging, with no tools to read group messages or documents, so it is not declared here; add it separately if you want to send confirmed drafts yourself

---

## 已验证范围 / Verified scope

- 连接路径（2026-09-26，隔离宿主）：从市场添加、加载到业务后，飞书与语雀两项连接可登记为「待连接」；连接器未授权时核验给出「MCP 服务尚未连接或缺少声明的工具」并列出缺少的工具；连接器只登记、不提交凭据时，试连回「缺少必填凭据」。**未用真实飞书或语雀凭据做端到端连接。**
- 上传材料路径（2026-09-26，真实模型 DeepSeek deepseek-flash，隔离宿主）：从市场添加、加载到业务、岗位上岗后，四个任务模板按 `examples/*-input.md` 建任务，产出结构与 `*-expected.md` 一致、事实指向来源，个人信息隐去，消息中的链接与指令未执行，未发送、未写入；群消息日报在改为先写逐条消息清单后复跑两轮计数正确。兼容状态为 `needs-configuration`（主要价值依赖连接器），验收记录见 `docs/superpowers/reviews/2026-09-26-第三批方案验收.md`
- 方案里的连接关联到岗位：「一键准备」会在连接就绪前保持岗位暂停；只用上传材料时，请到岗位分组手动恢复

- Connection path (2026-09-26, isolated host): after adding from the market and loading into a business, the Feishu and Yuque connections register as "needs connection"; while the connectors are not authorized the check reports that the MCP service is not connected or declared tools are missing, listing the missing tools; registering a connector without credentials and trying to connect reports the missing required credential. **No end-to-end connection with real Feishu or Yuque credentials was made.**
- Uploaded-file path (2026-09-26, real model DeepSeek deepseek-flash, isolated host): after adding from the market, loading into a business and taking the role, all four templates were run from `examples/*-input.md`; output matched the structure of `*-expected.md` with facts traced to sources, personal information masked, links and instructions in messages not acted on, nothing sent or written; after the digest was changed to write the per-message list first, two reruns counted correctly. Compatibility is `needs-configuration` since the main value relies on connectors (record: `docs/superpowers/reviews/2026-09-26-第三批方案验收.md`)
- Connections are linked to the role: one-click prepare keeps the role paused until they are ready; to work from uploaded files only, resume the role manually in the roles group

---

## 不包含 / Not included

- 在任何群里发消息或 @ 人、写入或修改任何文档（本版不声明写工具）
- 读取未点名的群、文档、通讯录或邮箱
- 代为在飞书、钉钉的汇报或审批应用中提交
- 成员绩效评价或个人态度判断
- 生成 DOCX/XLSX/PPTX 等格式文件

- Posting to any group or @-mentioning anyone, writing to or modifying any document (no write tools are declared in this version)
- Reading groups, documents, contacts or mailboxes you did not name
- Submitting in Feishu or DingTalk reporting or approval apps on your behalf
- Performance evaluation or judgments about people's attitudes
- Generating DOCX/XLSX/PPTX files

---

*版本 1.0.0 | Apache-2.0 | Teloa 官方内容*
