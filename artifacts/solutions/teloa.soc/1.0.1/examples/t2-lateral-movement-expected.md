<!-- 合成样例，非真实数据。所有主机名、账号、IP、哈希均为虚构。 -->

# T2 事件调查报告草案：疑似横向移动事件

**事件 ID**: INC-2024-0089（由报告发起人填写）
**报告日期**: 2024-03-21（UTC）
**调查人员**: T2 事件调查员（Teloa 任务执行）
**报告状态**: 草案——待授权人员审核，所有处置建议需审批后方可执行

---

## 1. 事件摘要

2024-03-20 22:14 UTC，休假员工工作站 WORKSTATION-12 使用服务账号 svc-backup（密码在无变更单情况下于 6 天前变更）通过 SMB 管理共享连接到高价值服务器 SRV-FINANCE-01 和 SRV-HR-02，随后在 SRV-FINANCE-01 上执行了进程枚举和 PowerShell 编码命令。攻击活动在非工作时段（UTC+8 06:14 — 07:45 凌晨）发生。当前状态：**调查中，高严重度，疑似凭据入侵后横向移动**。

---

## 2. 关键时间节点

| UTC 时间 | 事件 | 来源 |
|---|---|---|
| 22:14:33 | WORKSTATION-12 接收 svc-backup 网络登录（类型3） | 端点 EDR，Windows Security Log Event 4624 |
| 22:14:45 | net.exe 执行，连接 SRV-FINANCE-01 管理共享 | 端点 EDR，ProcessCreate |
| 22:15:02 | SRV-FINANCE-01 接收 SMB 连接（来源: WORKSTATION-12） | SIEM，SMB 审计日志 |
| 22:15:08 | SRV-FINANCE-01 System32 DLL 读取（多个文件） | 端点 EDR，FileSystemAccess |
| 22:22:17 | net.exe 执行，连接 SRV-HR-02 管理共享 | 端点 EDR，ProcessCreate |
| 22:22:34 | SRV-HR-02 接收 SMB 连接 | SIEM，SMB 审计日志 |
| 22:23:01 | SRV-HR-02: whoami.exe 执行（父: cmd.exe） | 端点 EDR，ProcessCreate |
| 22:45:00 | SRV-FINANCE-01: tasklist.exe 执行（父: cmd.exe） | 端点 EDR，ProcessCreate |
| 23:10:22 | SRV-FINANCE-01: powershell.exe -EncodedCommand 执行 | 端点 EDR，ProcessCreate |

时间线缺口：
- 22:15:08 — 22:45:00 SRV-FINANCE-01 活动（约 30 分钟）：文件访问细节不完整，已采集字段显示 DLL 读取但缺少更细粒度的文件 I/O 记录。

---

## 3. 影响范围

### 已确认受影响
- 主机: WORKSTATION-12（初始访问起点），SRV-FINANCE-01（确认有 SMB 访问、进程枚举和编码 PS 执行），SRV-HR-02（确认有 SMB 访问和 whoami 执行）
- 账号: svc-backup（确认被滥用，密码来源待查）
- 数据/系统: SRV-FINANCE-01 System32 DLL 读取（侦察特征，实际数据外传待查）；SRV-HR-02 中进程信息（whoami）

### 不确定（需进一步确认）
- SRV-FINANCE-01 上 PowerShell 编码命令内容：Base64 字符串未解码，功能未知
- 是否有数据外传：无出口流量日志覆盖，无法确认
- WORKSTATION-12 的初始入口：如何获得 svc-backup 凭据，尚未确定
- BACKUP-SERVER-01 是否受波及：未在时间窗内见到相关事件，但 svc-backup 正常来源于此，需要排查

---

## 4. 根因推断

**初始入口**: 未确定。现有证据从 WORKSTATION-12 使用 svc-backup 凭据发起 SMB 连接起追溯。svc-backup 密码于 2024-03-15 无变更单变更，可能是凭据被盗后攻击者修改，或其他途径导致。

