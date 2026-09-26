# Changelog · 变更日志

All notable changes to the catalog are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Releases are named by catalog version (`catalog-version.txt`). The full entry list is in [INDEX.md](INDEX.md).

目录的重要变更记录在此，格式遵循 Keep a Changelog，按目录版本（`catalog-version.txt`）分组。全部条目见 [INDEX.md](INDEX.md)。

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
