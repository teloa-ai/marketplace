# MODIFICATIONS — 二次开发修改记录 / Record of modifications

本目录内容二次开发自 `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2`（路径 `plugins/commit-commands/`，Apache-2.0，许可原件随附为根目录 `LICENSE`，未改；上游仓库与该插件目录都没有 NOTICE 文件）。
This directory is a derived work of `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2` (path `plugins/commit-commands/`, Apache-2.0; the original license is shipped unchanged as `LICENSE`; neither the upstream repository nor the plugin directory has a NOTICE file).

## 原版文件 / Original files

| 原版路径 / Original path | Git blob | 字节 / Bytes | SHA-256 | 本资源 / In this resource |
| --- | --- | --- | --- | --- |
| `plugins/commit-commands/LICENSE` | `d645695673349e3947e8e5ae42332d0ac3164cd7` | 11358 | `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30` | unchanged |
| `plugins/commit-commands/commands/commit.md` | `31ef0790b704d5197843d54bdf3efcd112c54137` | 624 | `d1acbc2bf0c50164f48d6bda872de6a343cd9390954ce903c3431c3119e7f8c4` | removed (CMT-M01) |

随附文件 / Shipped files: `LICENSE`、`SKILL.md`、`MODIFICATIONS.md`。

分类定义见 Teloa 市场仓 `CONTRIBUTING.md`「二次开发资源」一节，七类互斥、按 `security > fixed > removed > adapted > added > improved > localized` 取一类；机器可读版本见市场目录条目的 `derivation.changes`，验证记录见市场仓 `reviews/derivatives/anthropic.commit@1.0.0.json`。
Categories follow the "Derived resources" section of the Teloa marketplace `CONTRIBUTING.md`; the machine-readable list is the catalog entry's `derivation.changes`, and the verification record is `reviews/derivatives/anthropic.commit@1.0.0.json` in the marketplace repository.

共 8 条 / 8 changes: security 1、fixed 0、removed 1、adapted 4、added 1、improved 1、localized 0。

## security

### CMT-M06

- type: `security`
- path: `SKILL.md` (Boundary (new); Step 2 (new))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/commit-commands/commands/commit.md`
- summary (zh-CN): 新增暂存前的凭据检查：不纳入通常存放凭据的文件（`.env`/`.env.*`（模板除外）、`*.pem`、`*.key`、`*.p12`、`*.pfx`、私钥、`credentials.json`、服务账号 JSON、含令牌的 `.npmrc`/`.pypirc`/`.netrc` 等）；扫描拟提交内容里的私钥块、云访问密钥、`ghp_`/`github_pat_`/`xox`/`sk-` 类令牌与带字面值的 password/secret/token/api_key 赋值；发现时只报 file:line、类型与至多 2-4 字符掩码，不纳入该文件并交用户决定；已暂存的可疑文件建议 `git restore --staged`，经确认才执行。同时禁止 `git add -A`、`git add .`、`git commit -a`，只暂存明确路径。
- summary (en): Adds a credential check before staging: files that normally hold credentials are left out (`.env`/`.env.*` except templates, `*.pem`, `*.key`, `*.p12`, `*.pfx`, private keys, `credentials.json`, service-account JSON, `.npmrc`/`.pypirc`/`.netrc` with tokens, and similar); the text to be committed is scanned for private key blocks, cloud access keys, `ghp_`/`github_pat_`/`xox`/`sk-` tokens and password/secret/token/api_key assignments with literal values; a hit is reported by file:line, kind and at most a 2-4 character mask, the file is left out and the user decides; a suspicious staged file gets a proposed `git restore --staged`, run only after confirmation. `git add -A`, `git add .` and `git commit -a` are forbidden; only explicit paths are staged.
- reason (zh-CN): 原版预先放行任意参数的 `git add`，又要求一步完成暂存与提交、「不做任何其他事」，没有任何凭据检查；插件 README 声称「Avoids committing files with secrets (.env, credentials.json)」，命令正文却没有这项要求。已在示例仓库验证：没有 .gitignore 时，原版放行范围内的 `git add .` 会把含 AWS 示例密钥的 .env 纳入暂存区。
- reason (en): The original pre-approves `git add` with any arguments and asks for staging and committing in one step, "do not ... do anything else", with no credential check; the plugin README claims it "Avoids committing files with secrets (.env, credentials.json)", but the command text contains no such instruction. Verified on a sample repository: without a .gitignore, `git add .`, which the original pre-approves, stages a .env holding AWS's example key.

## removed

### CMT-M01

- type: `removed`
- path: `commands/commit.md`
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/commit-commands/commands/commit.md`
- summary (zh-CN): 原版 Claude Code 斜杠命令文件不随附；其正文改写为资源根目录的 SKILL.md（逐处改动见本清单其余各条）。
- summary (en): The original Claude Code slash-command file is not shipped; its text is rewritten as SKILL.md at the resource root (each change is listed in the other entries).
- reason (zh-CN): Teloa 按技能加载 SKILL.md，不支持 Claude Code 的命令文件格式（`allowed-tools` 与 `!` 命令展开）。
- reason (en): Teloa loads skills from SKILL.md and does not support the Claude Code command format (`allowed-tools` and `!` command expansion).

