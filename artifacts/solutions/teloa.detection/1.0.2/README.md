# 检测工程

Detection Engineering

面向检测工程师的威胁检测开发方案。覆盖从检测需求梳理到 Sigma 规则编写、目标平台转换草案、设备原生规则草案、样本回放调优，以及变更与回滚说明的完整链路。

---

## 现在可做

加载本方案后，以下任务可立即使用：

- **检测需求梳理**：提供威胁描述或 ATT&CK 技术编号，获得结构化检测需求文档（威胁假设、Data Component 映射、关键字段、误报来源、验收判据）。
- **Sigma 规则编写**：基于需求文档生成符合 Sigma 规范的源规则，包含所有必需字段（title/id/status/description/references/author/date/logsource/detection/falsepositives/level/tags）。规范参考：https://github.com/SigmaHQ/sigma/wiki/Specification
- **目标平台转换草案**：将 Sigma 源规则转换为 Splunk SPL、Microsoft Sentinel/Defender KQL、Elastic EQL/ES|QL 草案，并附字段映射表。所有草案标注"未在目标引擎验证"。
- **设备原生规则草案**：提供 Suricata/Snort 或 YARA 规则的通用格式草案，需客户提供目标版本与字段信息进行验证。
- **样本回放与误报调优**：基于用户提供的正负样本，手动评估规则命中情况并记录调优过程。
- **变更与回滚说明**：生成规则版本、影响范围、测试覆盖状态和具体回滚步骤文档。

---

## 还需你提供

以下内容需要你在加载方案后配置或提供，本方案不预置：

- **日志字段字典**：目标 SIEM/EDR 的实际字段名，用于精确字段映射（如 Splunk 索引字段、Sentinel 表结构）。
- **目标平台版本**：Splunk Enterprise 版本、Sentinel Workspace 配置、Elastic 集群版本，影响语法兼容性。
- **pySigma 配置**：若使用官方自动转换工具（推荐路径），需配置对应 backend 与 pipeline：https://github.com/SigmaHQ/pySigma
- **正负样本**：用于规则测试的脱敏日志记录（正样本：模拟攻击行为；负样本：正常业务活动）。
- **验收阈值**：正样本命中率和误报率目标，由你根据业务误关代价设定，本方案不提供固定值。
- **规则库与 SID 分配**：Suricata/Snort 规则的 SID 范围由你的规则库管理机制分配。
- **规则下发授权流程**：谁可以批准规则在生产环境加载与启用（本方案只产出草案）。

---

## 会请求的权限

本方案的检测工程师岗位以草案与只读为默认范围：

- **只读**：已授权平台的日志字段字典查询、规则库读取。
- **草案**：Sigma 规则、平台转换草案、测试报告、变更说明——均为草案形式，不自动执行。
- **需独立授权**：规则在生产 SIEM 加载、启用阻断模式、扩大日志采集范围，均为确认点，不作为自主动作。

---

## 已验证范围

- 本方案内容基于合成样例测试（见 `examples/` 目录，certutil 下载检测端到端样例）。
- Sigma 规则草案符合 SigmaHQ/sigma 规范字段要求（https://github.com/SigmaHQ/sigma/wiki/Specification）。
- 目标平台查询草案（SPL/KQL/EQL）为**手动参考草案，未在任何 SIEM 实例中执行验证**。
- pySigma 为推荐的自动化验证路径，本方案不替代该工具的实际转换与测试。

---

## 不包含

- 规则在生产 SIEM 的自动加载与启用：需独立授权流程。
- 特定 SIEM/EDR 厂商的现成 pySigma pipeline 配置：需根据客户环境定制。
- 攻击样本生成（shellcode、恶意载荷）：本方案不产生攻击性内容。
- LSASS 访问、内存注入等复杂检测的目标平台 VALIDATED 状态：需在客户环境完成端到端验收。
- 合规报告：本方案专注于技术检测开发。

---

## English Summary

This package provides a detection engineer role covering the full pipeline from requirements analysis to Sigma rule authoring, platform translation drafts (Splunk SPL, Microsoft Sentinel KQL, Elastic EQL/ES|QL), native device rule drafts (Suricata/YARA), sample replay tuning, and change/rollback notes. All platform translation drafts are explicitly marked "not validated in the target engine." pySigma (https://github.com/SigmaHQ/pySigma) is the recommended automated conversion and validation path. Rule deployment requires independent authorization.
