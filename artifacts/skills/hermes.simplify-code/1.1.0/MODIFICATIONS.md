# MODIFICATIONS — 二次开发修改记录（R3，市场上架版）

本目录内容**二次开发自** `NousResearch/hermes-agent@a7c080ca66d32b1ec2cb71e15896c5b0dc2470e8`（`skills/software-development/simplify-code/SKILL.md`，MIT；上游仓库根 LICENSE 原件随附在本目录根的 `LICENSE`，SHA-256 `821556e6336796450ab852d375117b48a4887e71d255794fd6318d99982a5ab6`，未改）。上游 SKILL.md SHA-256 `9ee977c3362a1c07f2e327198e066ddb3c0ed67709706fc410165ee820b2ca01`（14,696 字节）。R1 依据独立复审（摘要见市场仓 `reviews/derivatives/hermes.simplify-code/review-1.md`）修订（编号重排，R0 的 HSC-M01～M04 作废）。R2 依据独立复判（摘要见 `reviews/derivatives/hermes.simplify-code/review-2.md`）（H1–H4、N3）与主控 2026-09-28 裁定修订：只更正记录（HSC-M01 的例子、HSC-M03/M06 的行号、HSC-M08 的归类），`SKILL.md` 未改（SHA-256 仍为 `cb340074e0e870c6a2f2b8d9603d1d8bbe97a9be83cf3d95bc09cc49f6c0f5e7`）。R3（2026-09-28，收录进 Teloa 市场）：按市场规则把 `SKILL.md` frontmatter 修剪为 `name` 与 `description`（HSC-M09），正文未改；许可原件从 `licenses/upstream/LICENSE` 移到根目录 `LICENSE`（字节未改）。市场版的逐文件摘要以市场目录条目为准。

对外口径（主控裁定）：这些修改是正确性与可用性改进，**不宣称降低编造**——R1 盲评在 qwen3:4b 与 qwen3:8b 上都没有测出版本差异。

分类定义见市场仓 `CONTRIBUTING.md`「二次开发资源」一节（2026-09-27 定稿），互斥、按优先级取一类；机器可读版本见市场目录条目的 `derivation.changes`。

未修改：frontmatter 的 `name` 与 `description`；`delegate_task` 委派接口与顺序回退说明主体；Phase 1 / Phase 3 / Related 全文；Reviewer 1/2/4 提示；Reviewer 3 的检查清单（复审建议删长列表未采纳——它是技能覆盖面本身，删了会降低覆盖）。

共 8 条：improved 1、adapted 2、added 5（security、fixed、removed、localized 均为 0）。R3 按市场审查意见：HSC-M01 由 `fixed` 改归 `improved`（盲评未测出版本差异，依据是表述改进）；HSC-M07 修改的 `version` 字段在交付文件中已不存在，移出修改清单，说明并入 HSC-M09。

安装文件清单（主控裁定）：`SKILL.md`（技能正文；本技能没有参考文件），以及许可合规所需的 `LICENSE`（上游仓库根 LICENSE 原件；MIT 要求随附版权与许可声明）和本文件 `MODIFICATIONS.md`（SKILL.md 顶部声明写有 "See MODIFICATIONS.md"）。内部修改记录与条目草案属于审查材料，不随安装包。

## adapted

### HSC-M08

- type: `adapted`
- path: SKILL.md 标题下方新增一行 "Derived work: modified by Teloa from NousResearch/hermes-agent@a7c080ca…"
- upstream: `NousResearch/hermes-agent@a7c080ca66d32b1ec2cb71e15896c5b0dc2470e8:skills/software-development/simplify-code/SKILL.md`
- summary: 顶部加显著修改声明并指向 MODIFICATIONS.md。
- reason: MIT 不强制修改声明，但项目规格要求修改后须声明；不用 HTML 注释（review-scan 会把隐藏注释计为可疑）。主控 2026-09-28 裁定归 `adapted`。

### HSC-M09

- type: `adapted`
- path: SKILL.md frontmatter
- upstream: `NousResearch/hermes-agent@a7c080ca66d32b1ec2cb71e15896c5b0dc2470e8:skills/software-development/simplify-code/SKILL.md`
- summary: R3（市场上架）：frontmatter 只保留 `name` 与 `description`，删除 `version`（R1 曾以 HSC-M07 把它从 `1.1.0` 改为 `1.1.0-teloa.1`，避免被当成上游 1.1.0 原件；该字段现已删除，HSC-M07 随之移出修改清单，版本以市场目录条目 1.1.0 为准）、`author`、`license`、`platforms` 与 `metadata.hermes`（`tags`、`related_skills`）；正文未改。
- reason: Teloa 市场保存的技能 frontmatter 只允许 `name` 与 `description` 两个单行键；作者与许可信息由市场目录条目的原版来源、根目录 `LICENSE` 与本文件保留。

## added

### HSC-M02

- type: `added`
- path: SKILL.md §Phase 2 — 发现格式（上游 L110）及其说明
- upstream: `NousResearch/hermes-agent@a7c080ca66d32b1ec2cb71e15896c5b0dc2470e8:skills/software-development/simplify-code/SKILL.md`
- summary: 发现格式新增 "→ behavior check (why the fix keeps outputs, iteration order, side effects and error behavior identical)"；CAREFUL/RISKY 修复缺此字段即 `confidence: low`。
- reason: 上游只在 Phase 3 应用后靠跑测试兜底，dry-run/只报告模式下无任何等价性论证要求。R1 修正 path 行号。

