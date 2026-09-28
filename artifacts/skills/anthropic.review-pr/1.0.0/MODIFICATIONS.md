# MODIFICATIONS — 二次开发修改记录 / Record of modifications

本目录内容二次开发自 `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2`（路径 `plugins/pr-review-toolkit/`，Apache-2.0，许可原件随附为根目录 `LICENSE`，未改；上游仓库与该插件目录都没有 NOTICE 文件）。
This directory is a derived work of `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2` (path `plugins/pr-review-toolkit/`, Apache-2.0; the original license is shipped unchanged as `LICENSE`; neither the upstream repository nor the plugin directory has a NOTICE file).

## 原版文件 / Original files

| 原版路径 / Original path | Git blob | 字节 / Bytes | SHA-256 | 本资源 / In this resource |
| --- | --- | --- | --- | --- |
| `plugins/pr-review-toolkit/LICENSE` | `d645695673349e3947e8e5ae42332d0ac3164cd7` | 11358 | `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30` | unchanged |
| `plugins/pr-review-toolkit/commands/review-pr.md` | `021234cf7ac8c49964552b50650428727ea891a7` | 4997 | `5e70c17293a044e1bf9d092c80b5da8b4fd5802ebb07dc53993dec4ba7ce2fc4` | removed (RPR-M01) |
| `plugins/pr-review-toolkit/agents/code-reviewer.md` | `834b70c21f1f1bd4d01b8025bc830bf00887f2e7` | 3635 | `019395c3ce457460115cc703e2f4a86fed4bbe560dc58355051c4d877155d366` | modified |
| `plugins/pr-review-toolkit/agents/comment-analyzer.md` | `41ab074f50953c1f0fed5cf1972c9d2f36a97b31` | 4925 | `4a9c1f2eb8234a4b9231983e75739663d512e1aed242388964a165a719b84698` | modified |
| `plugins/pr-review-toolkit/agents/pr-test-analyzer.md` | `05b342b9175af85c5d7404bac67f5c62da375aa2` | 4560 | `fcb1cde9ba7b21694b508766a8d6a79bc91bed9982f828f816210059934f46b4` | modified |
| `plugins/pr-review-toolkit/agents/silent-failure-hunter.md` | `b8a8dfa41e18ef6ac801ae64be38b2508aa04f44` | 7807 | `fa9b0daec5a267e7e66435cc48b3328301fc9f70c3af259fe248881327a1babc` | modified |
| `plugins/pr-review-toolkit/agents/type-design-analyzer.md` | `9c17fec6b276cbe42f80b5e96e21e016b59c8e06` | 4999 | `c1cf67843d3c4fd27ddf6b24aa92521414b16c01610e7f7e87212c7b8681198d` | modified |
| `plugins/pr-review-toolkit/agents/code-simplifier.md` | `89a01c0b972f99fb33515de5f1e9ef1613dd9381` | 5292 | `976ddb22b84bc5a714216531a75db5e73169554add6b953442beeedb49b56891` | removed (RPR-M02) |

随附文件 / Shipped files: `LICENSE`、`SKILL.md`、`agents/code-reviewer.md`、`agents/comment-analyzer.md`、`agents/pr-test-analyzer.md`、`agents/silent-failure-hunter.md`、`agents/type-design-analyzer.md`、`MODIFICATIONS.md`。

分类定义见 Teloa 市场仓 `CONTRIBUTING.md`「二次开发资源」一节，七类互斥、按 `security > fixed > removed > adapted > added > improved > localized` 取一类；机器可读版本见市场目录条目的 `derivation.changes`，验证记录见市场仓 `reviews/derivatives/anthropic.review-pr@1.0.0.json`。
Categories follow the "Derived resources" section of the Teloa marketplace `CONTRIBUTING.md`; the machine-readable list is the catalog entry's `derivation.changes`, and the verification record is `reviews/derivatives/anthropic.review-pr@1.0.0.json` in the marketplace repository.

共 16 条 / 16 changes: security 0、fixed 3、removed 2、adapted 9、added 1、improved 1、localized 0。

