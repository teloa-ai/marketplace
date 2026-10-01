<!-- 合成样例，非真实数据。所有主机名、账号、IP、域名均为虚构。 -->

# T1 分诊输入样例：钓鱼 URL 点击告警

## 告警原文

```
告警 ID: ALERT-2024-001234
来源: Endpoint Detection Platform（规则: Phishing URL Click Detected）
接收时间: 2024-03-15T08:42:17Z
原始时间: 2024-03-15T08:42:17+00:00

event.host: WORKSTATION-47.corp.example-org.local
user.name: j.smith@corp.example-org.local
process.name: chrome.exe
process.pid: 4821
url.full: http://login-secure-update.example-phish.com/auth?token=abc123
url.domain: login-secure-update.example-phish.com
network.destination.ip: 198.51.100.42
network.destination.port: 80
rule.name: Phishing URL Click Detected
rule.severity: HIGH
```

## 资产信息（已提供）

```
主机: WORKSTATION-47.corp.example-org.local
操作系统: Windows 11 Pro 23H2
业务归属: 财务部门
资产分级: 中等价值（访问内部财务报表系统）
负责人: j.smith@corp.example-org.local
```

## 账号信息（已提供）

```
账号: j.smith@corp.example-org.local
类型: 人类账号
所属组: Finance-Users（无特权组成员资格）
MFA: 已启用
上次登录: 2024-03-15T07:55:00Z（正常工作时段，来自同一主机）
```

## 提供的上下文查询结果（告警前后 15 分钟）

```
查询时间窗: 2024-03-15T08:27:17Z — 2024-03-15T08:57:17Z
查询条件: host=WORKSTATION-47 OR user=j.smith
结果条数: 14

关键事件（摘要）:
08:42:11Z — chrome.exe 导航到 http://login-secure-update.example-phish.com/auth
08:42:13Z — DNS 查询: login-secure-update.example-phish.com → 198.51.100.42
08:42:17Z — 告警触发
08:42:18Z — chrome.exe 页面内容加载（HTTP 200，响应大小 12.4KB）
08:43:02Z — 用户键盘输入（chrome.exe，页面为 login-secure-update.example-phish.com）
08:43:30Z — 未检测到凭据提交事件（表单 POST 事件不在已采集字段内）
08:44:15Z — chrome.exe 导航离开，返回 intranet 页面
```

## 基线信息（已提供）

- 财务用户 j.smith 平时 08:00–17:00 上班，今日正常登录
- 无变更单与此主机或账号相关
- 未找到该主机的历史相同告警
