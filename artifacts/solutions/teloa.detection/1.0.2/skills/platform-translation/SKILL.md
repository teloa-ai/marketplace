---
name: platform-translation
description: 将 Sigma 源规则转换为 Splunk SPL、Microsoft Sentinel/Defender KQL、Elastic EQL/ES|QL 草案，提供字段映射表，并为每个目标平台标注"未在目标引擎验证"。pySigma 等官方工具是推荐的自动化转换与验证路径。
---

# 目标平台转换草案（Target Platform Translation Draft）

## 适用输入与前置检查

必须提供：
- Sigma 源规则（含完整字段）

可选：
- 客户目标平台的版本信息（如 Splunk Enterprise 9.x、Sentinel Workspace 版本）
- 客户日志字段字典（用于精确字段映射）
- 现有 pySigma backend/pipeline 配置（若使用自动化转换）

前置检查：
1. **所有目标平台转换草案均标注"未在目标引擎验证"**，这是本技能的基本假设。
2. pySigma 是官方推荐的自动化转换路径（https://github.com/SigmaHQ/pySigma）；本技能产出的草案供手动审查参考，不替代官方工具的实际转换与测试。
3. 确认目标平台版本，不同版本的字段名和语法可能不同。

## 目标平台转换说明

### Splunk SPL

**backend**: `splunk`（pySigma 官方 backend：https://github.com/SigmaHQ/pySigma-backend-splunk）

转换关键点：
- `logsource` 映射到 Splunk 索引或 sourcetype（通常通过 pipeline 配置，不在 SPL 查询中硬编码）
- 字段名通过 field mapping 映射到客户 Splunk 索引中的实际字段名
- `detection.condition` 中的 `and`/`or`/`not` 映射为 SPL 布尔操作
- 关联（event count/sequence）需使用 `transaction` 或 `stats` 命令，不是所有 Sigma 关联类型都有直接对应

草案格式：
```spl
index=[客户索引，需配置] sourcetype=[客户 sourcetype，需配置]
[字段]=* [字段]=[值]
| ...
```
**注意：以上 SPL 草案未在 Splunk 目标索引中验证。字段名需通过客户字段字典确认。**

### Microsoft Sentinel / Defender KQL

**backend**: `microsoft365defender` 或 `azuremonitor`（pySigma 官方 backend 列表：https://sigmahq.io/docs/digging-deeper/backends）

转换关键点：
- Windows 进程创建：通常映射到 `DeviceProcessEvents`（Defender）或 `SecurityEvent`（Sentinel）
- 网络连接：通常映射到 `DeviceNetworkEvents` 或 `CommonSecurityLog`
- 字段映射：`CommandLine` → `ProcessCommandLine`（Defender）；`Image` → `FolderPath` + `FileName`
- `contains` 修饰符 → `contains` 函数或 `=~ "*value*"` 模式
- 时间窗关联使用 `join` 或 `summarize ... by ... window=...`

草案格式：
```kql
[表名]
| where [字段] contains "[值]"
| where not ([过滤条件])
```
**注意：以上 KQL 草案未在 Microsoft Sentinel/Defender Workspace 中验证。表名和字段名需根据客户数据连接器确认。**

### Elastic EQL / ES|QL

**backend**: `elasticsearch`（pySigma 官方 backend：https://github.com/SigmaHQ/pySigma-backend-elasticsearch）

转换关键点：
- EQL 用于事件序列检测（`sequence by ... [event1] [event2]`）
- ES|QL（Elasticsearch SQL 继任）用于聚合与统计查询
- 字段名：通常使用 ECS（Elastic Common Schema）字段，如 `process.command_line`、`process.parent.executable`
- `contains` → `like~ "*value*"` 或 `match(field, "value")`
- 需确认客户的索引模式（index pattern）和 ECS 映射版本

