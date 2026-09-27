# Changelog · 变更日志

All notable changes to the catalog are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Releases are named by catalog version (`catalog-version.txt`). The full entry list is in [INDEX.md](INDEX.md).

目录的重要变更记录在此，格式遵循 Keep a Changelog，按目录版本（`catalog-version.txt`）分组。全部条目见 [INDEX.md](INDEX.md)。

## [2026.9.27.3] - 2026-09-27

### Added

- Five local Ollama model references (`model.form: local-general`): `teloa.model.local.deepseek-r1`, `teloa.model.local.gemma3`, `teloa.model.local.llama3.1`, `teloa.model.local.phi4`, `teloa.model.local.qwen3`. Cloud model entries now carry explicit `local: null` and `variants: null`.
  新增五个本机 Ollama 模型引用；云端模型条目显式写出 `local: null` 与 `variants: null`。
- The validator requires Ollama variant names to be unique across entries and every variant to carry its registry digest.
  校验器要求 Ollama 变体名称跨条目唯一，且每个变体都带 registry 摘要。

### Changed

- Connector licenses follow the delivery form. Connectors that only talk to a vendor's remote MCP endpoint (no local npm package) declare the vendor's terms, `LicenseRef-<Vendor>-Terms`, with the vendor documentation link in the license file and in `connector.upstreamUrl`; connectors that install a local npm package declare that package's own license. Changed accordingly: `teloa.mcp-atlassian` (was Apache-2.0) and `teloa.mcp-posthog`, `teloa.mcp-sentry`, `teloa.mcp-stripe`, `teloa.mcp-context7`, `teloa.mcp-deepwiki`, `teloa.mcp-figma`, `teloa.mcp-github`, `teloa.mcp-linear`, `teloa.mcp-notion-remote` (were MIT). The validator now enforces the rule in both directions.
  连接器按交付形态标许可：只连厂商远端 MCP 端点、无本地 npm 包的一律 `LicenseRef-<厂商>-Terms`（许可文件与 `connector.upstreamUrl` 给出厂商条款/文档链接）；安装本地 npm 包的按包内 LICENSE 标注。据此改动 atlassian（原 Apache-2.0）与 posthog、sentry、stripe、context7、deepwiki、figma、github、linear、notion-remote（原 MIT）；校验器双向强制该规则。
- Validator messages are English first with the Chinese text after a slash (`English / 中文`). Field-level errors passed through from the entry reader are unchanged.
  校验器报错改为英文优先、中文附后；条目读取器透传的字段级错误不变。

### Fixed

- `teloa.mcp-amap` (ISC): the copyright line now names the upstream author from the package's `package.json`, `高德地图开放平台, PBC (https://lbs.amap.com)`, instead of a generic placeholder.
  `teloa.mcp-amap` 的 ISC 版权行改为上游 `package.json` 的实际署名。
- `teloa.mcp-exa`, `teloa.mcp-lark` and `teloa.mcp-notion` (MIT): the license files now carry the upstream copyright lines (`Exa Labs`, `Lark Technologies Pte. Ltd.`, `Notion Labs, Inc.`), matching the packages in the bundled locks; the other stdio connectors already matched their npm package licenses (amap ISC, dingtalk MIT, playwright Apache-2.0, yuque MIT).
  `teloa.mcp-exa`、`teloa.mcp-lark`、`teloa.mcp-notion` 的 MIT 许可文件补上游版权行；其余 stdio 连接器许可已与 lock 中包一致。

### Versioning note · 版本说明

The license-file corrections in 2026.9.27.1 and in this release change hosted artifact bytes (and therefore the entries' artifact tree hashes) without changing what is installed or how it behaves. Entry versions were deliberately not bumped for these fixes; the catalog version records them. Historical version directories under `artifacts/` (16 at this release) are kept so earlier catalog versions stay reproducible.
2026.9.27.1 与本版的许可文件修正只改工件字节与工件树摘要，不改安装内容与行为，经裁定不递增条目版本，以目录版本记录。`artifacts/` 下的历史版本目录（本版 16 个）保留，以保证旧目录版本可复现。

## [2026.9.27.1] - 2026-09-27

First public layout of the repository. / 仓库首次公开时的目录布局。

### Changed

- Entries are grouped by type: `catalog/{solutions,roles,skills,connectors,models}/<id>.json`. Upstream skills moved from `catalog/upstream/` to `catalog/skills/` and are identified by `delivery: upstream`. Hosted files moved to `artifacts/<type>/<id>/<version>/`, review records to `reviews/<type>/`. Entry IDs and file names are unchanged.
  条目按类型分目录；上游技能并入 `catalog/skills/`，以 `delivery: upstream` 区分；工件与审核记录同样按类型分目录。条目 ID 与文件名不变。
- `SUBMITTING.md` became `CONTRIBUTING.md`; `SUBMITTING.md` now points to it. The README is English with a Chinese version in `README.zh-CN.md`.
  `SUBMITTING.md` 改名为 `CONTRIBUTING.md` 并保留指向；README 以英文为主，中文见 `README.zh-CN.md`。

### Added

- `LICENSE` (Apache-2.0 for catalog metadata, documentation and Teloa-authored artifacts), generated `NOTICE` and `INDEX.md`, `SECURITY.md`, this changelog, and `tools/validate.mjs`, a single-file validator generated from the Teloa source repository.
  新增 `LICENSE`、自动生成的 `NOTICE` 与 `INDEX.md`、`SECURITY.md`、本变更日志，以及由 Teloa 源码仓生成的单文件校验器 `tools/validate.mjs`。
- GitHub workflow that runs the validator and a DCO sign-off check on pull requests; issue templates for resource requests, problem reports and license disputes; pull request template; code owners.
  新增 PR 校验与 DCO 签署检查、Issue 模板（资源申请、问题反馈、许可争议）、PR 模板与 CODEOWNERS。
- The validator enforces that each entry sits in the directory of its type, that `artifacts/` holds only hosted entries, and that every hosted version directory ships a `LICENSE` or `LICENSE.txt` matching `license.spdx`.
  校验器强制：条目所在目录与类型一致；`artifacts/` 只放托管条目；每个托管版本目录自带与 `license.spdx` 相符的许可文件。

### Fixed

- The 14 AI teammate (`roles`) artifacts now ship an Apache-2.0 `LICENSE`.
  14 个 AI 同事工件补上 Apache-2.0 `LICENSE`。
- Connector license files now match their declared identifiers: `teloa.mcp-amap` (ISC), `teloa.mcp-playwright` and `teloa.mcp-atlassian` (Apache-2.0), full MIT text for `teloa.mcp-dingtalk`, `teloa.mcp-yuque`, `teloa.mcp-posthog`, `teloa.mcp-sentry` and `teloa.mcp-stripe`, and a provider documentation link for the seven `LicenseRef-*-Terms` connectors. Entry versions were not bumped; installable behavior is unchanged.
  连接器许可文件与声明对齐（amap 为 ISC，playwright、atlassian 为 Apache-2.0，五个 MIT 条目补全文，七个 `LicenseRef-*-Terms` 条目补服务文档链接）。条目版本未递增，安装行为不变。
