# 复审结论摘要（一）：hermes.simplify-code

本文件是 Teloa 内部审查记录的公开摘要，只保留结论与出处，不含本机路径。编号为当时的修订编号（R0，当时共 4 条，均已作废重排）。

## 第一轮独立复审（2026-09-27，独立审阅者，只读）

方法：对原版 `NousResearch/hermes-agent@a7c080ca66d32b1ec2cb71e15896c5b0dc2470e8` 的 `skills/software-development/simplify-code/SKILL.md` 逐行 diff；读取当时的效果测试记录并重算统计。

结论：Needs fixes（本技能 1 项 MAJOR 与若干 MINOR）。

- **M6（HIGH）**：当时 HSC-M01 新增的句子与固定测试输入一一对应，等于把标准答案写进提示；当时的效果结论（原版 6/8 vs 二次开发版 2/7，Fisher 双侧 p≈0.13）不显著，且两种调用链路混在一起统计，另有 2/9 次撞到 4096 输出上限。要求：泛化或删除测试特定表述；另建至少 3 组未见输入（至少 1 组有真实效率问题作阳性对照）；每版本至少 10 次采样、判读时不知版本；报告改为「未达显著」。
- **MINOR**：缩窄 Reviewer 3 时去掉了「or safer」，silent failures / TOCTOU 失去论证出口；HSC 各条行号有误（Reviewer 3 末句在原版 L166-167，发现格式在 L110，「Skip nits」在 L121-122）；frontmatter `version: 1.1.0` 原样保留会被当成原版。
- **提示层建议（§6）**：先证据后结论（写出修复前后每次调用的工作量）；默认空结果 `no material findings (call sites not provided)`；把规则放在输出格式旁边；顺序回退后加 efficiency 自检轮；调用方不要求四个字段非空；例子不复用测试样本；输出上限 ≥ 8k 并把截断计为失败。

这些建议对应现行 HSC-M01（改进 Reviewer 3 措辞并恢复「or safer」）、HSC-M02～M06。
许可：MIT 原件 SHA-256 `821556e6…` 与原版一致。
