# HR 招聘协作 / HR Recruiting

面向岗位说明书（JD）起草、简历初筛对照清单、面试纲要与面试记录汇总的 Teloa 官方行业方案。岗位只出草案与对照清单，不做录用或淘汰决定。

A Teloa official solution for drafting job descriptions, building resume screening checklists, and preparing interview guides and note summaries. The role produces drafts and checklists only and never makes hire or reject decisions.

---

## 现在可做 / What it does now

上传文件后，岗位可以：

- **JD 起草**：把用人部门的需求说明或旧版 JD 拆成职责、必备条件、加分条件与工作信息，每条附来源；缺失项标为待用人部门确认；年龄、性别、婚育、民族、籍贯等受保护特征一律不写入并给出合规提示
- **简历初筛对照清单**：逐份简历对照 JD 条目，生成「JD 条目 × 候选人」矩阵，每格只记满足 / 未满足 / 未提及 / 疑似满足并附简历出处与经验年限计算过程；不打分、不排名、不给录用建议
- **面试纲要与评分表**：每个问题对应一条 JD 能力要求，行为面试题附追问方向，评分锚点写成可观察行为；自动排除禁问事项
- **面试记录汇总**：从转写或面试官笔记中分离候选人事实、面试官原话评价与待办；多位面试官评价并列不合并；与岗位无关的评价标注待确认

After you upload files, the role can:

- **Draft JDs**: split the hiring team's requirements or a previous JD into responsibilities, must-haves, nice-to-haves and job details, each with its source; mark gaps for the hiring team; never write in protected characteristics (age, gender, marital or parental status, ethnicity, place of origin) and flag them
- **Build screening checklists**: compare each resume against JD items in a JD-item-by-candidate matrix, recording only met / not met / not mentioned / possibly met with resume citations and experience calculations; no scoring, ranking or hiring recommendation
- **Design interview guides and scorecards**: every question maps to a JD competency, behavioral questions come with follow-up paths, scoring anchors are observable behaviors; prohibited questions are excluded
- **Summarize interview notes**: separate candidate facts, verbatim interviewer comments and action items from transcripts or notes; keep multiple interviewers' comments side by side; flag job-irrelevant comments

---

## 还需你提供 / What you need to provide

- **文件**：岗位需求说明或旧版 JD、简历、面试转写或面试官笔记。岗位不会主动检索候选人的社交账号或未提供的外部资料。
- **岗位与轮次信息**：岗位名称、所属部门、面试轮次与本轮目标；经验年限折算等补充口径（如「实习按半计」）。
- **决定由你作出**：进入下一轮、录用、淘汰、薪酬与职级都由负责人与用人部门决定，岗位只提供对照材料。

- **Files**: job requirement notes or a previous JD, resumes, interview transcripts or interviewer notes. The role never searches candidates' social accounts or external sources you did not provide.
- **Job and round details**: job title, department, interview round and goals; supplementary rules such as how internships count toward experience.
- **Decisions stay with you**: advancing, hiring, rejecting, compensation and grading are decided by you and the hiring team; the role only supplies comparison material.

---

## 会请求的权限 / Permissions

本方案第一版仅需要**读取你上传的文件**，不请求任何写权限、外部 API 或账号连接。

以下动作岗位都会先停下等你确认：

- 向候选人、招聘渠道或第三方发送 JD、面试邀请或任何材料
- 将初筛结果或面试评价写入招聘系统、人才库或共享表格
- 创建或修改面试日程
- 起草录用通知、拒信或涉及薪酬、职级、入职承诺的文本
- 在产出中保留身份证号、联系方式、照片等非筛选必需的个人信息

This first version only **reads the files you upload** and requests no write access, external API or account connection.

The role stops and asks you before:

- sending a JD, interview invitation or any material to candidates, job boards or third parties
- writing screening results or interview comments into a recruiting system, talent pool or shared sheet
- creating or changing interview schedules
- drafting offer letters, rejection letters or any text involving compensation, grade or onboarding promises
- keeping ID numbers, contact details, photos or other non-essential personal data in the output

---

## 推荐搭配 / Recommended companions

以下为可选项，**未在本包中声明**，需要你另行添加与授权：

- **连接器**：飞书（`teloa.mcp-lark`）、钉钉（`teloa.mcp-dingtalk`）——用于在你确认后创建面试日程或发送通知；均需应用凭据
- **上游技能**：`wscats.resume-assistant`（简历整理）、`wscats.interview-simulator`（面试模拟）

Optional, **not bundled in this package**, added and authorized separately:

- **Connectors**: Lark (`teloa.mcp-lark`), DingTalk (`teloa.mcp-dingtalk`) for creating interview schedules or sending notices after your confirmation; both need app credentials
- **Upstream skills**: `wscats.resume-assistant`, `wscats.interview-simulator`

---

## 已验证范围 / Verified scope

- 2026-09-25 已用真实模型（DeepSeek deepseek-flash，隔离宿主）验收：从市场添加、加载到业务、岗位上岗后，三个任务模板（JD 起草、简历初筛对照、面试纲要与记录）按 `examples/*-input.md` 建任务，产出结构与 `*-expected.md` 一致、事实逐条指向来源，未对外发送、未做承诺或决定；兼容状态已改为 `verified`，验收记录见 `docs/superpowers/reviews/2026-09-25-首批方案扩充真实模型验收.md`
- 外部连接（日历、IM、招聘系统）未在本版本中进行端到端验收

- Verified with a real model (DeepSeek deepseek-flash on an isolated host) on 2026-09-25: after adding from the market, loading into a business and taking the role, all three task templates (JD draft, resume screening checklist, interview guide with notes) were run from `examples/*-input.md`; the output matched the structure of `*-expected.md` with facts traced to sources, nothing was sent externally and no commitments or decisions were made; compatibility is now `verified` (record: `docs/superpowers/reviews/2026-09-25-首批方案扩充真实模型验收.md`)
- External connections (calendar, IM, recruiting systems) have not been verified end to end

---

## 不包含 / Not included

- 录用、淘汰、排名或薪酬决定
- 任何基于年龄、性别、婚育、民族、籍贯、健康状况、外貌的筛选或评价
- 检索候选人社交账号、背景信息或未提供的外部资料
- 直接发送邮件、消息或写入招聘系统（须另行授权）
- 生成 DOCX/XLSX/PPTX 等格式文件（文件生成为独立工具能力）

- Hire, reject, ranking or compensation decisions
- Any screening or evaluation based on age, gender, marital or parental status, ethnicity, place of origin, health or appearance
- Searching candidates' social accounts, background or external sources not provided
- Sending email or messages or writing to recruiting systems directly (separate authorization required)
- Generating DOCX/XLSX/PPTX files (a separate tool capability)

---

*版本 1.0.0 | Apache-2.0 | Teloa 官方内容*
