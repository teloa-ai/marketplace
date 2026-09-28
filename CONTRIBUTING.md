# Contributing · 贡献指南

[English](#english) · [中文](#中文)

## English

Contributions are welcome through pull requests to this repository. One pull request adds one entry or one new version of an entry.

### Before you start

- **Sign off every commit** under the [Developer Certificate of Origin 1.1](https://developercertificate.org/): add `Signed-off-by: Your Name <you@example.com>` with `git commit -s`. The DCO check in CI fails without it. The requirement applies to every new contribution since the repository was published on 2026-09-27; commits before that date are Teloa's internal curation history imported from the source repository, and CI checks only the commits a pull request adds. There is no CLA. The DCO certifies that you have the right to submit the work under the license that applies to it; it is not a copyright assignment. This is the same policy as the Teloa source repository ([DCO.md](https://github.com/teloa-ai/teloa/blob/main/DCO.md)).
- **Run the validator** from the repository root: `node tools/validate.mjs --write`. It runs every check and refreshes `INDEX.md`, `NOTICE` and the README catalog version in your working tree; do not commit those files (`git restore INDEX.md NOTICE README.md README.zh-CN.md`), they are generated after merge. Node.js 22 or newer is required; nothing else needs to be installed. Error messages are English first, with the Chinese text after a slash.

### Licensing rules

- Content hosted in `artifacts/` must use a license that allows redistribution. OSI-approved licenses are recommended. MIT-0, MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause and ISC are accepted directly; other licenses are reviewed case by case.
- Every hosted version directory, `artifacts/<type>/<id>/<version>/`, ships its own `LICENSE` or `LICENSE.txt`. It must be listed in the entry's `license.files`, and its text must match `license.spdx`. For MIT and similar licenses, keep the copyright lines.
- Source-available or no-redistribution resources can only be listed as upstream entries (`delivery: upstream`): metadata and a pinned source, no hosted copy. Publicly readable does not mean redistributable.
- Connector licenses follow the delivery form. A connector that only talks to a vendor's remote MCP endpoint (no local npm package) uses `LicenseRef-<Vendor>-Terms`. This names the provider's terms of service, not a license for anything in this repository; the connector's license file must include a link to the provider's terms or documentation, and `connector.upstreamUrl` points to the vendor documentation. A connector that installs a local npm package (`recipe.transport: stdio`) declares that package's own license, matching the package in the bundled lock. The validator rejects both mismatches.
- Any other custom license must include its full text or a link to it in the entry's license file.
- Correcting a license file alone (attribution, identifier, full text) does not bump the entry version, because what is installed and how it behaves do not change. Explain the correction in the pull request description; the generated `CHANGELOG.md` section lists the entry as changed. Any change to the installable files still requires a new version directory; earlier version directories are kept so older catalog versions stay reproducible.
- Catalog metadata and documentation you contribute are licensed under Apache-2.0, like the rest of this repository.

### A pull request contains

1. `catalog/<type>/<id>.json` with every field of `teloa.market-catalog-entry/v1`. `<type>` is `solutions`, `roles`, `skills`, `connectors` or `models`, and must match the entry's `kind`. Use `ecosystem.resource` for `id`, for example `hermes.meeting-action-items`. The file name equals the ID.
2. For hosted entries, `artifacts/<type>/<id>/<version>/` with the complete files to install. Skills have exactly one `SKILL.md` at the root; its frontmatter holds only `name` and `description`, and `name` equals the entry's `skill.name`.
3. The license file described above.
4. For content taken from elsewhere, the pinned upstream source: the full 40-character commit and the Git blob digest of each file taken. Mark every changed file at the top of its body and list each change in `modifications`. Skills that change the original files use the structured change list described in [Derivative resources](#derivative-resources).
5. stdio connectors (npm packages): the full dependency lock `package-lock.json` in the artifact (lockfile v3, the root depends only on the recipe package at its exact version, every package carries a sha512 integrity and comes from `https://registry.npmjs.org/`). The host installs with `npm ci --ignore-scripts` from this lock and checks every entry; a lock that disagrees with the recipe is refused. Changing the dependency tree requires a new entry version.
6. Nothing outside `catalog/`, `artifacts/` and `reviews/`. Do not edit `INDEX.md`, `NOTICE`, `catalog-version.txt`, the README catalog version or `CHANGELOG.md`: they are generated after merge (see Review), so parallel pull requests never conflict. Review records use one file per entry, `reviews/<type>/<id>.json`. CI enforces this scope and reports each path outside it. Changes to `tools/`, `.github/` and the documents are made by maintainers from an `infra/*` branch of this repository (pushing one requires write access) and need code owner review; those branches may change anything except `INDEX.md`, `NOTICE` and `catalog-version.txt`. Nobody deletes `README.md` or `README.zh-CN.md`.
7. A pull request description covering purpose and use cases, required tools and network access, how you tested, and how the entry will be upgraded.

### Derivative resources

Use this form when you publish a skill whose files differ from a pinned original: fixes, adaptations, removals or additions. An upstream entry (`delivery: upstream`) means the listed original files are installed byte for byte; any skill whose bytes changed is a hosted entry (`delivery: install`) with `derivation`. Keep the original ID prefix and skill name (for example `hermes.simplify-code`), use a plain version without a pre-release suffix, and keep one entry per skill.

- **Entry.** `upstream.files` lists every original file with `gitBlob`, `size` and `sha256` of the original bytes at the pinned commit. A license at the original repository root is listed with `repositoryPath` and placed at the artifact root as `LICENSE` or `LICENSE.txt`. `modifications` is `[]`. `derivation.unchangedFiles` lists original files shipped unchanged (their digest must equal the original digest, licenses included). `derivation.changes` lists every change. Derivative entries carry no `origin`: the original's install count is not ours. `compatibility.teloa` must have a lower bound of at least `0.2.0-alpha.7`.
- **Each change** has `id` (such as `CSB-M01`, unique in the entry), `type`, `path` (one file in the artifact, or the removed original file), optional `section` (language-neutral heading or line numbers; line numbers refer to the original file), `upstream` (`<owner>/<repo>@<commit>:<path>` of the original file, same repository and commit as the entry; `null` only for a file the original does not have), and `summary` and `reason` in Chinese and English, each at most 1000 characters. These texts are public: keep the technical content, leave out internal review bookkeeping.
- **Seven types, one per change,** chosen by priority: `security` > `fixed` > `removed` > `adapted` > `added` > `improved` > `localized`. Split a change that falls into two types.
  - `security`: removes an exploitable flaw or advice that leads to an unsafe result (for example a redirect check that accepts `//`).
  - `fixed`: corrects a factual, logic or code error the original did not intend.
  - `removed`: deletes content that is proprietary, broken, unsupported by Teloa or not licensed for redistribution.
  - `adapted`: reworks content to run in Teloa (tool names, paths, permissions, required notices) without changing its intent.
  - `added`: a capability, step or check the original does not have.
  - `improved`: same capability, better quality (clarity, structure, wording, performance, token use).
  - `localized`: translation or regional adaptation without changing meaning.
- **Every file is accounted for.** Each file in the artifact other than `MODIFICATIONS.md` is either in `unchangedFiles` or named by a change; each original file that is not shipped has a `removed` change.
- **`MODIFICATIONS.md`** at the artifact root is the full technical record and mentions every change `id`. Each changed or added file says `MODIFICATIONS.md` within its first 4 KiB (a visible change notice, as Apache-2.0 section 4(b) requires).
- **Verification record.** `reviews/derivatives/<id>@<version>.json` in format `teloa.derivative-review/v1` (`entryId`, `version`, `reviewedAt`, `reviewer`, `changeChecks`) has exactly one check per change with `result: "pass"`, a `method` of `test`, `reproduction`, `source-check` or `review`, and `evidence` (method and outcome, at most 1000 characters). `security` and `fixed` changes need a test, a reproduction or a check against an authoritative source, not review alone. Do not claim results you have not observed.
- **Not included:** review material such as tests, machine-readable change files and drafts stays out of the artifact.

Derivative resources reach the Teloa app with the next Teloa release after merge; market.teloa.ai shows them once the index is published.

### Model references

Model references have no artifacts (`delivery: reference`). See `catalog/models/teloa.model.sensevoice.json` for the local speech example, with `model.form: local-specialist`, `usage: ["speech-to-text"]`, and `native: {kind: "dsh-speech", providerId: "sensevoice-local"}`. Put the weight license in `model.license`; the top-level `license` describes the catalog entry. DSH's native preparer owns pinned weight versions, hashes, cache and download state; the catalog cannot duplicate this state or specify installation commands or arbitrary providers. Only this reviewed native binding is currently accepted. A new OCR or classification provider first needs an extension adapter and runtime and hardware validation.

A `skill` or `work-template` resource in a `teloa.business-package/v3` solution can declare `modelDependencies: [{catalogId, version, usage, required}]` with a fixed catalog version such as `teloa.model.sensevoice@1.0.0`, without weights, runtime addresses, download commands or credentials. See the [solution model-dependency design](https://github.com/teloa-ai/teloa/blob/main/docs/superpowers/specs/2026-09-27-%E8%A1%8C%E4%B8%9A%E6%96%B9%E6%A1%88%E6%A8%A1%E5%9E%8B%E4%BE%9D%E8%B5%96-design.md) for details. This describes development capabilities, not a claim that the current online version has been released.

### Not accepted

- Executable scripts (`.py`, `.sh`, `.js` and similar), files with the executable bit, symbolic links and hidden files inside artifacts.
- Content with an unclear license or one that forbids redistribution, except as an upstream entry.
- Content that only works with another host's private runtime, hooks or credentials.
- Full text of paid resources, private download links or settlement data.
- Secrets of any kind: API keys, tokens, passwords, private keys.

### Review

1. CI runs static checks only: `tools/validate.mjs` taken from the `main` branch (not from the pull request) is run against the pull request's content (structure, paths, sizes, digests, license files; generated files are regenerated in the CI checkout instead of being required), a scope check (item 6 above; enforced by `.github/workflows/scope.yml`, which runs from `main` through `pull_request_target`, reads only the changed-file list from the GitHub API and never checks out the submission, so a pull request cannot relax it), plus the DCO sign-off check on the commits the pull request adds. CI never runs scripts from a submission and has no deployment secrets. Changes to `tools/` are regenerated from the Teloa source repository by code owners.
2. A maintainer reviews source, license and content, and sets the compatibility status from actual verification. Code owners for `catalog/` and `artifacts/` are listed in `.github/CODEOWNERS`.
3. After merging, the Generate workflow (`.github/workflows/generate.yml`) bumps `catalog-version.txt`, adds a `CHANGELOG.md` section for the entries added, changed or removed, regenerates `INDEX.md`, `NOTICE` and the README catalog version, validates strictly and opens one pull request from `bot/generated-files` (submissions merged in the meantime join the same pull request). Its required checks (Catalog, Scope) come from `workflow_dispatch` runs started by the workflow; the `pull_request` run GitHub holds for approval on that pull request may be approved or ignored. Maintainers merge it with a merge commit (squash and rebase also work, because the source point is recorded in `CHANGELOG.md`). Once that is merged, a maintainer publishes the signed index to market.teloa.ai and pins the catalog into the next Teloa release.

This repository is the single source of truth for the catalog. Until the sync script in the Teloa source repository (`scripts/同步官方市场.mjs --ref <commit>`, planned for the release after the marketplace goes public) is in place, maintainers copy a reviewed commit of this repository into the source repository's `marketplace/` by hand and record the commit id there; the source repository does not accept direct catalog changes.

Use public issues by default to report malicious or unsafe resources. For potentially high-impact issues, we recommend contacting [security@teloa.ai](mailto:security@teloa.ai) privately first. Keep credentials, private data, and exploit details out of public issues and pull requests; see [SECURITY.md](SECURITY.md).

## 中文

欢迎通过 Pull Request 向本仓库投稿。一个 PR 只投一个条目或一个条目的新版本。

### 开始之前

- **每个提交都要签署** [Developer Certificate of Origin 1.1](https://developercertificate.org/)：用 `git commit -s` 加上 `Signed-off-by: 你的名字 <you@example.com>`，缺签署 CI 的 DCO 检查会失败。该要求自 2026-09-27 本仓库公开起对所有新贡献生效；此前的历史提交是 Teloa 从源码仓导入的内部整理记录，CI 只检查 PR 新增的提交。不设 CLA。签署是在证明你有权按适用的许可提交这份内容，不是转让版权。与 Teloa 源码仓的规则一致（[DCO.md](https://github.com/teloa-ai/teloa/blob/main/DCO.md)）。
- **运行校验器**：在仓库根目录运行 `node tools/validate.mjs --write`。它执行全部校验，并在工作区刷新 `INDEX.md`、`NOTICE` 与 README 目录版本；这些文件不要提交（`git restore INDEX.md NOTICE README.md README.zh-CN.md`），合并后统一生成。需要 Node.js 22 或更新版本，无需安装其他依赖。报错文案英文优先，斜杠后附中文。

### 许可规则

- 托管在 `artifacts/` 的内容必须使用允许再分发的许可，推荐 OSI 认可的许可。MIT-0、MIT、Apache-2.0、BSD-2-Clause、BSD-3-Clause、ISC 直接接受，其他许可逐个审核。
- 每个托管版本目录 `artifacts/<类型>/<id>/<version>/` 自带 `LICENSE` 或 `LICENSE.txt`，列在条目 `license.files` 里，正文与 `license.spdx` 一致。MIT 等许可要保留版权行。
- 「仅源码可见」或禁止再分发的资源只能以上游条目收录（`delivery: upstream`）：只记元数据与固定来源，不托管副本。公开可读不等于可以再分发。
- 连接器按交付形态标许可：只连厂商远端 MCP 端点、无本地 npm 包的连接器使用 `LicenseRef-<厂商>-Terms`，它指的是服务商的服务条款，不是本仓库任何内容的许可；许可文件里须给出服务条款或文档链接，`connector.upstreamUrl` 指向厂商文档。安装本地 npm 包（`recipe.transport: stdio`）的连接器按包内 LICENSE 标注，与随附 lock 中的包一致。两种不一致校验器都拒绝。
- 其他自定义许可须在条目的许可文件里给出完整许可正文或链接。
- 只修正许可文件（署名、标识、正文）不递增条目版本：安装内容与行为没有变化，在 PR 描述里写明修正内容即可，自动生成的 `CHANGELOG.md` 小节会把该条目列为变更。改动实际安装的文件仍须新建版本目录；旧版本目录保留，保证旧目录版本可复现。
- 你贡献的目录元数据与文档和本仓库其余部分一样采用 Apache-2.0。

### PR 需要包含

1. `catalog/<类型>/<id>.json`：按 `teloa.market-catalog-entry/v1` 填写全部字段。`<类型>` 为 `solutions`、`roles`、`skills`、`connectors`、`models` 之一，且与条目 `kind` 一致。`id` 用「来源生态.资源名」，例如 `hermes.meeting-action-items`，文件名等于 ID。
2. 托管条目的 `artifacts/<类型>/<id>/<version>/`：实际安装的完整文件。技能根目录有且只有一个 `SKILL.md`，frontmatter 只写 `name` 与 `description`，`name` 与条目 `skill.name` 一致。
3. 上文要求的许可文件。
4. 取自别处的内容要写上游固定来源：完整 40 位提交与每个取用文件的 Git blob 摘要。改动过的文件在正文开头注明来源，并在条目 `modifications` 里逐条说明。改动了原版文件的技能改用结构化修改清单，见[二次开发资源](#二次开发资源)。
5. stdio 连接器（npm 包）：工件里随附完整依赖锁定 `package-lock.json`（lockfile v3，根只精确依赖配方包，每个包带 sha512 integrity、只从 `https://registry.npmjs.org/` 取）。宿主安装时按它 `npm ci --ignore-scripts` 并逐条核对，锁与配方不一致拒绝安装。换依赖树须递增条目版本。
6. 只改 `catalog/`、`artifacts/`、`reviews/`。不要改 `INDEX.md`、`NOTICE`、`catalog-version.txt`、README 目录版本与 `CHANGELOG.md`：它们在合并后统一生成（见审核流程），并行的 PR 因此不会互相冲突。审查记录每个条目一个文件：`reviews/<类型>/<id>.json`。CI 强制这一范围，并逐个指出越界路径。`tools/`、`.github/` 与文档的改动由维护者从本仓库的 `infra/*` 分支提交（推送该分支需要写权限），并须代码所有者审查；这类分支可以改除 `INDEX.md`、`NOTICE`、`catalog-version.txt` 之外的任何文件。任何 PR 都不得删除 `README.md`、`README.zh-CN.md`。
7. PR 描述写清：用途与适用场景、依赖的工具与是否联网、你如何测试、以后如何升级。

### 二次开发资源

发布与锁定原版字节不同的技能（修复、适配、移除或新增内容）时用这种形式。上游条目（`delivery: upstream`）的含义是所列原版文件逐字节原样安装；字节改过的技能一律用托管条目（`delivery: install`）加 `derivation`。沿用原版的标识前缀与技能名（例如 `hermes.simplify-code`），版本号不用预发布后缀，同一技能只保留一个条目。

- **条目。** `upstream.files` 列出全部原版文件，每项带锁定提交下原版字节的 `gitBlob`、`size` 与 `sha256`；原版仓库根目录的许可用 `repositoryPath` 登记，并放在资源文件根目录的 `LICENSE` 或 `LICENSE.txt`。`modifications` 为 `[]`。`derivation.unchangedFiles` 列出原样随附的原版文件（摘要必须与原版一致，许可文件也不例外）；`derivation.changes` 逐条列出修改。二次开发条目不写 `origin`：原版的安装量不是我们的安装量。`compatibility.teloa` 的下界至少为 `0.2.0-alpha.7`。
- **每条修改**包含：`id`（如 `CSB-M01`，条目内唯一）、`type`、`path`（资源文件里的一个文件，或被移除的原版文件）、可选的 `section`（语言中性的章节名或行号，行号指原版文件）、`upstream`（原版文件的 `<owner>/<repo>@<提交>:<路径>`，仓库与提交须与条目一致；只有原版没有的文件写 `null`），以及中英双语的 `summary` 与 `reason`（每语不超过 1000 字）。这些文字会公开展示：保留技术内容，不写内部审查记账。
- **七类，每条只归一类**，按优先级取：`security` > `fixed` > `removed` > `adapted` > `added` > `improved` > `localized`。一处改动跨两类时拆成两条。
  - `security`（安全修复）：消除可被利用的漏洞，或会导致不安全结果的建议（例如放过 `//` 的重定向校验）。
  - `fixed`（修复）：纠正原版并非本意的事实、逻辑或代码错误。
  - `removed`（移除）：删除专有、失效、Teloa 不支持或许可不允许再分发的内容。
  - `adapted`（适配）：为在 Teloa 中运行而改造（工具名、路径、权限、必需的声明），功能意图不变。
  - `added`（新增）：原版没有的新能力、新步骤或新检查项。
  - `improved`（优化）：能力不变，提升质量（清晰度、结构、表述、性能、token 用量）。
  - `localized`（本地化）：翻译与区域化，不改语义。
- **每个文件都有着落。** 资源文件里除 `MODIFICATIONS.md` 外的每个文件，要么在 `unchangedFiles` 里，要么被某条修改引用；没有随附的原版文件都要有一条 `removed` 修改。
- **`MODIFICATIONS.md`** 放在资源文件根目录，是完整的技术记录，须列出全部修改 `id`。每个改过或新增的文件在前 4 KiB 内写明 `MODIFICATIONS.md`（可见的修改声明，满足 Apache-2.0 第 4(b) 条）。
- **验证记录。** `reviews/derivatives/<id>@<version>.json`，格式 `teloa.derivative-review/v1`（`entryId`、`version`、`reviewedAt`、`reviewer`、`changeChecks`）：每条修改恰有一条检查，`result` 为 `"pass"`，`method` 取 `test`、`reproduction`、`source-check`、`review` 之一，`evidence` 写方法与结果（不超过 1000 字）。`security` 与 `fixed` 须用测试、复现或对照权威资料，不能只靠审阅。没有观察到的结果不要写。
- **不放进资源文件：** 测试、机器可读的修改文件、草案等审查材料。

二次开发资源合入后，随下一个 Teloa 发行版进入应用；市场站在索引发布后即可看到。

### 模型引用

模型引用没有工件（`delivery: reference`）。本地语音示例见 `catalog/models/teloa.model.sensevoice.json`，使用 `model.form: local-specialist`、`usage: ["speech-to-text"]`、`native: {kind: "dsh-speech", providerId: "sensevoice-local"}`；模型权重许可写在 `model.license`，顶层 `license` 描述目录条目本身。DSH 原生准备器维护固定权重版本、摘要、缓存和下载状态，目录不复制这些状态，也不能指定下载命令或任意 provider。目前只开放该已核对的原生绑定；新的 OCR、分类等 provider 需要先完成扩展适配、运行和硬件验收。

`teloa.business-package/v3` 方案中的 `skill`、`work-template` 资源可声明 `modelDependencies: [{catalogId, version, usage, required}]`，使用固定目录版本，例如 `teloa.model.sensevoice@1.0.0`，不附带权重、运行地址、下载命令或凭据。详见[行业方案模型依赖设计](https://github.com/teloa-ai/teloa/blob/main/docs/superpowers/specs/2026-09-27-%E8%A1%8C%E4%B8%9A%E6%96%B9%E6%A1%88%E6%A8%A1%E5%9E%8B%E4%BE%9D%E8%B5%96-design.md)。这是开发期能力说明，不代表当前线上版本已经发行。

### 不接受的内容

- 可执行脚本（`.py`、`.sh`、`.js` 等），以及工件里带可执行权限的文件、符号链接、隐藏文件。
- 许可不清楚或不允许再分发的内容（上游条目形式除外）。
- 依赖另一个宿主专属运行时、钩子或私有凭据才能工作的内容。
- 付费资源的完整正文、私有下载地址或结算资料。
- 任何密钥：API Key、令牌、口令、私钥。

### 审核流程

1. CI 只做静态校验：用 `main` 分支（而非 PR 内）的 `tools/validate.mjs` 校验 PR 内容（结构、路径、大小、摘要、许可文件；生成文件在 CI 检出里重新生成，不要求 PR 已更新），做范围检查（见上文第 6 项；由 `.github/workflows/scope.yml` 强制：它经 `pull_request_target` 以 `main` 上的版本运行，只通过 GitHub API 读取改动文件列表，从不检出投稿内容，PR 无法放宽），并对 PR 新增的提交做 DCO 签署检查。CI 不执行投稿中的任何脚本，也不接触部署密钥。`tools/` 的改动由代码所有者从 Teloa 源码仓重新生成。
2. 维护者人工核对来源、许可与内容，按实际验证结果填写兼容状态。`catalog/` 与 `artifacts/` 的负责人见 `.github/CODEOWNERS`。
3. 合入后 Generate 工作流（`.github/workflows/generate.yml`）递增 `catalog-version.txt`，在 `CHANGELOG.md` 加一节列出新增、变更、移除的条目，重新生成 `INDEX.md`、`NOTICE` 与 README 目录版本，严格校验后从 `bot/generated-files` 开一个 PR（期间合入的其他投稿并入同一个 PR）。该 PR 的必需检查（Catalog、Scope）由工作流发起的 `workflow_dispatch` 运行满足；GitHub 在该 PR 上「等待审批」的 `pull_request` 运行可批准也可忽略。维护者以 merge commit 方式合并该 PR（squash、rebase 也能正确工作，因为来源点记录在 `CHANGELOG.md` 中）。该 PR 合并后，由维护者把签名索引发布到 market.teloa.ai，并在下一个 Teloa 版本中固定目录快照。

本仓库是目录的唯一事实源。Teloa 源码仓的同步脚本（`scripts/同步官方市场.mjs --ref <commit>`，排在市场仓公开后的下一个发行）落地前，维护者手工把本仓库某个已审核提交复制进源码仓的 `marketplace/` 并记录提交号；源码仓不再直接改目录。

发现恶意或不安全的资源，默认公开提 Issue；如可能造成重大影响，建议先私下联系 [security@teloa.ai](mailto:security@teloa.ai)。不要将凭据、隐私和漏洞利用细节写入公开 Issue 或 PR，详见 [SECURITY.md](SECURITY.md)。
