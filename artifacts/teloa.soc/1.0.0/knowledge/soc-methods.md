# SOC 方法与来源索引

本文件说明本方案采用的方法论依据，以及各知识文件中引用的来源。
不复制任何受限标准原文；ATT&CK 技术编号与 NIST 阶段名称均可自由引用。

---

## 1. 事件响应阶段（NIST SP 800-61r3）

本方案的 T1/T2 工作流程使用 NIST SP 800-61r3 定义的四个事件响应阶段：
**检测（Detection）→ 分析（Analysis）→ 遏制（Containment）→ 恢复（Recovery）**

- T1 告警研判对应"检测"阶段的初始分类；
- T2 事件调查跨越"检测"与"分析"阶段；
- 遏制与恢复建议必须经人工确认，不由本方案自动执行。

**来源**：NIST SP 800-61r3 *Computer Security Incident Handling Guide*，2025-04 Final，
URL: https://csrc.nist.gov/pubs/sp/800/61/r3/final
许可：美国联邦政府公共领域文件，可自由引用。
本方案引用方式：仅引用阶段名称与框架概念，不复制标准原文。

---

## 2. 技术映射（MITRE ATT&CK）

本方案的研判卡、假设与狩猎计划使用 MITRE ATT&CK 技术编号标注攻击者行为。

引用版本：ATT&CK v19.x（当前主要版本，最新更新请在工作时确认）
引用格式：`T1234.001 子技术名（ATT&CK v19）`

关于数据检测模型：
- ATT&CK v18 起弃用旧 Data Sources（数量统计），新检测内容应使用 **Data Components**。
- 检测策略（Detection Strategies）、分析项（Analytic）和数据组件（Data Component）的关系参见：
  ATT&CK 检测数据模型 https://mitre-attack.github.io/attack-data-model/docs/principles/attack-detections/

**来源**：MITRE ATT&CK 官方数据，https://attack.mitre.org/resources/working-with-attack/
许可：ATT&CK 内容采用 Apache-2.0 许可，可自由引用技术编号与名称。
本方案引用方式：仅引用技术编号、名称和战术，不复制技术描述或数据。

---

## 3. 检测数据模型

| 术语 | 含义 | 本方案用途 |
|---|---|---|
| Data Component | ATT&CK v18+ 检测数据分类（如 Process Creation、Network Traffic Content） | 狩猎计划数据可见性矩阵 |
| Detection Analytic | 基于 Data Component 的检测逻辑 | 查询草案的理论基础 |
| Data Source | v18 前的旧分类体系，已弃用 | 不使用 |

---

## 4. T1 分诊设计原则

**分类三分法来源**：本方案自编设计，参考行业 SOC 实践；分类名称（疑似真实威胁/已解释正常/证据不足）不是标准规定，客户可根据自有工单系统替换为对应状态。

**置信度与严重度分离**：这一设计来源于 NIST SP 800-61r3 中强调分析结论应区分证据确定性与业务影响的原则。

---

## 5. T2 调查设计原则

**可证伪假设方法**：来自科学方法与 NIST SP 800-61r3 对分析阶段的描述，强调调查员必须主动寻找反证而不仅收集支持证据。

**取证保管链**：本方案仅使用哈希支持字节一致性验证。完整的法庭级取证保管链需要独立取证工具与程序，不在本方案范围内。

---

## 6. 威胁狩猎（T3）方法论

**假设驱动狩猎**：从业务风险或 ATT&CK 技术出发形成可证伪假设，确认数据可见性，再执行查询。不做无目标的全量扫描。

结论表述要求：无阳性发现时写
"在本次范围（数据源 X、时间窗 Y、方法 Z）内未发现支持 [假设] 的证据"，
不写为"环境中不存在该威胁"。

---

## 7. 客户配置说明

以下内容需要客户在加载本方案后提供，本方案不预先设定：

- SIEM 平台名称、告警 API 地址、读取凭据
- EDR 平台名称与授权范围
- 资产台账位置与访问方式
- 工单系统（SOAR）集成配置
- 响应授权边界（谁可以批准哪类处置动作）
- 组织特有的告警严重度分级标准

---

## 8. 引用台账（可用于合成样例中的引用标注）

| 来源 | 版本 | URL | 许可 |
|---|---|---|---|
| NIST SP 800-61r3 | Final 2025-04 | https://csrc.nist.gov/pubs/sp/800/61/r3/final | 公共领域 |
| MITRE ATT&CK | v19.x（使用时确认最新版） | https://attack.mitre.org | Apache-2.0 |
| ATT&CK 检测数据模型 | 随 v18+ 更新 | https://mitre-attack.github.io/attack-data-model/docs/principles/attack-detections/ | Apache-2.0 |
| ATT&CK Data Sources 弃用说明 | v18 起 | https://attack.mitre.org/datasources/ | Apache-2.0 |
