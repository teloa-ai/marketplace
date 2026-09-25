# Teloa 官方目录 · Teloa Official Catalog

[中文](#中文) · [English](#english)

## 中文

这里是 Teloa 官方市场目录的源。目录收录经过 Teloa 审核、许可清楚、版本固定的资源，在 Teloa 市场里可以直接搜索、查看来源并添加安装。本目录将来迁到独立的公开仓库，结构保持不变。

**当前状态：** 首批只收录技能（Skill）。目录随 Teloa 发行一起固定，应用不在运行时从网络拉取目录。

### 目录结构

| 路径 | 内容 |
| --- | --- |
| `catalog/<id>.json` | 一个条目一份，格式 `teloa.market-catalog-entry/v1` |
| `artifacts/<id>/<version>/` | 条目实际安装的文件，根目录必须有且只有一个 `SKILL.md` |
| `catalog-version.txt` | 目录版本，改动目录时递增 |

### 条目包含什么

- **身份**：`id` 形如 `openai.skill-creator`（来源生态.资源名），`skill.name` 是安装后的技能名。
- **上游来源**：仓库、完整 40 位提交、目录路径，以及每个取用文件的 Git blob 摘要。
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

### 与 Teloa 的关系

1. 维护者运行 `pnpm build:market-catalog`，脚本校验全部条目并生成后端快照，快照摘要写进代码随版本发布。
2. Teloa 启动时核对快照摘要和每个文件的字节，任何不一致都会让整个目录停用，不会部分放行。
3. 你在市场里点「添加到我的技能」，Teloa 把该条目固定保存为你的技能内容，之后照常安装、启用。
4. 目录更新不会改动你已安装的版本。

内置条目（`delivery: builtin`）不需要添加。例如技能创建器会在你新建技能时自动使用。

投稿方式见 [SUBMITTING.md](SUBMITTING.md)。

## English

This is the source of the Teloa official marketplace catalog. It lists resources that Teloa has reviewed, whose licenses are clear, and whose versions are pinned. In the Teloa marketplace you can search them, inspect their origin, and add them. The catalog will later move to a separate public repository with the same layout.

**Current status:** the first batch contains skills only. The catalog ships pinned inside each Teloa release; the app does not fetch it from the network at run time.

### Layout

| Path | Content |
| --- | --- |
| `catalog/<id>.json` | One file per entry, format `teloa.market-catalog-entry/v1` |
| `artifacts/<id>/<version>/` | The files that get installed; exactly one `SKILL.md` at the root |
| `catalog-version.txt` | Catalog version, bumped on every change |

### What an entry records

- **Identity**: `id` such as `openai.skill-creator` (ecosystem.resource); `skill.name` is the installed skill name.
- **Upstream**: repository, full 40-character commit, directory path, and the Git blob digest of each file taken.
- **Modifications**: what changed relative to upstream, in Chinese and English; empty when taken unchanged.
- **License**: SPDX identifier and the license files inside the artifact.
- **Compatibility**, one of four values:
  - `verified`: verified on the stated Teloa and DSH versions.
  - `needs-configuration`: needs setup first, such as connecting an account.
  - `content-only`: content adapted only; results depend on your materials and authorized tools.
  - `unsupported`: listed for information, not installable.
- **Requirements**: tools, network access, runtimes.
- **Review**: review date and reviewer.

"Official" only means the Teloa catalog reviewed and listed this version. It is not an endorsement by the upstream author and not a security certification.

### How Teloa uses it

1. Maintainers run `pnpm build:market-catalog`. The script validates every entry and generates the backend snapshot; its digest is pinned in code and ships with the release.
2. On start, Teloa checks the snapshot digest and every file's bytes. Any mismatch disables the whole catalog rather than trusting part of it.
3. When you click "Add to my skills", Teloa stores that entry as your pinned skill content, which you then install and enable as usual.
4. Catalog updates never change a version you already installed.

Built-in entries (`delivery: builtin`) need no adding. The skill creator, for example, is used automatically when you create a skill.

See [SUBMITTING.md](SUBMITTING.md) to contribute.
