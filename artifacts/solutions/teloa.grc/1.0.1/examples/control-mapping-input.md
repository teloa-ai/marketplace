**合成样例，非真实数据。所有策略文件、证据描述均为虚构，仅用于演示控制映射和差距分析输出格式。**

# 控制映射输入样例

## 映射请求

**目标框架**：ISO/IEC 27001:2022（附件 A，全量 93 控制）  
**业务范围**：CloudNote 虚构 SaaS 笔记服务，含 Web 应用、API 后端、数据库、文件存储  
**范围内系统**：Web 前端、REST API、用户数据库、文件对象存储  
**范围外**：CDN 提供商内部（仅接口层）

## 已提供策略文件

| 文件 ID | 文件名 | 版本 | 日期 |
|---|---|---|---|
| DOC-001 | information-security-policy.pdf | v1.2 | 2025-03-01 |
| DOC-002 | access-control-policy.pdf | v1.0 | 2025-01-15 |
| DOC-003 | incident-response-procedure.pdf | v1.1 | 2025-04-20 |
| DOC-004 | vulnerability-management-procedure.pdf | v0.9 | 2024-11-01（草稿）|
| DOC-005 | security-awareness-training-records-2025.xlsx | N/A | 2025-08-31 |

## 补充说明

- 物理安全控制由云提供商负责，有云提供商安全白皮书（未提供）
- 供应链/供应商管理策略尚在起草中，未提供
- 加密策略包含在 DOC-001 第 5 节中
- 最近一次渗透测试报告（2025-06）未提供
- 员工数量：约 35 人
- 暂无获得任何合规认证

## 期望输出

映射表草案（ISO 27001:2022 附件 A，选取以下 10 项示例控制）及差距统计。
