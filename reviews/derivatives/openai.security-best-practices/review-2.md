# 复审结论摘要（二）：openai.security-best-practices

本文件是 Teloa 内部审查记录的公开摘要，只保留结论与出处，不含本机路径。

## 1. 第二轮独立复判（2026-09-28，独立审阅者，只读；node v24.15.0、Python 3.14.5、go1.25.9，在临时副本上运行）

结论：**可以上架（附条件）**：完成 N1–N4 四项小修，改完抽查即可，不需要再走完整复审。上一轮的 C1 与 5 项 MAJOR 均已修好。

- **测试实跑**：node、Python、Go 三套各 65 项（55 个恶意向量 + 10 个合法路径）0 失败；原版正则放过 55 个恶意向量中的 34 个。从文档提取的片段：react+next 185 项、flask+fastapi 130 项、go 65 项均 0 失败；文档代码块与被测函数体逐字一致。
- **新增绕过向量**：复判者自拟 38 个（全角斜杠、全角反斜杠、`%5C`、`%09`/`%0a`/`%00`、除号斜杠 U+2215、NBSP/U+2028/BOM/U+0085/U+3000、全角句点、`/..;//`、IDN 与西里尔字母主机、`%u002e`、超长 UTF-8、孤立代理等），覆盖 JS×3、Python×2、Go×1 共 190 次判定，**离开本源 0 次**。Python 对部分 Unicode 输入返回未编码的本源绝对 URL，主机已固定，无安全影响；经 Werkzeug/Starlette 发出的实际 Location 头未实测。
- **分类核对**：互斥、优先级、五个必填字段均符合定稿；逐文件 diff 的每个 hunk 都能对应到条目，只有 React Notes 新增的一行当时未入任何条目（建议 m6）；CSB-M37 除拼写外还新增了安全前提，应按优先级拆条（建议 m6）。
- **时点事实联网抽查 7 条**：CVE-2025-66478 被 NVD 拒绝（正确）；react2shell 受影响范围与修复线（正确，https://nextjs.org/blog/CVE-2025-66478 ）；2025-12-11 修复线（正确，https://nextjs.org/blog/security-update-2025-12-11 ）；CVE-2026-23864 修复线正确但漏写 13.x/14.x App Router 受影响（N1）；Werkzeug 后续 CVE（正确）；Go 1.25.0 CrossOriginProtection（正确，https://pkg.go.dev/net/http#CrossOriginProtection ）；`https://nextjs.org/blog/security-update` 返回 404（N2）。
- **需修项**：N1（CVE-2026-23864 影响范围）、N2（404 链接）、N3（测试材料卫生：pyc、本机路径）、N4（Python `maxsplit` 关键字参数与缺失 import）；建议项 m1（TS 类型标注）、m2（生产环境用配置的规范 origin）、m3（点段措辞）、m4（`path.Clean` 去掉结尾斜杠）、m5（Go CSRF 措辞矛盾与「GET 改状态」）、m6（CSB-M37 拆条）、m7（草案待办）。

## 2. 复判后的修订与核对（实现者记录，2026-09-28）

- N1：联网核对 GitHub Advisory API `GHSA-h25m-26qc-wcjf`（受影响区间首段 `>= 13.0.0, < 15.0.8`，首个修复 15.0.8，描述含 Next.js 13.x、14.x、15.x、16.x App Router）、vercel/next.js 仓库公告（cve_id CVE-2026-23864，发布 2026-01-26）、Vercel 官方摘要 https://vercel.com/changelog/summary-of-cve-2026-23864 、NVD https://nvd.nist.gov/vuln/detail/CVE-2026-23864 、npm registry（14.x 最新 14.2.35，2025-12-11）。据此改写 CSB-M24。
- N2：核对入口改为 https://nextjs.org/blog/tag/security（实测 200），§6 其余 6 个链接实测 200。
- m6：React Notes 新增的一行补入 CSB-M01；CSB-M37 中的安全前提拆为 CSB-M40（security）。
- N3、N4、m1–m5、m7：逐项修订（见资源文件 `MODIFICATIONS.md` 各条的 R2 说明）；测试与片段提取在本目录 `tests/` 重跑全部通过（见 `tests/README.md` 与各 `*.output.txt`）。
- 这一轮修订没有再经过独立复审。

## 3. 市场上架前的修订（2026-09-28）

市场审查（含安全技能技术内容的独立复核）提出的修订见资源文件 `MODIFICATIONS.md` 的 R3 说明；修订后在 `tests/` 重跑三套测试、片段提取、类型检查与 r2-checks，全部通过，提取的片段与上一轮逐字节相同。
