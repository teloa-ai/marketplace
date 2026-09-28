# 测试材料 — openai.security-best-practices 二次开发件中代码片段的实跑证据

> 本目录是审查证据，**不随安装包**分发。资源文件与修改记录见 `artifacts/skills/openai.security-best-practices/1.0.0/`（`MODIFICATIONS.md`）；验证记录见 `reviews/derivatives/openai.security-best-practices@1.0.0.json`。`doc-snippets/extract.py` 从上述资源文件的 `references/` 提取片段。

- `vectors.json`：65 个输入（55 个敌意向量 + 10 个合法路径）与判定策略。敌意向量含协议相对 `//`、反斜杠 `/\`、点段（`/./`、`/../`、`/.//host`）、`%2e`/`%2E`/`%252e`、`%2f`、`%5c`、`%25`、tab/换行/NUL/DEL/空格、`///`、`\\`、`https:`/`javascript:`/`data:` 协议、userinfo 花样、空串。
- `node-safe-return-to.test.mjs` → `node-safe-return-to.output.txt`：React/Next.js/Vue 参考中的 `safeReturnTo()` / `sameOriginPath()`（node v24.15.0）。
- `python-safe-return-to.test.py` → `python-safe-return-to.output.txt`：Flask/FastAPI 参考中的 `safe_return_to()`（Python 3.14.5）。
- `go-safe-return-to/main.go` → `go-safe-return-to.output.txt`：Go 参考中的 `safeReturnTo()`（go1.25.9）。
- `doc-snippets/`：从 references 的 Markdown 代码块**原样提取**的片段（`react.ts`、`nextjs.ts`、`flask.py`、`fastapi.py`、`go/main.go`），用同一 `vectors.json` 再跑一遍，证明文档里的代码就是被测代码（`run.output.txt`）。R2 起由 `extract.py` 机械提取（不再手抄）；`nextjs-full.ts` 是 Next 整块代码（含 import 与 `GET` 处理器），只用于类型检查；`tsconfig.json` + `next-server.d.ts`（本机未装 next 时的最小桩）用 `tsc --strict` 检查 `react.ts`、`nextjs.ts`、`nextjs-full.ts`，结果在 `typecheck.output.txt`（含 R1 无类型版本的失败对照）。
- `r2-checks/`：R2 复判项的实跑证据——`m3-dot-segment-location.mjs`（点段形式原样作 Location 时留在本源、重新序列化为相对串后离开本源）、`n4-maxsplit.py`（按位置传 maxsplit 的 DeprecationWarning）、`go-clean/`（`path.Clean` 去掉结尾斜杠），输出在 `r2-checks.output.txt`。

运行（在本目录；Python 用 `-B` 不写 `__pycache__`，`-W error::DeprecationWarning` 把弃用告警当错误）：
```sh
node node-safe-return-to.test.mjs && python3 -B -W error::DeprecationWarning python-safe-return-to.test.py && (cd go-safe-return-to && go run .)
cd doc-snippets && python3 -B extract.py && node run.mjs && python3 -B -W error::DeprecationWarning run.py && (cd go && go run .)
tsc -p tsconfig.json --typeRoots <含 @types/node 的 node_modules>/@types   # 仍在 doc-snippets/
cd ../r2-checks && node m3-dot-segment-location.mjs && python3 -B n4-maxsplit.py && (cd go-clean && go run .)
```
全部以退出码 0 结束、`failures: 0` 为通过。2026-09-27 实跑结果：node 65/65、python 65/65、go 65/65；文档提取片段 react+next 185 项、flask+fastapi 130 项、go 65 项均 0 失败。

2026-09-28（R2）重跑：node v24.15.0、Python 3.14.5、go1.25.9，三套 65/65 与文档提取片段 185/130/65 项均 0 失败，Python 在 `-W error::DeprecationWarning` 下无告警；`tsc 5.9.3 --strict` 退出码 0；`r2-checks` 三项 exit 0。

2026-09-28（市场上架前，在市场仓本目录）重跑：node v24.15.0、Python 3.14.5、go1.25.9、tsc 5.9.3。三套 65/65（原版正则放过 55 个恶意向量中的 34 个）；从资源文件提取的片段 185/130/65 项均 0 失败，提取结果与上一轮逐字节相同；Python 在 `-W error::DeprecationWarning` 下无告警；`tsc --strict` 退出码 0（去掉类型标注的对照报 TS7006×2）；`r2-checks` 三项 exit 0。
