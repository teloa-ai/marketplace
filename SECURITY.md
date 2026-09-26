# Security Policy · 安全政策

[English](#english) · [中文](#中文)

## English

### Reporting a malicious or unsafe resource

Report privately. Do not open a public issue or pull request with details.

- Use GitHub private vulnerability reporting on this repository (**Security → Report a vulnerability**), or email [support@teloa.ai](mailto:support@teloa.ai).
- Include the entry ID and version, what is wrong (for example malicious instructions, credential exfiltration, a tampered upstream source, a hidden network call, a license violation that exposes users to legal risk), how to reproduce it, and whether you believe it is being exploited.

Non-security problems, such as a broken entry or wrong metadata, go to a normal issue. License disputes use the license-dispute issue template.

### What happens next

1. We confirm receipt, assess severity, and keep details private until a fix is published.
2. For a confirmed problem we take the entry down: its compatibility is set to `unsupported` or the entry is removed, the catalog version is bumped, and a newly signed index is published to market.teloa.ai. The Teloa app stops offering the entry once it adopts the new index or the next release snapshot.
3. The next Teloa release pins the corrected catalog. Versions users already installed are not changed automatically; the advisory tells users what to remove or update.
4. After the fix is published we record it in [CHANGELOG.md](CHANGELOG.md) and, where appropriate, publish a GitHub security advisory. We credit reporters who want to be credited.

Please give us a reasonable time to fix a problem before disclosing it publicly.

### What review does and does not mean

Entries are reviewed by hand and checked statically by `tools/validate.mjs`: structure, pinned digests, file types, sizes and license files. Artifacts never contain executable scripts, and CI never runs code from a submission. "Official" means the Teloa catalog reviewed this version; it is not a security certification. Connectors and upstream content can still reach third-party services under their own terms.

### Supported versions

Only the current `main` branch of this repository and the catalog snapshot pinned in the latest Teloa release receive fixes.

## 中文

### 报告恶意或不安全的资源

请私下报告，不要在公开 Issue 或 PR 里披露细节。

- 使用本仓库的 GitHub 私密漏洞报告（**Security → Report a vulnerability**），或发邮件至 [support@teloa.ai](mailto:support@teloa.ai)。
- 请写明条目 ID 与版本、问题是什么（例如恶意指令、外传凭据、上游来源被篡改、隐藏的网络调用、会让用户承担法律风险的许可违规）、如何复现，以及是否已被利用。

非安全问题（例如条目不可用、元数据错误）请提普通 Issue；许可争议请用「许可争议」Issue 模板。

### 处理流程

1. 收到后确认收悉并评估严重程度，修复发布前不对外公开细节。
2. 确认有问题的条目会下架：兼容状态改为 `unsupported` 或直接移除条目，递增目录版本，并向 market.teloa.ai 发布重新签名的索引。Teloa 应用采用新索引或下一发行快照后不再提供该条目。
3. 下一个 Teloa 发行固定修正后的目录。已安装的版本不会被自动改动，公告会说明需要移除或更新的内容。
4. 修复发布后在 [CHANGELOG.md](CHANGELOG.md) 记录，必要时发布 GitHub 安全公告。报告人愿意署名的，我们会致谢。

请在我们修复前给出合理时间，不要提前公开披露。

### 审核意味着什么

条目经人工审核，并由 `tools/validate.mjs` 做静态校验：结构、固定摘要、文件类型、大小与许可文件。工件不收录可执行脚本，CI 也从不执行投稿中的代码。「官方」只表示 Teloa 目录审核过这个版本，不是安全认证。连接器与上游内容仍可能按各自条款访问第三方服务。

### 支持的版本

只有本仓库当前 `main` 分支，以及最新 Teloa 发行中固定的目录快照会得到修复。
