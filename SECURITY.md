# Security Policy · 安全政策

[English](#english) · [中文](#中文)

## English

### Reporting a malicious or unsafe resource

Use a public [Issue](https://github.com/teloa-ai/marketplace/issues) by default, including for suspected malicious or unsafe resources. Identify the affected entry and version, describe the observed behavior without sensitive details, and link to existing public evidence or advisories.

- For a potentially high-impact issue, such as remote code execution, widespread credential exposure, or access to private user data, we recommend emailing [security@teloa.ai](mailto:security@teloa.ai) privately first. GitHub private vulnerability reporting (**Security → Report a vulnerability**) is also available. Email does not require a GitHub account.
- Keep live credentials, private data, and unpublished exploit instructions out of public issues and pull requests; send sanitized reproduction details through a private channel.
- Include the entry ID and version, the observed behavior (for example malicious instructions, credential exfiltration, a tampered upstream source, or a hidden network call), sanitized reproduction steps, and whether it is being exploited. Do not send live credentials or other people's private data.

Non-security problems, such as a broken entry or wrong metadata, go to a normal issue. License disputes use the license-dispute issue template.

### What happens next

1. We confirm receipt and assess severity. We coordinate disclosure of sensitive details with the reporter; necessary risk notices and mitigation advice can be published before a fix.
2. For a confirmed problem we take the entry down: its compatibility is set to `unsupported` or the entry is removed, the catalog version is bumped, and a newly signed index is published to market.teloa.ai. The Teloa app stops offering the entry once it adopts the new index or the next release snapshot.
3. The next Teloa release pins the corrected catalog. Versions users already installed are not changed automatically; the advisory tells users what to remove or update.
4. After the fix is published we record it in [CHANGELOG.md](CHANGELOG.md) and, where appropriate, publish a GitHub security advisory. We credit reporters who want to be credited.

The aim is to protect affected users while the problem is addressed. We coordinate a reasonable disclosure date with the reporter; this policy does not require indefinite secrecy or prevent public discussion of known risks and fixes.

### What review does and does not mean

Entries are reviewed by hand and checked statically by `tools/validate.mjs`: structure, pinned digests, file types, sizes and license files. Artifacts never contain executable scripts, and CI never runs code from a submission. "Official" means the Teloa catalog reviewed this version; it is not a security certification. Connectors and upstream content can still reach third-party services under their own terms.

### Supported versions

Only the current `main` branch of this repository and the catalog snapshot pinned in the latest Teloa release receive fixes.

## 中文

### 报告恶意或不安全的资源

默认通过公开 [Issue](https://github.com/teloa-ai/marketplace/issues) 报告，包括疑似恶意或不安全的资源。请注明受影响的条目与版本，描述不含敏感细节的可疑行为，并引用已有的公开证据或安全公告。

- 如果问题可能造成重大影响，例如远程执行代码、大范围凭据泄露或访问用户隐私，建议先私下发邮件至 [security@teloa.ai](mailto:security@teloa.ai)。也可使用本仓库的 GitHub 私密漏洞报告（**Security → Report a vulnerability**）。邮件报告不需要 GitHub 账号。
- 公开 Issue 或 PR 中不要放入真实凭据、隐私数据或尚未公开的漏洞利用步骤；脱敏后的复现细节可以通过私密渠道补充。
- 请写明条目 ID 与版本、观察到的行为（例如恶意指令、外传凭据、上游来源被篡改、隐藏的网络调用）、脱敏后的复现步骤，以及是否已被利用。不要发送真实有效的凭据或他人的隐私数据。

非安全问题（例如条目不可用、元数据错误）请提普通 Issue；许可争议请用「许可争议」Issue 模板。

### 处理流程

1. 收到后确认收悉并评估严重程度，与报告人协调敏感细节的披露；必要的风险提示与缓解建议可以在修复前公开。
2. 确认有问题的条目会下架：兼容状态改为 `unsupported` 或直接移除条目，递增目录版本，并向 market.teloa.ai 发布重新签名的索引。Teloa 应用采用新索引或下一发行快照后不再提供该条目。
3. 下一个 Teloa 发行固定修正后的目录。已安装的版本不会被自动改动，公告会说明需要移除或更新的内容。
4. 修复发布后在 [CHANGELOG.md](CHANGELOG.md) 记录，必要时发布 GitHub 安全公告。报告人愿意署名的，我们会致谢。

目的是在处理问题期间保护受影响的用户。我们会与报告人协调合理的披露时间，不要求无限期保密，也不限制对已知风险和修复结果的公开讨论。

### 审核意味着什么

条目经人工审核，并由 `tools/validate.mjs` 做静态校验：结构、固定摘要、文件类型、大小与许可文件。工件不收录可执行脚本，CI 也从不执行投稿中的代码。「官方」只表示 Teloa 目录审核过这个版本，不是安全认证。连接器与上游内容仍可能按各自条款访问第三方服务。

### 支持的版本

只有本仓库当前 `main` 分支，以及最新 Teloa 发行中固定的目录快照会得到修复。
