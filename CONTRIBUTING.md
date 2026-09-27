# Contributing · 贡献指南

[English](#english) · [中文](#中文)

## English

Contributions are welcome through pull requests to this repository. One pull request adds one entry or one new version of an entry.

### Before you start

- **Sign off every commit** under the [Developer Certificate of Origin 1.1](https://developercertificate.org/): add `Signed-off-by: Your Name <you@example.com>` with `git commit -s`. The DCO check in CI fails without it. There is no CLA. The DCO certifies that you have the right to submit the work under the license that applies to it; it is not a copyright assignment. This is the same policy as the Teloa source repository ([DCO.md](https://github.com/teloa-ai/teloa/blob/main/DCO.md)).
- **Run the validator** from the repository root: `node tools/validate.mjs`. After adding or changing entries, run `node tools/validate.mjs --write` to regenerate `INDEX.md` and `NOTICE`, then commit them. Node.js 22 or newer is required; nothing else needs to be installed. Error messages are English first, with the Chinese text after a slash.

### Licensing rules

- Content hosted in `artifacts/` must use a license that allows redistribution. OSI-approved licenses are recommended. MIT-0, MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause and ISC are accepted directly; other licenses are reviewed case by case.
- Every hosted version directory, `artifacts/<type>/<id>/<version>/`, ships its own `LICENSE` or `LICENSE.txt`. It must be listed in the entry's `license.files`, and its text must match `license.spdx`. For MIT and similar licenses, keep the copyright lines.
- Source-available or no-redistribution resources can only be listed as upstream entries (`delivery: upstream`): metadata and a pinned source, no hosted copy. Publicly readable does not mean redistributable.
- Connectors that talk to a remote service use `LicenseRef-<Vendor>-Terms`. This names the provider's terms of service, not a license for anything in this repository. The connector's license file must include a link to the provider's terms or documentation.
- Any other custom license must include its full text or a link to it in the entry's license file.
- Correcting a license file alone (attribution, identifier, full text) does not bump the entry version, because what is installed and how it behaves do not change. Record the correction in `CHANGELOG.md`. Any change to the installable files still requires a new version directory; earlier version directories are kept so older catalog versions stay reproducible.
- Catalog metadata and documentation you contribute are licensed under Apache-2.0, like the rest of this repository.

### A pull request contains

1. `catalog/<type>/<id>.json` with every field of `teloa.market-catalog-entry/v1`. `<type>` is `solutions`, `roles`, `skills`, `connectors` or `models`, and must match the entry's `kind`. Use `ecosystem.resource` for `id`, for example `hermes.meeting-action-items`. The file name equals the ID.
2. For hosted entries, `artifacts/<type>/<id>/<version>/` with the complete files to install. Skills have exactly one `SKILL.md` at the root; its frontmatter holds only `name` and `description`, and `name` equals the entry's `skill.name`.
3. The license file described above.
4. For content taken from elsewhere, the pinned upstream source: the full 40-character commit and the Git blob digest of each file taken. Mark every changed file at the top of its body and list each change in `modifications`.
5. stdio connectors (npm packages): the full dependency lock `package-lock.json` in the artifact (lockfile v3, the root depends only on the recipe package at its exact version, every package carries a sha512 integrity and comes from `https://registry.npmjs.org/`). The host installs with `npm ci --ignore-scripts` from this lock and checks every entry; a lock that disagrees with the recipe is refused. Changing the dependency tree requires a new entry version.
6. The regenerated `INDEX.md` and `NOTICE`, and a bumped `catalog-version.txt`.
7. A pull request description covering purpose and use cases, required tools and network access, how you tested, and how the entry will be upgraded.

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

1. CI runs static checks only: `node tools/validate.mjs` (structure, paths, sizes, digests, license files, generated files) and the DCO sign-off check. CI never runs scripts from a submission and has no deployment secrets.
2. A maintainer reviews source, license and content, and sets the compatibility status from actual verification. Code owners for `catalog/` and `artifacts/` are listed in `.github/CODEOWNERS`.
3. After merging, a maintainer publishes the signed index to market.teloa.ai and pins the catalog into the next Teloa release.

This repository is the single source of truth for the catalog. Until the sync script in the Teloa source repository (`scripts/同步官方市场.mjs --ref <commit>`, planned for the release after the marketplace goes public) is in place, maintainers copy a reviewed commit of this repository into the source repository's `marketplace/` by hand and record the commit id there; the source repository does not accept direct catalog changes.

To report a malicious or unsafe resource, follow [SECURITY.md](SECURITY.md) instead of opening a pull request.

## 中文

欢迎通过 Pull Request 向本仓库投稿。一个 PR 只投一个条目或一个条目的新版本。

### 开始之前

- **每个提交都要签署** [Developer Certificate of Origin 1.1](https://developercertificate.org/)：用 `git commit -s` 加上 `Signed-off-by: 你的名字 <you@example.com>`，缺签署 CI 的 DCO 检查会失败。不设 CLA。签署是在证明你有权按适用的许可提交这份内容，不是转让版权。与 Teloa 源码仓的规则一致（[DCO.md](https://github.com/teloa-ai/teloa/blob/main/DCO.md)）。
- **运行校验器**：在仓库根目录运行 `node tools/validate.mjs`。新增或修改条目后运行 `node tools/validate.mjs --write` 重新生成 `INDEX.md` 与 `NOTICE` 并一起提交。需要 Node.js 22 或更新版本，无需安装其他依赖。报错文案英文优先，斜杠后附中文。

### 许可规则

- 托管在 `artifacts/` 的内容必须使用允许再分发的许可，推荐 OSI 认可的许可。MIT-0、MIT、Apache-2.0、BSD-2-Clause、BSD-3-Clause、ISC 直接接受，其他许可逐个审核。
- 每个托管版本目录 `artifacts/<类型>/<id>/<version>/` 自带 `LICENSE` 或 `LICENSE.txt`，列在条目 `license.files` 里，正文与 `license.spdx` 一致。MIT 等许可要保留版权行。
- 「仅源码可见」或禁止再分发的资源只能以上游条目收录（`delivery: upstream`）：只记元数据与固定来源，不托管副本。公开可读不等于可以再分发。
- 连接远端服务的连接器使用 `LicenseRef-<厂商>-Terms`，它指的是服务商的服务条款，不是本仓库任何内容的许可。连接器的许可文件里须给出服务条款或文档链接。
- 其他自定义许可须在条目的许可文件里给出完整许可正文或链接。
- 只修正许可文件（署名、标识、正文）不递增条目版本：安装内容与行为没有变化，在 `CHANGELOG.md` 里记录即可。改动实际安装的文件仍须新建版本目录；旧版本目录保留，保证旧目录版本可复现。
- 你贡献的目录元数据与文档和本仓库其余部分一样采用 Apache-2.0。

### PR 需要包含

1. `catalog/<类型>/<id>.json`：按 `teloa.market-catalog-entry/v1` 填写全部字段。`<类型>` 为 `solutions`、`roles`、`skills`、`connectors`、`models` 之一，且与条目 `kind` 一致。`id` 用「来源生态.资源名」，例如 `hermes.meeting-action-items`，文件名等于 ID。
2. 托管条目的 `artifacts/<类型>/<id>/<version>/`：实际安装的完整文件。技能根目录有且只有一个 `SKILL.md`，frontmatter 只写 `name` 与 `description`，`name` 与条目 `skill.name` 一致。
3. 上文要求的许可文件。
4. 取自别处的内容要写上游固定来源：完整 40 位提交与每个取用文件的 Git blob 摘要。改动过的文件在正文开头注明来源，并在条目 `modifications` 里逐条说明。
5. stdio 连接器（npm 包）：工件里随附完整依赖锁定 `package-lock.json`（lockfile v3，根只精确依赖配方包，每个包带 sha512 integrity、只从 `https://registry.npmjs.org/` 取）。宿主安装时按它 `npm ci --ignore-scripts` 并逐条核对，锁与配方不一致拒绝安装。换依赖树须递增条目版本。
6. 重新生成的 `INDEX.md`、`NOTICE`，以及递增后的 `catalog-version.txt`。
7. PR 描述写清：用途与适用场景、依赖的工具与是否联网、你如何测试、以后如何升级。

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

1. CI 只做静态校验：运行 `node tools/validate.mjs`（结构、路径、大小、摘要、许可文件与生成文件）和 DCO 签署检查。CI 不执行投稿中的任何脚本，也不接触部署密钥。
2. 维护者人工核对来源、许可与内容，按实际验证结果填写兼容状态。`catalog/` 与 `artifacts/` 的负责人见 `.github/CODEOWNERS`。
3. 合入后由维护者把签名索引发布到 market.teloa.ai，并在下一个 Teloa 版本中固定目录快照。

本仓库是目录的唯一事实源。Teloa 源码仓的同步脚本（`scripts/同步官方市场.mjs --ref <commit>`，排在市场仓公开后的下一个发行）落地前，维护者手工把本仓库某个已审核提交复制进源码仓的 `marketplace/` 并记录提交号；源码仓不再直接改目录。

发现恶意或不安全的资源，请按 [SECURITY.md](SECURITY.md) 报告，不要提 PR。