## fixed

### RPR-M07

- type: `fixed`
- path: `SKILL.md` (step 3 (L31); Tips (L151))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/commands/review-pr.md`
- summary (zh-CN): 「Run `git diff --name-only`」改为 `git status --porcelain=v1 -uall` 加 `git diff HEAD --name-only`，并完整阅读新文件；写明只用 `git diff --name-only` 会漏掉已暂存改动与新文件。Tips 里「Agents analyze git diff by default」同步改为默认审查全部未提交改动。
- summary (en): "Run `git diff --name-only`" becomes `git status --porcelain=v1 -uall` plus `git diff HEAD --name-only`, reading new files in full; it notes that `git diff --name-only` alone misses staged changes and new files. The tip "Agents analyze git diff by default" now says the passes review every uncommitted change by default.
- reason (zh-CN): 原版的工作流写着「Stage all changes」后再审查，而 `git diff --name-only` 恰好不列已暂存的改动。已在示例仓库复现：一处已暂存（含静默吞掉异常的改动）、一处未暂存、一个新文件时，原命令只列出 1 个文件，新写法列出 3 个。
- reason (en): The original workflow says to "Stage all changes" before reviewing, and `git diff --name-only` does not list staged changes. Reproduced on a sample repository: with one staged change (including a swallowed exception), one unstaged edit and one new file, the original command lists 1 file and the new commands list all 3.

### RPR-M10

- type: `fixed`
- path: `agents/code-reviewer.md` (Review Scope (L21))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/agents/code-reviewer.md`
- summary (zh-CN): 默认审查范围从「`git diff` 的未暂存改动」改为全部未提交改动：`git diff HEAD`（已暂存与未暂存）加上 `git status --porcelain=v1 -uall` 列出的新文件（逐个完整阅读），并写明只用 `git diff` 会漏掉已暂存改动与新文件。
- summary (en): The default review scope changes from "unstaged changes from `git diff`" to every uncommitted change: `git diff HEAD` (staged and unstaged) plus the new files listed by `git status --porcelain=v1 -uall`, each read in full; it notes that `git diff` alone misses staged changes and new files.
- reason (zh-CN): `git diff` 只比较工作区与暂存区，已暂存的改动与未跟踪的新文件都不在其中；功能开发刚新建的文件、准备提 PR 前已 `git add` 的改动因此不会被审查。已在临时仓库复现：一处未暂存、一处已暂存、一个新文件时，`git diff --name-only` 只列出 1 个文件，新写法列出 3 个。
- reason (en): `git diff` compares the working tree with the index, so staged changes and untracked new files are not in it; files just created by a feature and changes already added with `git add` before a PR are never reviewed. Reproduced in a scratch repository: with one unstaged edit, one staged file and one new file, `git diff --name-only` lists 1 file and the new commands list all 3.

### RPR-M15