草案格式（EQL）：
```eql
process where process.executable like "*certutil*"
  and process.command_line like ("*urlcache*", "*split*")
  and not process.parent.executable like "*sccm*"
```
**注意：以上 EQL/ES|QL 草案未在 Elastic 目标集群中验证。字段名基于 ECS 约定，需确认客户的索引映射。**

## 分步方法

**步骤 1 — 建立字段映射表**
对 Sigma 源规则中使用的每个字段，建立三列映射：
- Sigma 字段名
- 每个目标平台的对应字段名
- 若字段名未知，标注"需客户确认"

**步骤 2 — 处理修饰符兼容性**
检查 Sigma 源规则中的每个修饰符：
- `contains` / `startswith` / `endswith`：各平台均有对应语法，无兼容性问题
- `re:`（正则）：各平台支持但语法不同，需分别适配
- `|all`（AND 列表）：需要在 SPL/KQL/EQL 中拆开为多个 AND 条件
- 关联类型（event_count 等）：可能无直接语法对应，在草案注释中说明降级方式

**步骤 3 — 生成每个平台的查询草案**
按上方格式生成 SPL、KQL、EQL/ES|QL 三个草案，每个草案末尾附：
- 字段映射摘要
- 未验证声明
- 官方转换工具推荐（pySigma）

**步骤 4 — 标注不支持项**
若某平台不支持某 Sigma 功能：
- 明确说明不支持的功能（如"Splunk 不支持 Sigma 关联类型 `event_count`"）
- 给出等效的手动实现思路（如"可用 `| stats count` 替代"）
- 不静默省略检测逻辑

## 输出结构

```
## 目标平台转换草案

**Sigma 源规则**: [title] ([id])
**转换日期**: YYYY-MM-DD
**转换方式**: 手动草案，未使用 pySigma 自动转换（推荐路径：https://github.com/SigmaHQ/pySigma）

---

### 字段映射表
| Sigma 字段 | Splunk 字段 | Sentinel/Defender KQL 字段 | Elastic EQL 字段 |
|---|---|---|---|
| CommandLine | CommandLine（待客户确认） | ProcessCommandLine | process.command_line |
| Image | Image（待客户确认） | FolderPath+"/"+FileName | process.executable |

---

### Splunk SPL 草案
```spl
[查询内容]
```
注意：未在 Splunk 目标索引中验证。需确认: 索引名、sourcetype、字段映射。

---

### Microsoft Sentinel/Defender KQL 草案
```kql
[查询内容]
```
注意：未在 Microsoft Sentinel/Defender Workspace 中验证。需确认: 表名、数据连接器配置、字段映射。

---

### Elastic EQL/ES|QL 草案
```eql
[查询内容]
```
注意：未在 Elastic 目标集群中验证。需确认: 索引模式、ECS 字段映射版本。

---

### 不支持项说明
- [平台]: [不支持的功能] — 降级方式: [说明]
```

## 证据与引用规则

- Sigma 规范：https://github.com/SigmaHQ/sigma/wiki/Specification
- pySigma 官方工具：https://github.com/SigmaHQ/pySigma
- Sigma Backends 文档：https://sigmahq.io/docs/digging-deeper/backends
- Sigma Processing Pipelines：https://sigmahq.io/docs/digging-deeper/pipelines
- 字段映射参考的来源（ECS、具体平台文档）应在映射表备注中列出。

## 未知/冲突/缺失处理

- 字段字典未提供：字段映射列"需客户确认"，草案使用 Sigma 原字段名加注释。
- 目标平台版本未提供：注明"草案基于常见版本约定，请对照客户实际版本确认字段名"。
- pySigma 转换与手动草案有差异：以 pySigma 实际输出为准，本草案仅供参考。

## 禁止事项

- 不得声称转换草案已在客户目标环境执行验证。
- 不得静默省略 Sigma 中不被目标平台支持的检测逻辑，必须明确说明降级。
- 不得将某平台对某 SPL/KQL 语法的支持扩展为对所有 Sigma 修饰符的支持。
