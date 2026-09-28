# 检测工程方法与来源索引

本文件说明本方案采用的方法论依据，以及各技能中引用的来源台账。
不复制受限标准原文。ATT&CK 技术编号与 NIST 概念可自由引用。

---

## 1. Sigma 规则规范

Sigma 是平台无关的检测规则描述语言，由 SigmaHQ 维护。

**规范参考**：https://github.com/SigmaHQ/sigma/wiki/Specification
**pySigma 官方转换工具**：https://github.com/SigmaHQ/pySigma
**Backends 文档**：https://sigmahq.io/docs/digging-deeper/backends
**Processing Pipelines 文档**：https://sigmahq.io/docs/digging-deeper/pipelines

关于本方案的使用立场：
- 本方案产出 Sigma 源规则作为检测意图的平台无关表达。
- 目标平台转换草案供手动审查，pySigma 是官方推荐的自动化转换路径。
- "Sigma 转换成功"不等于"在客户环境有效"——字段名、索引、语法版本需逐一确认。

---

## 2. MITRE ATT&CK 检测数据模型

ATT&CK v18+ 引入了基于 Data Components 的检测数据模型，替代旧 Data Sources 体系。

**ATT&CK 主页**：https://attack.mitre.org/resources/working-with-attack/
**Data Sources（v18 起弃用说明）**：https://attack.mitre.org/datasources/
**检测数据模型原则**：https://mitre-attack.github.io/attack-data-model/docs/principles/attack-detections/

本方案的使用原则：
- 检测需求梳理与狩猎计划中的"Data Component"使用 ATT&CK v18+ 术语。
- 不使用旧版"数据源数量"作为覆盖率指标。
- ATT&CK 技术引用格式：`T1234.001 子技术名（ATT&CK v19）`，使用时确认当前版本。

---

## 3. 目标平台参考

### Splunk

官方 pySigma Splunk backend：https://github.com/SigmaHQ/pySigma-backend-splunk
本方案草案为手动参考，不替代 pySigma 实际转换输出。字段映射需通过客户 Splunk 索引的实际字段确认。

### Microsoft Sentinel / Defender XDR

官方 pySigma backend 列表（含 Sentinel/Defender）：https://sigmahq.io/docs/digging-deeper/backends
关于旧版 Advanced Hunting API：旧 Defender XDR Advanced Hunting API 已标记为退役迁移，2026-01 起开始退役，新连接应使用 Microsoft Graph security API。
- 旧 API 迁移说明：https://learn.microsoft.com/en-us/defender-xdr/api-advanced-hunting
- Graph security API：https://learn.microsoft.com/en-us/graph/api/resources/security-api-overview?view=graph-rest-1.0

### Elastic

官方 pySigma Elasticsearch backend：https://github.com/SigmaHQ/pySigma-backend-elasticsearch
ECS（Elastic Common Schema）字段约定：https://www.elastic.co/guide/en/ecs/current/
字段映射需确认客户的 ECS 版本与索引映射配置。

### Suricata

CLI 参考（固定 8.0.0 版本文档，非最新部署推荐）：https://docs.suricata.io/en/suricata-8.0.0/command-line-options.html
配置测试：`suricata -T -c <config>`；PCAP 回放：`suricata -r <pcap>`。
Snort/Suricata 语法并非完全兼容，草案需标注目标引擎。

### Wazuh

日志测试工具（logtest）：https://documentation.wazuh.com/current/user-manual/ruleset/testing.html
使用与分析引擎相同的规则/解码器进行测试。客户部署版本需另行确认。

---

## 4. 检测规则最小交付包（方法论建议）

参考调研文件 §5.2，每条规则候选建议包含：

1. 检测假设、适用 ATT&CK ID/版本、所需遥测、可观测与不可观测的边界
2. Sigma 源规则、精确工具与 backend/pipeline 版本、字段映射
3. 每个目标的转换结果与变化说明
4. 脱敏正样本、近似正常负样本、边界样本；数据许可与来源
5. 目标引擎语法/加载结果、命中结果、误报说明、运行成本
6. 上线草案、规则身份、重复检测、回滚版本

本方案各技能对应以上步骤：检测需求技能对应 1；Sigma 规则技能对应 2；平台转换技能对应 3；样本回放技能对应 4–5；变更回滚技能对应 6。

---

## 5. 验收方法

每个对外列为支持的平台需完成完整验收链路：
原始样本 → 解析 → 查询/规则 → 真阳性与反样本 → 产出报告

不支持项（如不兼容的修饰符、聚合语法）不能静默降级，必须明确标注。

---

## 6. 客户配置说明

以下内容需要客户提供，本方案不预置：

- SIEM 平台名称、版本、索引/表结构与字段字典
- 目标引擎（Splunk/Sentinel/Elastic）的部署版本与许可范围
- Suricata/Snort/YARA 规则库管理机制、SID 分配范围
- 规则下发、启用与回滚的授权流程
- 正负样本来源与脱敏方式

---

## 7. 来源台账

| 来源 | 版本/状态 | URL | 许可 |
|---|---|---|---|
| Sigma 规范 | 滚动文档（SigmaHQ） | https://github.com/SigmaHQ/sigma/wiki/Specification | Apache-2.0 |
| pySigma | 滚动版本 | https://github.com/SigmaHQ/pySigma | LGPL-2.1 |
| Sigma Backends | 滚动文档 | https://sigmahq.io/docs/digging-deeper/backends | — |
| Sigma Pipelines | 滚动文档 | https://sigmahq.io/docs/digging-deeper/pipelines | — |
| MITRE ATT&CK | v19.x（使用时确认） | https://attack.mitre.org | Apache-2.0 |
| ATT&CK 检测数据模型 | v18+（随 ATT&CK 更新） | https://mitre-attack.github.io/attack-data-model/docs/principles/attack-detections/ | Apache-2.0 |
| Suricata CLI | 8.0.0（固定文档版本） | https://docs.suricata.io/en/suricata-8.0.0/command-line-options.html | GPLv2 |
| Wazuh logtest | current（滚动文档） | https://documentation.wazuh.com/current/user-manual/ruleset/testing.html | GPLv2 |
| pySigma Splunk backend | 滚动版本 | https://github.com/SigmaHQ/pySigma-backend-splunk | LGPL-2.1 |
| pySigma Elasticsearch backend | 滚动版本 | https://github.com/SigmaHQ/pySigma-backend-elasticsearch | LGPL-2.1 |
| Microsoft 旧 Advanced Hunting API 迁移说明 | 2026-08-03 更新 | https://learn.microsoft.com/en-us/defender-xdr/api-advanced-hunting | Microsoft 文档（仅引用） |
| Microsoft Graph security API | Graph v1.0 | https://learn.microsoft.com/en-us/graph/api/resources/security-api-overview?view=graph-rest-1.0 | Microsoft 文档（仅引用） |
