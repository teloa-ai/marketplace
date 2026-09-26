# Teloa 官方市场

[English](README.md) · 简体中文

这里是 Teloa 官方市场的目录源，收录经过 Teloa 审核、许可清楚、版本固定的方案、AI 同事、技能、连接器与模型引用。本仓库是市场的唯一事实源，投稿、审核与合并都在这里进行。

在线浏览与搜索：**https://market.teloa.ai** · 全部条目：[INDEX.md](INDEX.md)

## 与 market.teloa.ai、与 Teloa 的关系

- **market.teloa.ai** 是由本仓库生成的静态站点。每个条目页都链接回本仓库的条目文件、`artifacts/` 下托管的文件；上游条目另外链接到固定版本的上游来源。
- 站点同时提供签名在线索引（`index.json` 与 `v2/index.json`，各带 Ed25519 签名 `.sig`）。Teloa 应用只在签名与结构都通过后才采用在线索引，否则继续使用随发行打包的快照。
- 每个 Teloa 发行固定一份来自本仓库某个确定提交的目录快照。目录更新不会改动你已安装的版本。
- 校验规则在 Teloa 源码仓（[teloa-ai/teloa](https://github.com/teloa-ai/teloa)）维护，打包为 [`tools/validate.mjs`](tools/validate.mjs)，请勿手改该文件。

**发布状态：** 本仓库在市场正式开放前，由 Teloa 源码仓的 `marketplace/` 目录连同历史首次发布，目录版本 2026.9.27.1。此后本仓库是唯一事实源，源码仓只固定从这里取得的快照。market.teloa.ai 的条目页链接到这里；应用内在线索引本期需显式开启。

## 目录结构

| 路径 | 内容 |
| --- | --- |
| `catalog/<类型>/<id>.json` | 一个条目一份，格式 `teloa.market-catalog-entry/v1`。`<类型>` 只能是 `solutions`、`roles`、`skills`、`connectors`、`models`，且必须与条目 `kind` 一致。上游技能同样放在 `catalog/skills/`，以 `delivery: upstream` 区分。 |
| `artifacts/<类型>/<id>/<version>/` | Teloa 托管并安装的文件，只有 `solutions`、`roles`、`skills`、`connectors` 四类。每个版本目录自带 `LICENSE` 或 `LICENSE.txt`。上游条目与模型引用没有工件。 |
| `reviews/<类型>/` | 审核与核对记录，例如连接器配方核对。 |
| `INDEX.md`、`NOTICE` | 由 `node tools/validate.mjs --write` 从 `catalog/` 生成，请勿手改。 |
| `catalog-version.txt` | 目录版本，改动目录时递增。 |
| `tools/validate.mjs` | 由 Teloa 源码仓生成的单文件校验器。 |

条目 ID 形如 `ecosystem.resource`，例如 `openai.skill-creator`。发布后 ID 与文件名不再改变。

## 条目包含什么

- **身份与类型**：`id`、`kind`、`version`，以及安装后的名称（技能为 `skill.name`）。
- **分类**：功能与行业受控词表，与应用、市场站的筛选同一套。
- **上游来源**：取自别处的内容记录仓库、完整 40 位提交、目录路径与每个取用文件的 Git blob 摘要；ClawHub 条目固定作者、名称、版本与逐文件 SHA-256。
- **修改说明**：相对上游改了什么，逐条中英文记录；原样收录时为空。
- **许可**：SPDX 标识与工件内的许可文件。
- **兼容状态**，只有四个值：
  - `verified`：已在对应 Teloa 与 DSH 版本上验证。
  - `needs-configuration`：需要先完成配置，例如连接账号。
  - `content-only`：只做了内容适配，效果取决于你的材料与已授权工具。
  - `unsupported`：不支持，只作说明，不提供安装。
- **运行需求**：需要的工具、是否联网、运行时。
- **审核记录**：审核日期与审核人。

「官方」只表示 Teloa 目录收录并审核过这个版本，不代表上游作者认证，也不是安全认证。

## 在 Teloa 中添加

1. 在 Teloa 工作台打开「市场」，按名称、用途或条目 ID 搜索。也可以在对话里直接告诉任意同事，例如「在市场里搜索并添加 `teloa.soc`」，Teloa 会先给出确认卡，确认后才添加。
2. 点「添加」。Teloa 按条目固定的摘要逐文件核对；上游条目从固定来源逐文件拉取，同样核对。
3. 内置条目（`delivery: builtin`）无需添加。模型引用在「设置 · 模型」里配置；本地语音模型在市场的模型分类里准备。

标为 `unsupported` 的条目不能添加。market.teloa.ai 的每个条目页都有「在 Teloa 中使用」，一键复制一句可直接发到对话里的指令。

## 许可

- 目录元数据、文档与 Teloa 自有工件采用 [Apache License 2.0](LICENSE)。
- `artifacts/` 下托管的第三方工件各按其自身许可，每个版本目录都带该许可文件，条目 `license.spdx` 必须与之一致。
- 上游条目只记录元数据，本仓库不托管副本，文件仍按其自身许可留在固定的上游来源。
- 连接器上的 `LicenseRef-*-Terms` 指远端服务的服务条款，不是本仓库内容的许可。
- [NOTICE](NOTICE) 汇总每个托管工件与上游条目的署名与许可。

## 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。提交须按 Developer Certificate of Origin 签署（`git commit -s`），不设 CLA。提 PR 前请运行 `node tools/validate.mjs`。

## 安全

发现恶意或不安全的资源，请按 [SECURITY.md](SECURITY.md) 私下报告，不要在公开 Issue 中披露。

## 变更

见 [CHANGELOG.md](CHANGELOG.md)。