- type: `fixed`
- path: `agents/silent-failure-hunter.md` (L39, L41, L94, Special Considerations (L123-129))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/agents/silent-failure-hunter.md`
- summary (zh-CN): 删除写死的项目事实：「logError for production issues」「error ID from constants/errorIds.ts for Sentry tracking」「Use proper error IDs for Sentry tracking」，以及 Special Considerations 里「This project has specific logging functions: logForDebugging、logError (Sentry)、logEvent (Statsig)」「Error IDs should come from constants/errorIds.ts」；改为先从项目规范文件与周边代码找出它自己的日志、错误上报与错误编号约定并据此检查，找不到时按通用原则判断并说明未发现项目约定。
- summary (en): Removes hard-coded project facts: "logError for production issues", "error ID from constants/errorIds.ts for Sentry tracking", "Use proper error IDs for Sentry tracking", and the Special Considerations lines "This project has specific logging functions: logForDebugging, logError (Sentry), logEvent (Statsig)" and "Error IDs should come from constants/errorIds.ts". Instead the reviewer finds the project's own logging, error-reporting and error-ID conventions in its guideline files and surrounding code and checks against them; if there are none, it judges by the general principles and says no project convention was found.
- reason (zh-CN): 这些是某一个特定代码库的约定，原文却以「This project has…」陈述为被审查项目的事实。在其他项目上会要求不存在的文件与函数，把正确的错误处理误报为缺陷。示例仓库（日志用 `log.exception`、没有 errorIds.ts 与 Sentry）即属此类。
- reason (en): These are the conventions of one particular codebase, yet the text states them as facts about the reviewed project ("This project has…"). On any other project it demands files and functions that do not exist and reports correct error handling as defects. The sample repository (logging via `log.exception`, no errorIds.ts, no Sentry) is such a case.

## removed

### RPR-M01

- type: `removed`
- path: `commands/review-pr.md`
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/commands/review-pr.md`
- summary (zh-CN): 原版 Claude Code 斜杠命令文件不随附；其正文改写为资源根目录的 SKILL.md（逐处改动见本清单其余各条）。
- summary (en): The original Claude Code slash-command file is not shipped; its text is rewritten as SKILL.md at the resource root (each change is listed in the other entries).
- reason (zh-CN): Teloa 按技能加载 SKILL.md，不支持 Claude Code 的命令文件格式（`allowed-tools`、`argument-hint`、`$ARGUMENTS`）。
- reason (en): Teloa loads skills from SKILL.md and does not support the Claude Code command format (`allowed-tools`, `argument-hint`, `$ARGUMENTS`).

### RPR-M02

- type: `removed`
- path: `agents/code-simplifier.md`
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/agents/code-simplifier.md`
- summary (zh-CN): 不随附 code-simplifier 角色；SKILL.md 的审查维度去掉 `simplify`，改为提示需要时另用 `hermes.simplify-code` 技能并逐处确认改动。
- summary (en): The code-simplifier role is not shipped; SKILL.md drops the `simplify` aspect and points to the separate `hermes.simplify-code` skill, with the user confirming each edit.
- reason (zh-CN): 该角色会直接改代码，且要求「无需明确请求、写完代码立即自动精简」，与 Teloa「写操作须本人确认」不符；其「项目规范」写死了某个项目的约定（ES modules、function 关键字、React Props 类型等）当作普遍规则。本技能定位为只读审查，Teloa 市场已有 hermes.simplify-code 覆盖改代码的精简。
- reason (en): The role edits code and is told to act "autonomously and proactively ... without requiring explicit requests", which conflicts with Teloa's rule that writes need the person's confirmation; its "project standards" hard-code one project's conventions (ES modules, the function keyword, React Props types) as general rules. This skill is a read-only review, and the Teloa marketplace already has hermes.simplify-code for code-editing simplification.

## adapted

### RPR-M03

- type: `adapted`
- path: `SKILL.md` (frontmatter (L1-5))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/commands/review-pr.md`
- summary (zh-CN): frontmatter 改为只有 `name: review-pr` 与单行 `description`（写明只读、不评论不批准不合并）；删除 `allowed-tools` 与 `argument-hint`。
- summary (en): The frontmatter keeps only `name: review-pr` and a single-line `description` (read-only; never comments, approves or merges); `allowed-tools` and `argument-hint` are removed.
- reason (zh-CN): Teloa 市场的技能 frontmatter 只允许单行 name 与 description；工具权限由宿主与岗位授权管理，不认 Claude Code 的 allowed-tools。
- reason (en): Skills in the Teloa marketplace may only have single-line name and description frontmatter keys; tool permissions come from the host and role grants, not from Claude Code's allowed-tools.

### RPR-M04

