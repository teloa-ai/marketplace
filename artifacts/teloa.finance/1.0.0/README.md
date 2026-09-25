# 财务对账协作 / Finance Reconciliation

面向银行与账面对账差异清单、报销单合规核对、月结清单与单据索引的 Teloa 官方行业方案。岗位只出差异清单与核对意见，不付款、不改账、不做税务结论。

A Teloa official solution for bank-to-ledger reconciliation discrepancy lists, expense claim policy checks, month-end close checklists and voucher indexes. The role produces discrepancy lists and review notes only; it never makes payments, changes ledger entries or draws tax conclusions.

---

## 现在可做 / What it does now

上传文件后，岗位可以：

- **对账差异清单**：把银行流水与账面明细逐条匹配，输出已匹配、金额差异、日期差异、单边未达、疑似重复五类，每条附两边行号与精确差额，末尾做合计勾稽；手续费、利息等常见单边项照列
- **报销单合规核对**：把制度拆成可核对条款，逐单逐条对照，只记符合 / 不符合 / 材料未提及并附单据字段与条款号；标注疑似重复、疑似拆分与票据金额不一致
- **月结清单与缺口核对**：按组织检查表或通用清单逐项标注已完成 / 未完成 / 无法确认及依据位置；做科目余额表借贷平衡、逐科目期初 + 发生 = 期末、子表与科目合计的算术勾稽
- **表格核对与单据索引**：核对合计、单位币种、借贷方向与含税口径；把发票、合同、回单、审批记录关联到账目条目并统计覆盖率

After you upload files, the role can:

- **Reconciliation discrepancy lists**: match bank statement lines to ledger entries and output five classes (matched, amount difference, date difference, one-sided items, suspected duplicates), each with row numbers on both sides and exact differences, plus a totals check; fees and interest are listed rather than skipped
- **Expense claim policy checks**: break the policy into checkable clauses, compare each claim clause by clause recording only compliant / non-compliant / not mentioned with claim fields and clause numbers; flag suspected duplicates, splits and receipt mismatches
- **Month-end close checklists**: mark each item done / not done / cannot confirm with evidence locations; run arithmetic checks on trial balance debits and credits, per-account roll-forward and sub-schedule totals
- **Table checks and voucher indexes**: verify totals, units and currencies, debit/credit direction and tax-inclusive definitions; link invoices, contracts, payment slips and approvals to ledger entries with coverage statistics

---

## 还需你提供 / What you need to provide

- **文件**：银行流水或支付平台账单、账面明细导出、报销单与发票影像、报销制度、科目余额表与月结子表。岗位不会主动读取未提供的银行账户或财务系统。
- **口径与规则**：对账期间、日期与金额容忍、正负号与借贷方向约定、适用的制度版本、职级对照表。
- **处理由你完成**：付款、退款、调账、录入凭证、审批报销都由负责人在财务系统内操作；税务与会计处理由财务负责人或专业人士判断。

- **Files**: bank statements or payment platform exports, ledger detail exports, expense claims with invoice images, the expense policy, trial balance and close schedules. The role never reads bank accounts or finance systems you did not provide.
- **Definitions and rules**: reconciliation period, date and amount tolerances, sign and debit/credit conventions, the applicable policy version, grade mapping.
- **Actions stay with you**: payments, refunds, adjustments, voucher entry and expense approval are done by you in the finance system; tax and accounting treatment is judged by your finance lead or a professional.

---

## 会请求的权限 / Permissions

本方案第一版仅需要**读取你上传的文件**，不请求任何写权限、外部 API、银行接口或账号连接。

以下动作岗位都会先停下等你确认：

- 向银行、供应商、审计方或其他外部对象发送差异清单或任何材料
- 将核对结果写入财务系统、共享账套或共享表格
- 对任何报销单作出正式通过或驳回
- 起草涉及付款、退款、调账、冲销或计提金额的操作建议
- 在产出中保留银行卡完整卡号、身份证号等敏感字段

