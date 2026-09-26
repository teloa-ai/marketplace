<!-- 合成样例，非真实数据。所有主机名、账号、IP、哈希均为虚构。 -->

# T2 事件调查输入样例：疑似横向移动证据包

## 来源 T1 研判卡

```
告警 ID: ALERT-2024-001289
分类: 疑似真实威胁
ATT&CK 映射: T1021.002 SMB/Windows Admin Shares（ATT&CK v19）
研判说明: 工作站 WORKSTATION-12 在非工作时段通过 SMB 访问了多台服务器管理共享，
          涉及账号 svc-backup 上周发生了密码变更（未找到对应变更单）。
升级原因: 多服务器横向移动迹象，服务账号异常密码变更。
```

## 已提供证据材料

### 端点日志（已授权 SIEM 查询，时间窗 2024-03-20T22:00Z — 2024-03-21T02:00Z）

```
事件摘要（共 47 条）:

2024-03-20T22:14:33Z — WORKSTATION-12: 用户 svc-backup 登录（类型3，网络登录）
2024-03-20T22:14:45Z — WORKSTATION-12: net.exe 执行，命令行: net use \\SRV-FINANCE-01\admin$ /user:svc-backup ***
2024-03-20T22:15:02Z — SRV-FINANCE-01: SMB 连接接收，来源: WORKSTATION-12，账号: svc-backup
2024-03-20T22:15:08Z — SRV-FINANCE-01: 文件系统访问 C:\Windows\System32\，读取多个 DLL
2024-03-20T22:22:17Z — WORKSTATION-12: net.exe 执行，命令行: net use \\SRV-HR-02\admin$ /user:svc-backup ***
2024-03-20T22:22:34Z — SRV-HR-02: SMB 连接接收，来源: WORKSTATION-12，账号: svc-backup
2024-03-20T22:23:01Z — SRV-HR-02: whoami.exe 执行（父进程: cmd.exe，父命令行含 SMB 路径）
2024-03-20T22:45:00Z — SRV-FINANCE-01: tasklist.exe 执行（父进程: cmd.exe）
2024-03-20T23:10:22Z — SRV-FINANCE-01: powershell.exe 执行，命令行: -EncodedCommand [Base64 字符串]
```

### 身份审计日志（已提供）

```
账号: svc-backup
账号类型: 服务账号（备份系统使用）
所属组: Backup-Operators（不在 Domain Admins 中）
密码上次变更: 2024-03-15T14:22:00Z（无变更单，备份系统负责人未收到通知）
MFA: 不适用（服务账号）
正常行为基线: svc-backup 通常只从 BACKUP-SERVER-01 发起连接，不从工作站发起
```

### 资产台账（已提供）

```
WORKSTATION-12: 财务分析师 a.chen@corp.example-org.local 专用工作站（目前 a.chen 在休假，已确认）
SRV-FINANCE-01: 财务核心系统（高价值资产，存储季度财报）
SRV-HR-02: 人力资源系统（高价值资产，存储员工薪资数据）
BACKUP-SERVER-01: 备份服务器（高价值资产）
```

## 已授权数据源范围

- 端点 EDR（进程、网络、文件系统事件，保留 90 天）
- SIEM 集中日志（Windows 安全日志、DNS 日志，保留 30 天）
- 目录服务（账号信息只读查询）

## 附加信息

- WORKSTATION-12 用户 a.chen 自 2024-03-18 开始休假
- 告警触发时间与通常办公时段（08:00–18:00 +08:00）不符
- 未发现与 2024-03-20 相关的计划性维护窗口
