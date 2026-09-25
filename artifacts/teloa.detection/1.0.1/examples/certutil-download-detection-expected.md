<!-- 合成样例，非真实数据。所有 IP、哈希、域名均为虚构。 -->

# 检测工程端到端样例期望产出：certutil 下载绕过检测

---

## 一、检测需求文档

### 威胁假设
- **ATT&CK 映射**: T1105 Ingress Tool Transfer（ATT&CK v19）
- **描述**: 攻击者在已获得命令行执行权限的 Windows 主机上，利用内置工具 certutil.exe 的 `-urlcache`（或简写 `-URL`）参数从外部 HTTP/HTTPS 下载文件并写入磁盘，绕过部分 Application Control 或 EDR 对非系统工具下载行为的检测。
- **可观测点**: process_creation 事件（Sysmon Event 1 或 EVID 4688），CommandLine 含 `urlcache` 且同时含下载目标参数（`-f` 或 `-split`）；Image 为 certutil.exe（含 SysWOW64 变体）。

### 数据源与 Data Component
| Data Component | 日志平台类型 | 字段可用性 | 备注 |
|---|---|---|---|
| Process Creation | Sysmon Event 1 或 EVID 4688 | ✅ 可用（含完整 CommandLine） | EVID 4688 需要审计策略启用命令行日志 |
| Network Connection | Sysmon Event 3 或 EDR 网络日志 | ⚠️ 可用但不在本规则逻辑中 | 可用于后续关联确认下载目标 |

### 关键字段清单
| Sigma 字段名 | 含义 | 示例值 | Splunk 字段 | Sentinel/Defender 字段 | Elastic EQL 字段 |
|---|---|---|---|---|---|
| Image | 进程完整路径 | C:\Windows\System32\certutil.exe | Image | FolderPath+"\\"+FileName | process.executable |
| CommandLine | 完整命令行 | certutil -urlcache -f http://... | CommandLine | ProcessCommandLine | process.command_line |
| ParentImage | 父进程路径 | C:\Windows\System32\cmd.exe | ParentImage | InitiatingProcessFolderPath+"\\"+InitiatingProcessFileName | process.parent.executable |

### 误报来源分析
| 场景描述 | 关键区分特征 | 涉及账号/系统类型 |
|---|---|---|
| IT 管理工具通过 certutil 下载补丁或配置 | 父进程为已知管理工具（如 SCCM、RMM agent） | 系统账号或 IT 管理员 |
| 证书验证（-verify -urlfetch） | CommandLine 含 `-verify`，无 `-urlcache` 或 `-f` 下载 URL | 证书管理流程 |
| 证书导出（-exportPFX） | 无网络参数 | 证书管理员 |

### 验收判据
- 正样本命中率目标: ≥100%（所有已知 P-0x 样本必须命中）
- 误报率目标: 客户根据 IT 环境设定，N-01 至 N-03 均不应命中
- 必须覆盖的边界场景: P-02 大小写变体、P-03 SysWOW64 路径
- 禁止静默降级: 不允许移除 `urlcache` 条件以"减少规则复杂度"

---

## 二、Sigma 源规则

```yaml
title: Certutil Download Using URLCache
id: REPLACE-WITH-UUIDv4-BEFORE-PRODUCTION
status: experimental
description: |
  Detects certutil.exe being used with the -urlcache (or -URL) flag combined with -f or -split
  to download a file from a remote URL. This is a known LoLBAS technique mapped to T1105.
  False positives: IT management tools using certutil to download patches (filter by ParentImage).
references:
  - https://attack.mitre.org/techniques/T1105/
  - https://lolbas-project.github.io/lolbas/Binaries/Certutil/
author: Teloa Detection Engineering
date: 2024/03/21
logsource:
  category: process_creation
  product: windows
detection:
  selection_img:
    Image|endswith:
      - '\certutil.exe'
  selection_cli:
    CommandLine|contains|all:
      - 'urlcache'
      - '-f'
    # Alternative: -split variant (uncomment to add)
    # CommandLine|contains:
    #   - 'urlcache'
    #   - 'split'
  filter_main:
    ParentImage|endswith:
      # Add known-safe parent processes per customer environment
      - '\sccm.exe'
      - '\ccmexec.exe'
  condition: all of selection_* and not filter_main
falsepositives:
  - IT management or patching tools using certutil to download legitimate packages
  - Certificate management workflows using -verify -urlfetch
level: high
tags:
  - attack.t1105
  - attack.command_and_control
```

