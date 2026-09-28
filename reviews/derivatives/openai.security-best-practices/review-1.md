# 复审结论摘要（一）：openai.security-best-practices

本文件是 Teloa 内部审查记录的公开摘要，只保留结论与出处，不含本机路径。编号为当时的修订编号（R0），与现行编号的对照见文末。

## 0. 首轮完整正文审查（Teloa，2026-09-27）

对锁定提交 `openai/skills@49f948faa9258a0c61caceaf225e179651397431` 的 13 个文件逐一核对 Git blob 与大小，全部与锁定树一致；逐文件通读后，阻断原样收录的发现：

| 编号 | 发现 | 现行修改 |
|---|---|---|
| CSB-01 | React 开放重定向修复示例（正则 `/^\/[^\s]*$/`）仍接受外部目标 | CSB-M01 |
| CSB-02 | jQuery 建议在 SRI 出错时移除 integrity，与同节要求矛盾 | CSB-M08 |
| CSB-03 | Go os/exec 行为说明自相矛盾（写成会调用 shell） | CSB-M26 |
| CSB-04 | 多份参考笼统允许省略 script-src 以外的 CSP 指令 | CSB-M09～M14 |
| CSB-05 | Express 建议忽略开发工具依赖的风险 | CSB-M15 |
| CSB-06 | 环境边界、HSTS、版本事实与交叉引用需要复核 | CSB-M28、M29、M31、M33 |

## 1. 第一轮独立复审（2026-09-27，独立审阅者，只读）

方法：对原版逐文件 diff；在 node 中实测修复代码；逐条读上下文；联网核对 nextjs.org、NVD API、GitHub Advisory API、PyPI/npm registry、pkg.go.dev、blog.jquery.com。

结论：Needs fixes（1 CRITICAL、5 MAJOR 涉及本技能）。

- **C1**：当时的 `safeReturnTo()` 返回 `url.pathname + url.search + url.hash`，点段输入（`/.//evil.example`、`/a/..//evil.example`、`/%2e//evil.example`、`/%2e%2e//evil.example`、`/./\evil.example`）归一化后得到 `//evil.example`，本身构成开放重定向。要求返回已校验的绝对地址或复验输出。→ 现行 CSB-M01。
- **M1**：同类重定向口径在 Next.js、Vue 未修，Go、Flask、FastAPI 只有笼统口径。→ 现行 CSB-M03～M07。
- **M2**：Flask SSTI 改写把「开发者格式串 + 用户值 → 模板源」说成较低风险。→ 现行 CSB-M30。
- **M3**：react2shell 版本段有事实错误（13.x/14.x stable 不受影响、CVE-2025-66478 被 NVD 拒绝、GHSA-fq29-rrrv-cq2m 不存在、后续修复线未列）。→ 现行 CSB-M24。
- **M4**：SKILL.md「Overrides」允许被审仓库内的文档或提示文件压过安全规则，是提示注入入口。→ 现行 CSB-M25。
- **M5**：CSRF 口径 9 条与开发依赖 1 条应归 `security`；HSTS 条应拆出 Codex 专属措辞。→ 现行 CSB-M15～M23、CSB-M31。
- **MINOR**：FastAPI L398 残留句；SRI 补 `sha384-` 前缀并先排除 CORS；CSP 改为 nonce/hash + `'strict-dynamic'`，注明 `<meta>` 中 report-only 不可用；开发依赖安装脚本措辞；Go CrossOriginProtection 行为描述；Werkzeug 后续 CVE。

逐条核对表中判定为「正确」的（当时编号）：CSP 组、os/exec（M10）、SameSite（M11，`http.SameSiteLaxMode` 存在）、交叉引用（M12，`JS-URL-001` 存在）、拼写组（M27～M29）。

联网核对 21 项：正确 15、错误 5（均已在后续修订中修正）、无法核实 1（参考文件自述的抓取日期）。出处包括 https://nextjs.org/blog/CVE-2025-66478 、https://nvd.nist.gov/vuln/detail/CVE-2025-55182 、https://github.com/advisories/GHSA-h25m-26qc-wcjf 、https://pkg.go.dev/net/http#CrossOriginProtection 、Werkzeug GHSA-hgf8-39gv-g3f2 / GHSA-87hc-h4r5-73f7。

许可：`LICENSE.txt` 与原版 blob、字节一致；被修改文件都有显著修改声明；原版无 NOTICE。满足 Apache-2.0 §4(a)(b)(c)。

## 编号对照（R0 → 现行）

M01→M01；M02→M02；M03（SRI）→M08；M04～M09（CSP）→M09～M14；M10（os/exec）→M26；M11（SameSite）→M27；M12（交叉引用）→M28；M13（开发依赖）→M15；M14（HSTS）→M29 + M31；M15～M22（CSRF）→M16～M23；M23（SSTI）→M30；M24（修改声明）→M32 与 M42～M51；M25（快照说明）→M33；M26（CrossOriginProtection）→M34；M27～M29（拼写）→M37～M39；M30（react2shell）→M24。
