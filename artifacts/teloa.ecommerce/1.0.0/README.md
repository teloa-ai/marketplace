# 电商运营协作 / E-commerce Operations

面向商品文案起草与核对、活动日历编排、销量与销售额核对、买家评价分析的 Teloa 官方行业方案。

A Teloa official solution for drafting and checking product copy, planning campaign calendars, verifying sales volume and revenue, and analyzing buyer reviews.

---

## 现在可做 / What it does now

上传文件后，电商运营协作员可以：

- **商品文案起草**：按商品事实表为详情页首屏、详情页正文、主图文案、短视频口播、直播口播提纲起草文案，每条参数后附事实条目编号，缺失事实留占位符；绝对化用语、效果与功效、比较、诱导性表述没有依据时不写，列入「已删改的表述」交你知情
- **文案事实与用语核对**：对待发布文案逐项核对参数、效果与荣誉表述、绝对化与诱导性用语、素材授权，输出「已核实 / 待确认 / 存疑」三类清单
- **活动日历编排**：把平台活动节点、店铺节点与准备工作按日期排入日历，倒推准备起点并写出算式；列出截止、库存、资源、价格与时间重叠冲突；报名、改价、上下架、开播只列为待确认动作
- **销量与销售额核对**：对照平台导出、运营日报与退款记录核验合计、单位、口径（统计、时间、退款、运费）与缺失值，每个差额可由两个来源数字复算；口径不一致时并列结果，不判定哪份正确
- **买家评价分析**：星级分布、多选主题统计（占比 = 条数 ÷ 总数）、脱敏原句摘录、待判读评价与问题清单；安全类表述单列「需负责人立即处理」；不生成回复文案

After you upload files, the e-commerce ops collaborator can:

- **Product copy drafting**: draft detail page hero, detail page body, main image lines, short video voice-over and livestream outlines from the product fact sheet, with fact IDs after every parameter and placeholders for missing facts; absolute claims, efficacy, comparison and urgency wording without evidence are left out and listed under "removed or rewritten wording" for your awareness
- **Copy fact and wording check**: check parameters, efficacy and award claims, absolute and urgency wording, and asset licensing in copy awaiting release, as "verified / to confirm / questionable" lists
- **Campaign calendar**: place platform milestones, store events and preparation work on a calendar, back-calculate preparation start dates with formulas, and list deadline, stock, resource, price and overlap conflicts; enrolment, price changes, listing and going live appear only as actions awaiting your confirmation
- **Sales verification**: check totals, units, definitions (basis, date basis, refunds, shipping) and missing values across platform exports, daily reports and refund records, with every difference recomputable from two source figures; when definitions differ, results are shown side by side without ruling which is correct
- **Buyer review analysis**: star distribution, multi-label theme counts (share = count ÷ total), anonymized quotes, reviews pending interpretation and an issue list; safety-related remarks are listed separately for immediate attention; no reply copy is generated

---

## 还需你提供 / What you need to provide

- **文件**：商品事实表（最好带条目编号）、检测报告或资质依据、品牌语气手册、平台活动通知、店铺计划、准备工作时长与库存表、平台后台销量导出、运营日报、退款记录、评价导出与客服记录。岗位不会主动登录店铺后台、平台商家中心、支付或物流系统，也不采集竞品店铺数据。
- **说明**：目标渠道与人群、已书面确认的活动价与赠品、核对范围与容忍值、需要额外关注的评价主题。

- **Files**: product fact sheet (ideally with item IDs), test reports or qualification evidence, brand tone guide, platform campaign notices, store plans, preparation durations and stock tables, platform sales exports, daily operations reports, refund records, review exports and customer service logs. The role will not log in to store back offices, platform merchant centers, payment or logistics systems, and does not collect competitor store data.
- **Context**: target channels and audience, campaign prices and gifts confirmed in writing, verification scope and tolerance, and any extra review themes to track.

---

## 会请求的权限 / Permissions

本方案第一版仅需要**读取你上传的文件**，不请求任何写权限、外部 API 或账号连接。