## adapted

### CMT-M02

- type: `adapted`
- path: `SKILL.md` (frontmatter (L1-4))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/commit-commands/commands/commit.md`
- summary (zh-CN): frontmatter 改为只有 `name: commit` 与单行 `description`（写明确认后才执行、不推送不修订不跳过钩子）；删除 `allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)`。
- summary (en): The frontmatter keeps only `name: commit` and a single-line `description` (runs only after confirmation; never pushes, amends or bypasses hooks); `allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)` is removed.
- reason (zh-CN): Teloa 市场的技能 frontmatter 只允许单行 name 与 description；Teloa 不认 Claude Code 的 allowed-tools 预授权，bash 由宿主确认。
- reason (en): Skills in the Teloa marketplace may only have single-line name and description frontmatter keys; Teloa does not honour Claude Code's allowed-tools pre-approval, and bash goes through the host's confirmation.

### CMT-M03

- type: `adapted`
- path: `SKILL.md` (below the title)
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/commit-commands/commands/commit.md`
- summary (zh-CN): 在标题下方加一行可见的修改声明「Derived work: modified by Teloa from anthropics/claude-plugins-official@fa59bc90…」，写明原版文件路径与许可，并指向 MODIFICATIONS.md。
- summary (en): Adds a visible change notice below the title, "Derived work: modified by Teloa from anthropics/claude-plugins-official@fa59bc90…", naming the original file and license and pointing to MODIFICATIONS.md.
- reason (zh-CN): Apache-2.0 第 4(b) 条要求改过的文件带显著的修改声明；用可见正文而不是 HTML 注释，避免隐藏注释被安全扫描当作可疑内容。
- reason (en): Apache-2.0 section 4(b) requires modified files to carry a prominent change notice; visible text is used instead of an HTML comment, which security scans would flag as hidden content.

### CMT-M04

