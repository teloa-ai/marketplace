---
name: sigma-rule-authoring
description: 根据检测需求文档编写符合 Sigma 规范的源规则，包含所有必需字段。Sigma 规范参考：https://github.com/SigmaHQ/sigma/wiki/Specification
---

# Sigma 规则编写（Sigma Rule Authoring）

## 适用输入与前置检查

必须提供：
- 检测需求文档（或至少包含威胁假设、ATT&CK 技术、关键字段的摘要）

可选：
- 客户日志样本（用于确认字段名）
- 已有 Sigma 规则（用于参考或扩展）

前置检查：
1. 确认 Sigma 规范版本。本技能遵循 SigmaHQ/sigma 项目的规范定义。
   规范参考：https://github.com/SigmaHQ/sigma/wiki/Specification
2. 规则 `id` 字段必须为有效 UUIDv4，在合成样例中使用占位符并说明需生成唯一 UUID。
3. 若字段字典未提供，在规则注释中标注"字段名基于常见约定，需客户确认目标环境字段名"。

## Sigma 必需字段说明

| 字段 | 说明 | 示例/约束 |
|---|---|---|
| `title` | 规则简称，≤256 字符 | "Certutil Download Bypass" |
| `id` | UUIDv4，全局唯一 | 生成工具推荐：`python -c "import uuid;print(uuid.uuid4())"` |
| `status` | 规则成熟度：`stable`/`test`/`experimental`/`deprecated`/`unsupported` | 新规则建议 `experimental` |
| `description` | 规则检测行为的详细说明 | 说明攻击者目的与可观测行为 |
| `references` | 参考资料 URL 列表 | ATT&CK 技术页、公开 PoC、博客文章 |
| `author` | 规则作者 | 机构或个人名称 |
| `date` | 规则创建日期，格式 YYYY/MM/DD | 2024/03/21 |
| `logsource` | 日志来源：`product`/`category`/`service` | 见下方示例 |
| `detection` | 检测条件（selection + condition） | 见下方示例 |
| `falsepositives` | 误报场景列表 | 基于需求文档的误报分析 |
| `level` | 严重度：`critical`/`high`/`medium`/`low`/`informational` | 参考 ATT&CK 技术影响 |
| `tags` | ATT&CK 技术标签，格式 `attack.t1234` 或 `attack.t1234.001` | 小写，不带前缀点 |

## 分步方法

**步骤 1 — 填写元数据字段**
按上表填写 title、id（占位符）、status（建议 `experimental`）、description、references、author、date。
- `date` 写当前日期。
- `references` 至少包含 ATT&CK 技术页 URL。

**步骤 2 — 定义 logsource**
选择最精确的 logsource 组合：
```yaml
logsource:
  category: process_creation   # 或 network_connection、file_event 等
  product: windows             # 或 linux、macos 等
```
- `category` 优先使用 SigmaHQ 支持的标准分类（process_creation、network_connection、file_event、registry_event 等）。
- 若无标准 category，使用 `service` 加具体日志服务名（如 `service: sysmon`）。

**步骤 3 — 编写 detection**
```yaml
detection:
  selection:
    FieldName|modifier: 'value'
  filter_main:
    ParentField: 'known_legitimate_parent'
  condition: selection and not filter_main
```
常用修饰符：`contains`、`startswith`、`endswith`、`re:`（正则）、`|all`（AND 列表）、`|contains|all`。
- 过滤条件用 `filter_` 前缀命名，在 condition 中排除。
- 关联规则（`type: event_count` 等）需确认目标平台支持，在转换草案中标注支持状态。

**步骤 4 — 填写 falsepositives 与 level**
- `falsepositives` 来自需求文档的误报场景，至少写 1 条（若无则写 `"Unknown"`）。
- `level` 参考：关键系统受威胁/无过滤困难 → `high`；有过滤空间 → `medium`；信息性 → `low`。

**步骤 5 — 添加 tags**
- 格式：`attack.t1059.001`（小写，ATT&CK 技术编号前缀 `attack.`）。
- 战术标签也可添加：`attack.execution`、`attack.persistence` 等。

## 输出结构

```yaml
title: [规则标题]
id: [UUID占位符，需替换为实际 UUIDv4]
status: experimental
description: |
  [详细描述攻击行为、可观测点与本规则的检测逻辑。]
references:
  - https://attack.mitre.org/techniques/T[编号]/
  - [其他参考链接]
author: [作者名]
date: YYYY/MM/DD
logsource:
  category: [category]
  product: [product]
detection:
  selection:
    [FieldName|modifier]: '[value]'
  filter_main:
    [FilterField]: '[filter_value]'
  condition: selection and not filter_main
falsepositives:
  - [误报场景描述]
level: [high/medium/low/informational]
tags:
  - attack.t[编号]
  - attack.[战术名]
```

**注意：以上为 Sigma 源规则草案，未在任何目标 SIEM 或 EDR 引擎中执行验证。规则 id 为占位符，下发前必须替换为全局唯一 UUIDv4。**

## 证据与引用规则

- `references` 中 ATT&CK 链接格式：`https://attack.mitre.org/techniques/T[技术编号]/`（子技术在技术编号后加斜线，如 `T1059/001`）。
- Sigma 规范链接（知识文件中引用用）：https://github.com/SigmaHQ/sigma/wiki/Specification
- pySigma 转换工具（知识文件中引用用）：https://github.com/SigmaHQ/pySigma

## 未知/冲突/缺失处理

- 字段名未确认：在 detection 字段上方加注释 `# 字段名需在目标环境确认`。
- 目标平台不支持某修饰符：在转换草案技能中处理，源规则保留语义。
- 无合适 logsource category：使用 `service` 并在注释中说明"已知标准 category 不适用"。

## 禁止事项

- 不得省略任何 Sigma 必需字段（title、id、status、description、references、author、date、logsource、detection、falsepositives、level、tags）。
- 不得将 `id` 留空或使用示例 UUID（如 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）——使用有意义的占位符并说明需生成。
- 不得将规则声称为"可直接在生产环境使用"。
- 不得在规则中编码客户 IP、账号名或其他个人身份数据。