以下动作岗位不会自行执行，会先停下等待你确认：修改商品价格、库存、优惠券或满减；上架、下架、编辑商品或提交审核；报名、退出或修改平台活动；发布或替换商品详情、主图、短视频、直播脚本或任何对外文案；以店铺账号回复评价、私信或客服会话；删除、隐藏、置顶或申诉评价；把商品资料、销量数据或评价导出发给外部合作方或上传到外部平台。

This first version only needs to **read the files you upload**; it requests no write access, external APIs or account connections.

The role never does the following on its own and stops for your confirmation first: changing product prices, stock, coupons or discounts; listing, delisting, editing products or submitting them for review; enrolling in, leaving or changing platform campaigns; publishing or replacing detail pages, main images, short videos, livestream scripts or any public copy; replying to reviews, direct messages or customer service chats as the store; deleting, hiding, pinning or appealing reviews; sending product materials, sales data or review exports to outside parties or uploading them to external platforms.

---

## 推荐搭配 / Recommended pairings

以下连接器与技能为**可选**，未在本包中声明，需要你另行添加、授权并配置：

- **连接器**：Exa（`teloa.mcp-exa`）用于检索公开的行业与平台规则资料，结果只作参考并标注来源，不用于补齐商品事实，海外服务，需密钥；Playwright（`teloa.mcp-playwright`）用于在你授权后打开公开网页查看页面，海外开源项目，无需密钥，需本机浏览器运行环境。
- **技能**：上游 `ivangdavila.image`（图片处理）、`ivangdavila.excel-xlsx`（电子表格处理）、`cellcog.image-generation-cellcog`（商品图生成，需联网；生成的图片发布前须与商品事实表核对）。

The following connectors and skills are **optional**, not declared in this package, and must be added, authorized and configured separately:

- **Connectors**: Exa (`teloa.mcp-exa`) to search public industry and platform-rule material, used for reference with sources noted and never to fill in product facts; an overseas service that requires credentials. Playwright (`teloa.mcp-playwright`) to open public web pages after your authorization; an overseas open-source project that needs no credentials but requires a local browser runtime.
- **Skills**: upstream `ivangdavila.image` (image handling), `ivangdavila.excel-xlsx` (spreadsheet handling) and `cellcog.image-generation-cellcog` (product image generation, requires network access; generated images must be checked against the product fact sheet before release).

---

## 已验证范围 / Verified scope

- 尚未真实模型验收：四个任务模板（商品文案、活动日历、销量核对、评价分析）的合成样例与期望产出见 `examples/`，兼容状态为 `content-only`，待隔离宿主真实模型验收后更新
- 连接器搭配（Exa、Playwright）未做端到端验收

- Not yet verified with a real model: synthetic samples and expected outputs for the four task templates (product copy, campaign calendar, sales verification, review analysis) are in `examples/`; compatibility is `content-only` until real-model acceptance on an isolated host
- Connector pairings (Exa, Playwright) have not been verified end to end

---

## 不包含 / Not included

- 改价、上下架、报名活动、发布商品或文案
- 回复买家，删除、隐藏或申诉评价
- 向买家承诺退款、补发、赔付或补偿（任何情况下都不做）
- 在产出中写出买家昵称、订单号、手机号或地址（一律脱敏或省略）
- 编写虚构的买家评价、销量或荣誉，或使用无依据的绝对化用语
- 广告法、价格法或平台处罚的法律判断（只登记事实，交专业人员评估）
- 生成 DOCX/XLSX/PPTX 等格式文件

- Changing prices, listing or delisting, enrolling in campaigns, publishing products or copy
- Replying to buyers, or deleting, hiding or appealing reviews
- Promising buyers refunds, reshipments, compensation or allowances (never, under any circumstances)
- Writing buyer nicknames, order numbers, phone numbers or addresses in the output (always masked or omitted)
- Writing fictitious reviews, sales figures or awards, or using unsupported absolute claims
- Legal judgments on advertising law, pricing law or platform penalties (facts are logged for professional review)
- Generating DOCX/XLSX/PPTX files

---

*版本 1.0.0 | Apache-2.0 | Teloa 官方内容*
