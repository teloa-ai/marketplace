# 安全运营（SOC T1/T2/T3）

Security Operations — Alert Triage and Incident Investigation

面向 SOC 团队的告警研判与事件调查方案，包含 T1 告警研判员和 T2 事件调查员两个岗位，以及威胁狩猎计划模板（T3 内容，需客户遥测支持）。

---

## 现在可做

加载本方案后，以下任务可立即使用：

- **T1 告警分诊**：将告警原文（SIEM 导出/截图/文本）提供给 T1 告警研判员，获得真/误/待定判定、严重度与置信度评估、证据表与升级建议。
- **实体上下文补全**：提取告警涉及的主机、账号、IP、域名、哈希、进程并关联已知信息（需提供资产台账或上下文材料）。
- **T2 事件调查**：提供 T1 研判卡或客户事件描述，T2 调查员完成证据时间线、假设生成与验证、影响评估和调查报告草案。
- **威胁狩猎计划（草案）**：提供业务关注点和遥测概况，获得假设、数据可见性矩阵和查询逻辑草案——草案需在客户目标环境中验证后方可执行。
- **交班记录**：生成班次交接文档，覆盖活跃事件、关键动作与挂起的待审批项。

---

## 还需你提供

以下内容需要你在加载方案后配置或提供，本方案不预置：

- **SIEM/EDR 连接**：平台地址、读取凭据、查询 API 端点（本方案不内置任何厂商凭据）。
- **资产台账**：主机-业务归属-分级映射，可作为文件上传或通过数据源连接提供。
- **目录服务访问**：账号组成员关系、MFA 状态的只读查询权限。
- **响应授权边界文档**：哪些角色可以批准哪类处置动作（封禁/隔离/密码重置等）。
- **告警严重度分级标准**：本方案使用 High/Medium/Low 三档，可映射到你的工单系统状态。
- **客户遥测覆盖说明**（T3 狩猎）：日志类型、保留期、字段字典（用于数据可见性矩阵）。

---

## 会请求的权限

本方案的岗位以只读与草案为默认范围：

- **只读**：告警查询、日志检索、目录信息读取、资产台账读取。
- **草案**：研判卡、调查报告、处置建议、狩猎计划——均为草案形式，不自动执行。
- **需人工确认**：关闭/抑制告警、封禁账号、隔离主机、修改检测规则、向外部工单系统提交，均为确认点，不作为自主动作。

---

## 已验证范围

- 本方案内容基于合成样例测试（见 `examples/` 目录）。
- 不依赖特定 SIEM 或 EDR 厂商：技能输出格式为平台无关的结构化文本。
- T3 狩猎计划查询草案为**平台无关逻辑**，未在任何客户环境或 SIEM 引擎中执行验证。

---

## 不包含

- 生产处置自动化（隔离、封禁、工单关闭）：本方案不内置这些动作。
- 特定 SIEM/EDR 厂商的现成集成：需要在"还需你提供"步骤中完成配置。
- 完整的法庭级取证保管链：仅支持哈希字节一致性验证。
- 攻击模拟或紫队功能：需要独立的隔离环境与书面授权。
- 合规报告模板：本方案专注于事件响应操作，GRC 合规需使用 GRC 方案。

---

## English Summary

This package provides two SOC roles (T1 alert triage analyst, T2 incident investigator) and a T3 threat hunt plan template (requires customer telemetry). T1 classifies alerts as true/false/inconclusive with evidence tables; T2 produces timelines, hypotheses, and investigation reports. All response actions (blocking, isolation, ticket closure) are confirmation points requiring human approval. No vendor credentials are included; SIEM/EDR connections must be configured after loading.

## 1.1.0：固定引用完整业务看板

本版本保留1.0.2的员工、技能、资料和任务模板，并引用 `teloa.dashboard.soc-alert-overview@1.0.0` 的完整配置。新增看板按选择目标业务、核对映射、草案、预览、本人采用进入正式配置，不带真实告警、凭据、已有同步绑定或默认动作。历史技能验证不代表新增看板或整套1.1.0已经通过真实模型端到端验收。

Version 1.1.0 preserves the employees, skills, references and task templates from 1.0.2 and references the complete configuration from `teloa.dashboard.soc-alert-overview@1.0.0`. Select a target business, review mappings, create a draft, preview it and adopt it personally. No real alerts, credentials, existing synchronization bindings or default actions are included. Historical skill verification does not establish real-model end-to-end acceptance for the new dashboard or the complete 1.1.0 package.
