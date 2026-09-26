# 投稿说明 · Submitting

[中文](#中文) · [English](#english)

## 中文

欢迎通过 Pull Request 投稿。一个 PR 只投一个条目或一个条目的新版本。

### PR 需要包含

1. `catalog/<id>.json`：按 `teloa.market-catalog-entry/v1` 填写全部字段。`id` 用「来源生态.资源名」，例如 `hermes.meeting-action-items`。
2. `artifacts/<id>/<version>/`：实际安装的完整文件。根目录有且只有一个 `SKILL.md`，frontmatter 只写 `name` 与 `description`，`name` 与条目 `skill.name` 一致。
3. 许可文件：上游的 `LICENSE` 或 `LICENSE.txt` 原样放进工件；MIT 等许可要保留版权行。
4. 上游固定来源：完整 40 位提交与每个取用文件的 Git blob 摘要。改动过的文件在正文开头注明来源，并在条目 `modifications` 里逐条说明。
5. PR 描述写清：用途与适用场景、依赖的工具与是否联网、你如何测试、以后如何升级。
6. stdio 连接器（npm 包）：工件里随附完整依赖锁定 `package-lock.json`（lockfile v3，根只精确依赖配方包，每个包带 sha512 integrity、只从 `https://registry.npmjs.org/` 取）。缺失时 `pnpm build:market-catalog` 会按配方版本生成；宿主安装时按它 `npm ci --ignore-scripts` 并逐条核对，锁与配方不一致拒绝安装。换依赖树须递增条目版本，在新版本目录重新生成。

### 模型引用

模型引用是内容工件的例外：`delivery: reference` 不提交 `artifacts/`。本地语音示例见 `catalog/teloa.model.sensevoice.json`，使用 `model.form: local-specialist`、`usage: ["speech-to-text"]`、`native: {kind: "dsh-speech", providerId: "sensevoice-local"}`；模型权重许可写在 `model.license`，目录条目源码许可仍用顶层 `license`。DSH 原生准备器维护固定权重版本、摘要、缓存和下载状态，目录不复制这些状态，也不能指定下载命令或任意 provider。目前只开放该已核对的原生绑定；发布新的 OCR、分类等 provider 需要先完成扩展适配、运行和硬件验收，通用的开发者垂类模型发布与运行适配尚未完成。

行业方案依赖已接入开发代码：`teloa.business-package/v3` 的 `skill`、`work-template` 资源可声明 `modelDependencies: [{catalogId, version, usage, required}]`，v2 拒绝该新字段。使用固定目录版本，例如 `teloa.model.sensevoice@1.0.0`，不附带权重、运行地址、下载命令或凭据。合法但未知/未就绪的模型不会阻止整个方案导入，只阻断依赖它的必需入口；准备仍由用户进入现有设置确认。依赖不授予转写工具，也不切换聊天模型。完整示例、升级选择及验收边界见[行业方案模型依赖设计](../docs/superpowers/specs/2026-09-27-行业方案模型依赖-design.md)。这是开发期能力说明，不代表当前线上版本已经发行。

Skill 安装和预览不要求模型就绪；方案入口使用时才按自身声明检查。共享公共 Skill 的独立普通调用不继承引用方案的额外条件，方案包内 Skill 的普通调用则按固定包内声明检查。当前原子 Skill 格式没有独立模型依赖字段，不要在其 frontmatter 添加本协议字段。

### 不接受的内容

- 可执行脚本（`.py`、`.sh`、`.js` 等），以及带可执行权限的文件、符号链接。
- 许可不清楚或不允许再分发的内容。公开可读不等于可以再分发。
- 依赖另一个宿主专属运行时、钩子或私有凭据才能工作的内容。
- 付费资源的完整正文、私有下载地址或结算资料。

### 审核流程

1. CI 只做静态校验：运行 `pnpm check:market-catalog`，检查结构、路径、大小、摘要与许可文件。CI 不执行投稿中的任何脚本，也不接触部署密钥。
2. 维护者人工核对来源、许可与内容，按实际验证结果填写兼容状态。
3. 合入后由维护者重新生成快照，随下一个 Teloa 版本发布。

## English

Contributions are welcome through pull requests. One PR adds one entry or one new version of an entry.

### A PR contains

1. `catalog/<id>.json` with every field of `teloa.market-catalog-entry/v1`. Use `ecosystem.resource` for `id`, for example `hermes.meeting-action-items`.
2. `artifacts/<id>/<version>/` with the complete files to install. Exactly one `SKILL.md` at the root; its frontmatter holds only `name` and `description`, and `name` equals the entry's `skill.name`.
3. License files: the upstream `LICENSE` or `LICENSE.txt`, unchanged. Keep copyright lines for licenses such as MIT.
4. Pinned upstream source: the full 40-character commit and the Git blob digest of each file taken. Mark every changed file at the top of its body and list each change in `modifications`.
5. A PR description covering purpose and use cases, required tools and network access, how you tested, and how the entry will be upgraded.
6. stdio connectors (npm packages): ship the full dependency lock `package-lock.json` in the artifact (lockfile v3, the root depends only on the recipe package at its exact version, every package carries a sha512 integrity and comes from `https://registry.npmjs.org/`). When it is missing, `pnpm build:market-catalog` generates it from the recipe version. The host installs with `npm ci --ignore-scripts` from this lock and checks every entry; a lock that disagrees with the recipe is refused. Changing the dependency tree requires a new entry version with a freshly generated lock.

### Model references

Model references are an exception to content artifacts: `delivery: reference` has no `artifacts/` directory. See `catalog/teloa.model.sensevoice.json` for the local speech example, with `model.form: local-specialist`, `usage: ["speech-to-text"]`, and `native: {kind: "dsh-speech", providerId: "sensevoice-local"}`. Put the weight license in `model.license`; the top-level `license` describes catalog source code. DSH's native preparer owns pinned weight versions, hashes, cache, and download state; the catalog cannot duplicate this state or specify installation commands or arbitrary providers. Only this reviewed native binding is currently accepted. A new OCR or classification provider first needs an extension adapter and runtime/hardware validation. General developer specialist-model publishing and runtime adapters remain incomplete.

Solution dependencies are integrated in development code. A `skill` or `work-template` resource in `teloa.business-package/v3` can declare `modelDependencies: [{catalogId, version, usage, required}]`; v2 rejects this new field. Use a fixed catalog version such as `teloa.model.sensevoice@1.0.0`, without weights, runtime addresses, download commands, or credentials. A valid but unknown or unprepared model does not prevent importing the whole solution; it blocks only an entry that requires it. Preparation still needs user confirmation in the existing settings. A dependency grants no transcription tool and does not change the chat model. See the [solution model-dependency design](../docs/superpowers/specs/2026-09-27-行业方案模型依赖-design.md) for complete examples, upgrade choices, and acceptance boundaries. This describes development capabilities, not a claim that the current online version has been released.

Skill installation and its preview do not require a ready model; using an entry through a solution checks that solution's declaration. Independent ordinary calls to shared public Skills do not inherit extra prerequisites from referencing solutions. Ordinary calls to Skills packaged inside a solution check their fixed package declarations. The current atomic Skill format has no independent model-dependency field; do not add this protocol's fields to its frontmatter.

### Not accepted

- Executable scripts (`.py`, `.sh`, `.js`, and similar), files with the executable bit, and symbolic links.
- Content with an unclear license or one that forbids redistribution. Publicly readable does not mean redistributable.
- Content that only works with another host's private runtime, hooks, or credentials.
- Full text of paid resources, private download links, or settlement data.

### Review

1. CI runs static checks only: `pnpm check:market-catalog` validates structure, paths, sizes, digests and license files. CI never runs scripts from a submission and never sees deployment secrets.
2. A maintainer reviews source, license and content, and sets the compatibility status from actual verification.
3. After merging, a maintainer regenerates the snapshot, which ships with the next Teloa release.