- type: `adapted`
- path: `SKILL.md` (below the title)
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/commands/review-pr.md`
- summary (zh-CN): 在标题下方加一行可见的修改声明「Derived work: modified by Teloa from anthropics/claude-plugins-official@fa59bc90…」，写明原版文件路径与许可，并指向 MODIFICATIONS.md。
- summary (en): Adds a visible change notice below the title, "Derived work: modified by Teloa from anthropics/claude-plugins-official@fa59bc90…", naming the original file and license and pointing to MODIFICATIONS.md.
- reason (zh-CN): Apache-2.0 第 4(b) 条要求改过的文件带显著的修改声明；用可见正文而不是 HTML 注释，避免隐藏注释被安全扫描当作可疑内容。
- reason (en): Apache-2.0 section 4(b) requires modified files to carry a prominent change notice; visible text is used instead of an HTML comment, which security scans would flag as hidden content.

### RPR-M05

- type: `adapted`
- path: `SKILL.md` (Working rules (new); L12, L45-56, L90-114, L116-146, L184-190)
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/commands/review-pr.md`
- summary (zh-CN): 「Launch Review Agents」改为按随附的 `agents/*.md` 角色说明做各专项：宿主允许一次性委派（如 subagent_task）时交给只读子任务，否则自己依次完成；`$ARGUMENTS` 改为用户点名的维度；用法示例由 `/pr-review-toolkit:review-pr …` 改为自然语言请求；删去「Agents use appropriate models」「/agents list」；把「Agent Descriptions」改为「Pass Descriptions」，code-reviewer 一行由 CLAUDE.md 改为项目规范文件。
- summary (en): "Launch Review Agents" becomes specialist passes that follow the shipped `agents/*.md` role files: delegated to read-only subtasks when the host allows one-off delegation (such as subagent_task), otherwise run in turn; `$ARGUMENTS` becomes the aspects the user names; usage examples change from `/pr-review-toolkit:review-pr …` to plain requests; "Agents use appropriate models" and "/agents list" are removed; "Agent Descriptions" becomes "Pass Descriptions" and the code-reviewer line refers to the project's guideline files instead of CLAUDE.md.
- reason (zh-CN): Teloa 没有 Claude Code 的 Task 工具与插件注册的命名子代理；AI 同事能否委派取决于岗位是否授予一次性委派工具（subagent_task），所以按「可委派就委派、否则自己依次完成」写，并去掉模型档位，按宿主已配置的模型运行。
- reason (en): Teloa has no Claude Code Task tool and no plugin-registered named subagents; whether an AI colleague can delegate depends on whether its role was granted the one-off delegation tool (subagent_task), so the text says to delegate when possible and otherwise work in turn, and drops model tiers in favour of the host's configured model.

### RPR-M06

