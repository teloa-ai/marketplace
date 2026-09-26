<!-- 合成样例，非真实数据。所有主机名、账号、IP、域名均为虚构。 -->

# T1 分诊期望产出：钓鱼 URL 点击告警

## 研判卡

| 字段 | 值 |
|---|---|
| 告警 ID | ALERT-2024-001234 |
| 原始来源 | Endpoint Detection Platform，规则: Phishing URL Click Detected |
| 告警接收时间 | 2024-03-15 08:42:17 UTC（原时区: 08:42:17 +00:00） |
| 涉及主机 | WORKSTATION-47.corp.example-org.local |
| 涉及账号 | j.smith@corp.example-org.local |
| 其他实体 | 域名: login-secure-update.example-phish.com；IP: 198.51.100.42:80；进程: chrome.exe（PID 4821） |
| 分类 | **疑似真实威胁（True Positive）** |
| 业务严重度 | Medium |
| 置信度 | Medium |
| ATT&CK 映射 | T1566.002 Phishing: Spearphishing Link（ATT&CK v19）；T1078 Valid Accounts（待进一步确认是否凭据已提交） |

## 支持证据

| 序号 | 描述 | 来源字段/查询 | 具体值 |
|---|---|---|---|
| 1 | 用户点击了指向非组织域名的 URL | url.domain=login-secure-update.example-phish.com | 与 corp.example-org.local 无关联 |
| 2 | 目标域名含"login""secure""update"组合，与常见钓鱼模式一致 | url.full | http://login-secure-update.example-phish.com/auth?token=abc123 |
| 3 | HTTP 200 响应被加载（非即时拦截） | 08:42:18Z 网络事件，响应大小 12.4KB | [来源: 端点日志，response.status_code=200] |
| 4 | 告警后 45 秒内有键盘输入事件指向该域名页面 | 08:43:02Z，process=chrome.exe，url=login-secure-update.example-phish.com | [来源: 端点行为日志] |

## 反对证据

| 序号 | 描述 | 来源字段/查询 | 具体值 |
|---|---|---|---|
| 1 | MFA 已启用，即使凭据提交也需额外因素 | 账号信息（已提供） | mfa.enabled=true |
| 2 | 账号无特权组成员资格，横向移动能力受限 | 目录信息（已提供） | 所属组: Finance-Users |
| 3 | 导航时长较短（约 2 分钟后离开页面），但无法排除凭据已提交 | 08:44:15Z 导航离开事件 | [来源: 端点日志] |

## 证据缺口

- **最关键缺口**：无法确认凭据是否已提交（HTTP 表单 POST 事件未在已采集字段中，或 HTTPS 情况下内容不可见）。需要用户访谈或网关日志补充。
- 目标 IP 198.51.100.42 的威胁情报：未提供外部 TI 查询结果，无法评估是否为已知恶意 IP。
- 无邮件日志：无法确认钓鱼链接来源（邮件/即时通讯/其他）。

## 升级建议

**建议升级到 T2 进行进一步调查**，理由：
1. 用户与疑似钓鱼页面有交互（键盘输入），不能排除凭据提交。
2. 财务部门账号即使无特权组，仍有内部财务系统访问权限，需确认账号状态。
3. **建议立即（人工确认后）执行**：对 j.smith 账号触发密码重置，挂起 MFA 令牌；建议由有权限的人员审批后执行，本研判不直接触发。

**不建议仅凭本研判关闭告警。**

## 研判说明

用户访问了典型钓鱼模式域名，页面被加载且有键盘输入迹象，但因缺少表单 POST 数据无法确认凭据是否提交。MFA 启用降低了直接账号接管风险，但不能完全排除。严重度定为 Medium（中等价值资产 + MFA 缓解 + 凭据提交不确定），置信度为 Medium（证据支持真实威胁但缺失关键确认数据）。