- type: `adapted`
- path: `SKILL.md` (Context (L6-11))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/commit-commands/commands/commit.md`
- summary (zh-CN): 「!`git status`」等四行由 Claude Code 在加载时展开的命令，改为由模型自己运行的只读命令；`git status` 改为 `git status --porcelain=v1 -uall`（逐个列出新文件），`git diff HEAD` 补充仓库还没有提交时的替代写法。
- summary (en): The four "!`git status`"-style lines that Claude Code expands at load time become read-only commands the model runs itself; `git status` becomes `git status --porcelain=v1 -uall` (lists each new file), and `git diff HEAD` gets an alternative for repositories without commits yet.
- reason (zh-CN): Teloa 技能没有 `!` 命令展开；默认的 git status 会把未跟踪目录折叠成一行（如 `tests/`），看不到其中的新文件。
- reason (en): Teloa skills have no `!` command expansion; plain git status collapses an untracked directory into one line (such as `tests/`), hiding the new files inside.

### CMT-M05

- type: `adapted`
- path: `SKILL.md` (Boundary (new); Your task (L13-17); Steps 4-5 (new))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/commit-commands/commands/commit.md`
- summary (zh-CN): 删除「Stage and create the commit using a single message. Do not use any other tools or do anything else. Do not send any other text…」；改为先展示分支、要提交与未纳入的文件、凭据检查结果、完整提交信息与将执行的命令，等用户在对话中确认后才执行；「提交我的改动」这类请求只算开始准备，不算确认；用户改动方案需重新确认；无人值守的 AI 同事任务停在展示方案；列出不做的操作（推送、拉取、合并、变基、重置、储藏、修订、强推、建或切分支、改 Git 配置、--no-verify）。
- summary (en): Removes "Stage and create the commit using a single message. Do not use any other tools or do anything else. Do not send any other text…". Instead it first shows the branch, the files to commit and those left out, the credential check, the full message and the exact commands, and runs them only after the user confirms in the conversation; a request like "commit my changes" starts the preparation and is not that confirmation; a changed proposal needs a new confirmation; unattended AI colleague tasks stop at the proposal; and it lists what it never does (push, pull, merge, rebase, reset, stash, amend, force, create or switch branches, change Git configuration, --no-verify).
- reason (zh-CN): 原版在 Claude Code 里靠 allowed-tools 预先放行 git add 与 git commit，用户看不到将提交什么就已提交。Teloa 的写操作须本人确认，AI 同事不能自行提交。
- reason (en): In Claude Code the original pre-approves git add and git commit through allowed-tools, so a commit is made before the user sees what goes into it. In Teloa writes need the person's confirmation and AI colleagues cannot commit on their own.

## added

### CMT-M07

- type: `added`
- path: `SKILL.md` (Steps 1 and 5 (new))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/commit-commands/commands/commit.md`
- summary (zh-CN): 新增：优先用已暂存的内容，没有暂存时只提议属于同一逻辑改动的文件，其余列为「未纳入」并说明理由；纳入的新文件先完整阅读；没有可提交内容时说明并停止，不建空提交；提交钩子失败时停下报告，不用 --no-verify 重试、不修订；提交后报告新提交号与剩余未提交内容。
- summary (en): Adds: start from what is staged; with nothing staged, propose only the files of one logical change and list the rest as left out with a reason; read each new file before including it; with nothing to commit, say so and stop, never an empty commit; if a commit hook fails, stop and report, no --no-verify retry, no amend; afterwards report the new commit hash and anything left uncommitted.
- reason (zh-CN): 原版只说「根据上面的改动建一个提交」，没有说明挑选范围、空提交与钩子失败怎么处理（README 的排错一节提到了空提交问题）。
- reason (en): The original only says "create a single git commit" from the changes, with nothing on what to include, empty commits or failing hooks (the README's troubleshooting section mentions the empty-commit case).

## improved

### CMT-M08

- type: `improved`
- path: `SKILL.md` (Step 3 (new))
- upstream: `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2:plugins/commit-commands/commands/commit.md`
- summary (zh-CN): 新增起草提交信息的要求：按最近提交的风格（语言、`feat:`/`fix(scope):` 前缀、大小写、标题长度）写，说明为什么改而不只是改了什么；除非仓库惯例或用户要求，不加签名、合著者或工具署名行。
- summary (en): Adds message guidance: follow the style of recent commits (language, `feat:` / `fix(scope):` prefix, capitalization, subject length), say why the change was made and not only what changed, and add no sign-off, co-author or tool attribution lines unless the repository's commits or the user ask for them.
- reason (zh-CN): 原版把最近 10 条提交作为上下文给出，却没有要求照其风格写；README 声称会匹配仓库风格。
- reason (en): The original provides the last 10 commits as context but never asks to follow their style; the README says it matches the repository's style.