- type: `adapted`
- path: `SKILL.md` (Working rules (new); step 3 (L32))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/commands/review-pr.md`
- summary (zh-CN): 新增只读边界：只用 read、glob、grep 与只读 Git 命令，从不改文件、暂存、提交、推送、评论、批准或合并；「Check if PR already exists: gh pr view」改为：只有用户要求审查远程 PR 且 GitHub CLI 已安装并登录时才用 `gh pr view` / `gh pr diff` 读取，否则请用户提供差异；审查分支时与用户指定的基线比较。
- summary (en): Adds the read-only boundary: only read, glob, grep and read-only Git commands; never edit files, stage, commit, push, comment, approve or merge. "Check if PR already exists: gh pr view" becomes: use `gh pr view` / `gh pr diff` only when the user asked to review a remote pull request and GitHub CLI is installed and signed in, otherwise ask for the diff; a branch is compared with the base the user names.
- reason (zh-CN): 原版命令的 allowed-tools 放开了 Bash，且各审查角色未限定工具（继承包括写文件在内的全部工具）；Teloa 的写操作须本人确认，审查技能应当只读。gh 需要联网与账号授权，不应默认调用。
- reason (en): The original command allows Bash and the review roles have no tool list (they inherit every tool, including file writes); in Teloa writes need the person's confirmation and a review skill should be read-only. gh needs network access and an account, so it should not run by default.

### RPR-M11

- type: `adapted`
- path: `agents/code-reviewer.md` (frontmatter (L1-6); L8, L25, L36, L39, L49)
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/agents/code-reviewer.md`
- summary (zh-CN): 把 Claude Code 子代理定义改成随技能附带的角色说明：删除 frontmatter（name、description 及其中的 tools、model、color 字段），改为标题、修改声明、一行「Role」（取原 description，去掉面向 Claude Code 的调用示例）和一行「Tools」：只读，只用 read、glob、grep，另可用 bash 执行只读的 git status / diff / log / show，不写文件、不联网检索；正文里把「CLAUDE.md」改为项目规范文件（AGENTS.md、CLAUDE.md、CONTRIBUTING.md 或同类文件）。
- summary (en): Turns the Claude Code subagent definition into a role file shipped with the skill: the frontmatter (name, description and any tools, model or color fields) is replaced by a title, the change notice, a "Role" line (from the original description, without the Claude Code invocation examples) and a "Tools" line: read-only, `read`, `glob` and `grep` only, plus `bash` for read-only git status / diff / log / show, no file writes, no web fetch or search; the body replaces "CLAUDE.md" with the project's guideline files (AGENTS.md, CLAUDE.md, CONTRIBUTING.md or equivalent).
- reason (zh-CN): Teloa 不认 Claude Code 的子代理 frontmatter 与模型档位（sonnet/opus），也没有 KillShell、BashOutput、NotebookRead 等工具名；技能正文让主会话在可委派时把角色说明交给一次性子任务，否则自己按角色说明依次完成。分析角色读的是不可信的仓库内容，而 Teloa 的 web_fetch/web_search 没有逐次确认，所以只读角色不再带联网工具。原版未列工具，会继承包括写文件在内的全部工具；CLAUDE.md 是 Claude Code 的约定。
- reason (en): Teloa does not read Claude Code subagent frontmatter or model tiers (sonnet/opus), and has no KillShell, BashOutput or NotebookRead tools; the skill hands the role file to a one-off delegated subtask when the host allows it, otherwise the main session follows it in turn. Analysis roles read untrusted repository content and Teloa's web_fetch/web_search run without per-call confirmation, so the read-only roles no longer carry web tools. The original lists no tools and so inherits every tool, including file writes; CLAUDE.md is a Claude Code convention.

### RPR-M12

- type: `adapted`
- path: `agents/comment-analyzer.md` (frontmatter (L1-6))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/agents/comment-analyzer.md`
- summary (zh-CN): 把 Claude Code 子代理定义改成随技能附带的角色说明：删除 frontmatter（name、description 及其中的 tools、model、color 字段），改为标题、修改声明、一行「Role」（取原 description，去掉面向 Claude Code 的调用示例）和一行「Tools」：只读，只用 read、glob、grep，不运行命令，不写文件、不联网检索；正文未改。
- summary (en): Turns the Claude Code subagent definition into a role file shipped with the skill: the frontmatter (name, description and any tools, model or color fields) is replaced by a title, the change notice, a "Role" line (from the original description, without the Claude Code invocation examples) and a "Tools" line: read-only, `read`, `glob` and `grep` only and no commands, no file writes, no web fetch or search; the body is unchanged.
- reason (zh-CN): Teloa 不认 Claude Code 的子代理 frontmatter 与模型档位（sonnet/opus），也没有 KillShell、BashOutput、NotebookRead 等工具名；技能正文让主会话在可委派时把角色说明交给一次性子任务，否则自己按角色说明依次完成。分析角色读的是不可信的仓库内容，而 Teloa 的 web_fetch/web_search 没有逐次确认，所以只读角色不再带联网工具。原版未列工具，会继承包括写文件在内的全部工具，与其「只提供反馈、不直接修改」的要求不一致。
- reason (en): Teloa does not read Claude Code subagent frontmatter or model tiers (sonnet/opus), and has no KillShell, BashOutput or NotebookRead tools; the skill hands the role file to a one-off delegated subtask when the host allows it, otherwise the main session follows it in turn. Analysis roles read untrusted repository content and Teloa's web_fetch/web_search run without per-call confirmation, so the read-only roles no longer carry web tools. The original lists no tools and so inherits every tool, including file writes, which contradicts its own "analyze and provide feedback only" rule.

### RPR-M13

- type: `adapted`
- path: `agents/pr-test-analyzer.md` (frontmatter (L1-6); L71)
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/agents/pr-test-analyzer.md`
- summary (zh-CN): 把 Claude Code 子代理定义改成随技能附带的角色说明：删除 frontmatter（name、description 及其中的 tools、model、color 字段），改为标题、修改声明、一行「Role」（取原 description，去掉面向 Claude Code 的调用示例）和一行「Tools」：只读，只用 read、glob、grep，不运行命令，不写文件、不联网检索；正文里把「CLAUDE.md」改为项目规范文件（AGENTS.md、CLAUDE.md、CONTRIBUTING.md 或同类文件）。
- summary (en): Turns the Claude Code subagent definition into a role file shipped with the skill: the frontmatter (name, description and any tools, model or color fields) is replaced by a title, the change notice, a "Role" line (from the original description, without the Claude Code invocation examples) and a "Tools" line: read-only, `read`, `glob` and `grep` only and no commands, no file writes, no web fetch or search; the body replaces "CLAUDE.md" with the project's guideline files (AGENTS.md, CLAUDE.md, CONTRIBUTING.md or equivalent).
- reason (zh-CN): Teloa 不认 Claude Code 的子代理 frontmatter 与模型档位（sonnet/opus），也没有 KillShell、BashOutput、NotebookRead 等工具名；技能正文让主会话在可委派时把角色说明交给一次性子任务，否则自己按角色说明依次完成。分析角色读的是不可信的仓库内容，而 Teloa 的 web_fetch/web_search 没有逐次确认，所以只读角色不再带联网工具。原版未列工具，会继承包括写文件在内的全部工具；CLAUDE.md 是 Claude Code 的约定。
- reason (en): Teloa does not read Claude Code subagent frontmatter or model tiers (sonnet/opus), and has no KillShell, BashOutput or NotebookRead tools; the skill hands the role file to a one-off delegated subtask when the host allows it, otherwise the main session follows it in turn. Analysis roles read untrusted repository content and Teloa's web_fetch/web_search run without per-call confirmation, so the read-only roles no longer carry web tools. The original lists no tools and so inherits every tool, including file writes; CLAUDE.md is a Claude Code convention.