### HSC-M03

- type: `added`
- path: SKILL.md §Phase 2 — 发现格式说明紧后两行（上游 L113 之后；diff `113a119`）
- upstream: `NousResearch/hermes-agent@a7c080ca66d32b1ec2cb71e15896c5b0dc2470e8:skills/software-development/simplify-code/SKILL.md`
- summary: R1 按复审"规则放在输出格式旁边"：紧挨发现格式写两条对每个发现都适用的规则——(1) 效率发现必须给出修复前后每次调用的工作量，相同即不是效率发现；(2) 任何角度都可返回 `no material findings`，空结果有效、编造结果无效。
- reason: 小模型对长提示中部的约束记忆差（复审 §6-3）；把反编造规则压成两行放在格式旁。 R2 按复判 H2 更正行号（原写 L112）。

### HSC-M04

- type: `added`
- path: SKILL.md §Phase 2 — "Tell each reviewer to" 列表末尾（上游 L121-122 "Skip nits…" 之后）
- upstream: `NousResearch/hermes-agent@a7c080ca66d32b1ec2cb71e15896c5b0dc2470e8:skills/software-development/simplify-code/SKILL.md`
- summary: 新增：某角度可合法无实质发现，报 `no material findings`，不得换标签重述其他角度的发现或编造收益填空；重复代码付的是维护成本不是 CPU，除非同一输入在同一执行路径上确实被处理多次；R1 补：拿不到能证明重复工作的调用点时，efficiency 默认写 `no material findings (call sites not provided)`。
- reason: 上游没有空结果出口，与要求四个字段的调用方式叠加形成填空压力；复审 §6-2 建议给小模型一个现成的安全答案。R1 修正 path 行号。

### HSC-M05

- type: `added`
- path: SKILL.md §Phase 2 — "No delegation available?" 段（上游 L91-97）
- upstream: `NousResearch/hermes-agent@a7c080ca66d32b1ec2cb71e15896c5b0dc2470e8:skills/software-development/simplify-code/SKILL.md`
- summary: R1 新增自检轮：顺序回退完成四个角度后，只对 efficiency 发现再过一遍——前后每次调用的工作量是否真的不同、哪一行证明；不成立的删除。
- reason: 复审 §6-4。

### HSC-M06

- type: `added`
- path: SKILL.md §Pitfalls（上游 L245 之后、L246 "Large diffs blow context" 之前新增一条；diff `245a276`）
- upstream: `NousResearch/hermes-agent@a7c080ca66d32b1ec2cb71e15896c5b0dc2470e8:skills/software-development/simplify-code/SKILL.md`
- summary: R1 新增 "Reasoning budget"：会先思考再回答的模型做四角度内联审查可能需要 ≥ 8k 输出 token；被截断的回答不是审查，应加大输出上限或缩小 diff 重跑，不得据部分结果行动。
- reason: 复审 §6-7；R0 复测中 4b 两次撞 4096 上限。 R2 按复判 H2 更正行号（原写 L232）。

## improved

### HSC-M01

- type: `improved`
- path: SKILL.md §Phase 2 — Reviewer 3 (Efficiency) 末句（上游 L166-167 "For each, give the concrete fix and why it's faster or safer."）
- upstream: `NousResearch/hermes-agent@a7c080ca66d32b1ec2cb71e15896c5b0dc2470e8:skills/software-development/simplify-code/SKILL.md`
- summary: R1 改为：给出具体修复及其可度量依据——引用在一次请求/运行中真正执行了重复工作的调用点（file:line），写出修复前后每次调用的工作量（SKILL.md 中的例子："before: one DNS lookup per outgoing message; after: one per batch"）；前后相同即不是效率发现，删除或交给 Quality 角度；在分别被调用的函数间共享代码本身不减少运行时工作量（SKILL.md 中的例子：两个 CLI 子命令共用一个参数解析器，仍各解析一次），只有同一执行路径上重复的工作才算；对 silent failures/TOCTOU 要说明当前被掩盖的错误或竞态是什么、什么会把它暴露出来——这就是 "safer" 的论证出口。两个例子都与盲评输入 A/B/C 无关（R2 更正：R1 记录里写的 "before: one file read per order; after: one per report" 从未出现在 SKILL.md 中，且恰是盲评阳性输入 B 的答案，属记录错误，已删）。
- reason: 上游要求每条效率发现解释"为什么更快"，输入无效率问题时诱导编造收益。R0 版把测试样例（subtotal/taxedTotal 的"抽 helper 不减少循环迭代"）写进了提示，构成答案泄漏，且去掉了 "or safer"（复审 M6/MINOR）；R1 改为通用表述、换与测试无关的例子、恢复安全性出口。 R1 盲评复测（3 组未见输入 A/B/C，每模型×版本×输入 10 采样，pi-ai 真实链路，8k 输出上限，0 截断）：qwen3:4b 两版阴性编造均 0/20、阳性均 10/10；qwen3:8b 阴性编造 原版 5/20 vs 二次开发版 4/20（Fisher 双侧 p=1.0），阳性均 10/10。版本差异不可检出；本条保留的依据是消除答案泄漏、恢复 "safer" 出口与表述正确性，不是实测收益（详见市场仓 `reviews/derivatives/hermes.simplify-code/review-2.md` §1）。 R2：按复判 H1 更正 summary 中与实物不符的例子；对外不宣称本条降低编造（主控裁定）。
