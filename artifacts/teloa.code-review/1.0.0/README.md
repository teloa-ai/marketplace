# 研发协作与代码评审 / Code Review & Release

面向 PR 评审、发布说明与 Issue 分诊的 Teloa 官方行业方案，附安全修复验证与安全设计评审。

A Teloa official solution for PR review, release notes and issue triage, with security fix verification and security design review.

---

## 现在可做 / What it does now

上传文件后，代码评审协作员可以：

- **PR 评审**：先对照 PR 描述建立改动地图，再按正确性、测试、安全、可维护性逐处核对差异；每条意见带文件行号与依据，分为阻断、建议、提问三档，风格偏好一律归建议；结论只给「建议批准 / 建议请求变更 / 需人工复核」之一
- **发布说明**：从已合并 PR 或提交记录归类为不兼容变更、安全、新增、变更、修复、弃用、移除，每条附来源编号；不兼容变更附迁移文档中的升级步骤，安全条目不写利用细节；纯内部条目与回滚配对移到核对表；版本号与变更性质不相称时列入待你决策
- **Issue 分诊**：逐条判定类型、优先级建议、缺失信息与疑似重复（附比对理由），并起草只针对缺失项的追问；疑似安全问题提示你走事件流程，不在分诊表中展开复现细节
- **安全修复验证与安全设计评审**（在对话中使用，无任务模板）：核对修复差异是否覆盖原发现的入口点与利用条件；按 OWASP ASVS 5.0.0 章节评审设计文档；两者结论与 PR 评审的阻断、提问对应

After you upload files, the code review collaborator can:

- **PR review**: build a change map against the PR description, then check the diff for correctness, tests, security and maintainability; every comment carries file, line and evidence and is graded blocking, suggestion or question, with style preferences always as suggestions; the conclusion is one of "suggest approve", "suggest request changes" or "needs manual review"
- **Release notes**: sort merged PRs or commits into breaking changes, security, added, changed, fixed, deprecated and removed, each with its source reference; breaking changes carry upgrade steps from the migration doc, security items omit exploit details; internal-only entries and revert pairs go to a check table; a version number that does not match the nature of the changes is left for your decision
- **Issue triage**: classify each issue by type, suggested priority, missing information and suspected duplicates (with reasons), and draft follow-up questions limited to what is missing; suspected security issues are flagged for your incident process without reproduction details in the triage table
- **Security fix verification and design review** (use in conversation, no task template): check whether a fix diff covers the original finding's entry points and exploit conditions; review design documents against OWASP ASVS 5.0.0 chapters; both map onto blocking items and questions in PR review

---

## 还需你提供 / What you need to provide

- **文件**：PR 差异（unified diff 或补丁）与描述、版本区间内的已合并 PR 列表或提交记录、迁移文档、Issue 文本与近期 Issue 列表、原始安全发现、设计文档或 API 契约。岗位不会主动访问本次工作未提供的仓库、分支、CI 日志或聊天记录。
- **说明**：基准与目标提交、团队评审规范、优先级定义、读者类型、组件关注人对照表（如有）。

- **Files**: PR diffs (unified diff or patch) and descriptions, merged PR lists or commit logs for the release range, migration docs, issue text and a recent issue list, original security findings, design documents or API contracts. The role will not access repositories, branches, CI logs or chats you did not provide for the task.
- **Context**: base and head commits, team review guidelines, priority definitions, target readers, and a component owner table if you have one.

---

## 会请求的权限 / Permissions

本方案第一版仅需要**读取你上传的文件**，不请求任何写权限、外部 API 或账号连接；不运行差异中的代码、测试或脚本，不安装依赖。

以下动作岗位不会代你执行，只出草案并停下等待你确认后由你操作：在 PR 或 Issue 上发表评论或追问；标记批准或请求变更；合并、关闭或重新打开 PR 与 Issue，修改标签、指派人或里程碑；推送提交、创建标签、发布版本或触发部署；把代码片段上传到外部服务；在意见中涉及贡献者个人评价。

This first version only needs to **read the files you upload**; it requests no write access, external APIs or account connections, and it never runs code, tests or scripts from the diff or installs dependencies.

The role never does the following for you; it drafts and stops for your confirmation, and you carry it out: posting comments or follow-up questions on PRs or issues; approving or requesting changes; merging, closing or reopening PRs and issues, or changing labels, assignees or milestones; pushing commits, creating tags, publishing releases or triggering deployments; uploading code snippets to external services; commenting on contributors personally.

---

## 推荐搭配 / Recommended pairings

以下连接器与技能为**可选**，未在本包中声明，需要你另行添加、授权并配置：

- **连接器**：GitHub（`teloa.mcp-github`）用于读取 PR、提交与 Issue；Linear（`teloa.mcp-linear`）用于读取 Issue；Greptile（`teloa.mcp-greptile`）用于代码库检索；Context7（`teloa.mcp-context7`）与 DeepWiki（`teloa.mcp-deepwiki`）用于查阅库与仓库文档。以上均为海外服务；GitHub、Linear、Greptile 需密钥，Context7 与 DeepWiki 无需密钥。向代码检索或文档服务发送代码片段前岗位会先请你确认。
- **技能**：`openclaw.github`（需 gh CLI）、`anthropic.mcp-builder`、上游 `ivangdavila.git`。

The following connectors and skills are **optional**, not declared in this package, and must be added, authorized and configured separately:

- **Connectors**: GitHub (`teloa.mcp-github`) to read PRs, commits and issues; Linear (`teloa.mcp-linear`) to read issues; Greptile (`teloa.mcp-greptile`) for codebase search; Context7 (`teloa.mcp-context7`) and DeepWiki (`teloa.mcp-deepwiki`) for library and repository docs. All are overseas services; GitHub, Linear and Greptile require credentials, Context7 and DeepWiki do not. The role asks for your confirmation before sending code snippets to search or documentation services.
- **Skills**: `openclaw.github` (requires the gh CLI), `anthropic.mcp-builder`, and upstream `ivangdavila.git`.

---

## 已验证范围 / Verified scope

- 尚未真实模型验收：三个任务模板（PR 评审、发布说明、Issue 分诊）的合成样例与期望产出见 `examples/`，兼容状态为 `content-only`，待隔离宿主真实模型验收后更新；安全修复验证与安全设计评审两项技能沿用 teloa.appsec 的方法，本方案未单独提供样例
- 连接器与技能搭配未做端到端验收

- Not yet verified with a real model: synthetic samples and expected outputs for the three task templates (PR review, release notes, issue triage) are in `examples/`; compatibility is `content-only` until real-model acceptance on an isolated host; the security fix verification and design review skills reuse the teloa.appsec methods and have no separate samples in this package
- Connector and skill pairings have not been verified end to end

---

## 不包含 / Not included

- 在 PR 或 Issue 上代为发表评论、批准或请求变更
- 合并、推送、打标签、发版或触发部署
- 关闭 Issue 或修改标签、指派人、里程碑
- 运行代码、测试、脚本或安装依赖；动态安全测试
- 对贡献者的个人评价或责任归因

- Posting comments, approving or requesting changes on PRs or issues on your behalf
- Merging, pushing, tagging, releasing or triggering deployments
- Closing issues or changing labels, assignees or milestones
- Running code, tests or scripts, installing dependencies, or dynamic security testing
- Personal evaluation of or blame on contributors

---

*版本 1.0.0 | Apache-2.0 | Teloa 官方内容*