This first version only **reads the files you upload** and requests no write access, external API, bank interface or account connection.

The role stops and asks you before:

- sending discrepancy lists or any material to banks, suppliers, auditors or other external parties
- writing check results into a finance system, shared ledger or shared sheet
- formally approving or rejecting any expense claim
- drafting operational suggestions involving payments, refunds, adjustments, reversals or accrual amounts
- keeping full bank card numbers, ID numbers or other sensitive fields in the output

---

## 推荐搭配 / Recommended companions

以下为可选项，**未在本包中声明**，需要你另行添加与授权：

- **连接器**：Stripe（`teloa.mcp-stripe`，只读拉取账单与余额；海外服务，需密钥）、飞书（`teloa.mcp-lark`）、钉钉（`teloa.mcp-dingtalk`）——用于在你确认后发送差异清单或审批提醒；均需凭据
- **上游技能**：`ivangdavila.excel-xlsx`（电子表格读写）、`ivangdavila.data-analysis`（数据分析）

Optional, **not bundled in this package**, added and authorized separately:

- **Connectors**: Stripe (`teloa.mcp-stripe`, read-only statements and balances; overseas service, needs a key), Lark (`teloa.mcp-lark`), DingTalk (`teloa.mcp-dingtalk`) for sending lists or approval reminders after your confirmation; all need credentials
- **Upstream skills**: `ivangdavila.excel-xlsx`, `ivangdavila.data-analysis`

---

## 已验证范围 / Verified scope

- 2026-09-25 已用真实模型（DeepSeek deepseek-flash，隔离宿主）验收：从市场添加、加载到业务、岗位上岗后，三个任务模板（对账差异清单、报销合规核对、月结清单）按 `examples/*-input.md` 建任务，产出结构与 `*-expected.md` 一致、事实逐条指向来源，未对外发送、未做承诺或决定；对账差异清单两轮中有一轮把一笔单边未达归错侧并如实报「勾稽不平」后停止，分类结果仍需本人逐条复核；兼容状态已改为 `verified`，验收记录见 `docs/superpowers/reviews/2026-09-25-首批方案扩充真实模型验收.md`
- 外部连接（支付平台、IM、财务系统）未在本版本中进行端到端验收

- Verified with a real model (DeepSeek deepseek-flash on an isolated host) on 2026-09-25: after adding from the market, loading into a business and taking the role, all three task templates (reconciliation differences, expense policy check, month-end checklist) were run from `examples/*-input.md`; the output matched the structure of `*-expected.md` with facts traced to sources, nothing was sent externally and no commitments or decisions were made; in one of two reconciliation runs a one-sided item was placed on the wrong side and the run honestly reported an unbalanced tie-out and stopped, so classifications still need line-by-line review; compatibility is now `verified` (record: `docs/superpowers/reviews/2026-09-25-首批方案扩充真实模型验收.md`)
- External connections (payment platforms, IM, finance systems) have not been verified end to end

---

## 不包含 / Not included

- 付款、退款、调账、冲销、录入凭证或审批报销
- 税务结论（可否抵扣、是否需缴税）与会计处理结论（科目归属、是否计提）
- 发票真伪查验
- 对差异原因的判断或对疑似重复、拆分的定性
- 直接发送邮件、消息或写入财务系统（须另行授权）
- 生成 XLSX/DOCX 等格式文件（文件生成为独立工具能力）

- Payments, refunds, adjustments, reversals, voucher entry or expense approval
- Tax conclusions (deductibility, tax liability) or accounting conclusions (account classification, whether to accrue)
- Invoice authenticity verification
- Judging causes of differences or characterizing suspected duplicates or splits
- Sending email or messages or writing to finance systems directly (separate authorization required)
- Generating XLSX/DOCX files (a separate tool capability)

---

*版本 1.0.0 | Apache-2.0 | Teloa 官方内容*