### RPR-M14

- type: `adapted`
- path: `agents/type-design-analyzer.md` (frontmatter (L1-6))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/agents/type-design-analyzer.md`
- summary (zh-CN): 把 Claude Code 子代理定义改成随技能附带的角色说明：删除 frontmatter（name、description 及其中的 tools、model、color 字段），改为标题、修改声明、一行「Role」（取原 description，去掉面向 Claude Code 的调用示例）和一行「Tools」：只读，只用 read、glob、grep，不运行命令，不写文件、不联网检索；正文未改。
- summary (en): Turns the Claude Code subagent definition into a role file shipped with the skill: the frontmatter (name, description and any tools, model or color fields) is replaced by a title, the change notice, a "Role" line (from the original description, without the Claude Code invocation examples) and a "Tools" line: read-only, `read`, `glob` and `grep` only and no commands, no file writes, no web fetch or search; the body is unchanged.
- reason (zh-CN): Teloa 不认 Claude Code 的子代理 frontmatter 与模型档位（sonnet/opus），也没有 KillShell、BashOutput、NotebookRead 等工具名；技能正文让主会话在可委派时把角色说明交给一次性子任务，否则自己按角色说明依次完成。分析角色读的是不可信的仓库内容，而 Teloa 的 web_fetch/web_search 没有逐次确认，所以只读角色不再带联网工具。原版未列工具，会继承包括写文件在内的全部工具。
- reason (en): Teloa does not read Claude Code subagent frontmatter or model tiers (sonnet/opus), and has no KillShell, BashOutput or NotebookRead tools; the skill hands the role file to a one-off delegated subtask when the host allows it, otherwise the main session follows it in turn. Analysis roles read untrusted repository content and Teloa's web_fetch/web_search run without per-call confirmation, so the read-only roles no longer carry web tools. The original lists no tools and so inherits every tool, including file writes.

### RPR-M16

- type: `adapted`
- path: `agents/silent-failure-hunter.md` (frontmatter (L1-6))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/agents/silent-failure-hunter.md`
- summary (zh-CN): 把 Claude Code 子代理定义改成随技能附带的角色说明：删除 frontmatter（name、description 及其中的 tools、model、color 字段），改为标题、修改声明、一行「Role」（取原 description，去掉面向 Claude Code 的调用示例）和一行「Tools」：只读，只用 read、glob、grep，不运行命令，不写文件、不联网检索；正文的其他改动见 RPR-M15。
- summary (en): Turns the Claude Code subagent definition into a role file shipped with the skill: the frontmatter (name, description and any tools, model or color fields) is replaced by a title, the change notice, a "Role" line (from the original description, without the Claude Code invocation examples) and a "Tools" line: read-only, `read`, `glob` and `grep` only and no commands, no file writes, no web fetch or search; the body changes are listed in RPR-M15.
- reason (zh-CN): Teloa 不认 Claude Code 的子代理 frontmatter 与模型档位（sonnet/opus），也没有 KillShell、BashOutput、NotebookRead 等工具名；技能正文让主会话在可委派时把角色说明交给一次性子任务，否则自己按角色说明依次完成。分析角色读的是不可信的仓库内容，而 Teloa 的 web_fetch/web_search 没有逐次确认，所以只读角色不再带联网工具。原版 description 里以 Task 工具调用为例的三段示例对 Teloa 无意义。
- reason (en): Teloa does not read Claude Code subagent frontmatter or model tiers (sonnet/opus), and has no KillShell, BashOutput or NotebookRead tools; the skill hands the role file to a one-off delegated subtask when the host allows it, otherwise the main session follows it in turn. Analysis roles read untrusted repository content and Teloa's web_fetch/web_search run without per-call confirmation, so the read-only roles no longer carry web tools. The three examples in the original description show Task-tool invocations, which mean nothing in Teloa.