**注意：以上 Sigma 规则为草案（status: experimental），规则 id 为占位符，下发前必须替换为全局唯一 UUIDv4。**
**规范参考：https://github.com/SigmaHQ/sigma/wiki/Specification**

---

## 三、目标平台转换草案

### 字段映射表
| Sigma 字段 | Splunk（Sysmon sourcetype） | Sentinel/Defender KQL | Elastic EQL |
|---|---|---|---|
| Image（endswith '\certutil.exe'） | Image | FolderPath + FileName（combined） | process.executable |
| CommandLine（contains urlcache, -f） | CommandLine | ProcessCommandLine | process.command_line |
| ParentImage（endswith） | ParentImage | InitiatingProcessFolderPath+FileName | process.parent.executable |

---

### Splunk SPL 草案

```spl
index=* sourcetype="XmlWinEventLog:Microsoft-Windows-Sysmon/Operational" EventID=1
  (Image="*\\certutil.exe")
  (CommandLine="*urlcache*" AND CommandLine="*-f*")
  NOT (ParentImage="*\\ccmexec.exe" OR ParentImage="*\\sccm.exe")
| table _time, Computer, User, Image, CommandLine, ParentImage
| sort -_time
```

⚠️ **未在 Splunk 目标索引中验证。** 需确认：索引名、sourcetype 配置、CommandLine 字段是否采集完整。建议使用 [pySigma Splunk backend](https://github.com/SigmaHQ/pySigma-backend-splunk) 自动转换并在测试索引验证。

---

### Microsoft Sentinel/Defender KQL 草案

```kql
DeviceProcessEvents
| where FileName =~ "certutil.exe"
| where ProcessCommandLine has "urlcache" and ProcessCommandLine has "-f"
| where not (InitiatingProcessFileName in~ ("ccmexec.exe", "sccm.exe"))
| project TimeGenerated, DeviceName, AccountName, FileName, ProcessCommandLine, InitiatingProcessFileName
| sort by TimeGenerated desc
```

⚠️ **未在 Microsoft Sentinel/Defender Workspace 中验证。** 需确认：数据连接器（MDE Integration）已就绪、表 `DeviceProcessEvents` 可用。若使用 Sentinel + Security Events，表名和字段名不同，需切换到 `SecurityEvent` 表并调整字段名。

---

### Elastic EQL 草案

```eql
process where
  process.executable like~ "*\\certutil.exe" and
  process.command_line like~ ("*urlcache*-f*", "*urlcache* -f *") and
  not process.parent.executable like~ ("*\\ccmexec.exe", "*\\sccm.exe")
```

⚠️ **未在 Elastic 目标集群中验证。** 需确认：ECS 字段映射（process.executable、process.command_line 对应的 index pattern 字段）。若不使用 ECS，字段名需按客户 index mapping 调整。

---

### 不支持项说明

| 平台 | 功能 | 说明 |
|---|---|---|
| 所有平台 | Sigma 关联类型（event_count 等） | 本规则不使用关联，无影响 |
| Splunk | `contains|all` 列表 | 需拆开为多个 `AND CommandLine=*...*` 条件，已在草案中处理 |

---

## 四、样本回放报告

### 样本表
| 样本 ID | 类型 | 场景 | CommandLine（关键部分） | 预期命中 | 手动检查结果 | 匹配 |
|---|---|---|---|---|---|---|
| P-01 | 正样本 | HTTP 下载 PE | certutil -urlcache -split -f http://...payload.exe | ✅ | ✅ | ✓ |
| P-02 | 正样本（大写变体） | HTTPS 下载，大写 | CERTUTIL.EXE -URLCACHE -SPLIT -F https://... | ✅ | ✅ | ✓ |
| P-03 | 正样本（SysWOW64） | SysWOW64 certutil | certutil -urlcache -f http://... | ✅ | ✅ | ✓ |
| N-01 | 负样本 | 证书验证 | certutil -verify -urlfetch cert.p7b | ❌ | ❌ | ✓ |
| N-02 | 负样本 | 证书导出（SCCM 父进程） | certutil -exportPFX ... | ❌ | ❌ | ✓ |
| N-03 | 负样本 | 显示 CRL | certutil -crl | ❌ | ❌ | ✓ |
| B-01 | 边界样本 | IT 工具下载补丁（RMM 父进程） | certutil -urlcache -split -f https://download... | ⚠️ 客户决定 | ✅（当前规则命中，filter 未覆盖 RMM） | 需客户决定是否添加过滤 |

### 命中率汇总
| 样本类型 | 总数 | 命中符合预期 | 准确率 |
|---|---|---|---|
| 正样本 | 3 | 3 | 100% |
| 负样本 | 3 | 3 | 100% |
| 边界样本 | 1 | 1（命中但需客户裁定） | — |

### 调优记录
| Rev | 修改内容 | 修改理由 | 对样本影响 |
|---|---|---|---|
| 1 | 初始草案：仅检测 `-urlcache -f` | 覆盖最常见用法 | P-01 命中，P-02 需大小写不敏感 |
| 2 | CommandLine 改用 `contains|all`（或 `*urlcache*` + `*-f*`），支持大小写变体 | P-02 原始规则因大小写未命中 | P-02 现在命中 |

**注意：以上测试为手动字段值对比，未在任何 SIEM 平台实际执行查询。**

---

## 五、变更与回滚说明

| 字段 | 值 |
|---|---|
| 规则名称 | Certutil Download Using URLCache |
| 规则 ID | REPLACE-WITH-UUIDv4-BEFORE-PRODUCTION |
| 变更类型 | 新增规则 |
| 当前 rev | 2 |
| 回滚 rev/版本 | Rev 1（初始草案；或直接删除规则） |
| 变更日期 | 2024-03-21 |

**变更内容**: Rev 2 修改 CommandLine 匹配为包含大小写不敏感模式，覆盖 P-02 大写变体。

**影响范围**:
- ATT&CK 覆盖: T1105 Ingress Tool Transfer（ATT&CK v19）
- 预计告警量: 低，certutil 正常使用场景有限；边界样本 B-01（RMM 父进程）会命中，需客户确认是否添加过滤
- 下游影响: 无已知下游配置

**测试覆盖状态**:
| 样本类型 | 覆盖 | 通过 | 未覆盖范围 |
|---|---|---|---|
| 正样本 | 3 | 3 | 未测试：encoded Command/混淆、非标安装路径 |
| 负样本 | 3 | 3 | 未测试：所有可能父进程白名单组合 |
| 边界样本 | 1 | 需客户裁定 | RMM/第三方管理工具父进程 |

**测试环境**: 合成样本手动字段值对比，未在生产 SIEM 中执行规则加载验证。

**回滚步骤**:
1. 确认回滚目标（Rev 1 草案或删除规则）
2. 在规则库中还原 Rev 1 或标记规则状态为 `deprecated`
3. 在目标 SIEM 平台中撤销已加载的 Rev 2 规则（参照客户平台操作手册）
4. 验证：在测试事件中确认 Rev 1 行为恢复或规则已停用
5. 记录回滚时间与执行人

**待填写（下发时）**:
- 计划变更时间窗: [___]
- 授权人员: [___]
- 变更工单 ID: [___]
- 实际下发时间: [___]