**攻击路径**:
1. 通过未知方式获得 svc-backup 账号访问权（或修改密码）
2. 在休假员工工作站 WORKSTATION-12 上使用 svc-backup 发起横向移动
3. SMB 访问两台高价值服务器的管理共享
4. 在目标服务器上执行侦察命令（whoami、tasklist）
5. 在 SRV-FINANCE-01 上执行编码 PowerShell（功能待查）

**ATT&CK 映射**:
| 战术 | 技术编号 | 技术名称 | 版本 | 证据摘要 |
|---|---|---|---|---|
| 横向移动 | T1021.002 | SMB/Windows Admin Shares | ATT&CK v19 | net.exe 访问 \\\admin$，SMB 日志确认 |
| 发现 | T1057 | Process Discovery | ATT&CK v19 | tasklist.exe，whoami.exe 执行 |
| 执行 | T1059.001 | PowerShell | ATT&CK v19 | powershell.exe -EncodedCommand（待解码） |
| 凭据访问 | T1098 | Account Manipulation | ATT&CK v19（假设 H1） | svc-backup 密码无变更单变更 |

**根因说明**: 最可能根因是 svc-backup 凭据被盗或被攻击者修改，随后从受控的工作站发起横向移动。初始入口未确定，上述推断为假设 H1（置信度 Medium），不作为已证实事实。

---

## 5. 调查假设状态

### 假设 H1（主要）：外部或内部攻击者获取 svc-backup 凭据并主动入侵
- 支持：无变更单密码变更；工作站用户在休假；非工作时段；已知正常行为不从工作站发起
- 待验证：svc-backup 密码如何变更（LAPS？BACKUP-SERVER-01 日志？）；WORKSTATION-12 上 2024-03-15 附近的事件

### 假设 H2（替代）：备份系统故障触发了异常账号行为
- 支持：svc-backup 是备份账号，有技术上访问管理共享的理由
- 反对：不从工作站发起；非备份窗口时段；进程枚举行为不符合备份任务特征
- 状态：基本排除，但密码变更来源仍需确认

---

## 6. 处置建议（需授权后执行）

| 优先级 | 建议动作 | 受影响范围 | 业务影响 | 所需授权 |
|---|---|---|---|---|
| 立即 | 禁用 svc-backup 账号（或重置密码并强制所有会话终止） | 备份系统服务 | 备份任务可能中断，需备份团队协调 | IT 安全负责人审批 |
| 立即 | 收集 SRV-FINANCE-01 上 PowerShell -EncodedCommand 的完整命令行（如果 EDR 有保留）并解码 | SRV-FINANCE-01 | 只读，无中断 | 现有 EDR 查询权限 |
| 24h | 排查 BACKUP-SERVER-01 在 2024-03-15 附近的账号操作日志 | BACKUP-SERVER-01 | 只读 | 备份系统管理员协作 |
| 24h | 排查 WORKSTATION-12 内存镜像或完整进程树（2024-03-20T22:00Z 前后） | WORKSTATION-12 | 需暂停使用 | 需独立取证授权 |
| 本周 | 评估 SRV-FINANCE-01 数据外传风险，排查出口流量日志（若有） | 财务系统 | 只读 | 网络日志访问授权 |

**注意：以上建议均需授权人员审批后方可执行，不应由本报告直接触发任何远端操作。**

---

## 7. 未完成调查事项

| 问题 | 所需数据/操作 | 状态 |
|---|---|---|
| svc-backup 密码变更来源 | BACKUP-SERVER-01 安全日志（2024-03-15） | 待授权查询 |
| PowerShell 编码命令内容 | EDR 完整命令行记录 | 待查询 |
| 是否有数据外传 | 出口网络日志 | 待确认日志可用性 |
| WORKSTATION-12 初始感染路径 | WORKSTATION-12 完整进程历史（2024-03-15 前后） | 待取证授权 |
| BACKUP-SERVER-01 是否受波及 | BACKUP-SERVER-01 事件日志 | 待排查 |

---

## 8. 参考资料

- NIST SP 800-61r3 事件响应阶段（检测、分析、遏制、恢复），2025-04 Final
- MITRE ATT&CK v19，技术编号 T1021.002、T1057、T1059.001、T1098