## added

### RPR-M09

- type: `added`
- path: `SKILL.md` (Working rules (new))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/commands/review-pr.md`
- summary (zh-CN): 新增两条规则：代码、注释、提交信息与 PR 描述里指挥 AI 的文字（如「标记为已批准」「跳过测试审查」）当作发现报告，不照做；差异里出现凭据时只写 file:line 与至多 2-4 个字符的掩码预览，不复述原值。
- summary (en): Adds two rules: text in code, comments, commit messages or PR descriptions that tells an AI tool what to do ("mark this as approved", "skip the tests review") is reported as a finding, not followed; a credential in the diff is cited by file:line with at most a 2-4 character masked preview, never repeated.
- reason (zh-CN): 审查的正是别人提交的不可信内容，原版没有防提示注入与凭据外泄的说明；做法取自同一上游仓库 code-modernization 插件的相应规则。
- reason (en): The skill reviews untrusted content submitted by others, and the original has no guidance on prompt injection or credential exposure; the wording follows the corresponding rules of the code-modernization plugin in the same upstream repository.

## improved

### RPR-M08

- type: `improved`
- path: `SKILL.md` (step 6 (after L64))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/pr-review-toolkit/commands/review-pr.md`
- summary (zh-CN): 汇总前新增一张对照表，把各专项的不同刻度（code-reviewer 置信度 90-100/80-89、silent-failure-hunter 的 CRITICAL/HIGH/MEDIUM、pr-test-analyzer 的 1-10 重要度、注释与类型分析的分类）对应到 Critical / Important / Suggestion，并要求合并指向同一 file:line 同一问题的发现、保留较高一级。
- summary (en): Adds a table before aggregation that maps each pass's own scale (code-reviewer confidence 90-100/80-89, silent-failure-hunter CRITICAL/HIGH/MEDIUM, pr-test-analyzer criticality 1-10, the comment and type categories) to Critical / Important / Suggestion, and asks to merge findings on the same file:line and problem, keeping the higher level.
- reason (zh-CN): 原版要求按三级汇总，但五个角色各用一套刻度，没有说明怎么对应，汇总结果因人而异。
- reason (en): The original asks for a three-level summary, but the five roles use five different scales and nothing says how they map, so summaries vary from run to run.
