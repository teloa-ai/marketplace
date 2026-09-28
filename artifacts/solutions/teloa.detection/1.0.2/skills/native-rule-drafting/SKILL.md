---
name: native-rule-drafting
description: 为 Suricata/Snort 网络规则和 YARA 文件/内存扫描规则提供通用格式草案，明确标注需要客户提供目标版本与字段字典进行验证。
---

# 设备原生规则草案（Native Device Rule Draft）

## 适用输入与前置检查

必须提供：
- 检测目标（恶意网络载荷特征、文件特征或内存字符串）
- 规则类型（网络规则 Suricata/Snort，或文件/内存扫描规则 YARA）

必须由客户提供（本技能仅能给出草案，不能自行确认）：
- 目标设备版本（如 Suricata 7.x、Snort 3.x）
- 目标环境支持的规则语法版本
- 现有规则集与 SID/rev 分配范围（Suricata）
- YARA 使用的模块与加载方式

前置检查：
1. Suricata 和 Snort 语法存在差异，草案需明确标注适用哪个引擎；若不确定，标注"需客户确认目标引擎"。
2. YARA 规则中的字符串提取来自用户提供的样本或描述，不自行生成恶意代码或载荷。

## 分步方法：Suricata/Snort 网络规则

**步骤 1 — 明确检测目标**
- 目标行为：什么类型的网络流量（如 HTTP 请求头含特定模式、DNS 查询特定域、TCP 载荷含特定字节序列）
- 协议（tcp/udp/http/dns/tls 等）
- 方向（客户端到服务器/服务器到客户端）

**步骤 2 — 规则草案结构**

Suricata/Snort 规则格式：
```
动作 协议 源IP 源端口 方向 目标IP 目标端口 (选项;)
```

常用选项：
- `content:"..."` — 匹配载荷内容（大小写敏感）
- `nocase` — 大小写不敏感
- `http.uri` / `http.header` / `http.body` — HTTP 层选项（Suricata）
- `pcre:"/pattern/i"` — 正则匹配
- `threshold:type limit,track by_src,count 1,seconds 60` — 频率阈值
- `msg:"..."` — 告警消息
- `sid:[SID]` — 规则 ID（需客户分配 SID 范围）
- `rev:[版本]` — 规则修订版本

**步骤 3 — 草案标注**
- 标注适用引擎（Suricata 版本/Snort 版本）
- 标注需要用 `-T`（Suricata）或等效命令进行配置语法验证
- 标注需要 PCAP 回放验证命中情况
- 标注 SID 需客户分配

## 分步方法：YARA 规则

**步骤 1 — 明确检测目标**
- 文件扫描（静态特征）或内存扫描（运行时特征）
- 特征来源：用户提供的字符串、字节序列或行为描述
- 适用模块：`pe`（Windows PE 文件）、`elf`（Linux）、`macho`（macOS）等

**步骤 2 — YARA 规则草案结构**

```yara
rule RuleName {
  meta:
    description = "[规则描述]"
    author = "[作者]"
    date = "YYYY-MM-DD"
    reference = "[参考链接]"
    hash = "[已知样本哈希，如有]"
  strings:
    $s1 = "[字符串特征1]" ascii wide
    $b1 = { [十六进制字节序列] }
    $re1 = /[正则表达式]/ nocase
  condition:
    any of ($s*)
    and filesize < [大小上限]MB
}
```

常用 `condition` 模式：
- `all of them` — 所有特征同时存在
- `any of ($s*)` — $s 开头的任意一个字符串
- `2 of ($s*)` — $s 中至少 2 个命中
- `pe.imphash() == "..."` — 使用 pe 模块（需加载 pe 模块）

**步骤 3 — 草案标注**
- 标注字符串特征来源（来自用户提供的样本描述，非独立生成）
- 标注需要在目标 YARA 版本（建议标注 ≥ 4.0.0）下测试
- 标注 `pe`/`elf` 等模块需在 YARA 编译时启用
- 标注正负样本需在目标环境回放验证

## 输出结构

```
## 设备原生规则草案

**类型**: [Suricata / Snort / YARA]
**目标版本**: [客户需确认]
**草案日期**: YYYY-MM-DD
**特征来源**: [来自用户提供的描述/样本，非独立研究]

---

### 规则草案
[规则内容]

---

### 验证要求（客户操作）
- [ ] 确认目标引擎版本与语法兼容性
- [ ] 配置语法检查（Suricata: `suricata -T -c <config>` / YARA: `yarac rule.yar`）
- [ ] 正样本回放（PCAP 或文件扫描）
- [ ] 负样本（正常流量/文件）验证无误报
- [ ] 性能测试（生产前评估规则对吞吐量的影响）
- [ ] SID 分配（Suricata/Snort）

注意：以上草案未在任何 Suricata/Snort/YARA 目标环境中验证。下发前必须完成以上验证步骤。
```

## 证据与引用规则

- Suricata 8.0.0 CLI 文档（固定版本参考，非最新部署推荐）：https://docs.suricata.io/en/suricata-8.0.0/command-line-options.html
- Wazuh logtest 文档（如适用）：https://documentation.wazuh.com/current/user-manual/ruleset/testing.html
- YARA 官方文档：https://yara.readthedocs.io/（版本需客户确认）

## 未知/冲突/缺失处理

- 目标引擎版本未提供：草案使用通用语法，标注"语法兼容性需客户按实际版本确认"。
- 样本特征不明确：说明无法生成有效的内容匹配条件，请客户提供具体字节序列或字符串。
- Snort 与 Suricata 语法差异影响规则：分别给出两份草案并标注差异点。

## 禁止事项

- 不得生成功能性恶意代码、shellcode 或载荷作为规则内容。
- 不得将草案标注为"已验证可在生产环境使用"。
- 不得假设客户 YARA 版本或 Suricata 版本，必须标注"需确认"。
- 不得上传客户提供的样本文件到任何外部服务。
