# Teloa Official Catalog · Teloa 官方目录

[English](#english) · [中文](#中文)

Browse and search online: **https://market.teloa.ai** · 在线浏览与搜索：**https://market.teloa.ai**

## English

This is the source of the Teloa official marketplace catalog. It lists resources that Teloa has reviewed, whose licenses are clear, and whose versions are pinned. In the Teloa marketplace you can search them, inspect their origin, and add them. The catalog will later move to a separate public repository with the same layout.

**Current status:** Teloa-authored skills, solutions and connectors ship pinned inside each Teloa release. Upstream entries (`catalog/upstream/`) are pinned to a fixed source and fetched file by file when you add them. A signed online index (`index.json` + Ed25519 `index.json.sig`) is published to `https://market.teloa.ai/index.json`; the app can refresh its browse list from it (opt-in, disabled by default in this phase) and falls back to the bundled snapshot whenever download or signature verification fails. The online index is published in two frozen formats side by side: `index.json` (v1, skills / solutions / connectors only) and `v2/index.json` (v2, all entry types). Each keeps its own signature. An older format stays published until the last app version that reads it is no longer supported; that date will be recorded here.

### Layout

| Path | Content |
| --- | --- |
| `catalog/<id>.json` | One file per Teloa-reviewed entry, format `teloa.market-catalog-entry/v1` |
| `catalog/upstream/<id>.json` | One file per upstream entry (`delivery: upstream`), pinned to a fixed source; no files are stored here |
| `artifacts/<id>/<version>/` | The files that get installed for Teloa entries; skills have exactly one `SKILL.md` at the root |
| `catalog-version.txt` | Catalog version, bumped on every change |

### What an entry records

- **Identity**: `id` such as `openai.skill-creator` (ecosystem.resource); `skill.name` is the installed skill name.
- **Taxonomy**: controlled vocabulary of functions and industries, shared with the app and the website filters.
- **Upstream**: repository, full 40-character commit, directory path, and the Git blob digest of each file taken; ClawHub entries pin owner, slug, version and per-file SHA-256.
- **Modifications**: what changed relative to upstream, in Chinese and English; empty when taken unchanged.
- **License**: SPDX identifier and the license files inside the artifact.
- **Compatibility**, one of four values:
  - `verified`: verified on the stated Teloa and DSH versions.
  - `needs-configuration`: needs setup first, such as connecting an account.
  - `content-only`: content adapted only; results depend on your materials and authorized tools.
  - `unsupported`: listed for information, not installable.
- **Requirements**: tools, network access, runtimes.
- **Review**: review date and reviewer.

"Official" only means the Teloa catalog reviewed and listed this version. It is not an endorsement by the upstream author and not a security certification.

### How Teloa uses it

1. Maintainers run `pnpm build:market-catalog`. The script validates every entry and generates the backend snapshot; its digest is pinned in code and ships with the release.
2. Maintainers run `pnpm publish:market-index`. The script writes `dist-market/index.json`, signs it with the Ed25519 private key (local `.runtime/teloa/market-signing/`, or the `TELOA_MARKET_SIGNING_KEY` secret in CI), and regenerates the catalog table below. Before a release, `TELOA_MARKET_SIGNING_KEY=<production key> pnpm check:market-index -- --production` verifies that the public key built into the app matches the production key and is not the development key.
3. On start, Teloa checks the snapshot digest and every file's bytes. Any mismatch disables the whole catalog rather than trusting part of it. An online index is only adopted after its signature and structure verify.
4. When you click "Add to my skills", Teloa stores that entry as your pinned skill content, which you then install and enable as usual. Adding still verifies every file against the entry's fixed source.
5. Catalog updates never change a version you already installed.

Built-in entries (`delivery: builtin`) need no adding. The skill creator, for example, is used automatically when you create a skill.

See [SUBMITTING.md](SUBMITTING.md) to contribute.

## 中文

这里是 Teloa 官方市场目录的源。目录收录经过 Teloa 审核、许可清楚、版本固定的资源，在 Teloa 市场里可以直接搜索、查看来源并添加安装。本目录将来迁到独立的公开仓库，结构保持不变。

**当前状态：** Teloa 自有的技能、方案与连接器随 Teloa 发行一起固定。上游条目（`catalog/upstream/`）固定到确定的来源，添加时逐文件拉取核对。签名在线索引（`index.json` 与 Ed25519 签名 `index.json.sig`）发布在 `https://market.teloa.ai/index.json`；应用可据此刷新浏览列表（本期默认关闭，需显式开启），下载或验签失败时退回随版本打包的快照。在线索引按格式版本并行发布：`index.json`（v1，只含技能 / 方案 / 连接器）与 `v2/index.json`（v2，全部类型），各自签名。旧格式至少保留到读取它的应用版本停止支持，停止支持日期记录在此处。

### 目录结构

| 路径 | 内容 |
| --- | --- |
| `catalog/<id>.json` | 一个 Teloa 审核条目一份，格式 `teloa.market-catalog-entry/v1` |
| `catalog/upstream/<id>.json` | 一个上游条目一份（`delivery: upstream`），固定来源，不在此存放文件 |
| `artifacts/<id>/<version>/` | Teloa 条目实际安装的文件；技能根目录必须有且只有一个 `SKILL.md` |
| `catalog-version.txt` | 目录版本，改动目录时递增 |

### 条目包含什么

- **身份**：`id` 形如 `openai.skill-creator`（来源生态.资源名），`skill.name` 是安装后的技能名。
- **分类**：功能与行业受控词表，与应用、市场站的筛选同一套。
- **上游来源**：仓库、完整 40 位提交、目录路径，以及每个取用文件的 Git blob 摘要；ClawHub 条目固定作者、名称、版本与逐文件 SHA-256。
- **修改说明**：相对上游改了什么，逐条中英文记录；原样收录时为空。
- **许可**：SPDX 标识与工件内的许可文件。
- **兼容状态**，只有四个值：
  - `verified`：已在对应 Teloa 与 DSH 版本上验证。
  - `needs-configuration`：需要先完成配置，例如连接账号。
  - `content-only`：只做了内容适配，效果取决于你的材料与已授权工具。
  - `unsupported`：不支持，只作说明，不提供安装。
- **运行需求**：需要的工具、是否联网、运行时。
- **审核记录**：审核日期与审核人。

「官方」只表示 Teloa 目录收录并审核过这个版本，不代表上游作者认证，也不是安全认证。

### 与 Teloa 的关系

1. 维护者运行 `pnpm build:market-catalog`，脚本校验全部条目并生成后端快照，快照摘要写进代码随版本发布。
2. 维护者运行 `pnpm publish:market-index`，脚本生成 `dist-market/index.json`，用 Ed25519 私钥（本机 `.runtime/teloa/market-signing/`，CI 用 Secret `TELOA_MARKET_SIGNING_KEY`）签名，并重新生成下方分类总表。发布前用 `TELOA_MARKET_SIGNING_KEY=<生产私钥> pnpm check:market-index -- --production` 核对应用内置公钥与生产私钥匹配且不是开发公钥。
3. Teloa 启动时核对快照摘要和每个文件的字节，任何不一致都会让整个目录停用，不会部分放行。在线索引只在签名与结构都通过后才采用。
4. 你在市场里点「添加到我的技能」，Teloa 把该条目固定保存为你的技能内容，之后照常安装、启用。添加时仍按条目的固定来源逐文件核对。
5. 目录更新不会改动你已安装的版本。

内置条目（`delivery: builtin`）不需要添加。例如技能创建器会在你新建技能时自动使用。

投稿方式见 [SUBMITTING.md](SUBMITTING.md)。

## Catalog · 目录总表

<!-- catalog:start -->
_Generated by `node scripts/发布市场索引.mjs` from `catalog/`; do not edit by hand. 126 entries, catalog version 2026.9.26.1. Detail pages: https://market.teloa.ai_

### By industry · 按行业

#### General · 通用 (109)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [Internal communications](https://market.teloa.ai/anthropic.internal-comms/) · 内部沟通稿 | skill | GitHub anthropics/skills | content-only |
| [MCP server builder](https://market.teloa.ai/anthropic.mcp-builder/) · MCP 服务器构建指南 | skill | GitHub anthropics/skills | content-only |
| [API Gateway](https://market.teloa.ai/clawhub.byungkyu.api-gateway/) · API 网关（Maton） | skill | ClawHub byungkyu/api-gateway | unsupported |
| [Calendly](https://market.teloa.ai/clawhub.byungkyu.calendly-api/) · Calendly 日程管理 | skill | ClawHub byungkyu/calendly-api | unsupported |
| [ClickUp](https://market.teloa.ai/clawhub.byungkyu.clickup-api/) · ClickUp 任务管理 | skill | ClawHub byungkyu/clickup-api | unsupported |
| [Fathom](https://market.teloa.ai/clawhub.byungkyu.fathom-api/) · Fathom 会议记录 | skill | ClawHub byungkyu/fathom-api | unsupported |
| [gmail](https://market.teloa.ai/clawhub.byungkyu.gmail/) · Gmail 邮件收发 | skill | ClawHub byungkyu/gmail | unsupported |
| [google-drive](https://market.teloa.ai/clawhub.byungkyu.google-drive/) · Google Drive 文件管理 | skill | ClawHub byungkyu/google-drive | unsupported |
| [google-meet](https://market.teloa.ai/clawhub.byungkyu.google-meet/) · Google Meet 视频会议 | skill | ClawHub byungkyu/google-meet | unsupported |
| [google-play](https://market.teloa.ai/clawhub.byungkyu.google-play/) · Google Play 应用管理 | skill | ClawHub byungkyu/google-play | unsupported |
| [google-sheets](https://market.teloa.ai/clawhub.byungkyu.google-sheets/) · Google Sheets 表格处理 | skill | ClawHub byungkyu/google-sheets | unsupported |
| [google-slides](https://market.teloa.ai/clawhub.byungkyu.google-slides/) · Google Slides 演示文稿 | skill | ClawHub byungkyu/google-slides | unsupported |
| [google-workspace-admin](https://market.teloa.ai/clawhub.byungkyu.google-workspace-admin/) · Google Workspace 管理员 | skill | ClawHub byungkyu/google-workspace-admin | unsupported |
| [klaviyo](https://market.teloa.ai/clawhub.byungkyu.klaviyo/) · Klaviyo 邮件营销 | skill | ClawHub byungkyu/klaviyo | unsupported |
| [mailchimp](https://market.teloa.ai/clawhub.byungkyu.mailchimp/) · Mailchimp 邮件营销 | skill | ClawHub byungkyu/mailchimp | unsupported |
| [microsoft-excel](https://market.teloa.ai/clawhub.byungkyu.microsoft-excel/) · Microsoft Excel 表格处理 | skill | ClawHub byungkyu/microsoft-excel | unsupported |
| [Monday.com](https://market.teloa.ai/clawhub.byungkyu.monday/) · Monday.com 工作管理 | skill | ClawHub byungkyu/monday | unsupported |
| [Outlook](https://market.teloa.ai/clawhub.byungkyu.outlook-api/) · Outlook 邮件管理 | skill | ClawHub byungkyu/outlook-api | unsupported |
| [Pipedrive](https://market.teloa.ai/clawhub.byungkyu.pipedrive-api/) · Pipedrive 销售 CRM | skill | ClawHub byungkyu/pipedrive-api | unsupported |
| [Salesforce](https://market.teloa.ai/clawhub.byungkyu.salesforce-api/) · Salesforce CRM | skill | ClawHub byungkyu/salesforce-api | unsupported |
| [typeform](https://market.teloa.ai/clawhub.byungkyu.typeform/) · Typeform 在线表单 | skill | ClawHub byungkyu/typeform | unsupported |
| [WhatsApp Business](https://market.teloa.ai/clawhub.byungkyu.whatsapp-business/) · WhatsApp Business 消息 | skill | ClawHub byungkyu/whatsapp-business | unsupported |
| [WooCommerce](https://market.teloa.ai/clawhub.byungkyu.woocommerce/) · WooCommerce 在线商城 | skill | ClawHub byungkyu/woocommerce | unsupported |
| [xero](https://market.teloa.ai/clawhub.byungkyu.xero/) · Xero 云会计 | skill | ClawHub byungkyu/xero | unsupported |
| [YouTube](https://market.teloa.ai/clawhub.byungkyu.youtube-api-skill/) · YouTube 视频管理 | skill | ClawHub byungkyu/youtube-api-skill | unsupported |
| [Zoho CRM](https://market.teloa.ai/clawhub.byungkyu.zoho-crm/) · Zoho CRM 客户管理 | skill | ClawHub byungkyu/zoho-crm | unsupported |
| [zoho-mail](https://market.teloa.ai/clawhub.byungkyu.zoho-mail/) · Zoho Mail 企业邮箱 | skill | ClawHub byungkyu/zoho-mail | unsupported |
| [cellcog](https://market.teloa.ai/clawhub.cellcog.cellcog/) · CellCog AI 代理 | skill | ClawHub cellcog/cellcog | unsupported |
| [Image Generation](https://market.teloa.ai/clawhub.cellcog.image-generation-cellcog/) · 图像生成（CellCog） | skill | ClawHub cellcog/image-generation-cellcog | content-only |
| [Financial Search Engine](https://market.teloa.ai/clawhub.financial-ai-analyst.mx-finance-search/) · 金融搜索引擎 | skill | ClawHub financial-ai-analyst/mx-finance-search | unsupported |
| [Global Macro Database Assistant](https://market.teloa.ai/clawhub.financial-ai-analyst.mx-macro-data/) · 全球宏观数据助手 | skill | ClawHub financial-ai-analyst/mx-macro-data | unsupported |
| [Skill Finder Cn](https://market.teloa.ai/clawhub.guohongbin-git.skill-finder-cn/) · 技能查找器 | skill | ClawHub guohongbin-git/skill-finder-cn | content-only |
| [Baidu Wenku AIPPT](https://market.teloa.ai/clawhub.ide-rea.ai-ppt-generator/) · 百度文库 AI PPT | skill | ClawHub ide-rea/ai-ppt-generator | content-only |
| [得到大脑（原 Get 笔记）](https://market.teloa.ai/clawhub.iswalle.getnote/) · 得到大脑笔记 | skill | ClawHub iswalle/getnote | content-only |
| [Data Analysis](https://market.teloa.ai/clawhub.ivangdavila.data-analysis/) · 数据分析 | skill | ClawHub ivangdavila/data-analysis | content-only |
| [Excel / XLSX](https://market.teloa.ai/clawhub.ivangdavila.excel-xlsx/) · Excel 电子表格 | skill | ClawHub ivangdavila/excel-xlsx | content-only |
| [Git](https://market.teloa.ai/clawhub.ivangdavila.git/) · Git 版本控制 | skill | ClawHub ivangdavila/git | content-only |
| [Image](https://market.teloa.ai/clawhub.ivangdavila.image/) · 图像处理 | skill | ClawHub ivangdavila/image | content-only |
| [Market Research](https://market.teloa.ai/clawhub.ivangdavila.market-research/) · 市场研究 | skill | ClawHub ivangdavila/market-research | content-only |
| [Memory](https://market.teloa.ai/clawhub.ivangdavila.memory/) · 持久化记忆 | skill | ClawHub ivangdavila/memory | content-only |
| [Powerpoint / PPTX](https://market.teloa.ai/clawhub.ivangdavila.powerpoint-pptx/) · PowerPoint 演示 | skill | ClawHub ivangdavila/powerpoint-pptx | content-only |
| [Proactivity (Proactive Agent)](https://market.teloa.ai/clawhub.ivangdavila.proactivity/) · 主动代理 | skill | ClawHub ivangdavila/proactivity | content-only |
| [Screenshot](https://market.teloa.ai/clawhub.ivangdavila.screenshot/) · 截图工具 | skill | ClawHub ivangdavila/screenshot | content-only |
| [SEO (Site Audit + Content Writer + Competitor Analysis)](https://market.teloa.ai/clawhub.ivangdavila.seo/) · SEO 优化工具 | skill | ClawHub ivangdavila/seo | content-only |
| [Word / DOCX](https://market.teloa.ai/clawhub.ivangdavila.word-docx/) · Word 文档 | skill | ClawHub ivangdavila/word-docx | content-only |
| [X Search](https://market.teloa.ai/clawhub.jaaneek.x-search/) · X（Twitter）搜索 | skill | ClawHub jaaneek/x-search | unsupported |
| [Capability Evolver](https://market.teloa.ai/clawhub.kennyzir.capability-evolver-pro/) · 能力进化器 | skill | ClawHub kennyzir/capability-evolver-pro | content-only |
| [tushare](https://market.teloa.ai/clawhub.lidayan.tushare-data/) · Tushare 股票数据 | skill | ClawHub lidayan/tushare-data | content-only |
| [Planning with files](https://market.teloa.ai/clawhub.othmanadi.planning-with-files/) · 文件式任务规划 | skill | ClawHub othmanadi/planning-with-files | content-only |
| [China Stock Analysis](https://market.teloa.ai/clawhub.paulshe.china-stock-analysis/) · 中国股票分析 | skill | ClawHub paulshe/china-stock-analysis | content-only |
| [OCR - Local (No API Key)](https://market.teloa.ai/clawhub.shaw555.ocr-local/) · OCR 本地识别 | skill | ClawHub shaw555/ocr-local | content-only |
| [Eno Skills](https://market.teloa.ai/clawhub.wscats.eno/) · Eno 技能库 | skill | ClawHub wscats/eno | content-only |
| [Interview Simulator](https://market.teloa.ai/clawhub.wscats.interview-simulator/) · 面试模拟器 | skill | ClawHub wscats/interview-simulator | content-only |
| [Resume Assistant](https://market.teloa.ai/clawhub.wscats.resume-assistant/) · 简历助手 | skill | ClawHub wscats/resume-assistant | content-only |
| [Report Generator](https://market.teloa.ai/clawhub.wscats.smart-weekly-report/) · 周报生成器 | skill | ClawHub wscats/smart-weekly-report | content-only |
| [T Trading](https://market.teloa.ai/clawhub.wscats.t-trading/) · T 短线交易 | skill | ClawHub wscats/t-trading | content-only |
| [Self-Improving Proactive Agent](https://market.teloa.ai/clawhub.yueyanc.self-improving-proactive-agent/) · 自改进主动代理 | skill | ClawHub yueyanc/self-improving-proactive-agent | content-only |
| [Grounded citations](https://market.teloa.ai/hermes.grounded-citations/) · 有据引用 | skill | GitHub NousResearch/hermes-agent | content-only |
| [Meeting action items](https://market.teloa.ai/hermes.meeting-action-items/) · 会议行动项 | skill | GitHub NousResearch/hermes-agent | content-only |
| [Repository threat modeling](https://market.teloa.ai/openai.security-threat-model/) · 代码仓威胁建模 | skill | GitHub openai/skills | content-only |
| [Skill creator](https://market.teloa.ai/openai.skill-creator/) · 技能创建器 | skill | GitHub openai/skills | verified |
| [GitHub CLI workflow](https://market.teloa.ai/openclaw.github/) · GitHub CLI 工作流 | skill | GitHub openclaw/openclaw | needs-configuration |
| [Finance reconciliation](https://market.teloa.ai/teloa.finance/) · 财务对账 | solution | Teloa | verified |
| [Amap Maps (Official MCP)](https://market.teloa.ai/teloa.mcp-amap/) · 高德地图（官方 MCP） | connector | Teloa | needs-configuration |
| [Atlassian (Jira & Confluence)](https://market.teloa.ai/teloa.mcp-atlassian/) · Atlassian（Jira & Confluence） | connector | Teloa | needs-configuration |
| [Composio MCP (1500+ App Integrations)](https://market.teloa.ai/teloa.mcp-composio/) · Composio MCP（1500+ 应用集成） | connector | Teloa | unsupported |
| [Context7 (Official Docs MCP)](https://market.teloa.ai/teloa.mcp-context7/) · Context7（官方文档 MCP） | connector | Teloa | verified |
| [DeepWiki (Official Remote)](https://market.teloa.ai/teloa.mcp-deepwiki/) · DeepWiki（官方远程） | connector | Teloa | verified |
| [DingTalk (Enterprise Communication)](https://market.teloa.ai/teloa.mcp-dingtalk/) · 钉钉（企业通讯与协作） | connector | Teloa | needs-configuration |
| [Exa Web Search](https://market.teloa.ai/teloa.mcp-exa/) · Exa 网络搜索 | connector | Teloa | needs-configuration |
| [Figma Remote (OAuth + Allowlist, Supported in Next Version)](https://market.teloa.ai/teloa.mcp-figma/) · Figma 远程（OAuth + 白名单，下一版本支持） | connector | Teloa | unsupported |
| [GitHub (Official Remote MCP)](https://market.teloa.ai/teloa.mcp-github/) · GitHub（官方远程 MCP） | connector | Teloa | needs-configuration |
| [Greptile (Codebase Semantic Search)](https://market.teloa.ai/teloa.mcp-greptile/) · Greptile（代码库语义搜索） | connector | Teloa | needs-configuration |
| [Feishu/Lark (Official MCP)](https://market.teloa.ai/teloa.mcp-lark/) · 飞书/Lark（官方 MCP） | connector | Teloa | needs-configuration |
| [Linear (Official Remote MCP)](https://market.teloa.ai/teloa.mcp-linear/) · Linear（官方远程 MCP） | connector | Teloa | needs-configuration |
| [Notion (Local Bearer Token Mode)](https://market.teloa.ai/teloa.mcp-notion/) · Notion（本地 Bearer Token 模式） | connector | Teloa | needs-configuration |
| [Notion Remote (OAuth, Supported in Next Version)](https://market.teloa.ai/teloa.mcp-notion-remote/) · Notion 远程（OAuth，下一版本支持） | connector | Teloa | unsupported |
| [PagerDuty (Incident Response)](https://market.teloa.ai/teloa.mcp-pagerduty/) · PagerDuty（事件响应） | connector | Teloa | needs-configuration |
| [Playwright Browser Automation](https://market.teloa.ai/teloa.mcp-playwright/) · Playwright 浏览器自动化 | connector | Teloa | needs-configuration |
| [PostHog (Product Analytics)](https://market.teloa.ai/teloa.mcp-posthog/) · PostHog（产品分析） | connector | Teloa | needs-configuration |
| [Sentry (Error Monitoring)](https://market.teloa.ai/teloa.mcp-sentry/) · Sentry（错误监控） | connector | Teloa | needs-configuration |
| [Stripe (Payments)](https://market.teloa.ai/teloa.mcp-stripe/) · Stripe（支付） | connector | Teloa | needs-configuration |
| [Yuque (Knowledge Base)](https://market.teloa.ai/teloa.mcp-yuque/) · 语雀（知识库） | connector | Teloa | needs-configuration |
| [Zapier MCP (9000+ App Automations)](https://market.teloa.ai/teloa.mcp-zapier/) · Zapier MCP（9000+ 应用自动化） | connector | Teloa | needs-configuration |
| [Claude (Anthropic)](https://market.teloa.ai/teloa.model.claude/) · Claude（Anthropic） | model | pi-ai anthropic | needs-configuration |
| [DeepSeek](https://market.teloa.ai/teloa.model.deepseek/) · DeepSeek | model | pi-ai deepseek | needs-configuration |
| [Doubao (Volcengine Ark)](https://market.teloa.ai/teloa.model.doubao/) · 豆包（火山方舟） | model | ark.cn-beijing.volces.com | needs-configuration |
| [Gemini (Google)](https://market.teloa.ai/teloa.model.gemini/) · Gemini（Google） | model | pi-ai google | needs-configuration |
| [Zhipu GLM](https://market.teloa.ai/teloa.model.glm/) · 智谱 GLM | model | open.bigmodel.cn | needs-configuration |
| [Grok (xAI)](https://market.teloa.ai/teloa.model.grok/) · Grok（xAI） | model | pi-ai xai | needs-configuration |
| [Kimi (Moonshot)](https://market.teloa.ai/teloa.model.kimi/) · Kimi（Moonshot） | model | pi-ai moonshotai-cn | needs-configuration |
| [MiniMax](https://market.teloa.ai/teloa.model.minimax/) · MiniMax | model | api.minimax.cn | needs-configuration |
| [OpenAI](https://market.teloa.ai/teloa.model.openai/) · OpenAI | model | pi-ai openai | needs-configuration |
| [OpenRouter (aggregator)](https://market.teloa.ai/teloa.model.openrouter/) · OpenRouter（聚合） | model | pi-ai openrouter | needs-configuration |
| [Qwen (Model Studio)](https://market.teloa.ai/teloa.model.qwen/) · 通义千问（百炼） | model | pi-ai qwen-token-plan-cn | needs-configuration |
| [SiliconFlow (aggregator)](https://market.teloa.ai/teloa.model.siliconflow/) · 硅基流动（聚合） | model | api.siliconflow.cn | needs-configuration |
| [General office](https://market.teloa.ai/teloa.office/) · 通用办公 | solution | Teloa | verified |
| [Project management](https://market.teloa.ai/teloa.project/) · 项目管理 | solution | Teloa | verified |
| [HR recruiting](https://market.teloa.ai/teloa.recruiting/) · HR 招聘 | solution | Teloa | verified |
| [Knowledge and research](https://market.teloa.ai/teloa.research/) · 知识库与研究 | solution | Teloa | verified |
| [Business development collaborator](https://market.teloa.ai/teloa.role.bd-collaborator/) · 商务协作员 | role | Teloa · 方案 sales-business-development@1.0.0 | content-only |
| [Office collaborator](https://market.teloa.ai/teloa.role.office-collaborator/) · 办公协作员 | role | Teloa · 方案 office-collaboration@1.0.0 | content-only |
| [Project coordinator](https://market.teloa.ai/teloa.role.project-coordinator/) · 项目协调员 | role | Teloa · 方案 project-management@1.0.0 | content-only |
| [Reconciliation collaborator](https://market.teloa.ai/teloa.role.reconciliation-collaborator/) · 对账协作员 | role | Teloa · 方案 finance-reconciliation@1.0.0 | content-only |
| [Recruiting collaborator](https://market.teloa.ai/teloa.role.recruiting-collaborator/) · 招聘协作员 | role | Teloa · 方案 hr-recruiting@1.0.0 | content-only |
| [Research collaborator](https://market.teloa.ai/teloa.role.research-collaborator/) · 研究协作员 | role | Teloa · 方案 knowledge-research@1.0.0 | content-only |
| [Support knowledge collaborator](https://market.teloa.ai/teloa.role.support-knowledge-collaborator/) · 客服知识协作员 | role | Teloa · 方案 customer-support@1.0.0 | content-only |
| [Sales and business development](https://market.teloa.ai/teloa.sales/) · 销售与商务 | solution | Teloa | verified |
| [Customer support](https://market.teloa.ai/teloa.support/) · 客户支持 | solution | Teloa | verified |

#### Cyber Security · 网络安全 (9)

##### SOC Operations · SOC 运营 (3)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [T1 triage analyst](https://market.teloa.ai/teloa.role.soc-t1-analyst/) · T1 告警研判员 | role | Teloa · 方案 soc-operations@1.0.1 | content-only |
| [T2 incident investigator](https://market.teloa.ai/teloa.role.soc-t2-investigator/) · T2 事件调查员 | role | Teloa · 方案 soc-operations@1.0.1 | content-only |
| [Security operations (SOC T1/T2/T3)](https://market.teloa.ai/teloa.soc/) · 安全运营（SOC T1/T2/T3） | solution | Teloa | needs-configuration |

##### Detection Engineering · 检测工程 (2)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [Detection engineering](https://market.teloa.ai/teloa.detection/) · 检测工程 | solution | Teloa | content-only |
| [Detection engineer](https://market.teloa.ai/teloa.role.detection-engineer/) · 检测工程师 | role | Teloa · 方案 detection-engineering@1.0.1 | content-only |

##### Application Security · 应用安全 (2)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [Application security](https://market.teloa.ai/teloa.appsec/) · 应用安全 | solution | Teloa | verified |
| [AppSec auditor](https://market.teloa.ai/teloa.role.appsec-auditor/) · 应用安全审计员 | role | Teloa · 方案 appsec-review@1.0.1 | content-only |

##### Compliance & GRC · 合规与治理 (2)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [Governance, risk and compliance (GRC)](https://market.teloa.ai/teloa.grc/) · 治理、风险与合规（GRC） | solution | Teloa | content-only |
| [GRC collaborator](https://market.teloa.ai/teloa.role.grc-collaborator/) · GRC 协作员 | role | Teloa · 方案 grc-compliance@1.0.2 | content-only |

#### Marketing · 市场营销 (3)

##### New Media · 新媒体 (2)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [Content marketing](https://market.teloa.ai/teloa.marketing/) · 新媒体营销 | solution | Teloa | content-only |
| [Content marketer](https://market.teloa.ai/teloa.role.content-marketer/) · 内容运营员 | role | Teloa · 方案 content-marketing@1.0.0 | content-only |

##### E-commerce · 电商 (1)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [E-commerce operations](https://market.teloa.ai/teloa.ecommerce/) · 电商运营 | solution | Teloa | verified |

#### Media & Content · 媒体内容 (2)

##### Video Production · 视频制作 (2)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [Video editing collaborator](https://market.teloa.ai/teloa.role.video-editor/) · 视频剪辑协作员 | role | Teloa · 方案 video-editing@1.0.0 | content-only |
| [Video editing](https://market.teloa.ai/teloa.video/) · 视频剪辑 | solution | Teloa | content-only |

#### Software Development · 软件研发 (3)

##### Engineering · 研发工程 (2)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [Code review & release](https://market.teloa.ai/teloa.code-review/) · 研发协作与代码评审 | solution | Teloa | verified |
| [Engineering incident response](https://market.teloa.ai/teloa.incident/) · 研发事件响应 | solution | Teloa | verified |

##### Product · 产品 (1)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [Product ops & growth](https://market.teloa.ai/teloa.growth/) · 产品运营与增长分析 | solution | Teloa | verified |

### By function · 按功能

#### Office & Docs · 办公与文档 (39)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [Internal communications](https://market.teloa.ai/anthropic.internal-comms/) · 内部沟通稿 | skill | GitHub anthropics/skills | content-only |
| [API Gateway](https://market.teloa.ai/clawhub.byungkyu.api-gateway/) · API 网关（Maton） | skill | ClawHub byungkyu/api-gateway | unsupported |
| [Calendly](https://market.teloa.ai/clawhub.byungkyu.calendly-api/) · Calendly 日程管理 | skill | ClawHub byungkyu/calendly-api | unsupported |
| [ClickUp](https://market.teloa.ai/clawhub.byungkyu.clickup-api/) · ClickUp 任务管理 | skill | ClawHub byungkyu/clickup-api | unsupported |
| [Fathom](https://market.teloa.ai/clawhub.byungkyu.fathom-api/) · Fathom 会议记录 | skill | ClawHub byungkyu/fathom-api | unsupported |
| [gmail](https://market.teloa.ai/clawhub.byungkyu.gmail/) · Gmail 邮件收发 | skill | ClawHub byungkyu/gmail | unsupported |
| [google-drive](https://market.teloa.ai/clawhub.byungkyu.google-drive/) · Google Drive 文件管理 | skill | ClawHub byungkyu/google-drive | unsupported |
| [google-meet](https://market.teloa.ai/clawhub.byungkyu.google-meet/) · Google Meet 视频会议 | skill | ClawHub byungkyu/google-meet | unsupported |
| [google-play](https://market.teloa.ai/clawhub.byungkyu.google-play/) · Google Play 应用管理 | skill | ClawHub byungkyu/google-play | unsupported |
| [google-sheets](https://market.teloa.ai/clawhub.byungkyu.google-sheets/) · Google Sheets 表格处理 | skill | ClawHub byungkyu/google-sheets | unsupported |
| [google-slides](https://market.teloa.ai/clawhub.byungkyu.google-slides/) · Google Slides 演示文稿 | skill | ClawHub byungkyu/google-slides | unsupported |
| [google-workspace-admin](https://market.teloa.ai/clawhub.byungkyu.google-workspace-admin/) · Google Workspace 管理员 | skill | ClawHub byungkyu/google-workspace-admin | unsupported |
| [klaviyo](https://market.teloa.ai/clawhub.byungkyu.klaviyo/) · Klaviyo 邮件营销 | skill | ClawHub byungkyu/klaviyo | unsupported |
| [mailchimp](https://market.teloa.ai/clawhub.byungkyu.mailchimp/) · Mailchimp 邮件营销 | skill | ClawHub byungkyu/mailchimp | unsupported |
| [microsoft-excel](https://market.teloa.ai/clawhub.byungkyu.microsoft-excel/) · Microsoft Excel 表格处理 | skill | ClawHub byungkyu/microsoft-excel | unsupported |
| [Monday.com](https://market.teloa.ai/clawhub.byungkyu.monday/) · Monday.com 工作管理 | skill | ClawHub byungkyu/monday | unsupported |
| [Outlook](https://market.teloa.ai/clawhub.byungkyu.outlook-api/) · Outlook 邮件管理 | skill | ClawHub byungkyu/outlook-api | unsupported |
| [Pipedrive](https://market.teloa.ai/clawhub.byungkyu.pipedrive-api/) · Pipedrive 销售 CRM | skill | ClawHub byungkyu/pipedrive-api | unsupported |
| [Salesforce](https://market.teloa.ai/clawhub.byungkyu.salesforce-api/) · Salesforce CRM | skill | ClawHub byungkyu/salesforce-api | unsupported |
| [typeform](https://market.teloa.ai/clawhub.byungkyu.typeform/) · Typeform 在线表单 | skill | ClawHub byungkyu/typeform | unsupported |
| [WooCommerce](https://market.teloa.ai/clawhub.byungkyu.woocommerce/) · WooCommerce 在线商城 | skill | ClawHub byungkyu/woocommerce | unsupported |
| [xero](https://market.teloa.ai/clawhub.byungkyu.xero/) · Xero 云会计 | skill | ClawHub byungkyu/xero | unsupported |
| [YouTube](https://market.teloa.ai/clawhub.byungkyu.youtube-api-skill/) · YouTube 视频管理 | skill | ClawHub byungkyu/youtube-api-skill | unsupported |
| [zoho-mail](https://market.teloa.ai/clawhub.byungkyu.zoho-mail/) · Zoho Mail 企业邮箱 | skill | ClawHub byungkyu/zoho-mail | unsupported |
| [得到大脑（原 Get 笔记）](https://market.teloa.ai/clawhub.iswalle.getnote/) · 得到大脑笔记 | skill | ClawHub iswalle/getnote | content-only |
| [Memory](https://market.teloa.ai/clawhub.ivangdavila.memory/) · 持久化记忆 | skill | ClawHub ivangdavila/memory | content-only |
| [Word / DOCX](https://market.teloa.ai/clawhub.ivangdavila.word-docx/) · Word 文档 | skill | ClawHub ivangdavila/word-docx | content-only |
| [Self-Improving Proactive Agent](https://market.teloa.ai/clawhub.yueyanc.self-improving-proactive-agent/) · 自改进主动代理 | skill | ClawHub yueyanc/self-improving-proactive-agent | content-only |
| [Meeting action items](https://market.teloa.ai/hermes.meeting-action-items/) · 会议行动项 | skill | GitHub NousResearch/hermes-agent | content-only |
| [Atlassian (Jira & Confluence)](https://market.teloa.ai/teloa.mcp-atlassian/) · Atlassian（Jira & Confluence） | connector | Teloa | needs-configuration |
| [Context7 (Official Docs MCP)](https://market.teloa.ai/teloa.mcp-context7/) · Context7（官方文档 MCP） | connector | Teloa | verified |
| [DeepWiki (Official Remote)](https://market.teloa.ai/teloa.mcp-deepwiki/) · DeepWiki（官方远程） | connector | Teloa | verified |
| [Notion (Local Bearer Token Mode)](https://market.teloa.ai/teloa.mcp-notion/) · Notion（本地 Bearer Token 模式） | connector | Teloa | needs-configuration |
| [Notion Remote (OAuth, Supported in Next Version)](https://market.teloa.ai/teloa.mcp-notion-remote/) · Notion 远程（OAuth，下一版本支持） | connector | Teloa | unsupported |
| [Yuque (Knowledge Base)](https://market.teloa.ai/teloa.mcp-yuque/) · 语雀（知识库） | connector | Teloa | needs-configuration |
| [General office](https://market.teloa.ai/teloa.office/) · 通用办公 | solution | Teloa | verified |
| [Project management](https://market.teloa.ai/teloa.project/) · 项目管理 | solution | Teloa | verified |
| [Office collaborator](https://market.teloa.ai/teloa.role.office-collaborator/) · 办公协作员 | role | Teloa · 方案 office-collaboration@1.0.0 | content-only |
| [Project coordinator](https://market.teloa.ai/teloa.role.project-coordinator/) · 项目协调员 | role | Teloa · 方案 project-management@1.0.0 | content-only |

#### Communication & Collaboration · 沟通与协作 (11)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [WhatsApp Business](https://market.teloa.ai/clawhub.byungkyu.whatsapp-business/) · WhatsApp Business 消息 | skill | ClawHub byungkyu/whatsapp-business | unsupported |
| [Atlassian (Jira & Confluence)](https://market.teloa.ai/teloa.mcp-atlassian/) · Atlassian（Jira & Confluence） | connector | Teloa | needs-configuration |
| [DingTalk (Enterprise Communication)](https://market.teloa.ai/teloa.mcp-dingtalk/) · 钉钉（企业通讯与协作） | connector | Teloa | needs-configuration |
| [Figma Remote (OAuth + Allowlist, Supported in Next Version)](https://market.teloa.ai/teloa.mcp-figma/) · Figma 远程（OAuth + 白名单，下一版本支持） | connector | Teloa | unsupported |
| [GitHub (Official Remote MCP)](https://market.teloa.ai/teloa.mcp-github/) · GitHub（官方远程 MCP） | connector | Teloa | needs-configuration |
| [Feishu/Lark (Official MCP)](https://market.teloa.ai/teloa.mcp-lark/) · 飞书/Lark（官方 MCP） | connector | Teloa | needs-configuration |
| [Linear (Official Remote MCP)](https://market.teloa.ai/teloa.mcp-linear/) · Linear（官方远程 MCP） | connector | Teloa | needs-configuration |
| [Notion (Local Bearer Token Mode)](https://market.teloa.ai/teloa.mcp-notion/) · Notion（本地 Bearer Token 模式） | connector | Teloa | needs-configuration |
| [Notion Remote (OAuth, Supported in Next Version)](https://market.teloa.ai/teloa.mcp-notion-remote/) · Notion 远程（OAuth，下一版本支持） | connector | Teloa | unsupported |
| [Support knowledge collaborator](https://market.teloa.ai/teloa.role.support-knowledge-collaborator/) · 客服知识协作员 | role | Teloa · 方案 customer-support@1.0.0 | content-only |
| [Customer support](https://market.teloa.ai/teloa.support/) · 客户支持 | solution | Teloa | verified |

#### Content & Design · 内容与设计 (14)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [cellcog](https://market.teloa.ai/clawhub.cellcog.cellcog/) · CellCog AI 代理 | skill | ClawHub cellcog/cellcog | unsupported |
| [Image Generation](https://market.teloa.ai/clawhub.cellcog.image-generation-cellcog/) · 图像生成（CellCog） | skill | ClawHub cellcog/image-generation-cellcog | content-only |
| [Baidu Wenku AIPPT](https://market.teloa.ai/clawhub.ide-rea.ai-ppt-generator/) · 百度文库 AI PPT | skill | ClawHub ide-rea/ai-ppt-generator | content-only |
| [Powerpoint / PPTX](https://market.teloa.ai/clawhub.ivangdavila.powerpoint-pptx/) · PowerPoint 演示 | skill | ClawHub ivangdavila/powerpoint-pptx | content-only |
| [X Search](https://market.teloa.ai/clawhub.jaaneek.x-search/) · X（Twitter）搜索 | skill | ClawHub jaaneek/x-search | unsupported |
| [OCR - Local (No API Key)](https://market.teloa.ai/clawhub.shaw555.ocr-local/) · OCR 本地识别 | skill | ClawHub shaw555/ocr-local | content-only |
| [Eno Skills](https://market.teloa.ai/clawhub.wscats.eno/) · Eno 技能库 | skill | ClawHub wscats/eno | content-only |
| [Report Generator](https://market.teloa.ai/clawhub.wscats.smart-weekly-report/) · 周报生成器 | skill | ClawHub wscats/smart-weekly-report | content-only |
| [E-commerce operations](https://market.teloa.ai/teloa.ecommerce/) · 电商运营 | solution | Teloa | verified |
| [Content marketing](https://market.teloa.ai/teloa.marketing/) · 新媒体营销 | solution | Teloa | content-only |
| [Figma Remote (OAuth + Allowlist, Supported in Next Version)](https://market.teloa.ai/teloa.mcp-figma/) · Figma 远程（OAuth + 白名单，下一版本支持） | connector | Teloa | unsupported |
| [Content marketer](https://market.teloa.ai/teloa.role.content-marketer/) · 内容运营员 | role | Teloa · 方案 content-marketing@1.0.0 | content-only |
| [Video editing collaborator](https://market.teloa.ai/teloa.role.video-editor/) · 视频剪辑协作员 | role | Teloa · 方案 video-editing@1.0.0 | content-only |
| [Video editing](https://market.teloa.ai/teloa.video/) · 视频剪辑 | solution | Teloa | content-only |

#### Data & Research · 数据与研究 (15)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [Financial Search Engine](https://market.teloa.ai/clawhub.financial-ai-analyst.mx-finance-search/) · 金融搜索引擎 | skill | ClawHub financial-ai-analyst/mx-finance-search | unsupported |
| [Global Macro Database Assistant](https://market.teloa.ai/clawhub.financial-ai-analyst.mx-macro-data/) · 全球宏观数据助手 | skill | ClawHub financial-ai-analyst/mx-macro-data | unsupported |
| [Data Analysis](https://market.teloa.ai/clawhub.ivangdavila.data-analysis/) · 数据分析 | skill | ClawHub ivangdavila/data-analysis | content-only |
| [Excel / XLSX](https://market.teloa.ai/clawhub.ivangdavila.excel-xlsx/) · Excel 电子表格 | skill | ClawHub ivangdavila/excel-xlsx | content-only |
| [Image](https://market.teloa.ai/clawhub.ivangdavila.image/) · 图像处理 | skill | ClawHub ivangdavila/image | content-only |
| [Market Research](https://market.teloa.ai/clawhub.ivangdavila.market-research/) · 市场研究 | skill | ClawHub ivangdavila/market-research | content-only |
| [SEO (Site Audit + Content Writer + Competitor Analysis)](https://market.teloa.ai/clawhub.ivangdavila.seo/) · SEO 优化工具 | skill | ClawHub ivangdavila/seo | content-only |
| [tushare](https://market.teloa.ai/clawhub.lidayan.tushare-data/) · Tushare 股票数据 | skill | ClawHub lidayan/tushare-data | content-only |
| [Grounded citations](https://market.teloa.ai/hermes.grounded-citations/) · 有据引用 | skill | GitHub NousResearch/hermes-agent | content-only |
| [Product ops & growth](https://market.teloa.ai/teloa.growth/) · 产品运营与增长分析 | solution | Teloa | verified |
| [Amap Maps (Official MCP)](https://market.teloa.ai/teloa.mcp-amap/) · 高德地图（官方 MCP） | connector | Teloa | needs-configuration |
| [Exa Web Search](https://market.teloa.ai/teloa.mcp-exa/) · Exa 网络搜索 | connector | Teloa | needs-configuration |
| [PostHog (Product Analytics)](https://market.teloa.ai/teloa.mcp-posthog/) · PostHog（产品分析） | connector | Teloa | needs-configuration |
| [Knowledge and research](https://market.teloa.ai/teloa.research/) · 知识库与研究 | solution | Teloa | verified |
| [Research collaborator](https://market.teloa.ai/teloa.role.research-collaborator/) · 研究协作员 | role | Teloa · 方案 knowledge-research@1.0.0 | content-only |

#### Dev Tools · 研发工具 (14)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [MCP server builder](https://market.teloa.ai/anthropic.mcp-builder/) · MCP 服务器构建指南 | skill | GitHub anthropics/skills | content-only |
| [Git](https://market.teloa.ai/clawhub.ivangdavila.git/) · Git 版本控制 | skill | ClawHub ivangdavila/git | content-only |
| [Proactivity (Proactive Agent)](https://market.teloa.ai/clawhub.ivangdavila.proactivity/) · 主动代理 | skill | ClawHub ivangdavila/proactivity | content-only |
| [Screenshot](https://market.teloa.ai/clawhub.ivangdavila.screenshot/) · 截图工具 | skill | ClawHub ivangdavila/screenshot | content-only |
| [Capability Evolver](https://market.teloa.ai/clawhub.kennyzir.capability-evolver-pro/) · 能力进化器 | skill | ClawHub kennyzir/capability-evolver-pro | content-only |
| [Resume Assistant](https://market.teloa.ai/clawhub.wscats.resume-assistant/) · 简历助手 | skill | ClawHub wscats/resume-assistant | content-only |
| [Skill creator](https://market.teloa.ai/openai.skill-creator/) · 技能创建器 | skill | GitHub openai/skills | verified |
| [GitHub CLI workflow](https://market.teloa.ai/openclaw.github/) · GitHub CLI 工作流 | skill | GitHub openclaw/openclaw | needs-configuration |
| [Code review & release](https://market.teloa.ai/teloa.code-review/) · 研发协作与代码评审 | solution | Teloa | verified |
| [Context7 (Official Docs MCP)](https://market.teloa.ai/teloa.mcp-context7/) · Context7（官方文档 MCP） | connector | Teloa | verified |
| [DeepWiki (Official Remote)](https://market.teloa.ai/teloa.mcp-deepwiki/) · DeepWiki（官方远程） | connector | Teloa | verified |
| [GitHub (Official Remote MCP)](https://market.teloa.ai/teloa.mcp-github/) · GitHub（官方远程 MCP） | connector | Teloa | needs-configuration |
| [Greptile (Codebase Semantic Search)](https://market.teloa.ai/teloa.mcp-greptile/) · Greptile（代码库语义搜索） | connector | Teloa | needs-configuration |
| [PostHog (Product Analytics)](https://market.teloa.ai/teloa.mcp-posthog/) · PostHog（产品分析） | connector | Teloa | needs-configuration |

#### Cloud & Ops · 云与运维 (5)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [Engineering incident response](https://market.teloa.ai/teloa.incident/) · 研发事件响应 | solution | Teloa | verified |
| [Exa Web Search](https://market.teloa.ai/teloa.mcp-exa/) · Exa 网络搜索 | connector | Teloa | needs-configuration |
| [PagerDuty (Incident Response)](https://market.teloa.ai/teloa.mcp-pagerduty/) · PagerDuty（事件响应） | connector | Teloa | needs-configuration |
| [Playwright Browser Automation](https://market.teloa.ai/teloa.mcp-playwright/) · Playwright 浏览器自动化 | connector | Teloa | needs-configuration |
| [Sentry (Error Monitoring)](https://market.teloa.ai/teloa.mcp-sentry/) · Sentry（错误监控） | connector | Teloa | needs-configuration |

#### Security · 安全 (10)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [Repository threat modeling](https://market.teloa.ai/openai.security-threat-model/) · 代码仓威胁建模 | skill | GitHub openai/skills | content-only |
| [Application security](https://market.teloa.ai/teloa.appsec/) · 应用安全 | solution | Teloa | verified |
| [Detection engineering](https://market.teloa.ai/teloa.detection/) · 检测工程 | solution | Teloa | content-only |
| [Governance, risk and compliance (GRC)](https://market.teloa.ai/teloa.grc/) · 治理、风险与合规（GRC） | solution | Teloa | content-only |
| [AppSec auditor](https://market.teloa.ai/teloa.role.appsec-auditor/) · 应用安全审计员 | role | Teloa · 方案 appsec-review@1.0.1 | content-only |
| [Detection engineer](https://market.teloa.ai/teloa.role.detection-engineer/) · 检测工程师 | role | Teloa · 方案 detection-engineering@1.0.1 | content-only |
| [GRC collaborator](https://market.teloa.ai/teloa.role.grc-collaborator/) · GRC 协作员 | role | Teloa · 方案 grc-compliance@1.0.2 | content-only |
| [T1 triage analyst](https://market.teloa.ai/teloa.role.soc-t1-analyst/) · T1 告警研判员 | role | Teloa · 方案 soc-operations@1.0.1 | content-only |
| [T2 incident investigator](https://market.teloa.ai/teloa.role.soc-t2-investigator/) · T2 事件调查员 | role | Teloa · 方案 soc-operations@1.0.1 | content-only |
| [Security operations (SOC T1/T2/T3)](https://market.teloa.ai/teloa.soc/) · 安全运营（SOC T1/T2/T3） | solution | Teloa | needs-configuration |

#### Business Ops · 商务运营 (14)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [Zoho CRM](https://market.teloa.ai/clawhub.byungkyu.zoho-crm/) · Zoho CRM 客户管理 | skill | ClawHub byungkyu/zoho-crm | unsupported |
| [E-commerce operations](https://market.teloa.ai/teloa.ecommerce/) · 电商运营 | solution | Teloa | verified |
| [Finance reconciliation](https://market.teloa.ai/teloa.finance/) · 财务对账 | solution | Teloa | verified |
| [Product ops & growth](https://market.teloa.ai/teloa.growth/) · 产品运营与增长分析 | solution | Teloa | verified |
| [Stripe (Payments)](https://market.teloa.ai/teloa.mcp-stripe/) · Stripe（支付） | connector | Teloa | needs-configuration |
| [Project management](https://market.teloa.ai/teloa.project/) · 项目管理 | solution | Teloa | verified |
| [HR recruiting](https://market.teloa.ai/teloa.recruiting/) · HR 招聘 | solution | Teloa | verified |
| [Business development collaborator](https://market.teloa.ai/teloa.role.bd-collaborator/) · 商务协作员 | role | Teloa · 方案 sales-business-development@1.0.0 | content-only |
| [Project coordinator](https://market.teloa.ai/teloa.role.project-coordinator/) · 项目协调员 | role | Teloa · 方案 project-management@1.0.0 | content-only |
| [Reconciliation collaborator](https://market.teloa.ai/teloa.role.reconciliation-collaborator/) · 对账协作员 | role | Teloa · 方案 finance-reconciliation@1.0.0 | content-only |
| [Recruiting collaborator](https://market.teloa.ai/teloa.role.recruiting-collaborator/) · 招聘协作员 | role | Teloa · 方案 hr-recruiting@1.0.0 | content-only |
| [Support knowledge collaborator](https://market.teloa.ai/teloa.role.support-knowledge-collaborator/) · 客服知识协作员 | role | Teloa · 方案 customer-support@1.0.0 | content-only |
| [Sales and business development](https://market.teloa.ai/teloa.sales/) · 销售与商务 | solution | Teloa | verified |
| [Customer support](https://market.teloa.ai/teloa.support/) · 客户支持 | solution | Teloa | verified |

#### Automation & Integration · 自动化与集成 (8)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [Skill Finder Cn](https://market.teloa.ai/clawhub.guohongbin-git.skill-finder-cn/) · 技能查找器 | skill | ClawHub guohongbin-git/skill-finder-cn | content-only |
| [Planning with files](https://market.teloa.ai/clawhub.othmanadi.planning-with-files/) · 文件式任务规划 | skill | ClawHub othmanadi/planning-with-files | content-only |
| [China Stock Analysis](https://market.teloa.ai/clawhub.paulshe.china-stock-analysis/) · 中国股票分析 | skill | ClawHub paulshe/china-stock-analysis | content-only |
| [Interview Simulator](https://market.teloa.ai/clawhub.wscats.interview-simulator/) · 面试模拟器 | skill | ClawHub wscats/interview-simulator | content-only |
| [T Trading](https://market.teloa.ai/clawhub.wscats.t-trading/) · T 短线交易 | skill | ClawHub wscats/t-trading | content-only |
| [Composio MCP (1500+ App Integrations)](https://market.teloa.ai/teloa.mcp-composio/) · Composio MCP（1500+ 应用集成） | connector | Teloa | unsupported |
| [Playwright Browser Automation](https://market.teloa.ai/teloa.mcp-playwright/) · Playwright 浏览器自动化 | connector | Teloa | needs-configuration |
| [Zapier MCP (9000+ App Automations)](https://market.teloa.ai/teloa.mcp-zapier/) · Zapier MCP（9000+ 应用自动化） | connector | Teloa | needs-configuration |

#### Other · 其他 (12)

| Entry · 条目 | Type · 类型 | Source · 来源 | Compatibility · 兼容 |
| --- | --- | --- | --- |
| [Claude (Anthropic)](https://market.teloa.ai/teloa.model.claude/) · Claude（Anthropic） | model | pi-ai anthropic | needs-configuration |
| [DeepSeek](https://market.teloa.ai/teloa.model.deepseek/) · DeepSeek | model | pi-ai deepseek | needs-configuration |
| [Doubao (Volcengine Ark)](https://market.teloa.ai/teloa.model.doubao/) · 豆包（火山方舟） | model | ark.cn-beijing.volces.com | needs-configuration |
| [Gemini (Google)](https://market.teloa.ai/teloa.model.gemini/) · Gemini（Google） | model | pi-ai google | needs-configuration |
| [Zhipu GLM](https://market.teloa.ai/teloa.model.glm/) · 智谱 GLM | model | open.bigmodel.cn | needs-configuration |
| [Grok (xAI)](https://market.teloa.ai/teloa.model.grok/) · Grok（xAI） | model | pi-ai xai | needs-configuration |
| [Kimi (Moonshot)](https://market.teloa.ai/teloa.model.kimi/) · Kimi（Moonshot） | model | pi-ai moonshotai-cn | needs-configuration |
| [MiniMax](https://market.teloa.ai/teloa.model.minimax/) · MiniMax | model | api.minimax.cn | needs-configuration |
| [OpenAI](https://market.teloa.ai/teloa.model.openai/) · OpenAI | model | pi-ai openai | needs-configuration |
| [OpenRouter (aggregator)](https://market.teloa.ai/teloa.model.openrouter/) · OpenRouter（聚合） | model | pi-ai openrouter | needs-configuration |
| [Qwen (Model Studio)](https://market.teloa.ai/teloa.model.qwen/) · 通义千问（百炼） | model | pi-ai qwen-token-plan-cn | needs-configuration |
| [SiliconFlow (aggregator)](https://market.teloa.ai/teloa.model.siliconflow/) · 硅基流动（聚合） | model | api.siliconflow.cn | needs-configuration |
<!-- catalog:end -->
