#!/usr/bin/env python3
"""Build Teloa market candidates from cobusgreyling/grok-bot-templates (MIT).

Usage:
  python3 -I tools/build-grok-bot-template-teams.py --upstream-dir <checkout of the pinned commit> [--teams product,marketing,sales]
  python3 -I tools/build-grok-bot-template-teams.py --upstream-dir <pinned source> --teams marketing --version 1.0.1 --missing-source-policy evidence-v1 --output-root <staging>
  python3 -I tools/build-grok-bot-template-teams.py --upstream-dir <pinned source> --teams marketing --version 1.0.2 --missing-source-policy evidence-v1 --human-titles --output-root <staging>

Reads teams/<team>/team.yaml, templates/<cat>/<bot>/template.yaml, skills/<id>/{SKILL.md,skill.yaml}
and routines/<id>/routine.yaml from the pinned checkout and writes, inside this repository:
  catalog/solutions/teloa.grok-<team>-team.json         + artifacts/solutions/teloa.grok-<team>-team/<ver>/
  catalog/roles/teloa.grok-<bot>.json                   + artifacts/roles/teloa.grok-<bot>/<ver>/
  reviews/solutions/..., reviews/roles/...
Original PROFILE.md, template.yaml, examples/first-run.md, team.yaml, skill.yaml and routine.yaml are copied
byte for byte as references. role.json, SKILL.md frontmatter and work-template JSON are Teloa adaptations;
every adaptation is listed in MODIFICATIONS.md and in the catalog entry's `modifications`.
Only PyYAML is required. The script never contacts the network and never installs anything.
"""
import argparse, datetime, hashlib, json, pathlib, re, sys
import yaml

ROOT = pathlib.Path(__file__).resolve().parent.parent
REPOSITORY_ROOT = ROOT
UPSTREAM = {"owner": "cobusgreyling", "repo": "grok-bot-templates", "commit": "4f3f28b4e6578cd227ff7f4b78ec91d15fd091b5"}
UPSTREAM_URL = f"https://github.com/{UPSTREAM['owner']}/{UPSTREAM['repo']}/tree/{UPSTREAM['commit']}"
LICENSE_URL = f"https://github.com/{UPSTREAM['owner']}/{UPSTREAM['repo']}/blob/{UPSTREAM['commit']}/LICENSE"
VERSION = "1.0.0"
MISSING_SOURCE_POLICY = None
HUMAN_TITLES = False
REVIEWED_AT = "2026-10-14"
TELOA_RANGE = ">=0.2.0-alpha.8"
DSH_RANGE = "0.2.1-alpha.1"
AUTONOMY = {"L0": "Observe: read and report only", "L1": "Draft: review-ready artifacts; never send, post, pay, merge, publish or change production", "L2": "Approved action: named writes after in-chat approval", "L3": "Scheduled: routine runs the skill; writes still follow the never-list"}
# Teloa catalog connectors usable for the original plugin names; only read-only tools are declared.
CONNECTORS = {
    "GitHub": {"serverName": "github", "tools": ["search_repositories", "get_file_contents", "list_issues"], "entry": "teloa.mcp-github"},
    "Notion": {"serverName": "notion_remote", "tools": ["notion-search", "notion-fetch", "notion-query-data-sources", "notion-get-comments"], "entry": "teloa.mcp-notion-remote"},
}
# Teloa-side Chinese titles (adaptation; the original English stays in the package).
ZH = {
    "product": "软件产品团队", "marketing": "内容营销团队", "sales": "销售协作团队",
    "product-performance": "产品性能调查员工", "feature-ask-collator": "需求归集员工", "launch-coordinator": "发布协调员工",
    "competitor-watch": "竞品监测员工", "content-remix": "内容改编员工", "newsletter-desk": "简报编辑员工",
    "sales-outbound": "外联研究员工", "meeting-prep": "会前简报员工", "call-followup": "通话跟进员工",
}
ZH_TW = {
    "product": "軟體產品團隊", "marketing": "內容行銷團隊", "sales": "銷售協作團隊",
    "product-performance": "產品效能調查員工", "feature-ask-collator": "需求彙整員工", "launch-coordinator": "發布協調員工",
    "competitor-watch": "競品監測員工", "content-remix": "內容改編員工", "newsletter-desk": "電子報編輯員工",
    "sales-outbound": "開發客戶研究員工", "meeting-prep": "會前簡報員工", "call-followup": "通話跟進員工",
}
BOARDS = {
    "product": ("teloa.saas-delivery-dashboard", "软件交付看板", "需求验收、未解除阻塞和发布准备"),
    "marketing": ("teloa.content-ops-dashboard", "内容运营看板", "内容排期、待审稿件和有来源的渠道统计"),
    "sales": ("teloa.b2b-sales-followup-dashboard", "销售跟进看板", "商机、待履行承诺和按币种区分的金额"),
}
AVATARS = {
    "product-performance": "data-analyst", "feature-ask-collator": "product-manager", "launch-coordinator": "project",
    "competitor-watch": "marketing", "content-remix": "brand-designer", "newsletter-desk": "content-writer",
    "sales-outbound": "sales", "meeting-prep": "executive-assistant", "call-followup": "admin",
}
ROUTINE_TITLES = {
    "weekday-perf-health": ("工作日性能检查", "工作日效能檢查", "Weekday performance check"),
    "weekday-competitor-diff": ("工作日竞品变化", "工作日競品變化", "Weekday competitor changes"),
    "weekly-newsletter-draft": ("每周简报草稿", "每週電子報草稿", "Weekly newsletter draft"),
    "nightly-outbound-research": ("晚间客户研究", "晚間客戶研究", "Evening account research"),
    "morning-meeting-prep": ("晨间会前准备", "早晨會前準備", "Morning meeting preparation"),
}
ZH_SUMMARY = {
    "product-performance": "按证据做定向性能调查：打开仪表盘、追踪与代码链接，区分事实与假设，给出最高置信度热点；不改告警、不改开关、不合并、不呼叫任何人。",
    "feature-ask-collator": "只在你指定的 Slack 频道与时间窗内归集需求，按工作目标聚类、按线程计数、与现有工单去重，输出问题陈述草稿；不回复、不建工单、不承诺排期。",
    "launch-coordinator": "维护发布清单与 go/no-go 包：每个角色一个负责人，交接写明结果、来源与审批边界，阻塞集中一处；人来下结论，不发布、不打标签、不合并。",
    "competitor-watch": "对你指定的 3–8 家竞品做快照差异：只报价格、打包、定位和指定岗位招聘的实质变化，引用数字与 URL；Slack 草稿保持未发送，不抓登录后页面。",
    "content-remix": "把已接受的稿件改编成各渠道 DRAFT 变体：先提取来源主张，每句可回溯，尊重字数限制；不发布、不排期、不发邮件、不改动源 Notion 页。",
    "newsletter-desk": "从你保存的链接与笔记组装下一期简报：逐条引用原始 URL，跳过单薄或重复条目并可见列出，匹配过往语气；Doc 与 Gmail 草稿保持未发送，不加订阅者。",
    "sales-outbound": "对指定账户清单做研究并给出待审外联：按 ICP 与意向证据评分、每条带链接，最多三个联系人，DRAFT 外联按附件风格；不发送、不加入序列、不扩清单。",
    "meeting-prep": "从日历、CRM、邮件与指定 Slack 频道生成 INTERNAL 会前简报：谁在场、上次承诺与日期（或写无）、一句开场；不给客户发预读、不改日程。",
    "call-followup": "通话后起草未发送的回顾与双方任务：区分通话事实与推断，引用承诺并标注未知日期，按空闲时段提议下次窗口；不发送、不预约、不抄送。",
}
ZH_TEAM_SUMMARY = {
    "product": "三位员工覆盖延迟调查、需求归集与发布协调：产品性能调查员工（团队负责人）用仪表盘与追踪给出带证据的热点，需求归集员工只聚类不建工单，发布协调员工维护 go/no-go 清单并停在人来裁决之前。不改生产、不建工单、不发布。",
    "marketing": "三位员工覆盖竞品差异、内容改编与周报组装：竞品监测员工（团队负责人）只报实质变化并引用数字，内容改编员工把已接受稿件变成各渠道 DRAFT，简报编辑员工把保存的链接组装成未发送的一期。不发布、不发 Slack/X、不发送简报。",
    "sales": "三位员工覆盖外联研究、会前简报与通话跟进：外联研究员工（团队负责人）对指定账户清单评分并给出待审外联，会前简报员工为下一次会议写 INTERNAL 简报，通话跟进员工在拿到笔记后起草未发送回顾。不发送、不加入序列、不预约。",
}
EN_TEAM_SUMMARY = {
    "product": "Three employees investigate performance, gather feature requests and coordinate releases. The performance investigator leads; requests become evidence-backed drafts and release decisions remain with you.",
    "marketing": "Three employees track competitor changes, adapt accepted content and assemble newsletters. The competitor analyst leads; channel variants and newsletters stay as drafts for review.",
    "sales": "Three employees research accounts, prepare meetings and draft call follow-ups. The outbound researcher leads; outreach, recaps and proposed meeting times remain for your review.",
}
TAXONOMY = {
    "product": {"functions": ["business-ops", "data-research"], "industries": ["software/product", "software"], "domain": "software"},
    "marketing": {"functions": ["content-design", "data-research"], "industries": ["marketing", "marketing/new-media"], "domain": "marketing"},
    "sales": {"functions": ["business-ops", "communication"], "industries": ["general"], "domain": "general"},
}
ROLE_FUNCTIONS = {
    "product-performance": ["data-research", "dev-tools"], "feature-ask-collator": ["data-research", "business-ops"], "launch-coordinator": ["business-ops", "communication"],
    "competitor-watch": ["data-research"], "content-remix": ["content-design"], "newsletter-desk": ["content-design", "office-docs"],
    "sales-outbound": ["data-research", "business-ops"], "meeting-prep": ["office-docs", "business-ops"], "call-followup": ["office-docs", "communication"],
}
NETWORK = {"competitor-watch", "sales-outbound"}
ORIGINAL_MISSING_SOURCE_RULE = 'If a page is unavailable, write "page not found" rather than reusing last week\'s number silently.'
ORIGINAL_COMPETITOR_NO_DATA = "If the competitor list is missing or longer than eight, ask the owner to name 3–8 and stop. " + ORIGINAL_MISSING_SOURCE_RULE
EVIDENCE_MISSING_SOURCE_RULE = ("When a page or supplied capture is unavailable, report the known unavailability and mark the cause as unknown. "
    "State a cause or HTTP status only when this run's supplied material or a real tool response explicitly supports it. "
    "Do not infer nonexistence, deletion, access denial or a status code from unavailability. Never silently reuse a prior value as current.")

def no_data_policy(bot: str, original: str) -> str:
    """One fixed upstream correction shared by the role fields and adapted PROFILE."""
    if not MISSING_SOURCE_POLICY or bot != "competitor-watch":
        return original
    if original != ORIGINAL_COMPETITOR_NO_DATA:
        raise SystemExit("competitor-watch no_data source changed; review the pinned input before adapting")
    return original.replace(ORIGINAL_MISSING_SOURCE_RULE, EVIDENCE_MISSING_SOURCE_RULE, 1)

def native_skill_id(original: str, team_id: str = "marketing") -> str:
    # New parent trust includes its version, so a new name must not replace an older installation.
    return f"grok-{team_id}-{VERSION.replace('.', '-')}-{original}" if MISSING_SOURCE_POLICY or HUMAN_TITLES else original

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def text(value) -> str:
    return (value or "").strip()

def clip(value: str, limit: int, label: str) -> str:
    if len(value) > limit:
        raise SystemExit(f"{label}: {len(value)} chars exceeds {limit}")
    return value

def read_yaml(path: pathlib.Path):
    return yaml.safe_load(path.read_text(encoding="utf-8"))

def write(path: pathlib.Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(data, bytes):
        path.write_bytes(data)
    elif isinstance(data, str):
        path.write_text(data, encoding="utf-8")
    else:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def adapt_skill_markdown(original: str, skill_id: str, skill: dict, team_id: str = "marketing") -> tuple[str, list[str]]:
    """Add Teloa frontmatter and a derivation notice; drop the two Grok-only paste/composer instructions. Body otherwise verbatim."""
    removed = []
    lines = original.splitlines()
    kept = []
    for line in lines:
        if line.startswith("Paste this into Grok Bot after a successful run:") or line.startswith("> Save the process we just used as a skill called"):
            removed.append(line); continue
        if line.startswith("Type `/` in the composer to reference a saved skill."):
            removed.append(line); continue
        kept.append(line)
    body = "\n".join(kept).strip() + "\n"
    desc = " ".join(text(skill.get("when_to_use")).split())
    desc = clip(desc, 1024, f"{skill_id} description").replace('"', "'")
    notice = (f"> Derived work: adapted by Teloa from {UPSTREAM['owner']}/{UPSTREAM['repo']}@{UPSTREAM['commit'][:12]} skills/{skill_id}/SKILL.md (MIT). "
              f"Teloa added this frontmatter and notice and removed the Grok Bot paste/composer instructions; the six-field method below is unchanged. See MODIFICATIONS.md.\n\n")
    if MISSING_SOURCE_POLICY:
        notice += f"> Teloa versioned method name: `{native_skill_id(skill_id, team_id)}` corresponds to upstream `{skill_id}`. Only its name/frontmatter and this notice change; the six-field method and original skill.yaml stay unchanged. See MODIFICATIONS.md.\n\n"
    front = f"---\nname: {native_skill_id(skill_id, team_id)}\ndescription: {desc}\n---\n\n"
    # insert notice after the H1 title line
    title_end = body.find("\n")
    adapted = front + body[: title_end + 1] + "\n" + notice + body[title_end + 1 :].lstrip("\n")
    return adapted, removed

def role_definition(bot: str, t: dict, team: dict, team_bots: list[str]) -> dict:
    lead = team["lead"] == bot
    duty = f"{text(t['title'])}. {text(t['job'])}"
    if t.get("tagline"): duty += f" Tagline: {text(t['tagline'])}"
    if t.get("why"): duty += f" Why: {text(t['why'])}"
    if t.get("soul"): duty += f" Soul: {text(t['soul'])}"
    duty += f" Deliverable: {text(t['deliverable'])}"
    duty += f" Team role in the original '{team['name']}' team: {'lead' if lead else 'member'}."
    sources = "; ".join(text(s) for s in t.get("sources", []))
    no_data = no_data_policy(bot, text(t['no_data']))
    data_scope = f"Sources: {sources}. No-data / stale-data policy: {no_data} Durable files: the original keeps them under /workspace/{bot}/; in Teloa use this employee's working directory for the same purpose."
    never = "; ".join(text(s) for s in t.get("approval_never", []))
    ask = "; ".join(text(s) for s in t.get("approval_ask", []) or [])
    plugins = ", ".join(t.get("plugins", []) or []) or "none"
    execution = (f"Autonomy {t['autonomy']} ({AUTONOMY[t['autonomy']]}). Never: {never}." + (f" Ask first: {ask}." if ask else "") +
                 f" Plugins the original template names: {plugins}; in Teloa the owner connects and authorizes apps through the connections page, and nothing is connected by adding this template. Routines are not enabled on import.")
    handoffs = []
    for h in t.get("handoffs", []) or []:
        target = h["to"]
        inside = "" if target in team_bots else " (not part of this team package; the owner decides who takes it)"
        handoffs.append(f"Hand to {target}{inside} when: {text(h['when'])}")
    triggers = [f"First task when the owner starts without a task: {text(t['first_task'])}", "A task from the owner or a teammate that falls inside the job above"]
    responsibility = {
        "triggers": [clip(x, 1000, f"{bot} trigger") for x in triggers],
        "autonomousActions": [clip(text(x), 1000, f"{bot} action") for x in t.get("working_style", [])],
        "confirmationPoints": [clip(text(x), 1000, f"{bot} ask") for x in (t.get("approval_ask") or [])] or [f"Any action outside autonomy {t['autonomy']}"],
        "escalationRules": [clip(f"No data: {no_data}", 1000, f"{bot} nodata")] + [clip(x, 1000, f"{bot} handoff") for x in handoffs],
        "deliveryChecks": [clip(f"Deliverable: {text(t['deliverable'])}", 1000, f"{bot} deliverable")] + [clip(text(x), 1000, f"{bot} never") for x in t.get("never", [])],
    }
    return {
        "format": "teloa.role/v1",
        "name": clip(ZH[bot], 80, f"{bot} name"),
        "avatarKey": AVATARS[bot],
        "kind": "employee",
        "duty": clip(duty, 4000, f"{bot} duty"),
        "dataScope": clip(data_scope, 4000, f"{bot} dataScope"),
        "executionScope": clip(execution, 4000, f"{bot} executionScope"),
        "responsibility": responsibility,
    }

def localized(zh: str, en: str, limit: int, label: str) -> dict:
    return {"zh-CN": clip(zh, limit, label + " zh"), "en": clip(en, limit, label + " en")}

def metadata(original: str, zh: str, tw: str, en: str) -> dict:
    return {"original": original, "defaultLocale": "en", "locales": {"zh-CN": zh, "zh-TW": tw, "en": en}}

def build_team(src: pathlib.Path, team_id: str, license_bytes: bytes, report: dict):
    team = read_yaml(src / "teams" / team_id / "team.yaml")
    bots = list(team["bots"])
    if team["lead"] not in bots:
        raise SystemExit(f"team {team_id}: lead {team['lead']} not in bots")
    entry_id = f"teloa.grok-{team_id}-team"
    package_id = f"grok-bot-templates-team-{team_id}"
    titles = {**localized(ZH[team_id], f"{team['name']} team", 120, "title"), "zh-TW": ZH_TW[team_id]}
    scope = "general"
    out = ROOT / "artifacts" / "solutions" / entry_id / VERSION
    targets = [out] + [ROOT / "artifacts/roles" / f"teloa.grok-{bot}" / VERSION for bot in bots]
    for target in targets:
        if target.exists() or target.is_symlink():
            raise SystemExit(f"target exists; version directories are immutable: {target}")
    resources, relations, modifications_md = [], [], []
    templates = {}
    for bot in bots:
        hits = list(src.glob(f"templates/*/{bot}/template.yaml"))
        if len(hits) != 1:
            raise SystemExit(f"template for {bot} not found or ambiguous: {hits}")
        templates[bot] = (hits[0].parent, read_yaml(hits[0]))
    # team.yaml reference (lead, kickoff, handoffs live here)
    write(out / "references/team.yaml", (src / "teams" / team_id / "team.yaml").read_bytes())
    resources.append({"id": "team-definition", "kind": "knowledge", "title": f"Original team.yaml ({team['name']})", "version": VERSION, "required": True, "source": {"kind": "local", "path": "references/team.yaml"}})
    board_id, board_title, board_goal = BOARDS[team_id]
    guide = f"# {board_title}\n\n本团队可按需配合 Teloa 官方市场的 `{board_id}@1.0.0` 使用，跟进{board_goal}。看板是独立资源，未包含在本团队中；添加员工或团队不会新建业务、导入示例记录或自动运行。\n\n在市场中打开该看板，预览其记录字段与统计口径，选择新建业务或兼容的已有业务后确认采用。再由本人决定员工负责范围与工具权限。未知统计值保持未知，原模板的示例不成为业务事实。\n\n该指引由 Teloa 添加，非 Grok Bot 原模板内容。\n\n## Business dashboard guide\n\nThis team can work alongside the separate official dashboard `{board_id}@1.0.0`. Preview the dashboard's record fields and calculations, then adopt it into a new or compatible existing business. You decide employee responsibilities and tool permissions. Adding the team does not adopt the dashboard, create a business, import sample records or start work. Missing values remain unknown; upstream examples are not business facts. This guide was added by Teloa and is not part of the original template.\n"
    write(out / "references/teloa-dashboard-guide.md", guide)
    guide_title = f"{board_title}使用指引（独立资源，按需采用）"
    resources.append({"id": "dashboard-guide", "kind": "knowledge", "title": guide_title, "localized": {"title": metadata(guide_title, guide_title, "業務看板使用指引（獨立資源，按需採用）", "Business dashboard guide (separate resource, optional)")}, "version": VERSION, "required": False, "source": {"kind": "local", "path": "references/teloa-dashboard-guide.md"}})
    relations.append({"kind": "role-knowledge", "from": team["lead"], "to": "dashboard-guide"})
    skill_ids, connection_ids = [], {}
    for bot in bots:
        tdir, t = templates[bot]
        write(out / f"roles/{bot}.json", role_definition(bot, t, team, bots))
        resources.append({"id": bot, "kind": "role", "title": text(t["name"]) + (" (lead)" if team["lead"] == bot else ""), "version": VERSION, "required": True, "source": {"kind": "local", "path": f"roles/{bot}.json"}})
        for name in ["PROFILE.md", "template.yaml", "examples/first-run.md"]:
            p = tdir / name
            if p.exists():
                write(out / f"references/{bot}/{p.name}", p.read_bytes())
                rid = f"{bot}-{p.stem.lower().replace('_', '-')}"
                resources.append({"id": rid, "kind": "knowledge", "title": f"Original {name} of {text(t['name'])}", "version": VERSION, "required": True, "source": {"kind": "local", "path": f"references/{bot}/{p.name}"}})
                relations.append({"kind": "role-knowledge", "from": bot, "to": rid})
        relations.append({"kind": "role-knowledge", "from": bot, "to": "team-definition"})
        # 原 PROFILE 是工作规则，不只是一个不会自动进入执行上下文的知识引用。
        original_method_id = f"{bot}-working-method"
        method_id = native_skill_id(original_method_id, team_id)
        profile = (tdir / "PROFILE.md").read_text(encoding="utf-8")
        heading, source_notice = "Original employee working instructions", "The original instructions below are kept verbatim."
        if MISSING_SOURCE_POLICY:
            source_notice += f" Teloa uses versioned native name `{method_id}` for upstream `{original_method_id}` to preserve prior installations; see MODIFICATIONS.md."
            if bot == "competitor-watch":
                original_policy = text(t["no_data"])
                if profile.count(original_policy) != 1:
                    raise SystemExit("competitor-watch PROFILE no_data source changed; expected one fixed section")
                profile = profile.replace(original_policy, no_data_policy(bot, original_policy), 1)
                heading = "Teloa-adapted employee working instructions"
                source_notice = ("Teloa corrects the missing-source rule below: unavailability alone does not establish a cause or HTTP status. "
                    "The raw PROFILE/template and examples remain byte-identical references, not alternative missing-source instructions. "
                    f"Native name `{method_id}` corresponds to upstream `{original_method_id}` and preserves older installations. See MODIFICATIONS.md.")
        description = "Teloa-adapted working instructions" if MISSING_SOURCE_POLICY and bot == "competitor-watch" else "Original working instructions"
        method = f"---\nname: {method_id}\ndescription: {description} for {bot}; use together with its declared methods.\n---\n\n# {heading}\n\nSource: {UPSTREAM_URL}/templates/{tdir.parent.name}/{bot}/PROFILE.md (MIT, Cobus Greyling). {source_notice} In Teloa, /workspace paths are original platform conventions, not verified local paths. Use only the current task's authorized working directory; if it is unknown, ask for it rather than creating /workspace. Named apps require actual connection and employee tool grants; adding this method does not connect accounts or grant permissions. Original first-run examples are samples, not evidence of completed work.\n\n"+profile
        write(out / f"skills/{method_id}/SKILL.md", method)
        method_title = f"{ZH[bot]}工作准则"
        resources.append({"id":method_id,"kind":"skill","title":method_title,"localized":{"title":metadata(method_title, method_title, f"{ZH_TW[bot]}工作準則", f"{text(t['name'])} working instructions")},"version":VERSION,"required":True,"source":{"kind":"local","path":f"skills/{method_id}/SKILL.md"}})
        relations.append({"kind":"role-skill","from":bot,"to":method_id})
        if team["lead"] != bot:
            relations.append({"kind":"role-coordination","from":team["lead"],"to":bot})

        for skill_id in t.get("skills", []) or []:
            sdir = src / "skills" / skill_id
            skill = read_yaml(sdir / "skill.yaml")
            if skill_id not in skill_ids:
                adapted, removed = adapt_skill_markdown((sdir / "SKILL.md").read_text(encoding="utf-8"), skill_id, skill, team_id)
                native_id = native_skill_id(skill_id, team_id)
                write(out / f"skills/{native_id}/SKILL.md", adapted)
                write(out / f"skills/{native_id}/skill.yaml", (sdir / "skill.yaml").read_bytes())
                resources.append({"id": native_id, "kind": "skill", "title": text(skill["name"]), "version": VERSION, "required": True, "source": {"kind": "local", "path": f"skills/{native_id}/SKILL.md"}})
                skill_ids.append(skill_id)
                modifications_md.append(f"- `skills/{native_id}/SKILL.md`: added Teloa frontmatter (name/description from skill.yaml when_to_use) and a derivation notice; removed {len(removed)} Grok-only instruction line(s): " + "; ".join(f"`{r[:60]}…`" if len(r) > 60 else f"`{r}`" for r in removed) + ". Original `skill.yaml` kept verbatim next to it.")
            relations.append({"kind": "role-skill", "from": bot, "to": native_skill_id(skill_id, team_id)})
        routine = t.get("routine")
        if isinstance(routine, dict) and routine.get("id"):
            rid = routine["id"]
            rdir = src / "routines" / rid
            full = read_yaml(rdir / "routine.yaml") if (rdir / "routine.yaml").exists() else None
            if full:
                write(out / f"references/{bot}/routine.yaml", (rdir / "routine.yaml").read_bytes())
                resources.append({"id": f"{bot}-routine-yaml", "kind": "knowledge", "title": f"Original routine.yaml ({rid})", "version": VERSION, "required": True, "source": {"kind": "local", "path": f"references/{bot}/routine.yaml"}})
                relations.append({"kind": "role-knowledge", "from": bot, "to": f"{bot}-routine-yaml"})
            skill_for = routine.get("skill") or (full or {}).get("skill")
            skill_title = text(read_yaml(src / "skills" / skill_for / "skill.yaml")["name"])
            description = f"Original routine '{rid}': cadence {text(routine.get('cadence') or (full or {}).get('cadence'))}. " + (text(full.get("expected_result")) if full else "") + " Not scheduled by this template: the owner creates the plan after a test run and confirms timezone, input source, expected result, approval boundary and missing-source policy."
            requirements = [text(full["input_source"])] if full else [text(routine.get("timezone_note", ""))]
            output = text(full["expected_result"]) if full else f"Run {skill_for} report-only; writes stay behind approval."
            zh_title, tw_title, en_title = ROUTINE_TITLES[rid]
            routine_title = text(routine.get("id"))
            desc = " ".join(description.split())
            localized_routine = {"title": metadata(routine_title, zh_title, tw_title, en_title), "description": metadata(desc, f"由{ZH[bot]}按原方法整理待审结果。使用前确认资料来源、时间与权限；添加模板不会启用定时计划。", f"由{ZH_TW[bot]}按原方法整理待審結果。使用前確認資料來源、時間及權限；加入範本不會啟用定時安排。", desc)}
            write(out / f"routines/{rid}.json", {"format": "teloa.work-template/v1", "id": rid, "title": routine_title, "localized": localized_routine, "version": VERSION, "domain": scope, "description": desc, "requirements": [r for r in requirements if r], "output": " ".join(output.split()), "skills": [{"id": native_skill_id(skill_for, team_id), "title": skill_title, "version": VERSION}]})
            resources.append({"id": rid, "kind": "work-template", "title": en_title, "localized": {"title": metadata(en_title, zh_title + "（未排程）", tw_title + "（未排程）", en_title + " (unscheduled)")}, "version": VERSION, "required": False, "source": {"kind": "local", "path": f"routines/{rid}.json"}})
            relations.append({"kind": "role-work", "from": bot, "to": rid})
        for plugin in t.get("plugins", []) or []:
            c = CONNECTORS.get(plugin)
            if not c:
                report.setdefault("pluginGaps", {}).setdefault(plugin, set()).add(bot); continue
            cid = f"connection-{c['serverName'].replace('_', '-')}"
            if cid not in connection_ids:
                write(out / f"connections/{c['serverName']}.json", {"format": "teloa.mcp-connection/v1", "serverName": c["serverName"], "tools": c["tools"]})
                resources.append({"id": cid, "kind": "mcp", "title": f"{plugin} (read-only via Teloa connector {c['entry']})", "version": VERSION, "required": False, "source": {"kind": "local", "path": f"connections/{c['serverName']}.json"}})
                connection_ids[cid] = plugin
            relations.append({"kind": "role-connection", "from": bot, "to": cid})
    manifest = {
        "format": "teloa.business-package/v3", "id": package_id, "title": titles["en"] if HUMAN_TITLES else f"{team['name']} team (grok-bot-templates)", "version": VERSION,
        "domain": TAXONOMY[team_id]["domain"], "scope": scope,
        "description": clip(" ".join(f"Original team '{team['name']}' from {UPSTREAM['owner']}/{UPSTREAM['repo']}@{UPSTREAM['commit'][:12]} (MIT): lead {team['lead']}; bots {', '.join(bots)}. Why: {text(team['why'])} Group kickoff (original): {text(team['group_kickoff'])}".split()), 2000, "manifest description"),
        "resources": resources, "relations": relations, "entrypoints": [],
    }
    if HUMAN_TITLES:
        manifest["localized"] = {"title": metadata(titles["en"], titles["zh-CN"], titles["zh-TW"], titles["en"])}
    write(out / "teloa.json", manifest)
    write(out / "LICENSE", license_bytes)
    plugin_gaps = sorted({p for p, who in report.get("pluginGaps", {}).items() if who & set(bots)})
    profile_modification = "- Employee display names and resource labels are localized for Teloa; approved built-in employee avatar keys are added. Originals stay in PROFILE/template files. Each complete original PROFILE is also bound as a fixed working-method skill so it reaches execution rather than remaining only a reference."
    if MISSING_SOURCE_POLICY:
        profile_modification = "- Employee display names and resource labels are localized for Teloa; approved built-in employee avatar keys are added. Original PROFILE/template files remain references; adapted fixed working-method skills provide the execution rules described below."
    mods = [
        "- Format: each original `template.yaml` / `PROFILE.md` was mapped to a `teloa.role/v1` `roles/<bot>.json` (job, title, tagline, why, soul, deliverable → duty; sources + no_data → dataScope; autonomy, approval_never, approval_ask, plugins → executionScope; first_task → triggers; working_style → autonomousActions; approval_ask → confirmationPoints; no_data + handoffs → escalationRules; deliverable + never → deliveryChecks). The originals are kept verbatim under `references/<bot>/` and linked to the employee.",
        f"- Team: `teams/{team_id}/team.yaml` is kept verbatim as `references/team.yaml`. The coordinator is declared through role-coordination from the lead to each member, without authority or execution grants; group kickoff and handoffs remain references. Lead `{team['lead']}` is stated in that employee's duty and in README.md, kickoff and handoffs stay as text. The coordinator links are stored with the fixed package and mapped to real employee identities; kickoff and handoffs do not automatically run work.",
        "- Routines: an original routine becomes an unscheduled `teloa.work-template/v1` under `routines/` linked by role-work; no plan is created and nothing runs on import. The original `routine.yaml` (when the repository has one) is kept verbatim.",
        "- Plugins: only GitHub and Notion are declared as optional read-only connections through Teloa catalog connectors (teloa.mcp-github, teloa.mcp-notion-remote). " + (f"This package does not declare tools for: {', '.join(plugin_gaps)}; the owner provides material or connects and authorizes suitable apps separately." if plugin_gaps else "All original plugins have a Teloa connector."),
        "- Teloa added an optional dashboard guide for a separately adopted official industry dashboard. It is not an upstream file and adding the team does not create business records.\n- `/workspace/<bot>/` paths in the originals are left as written; in Teloa they mean the employee's working directory.",
        "- Example first-run outputs (`examples/first-run.md`) are fictional samples from the original repository, kept verbatim as references; they are not records of real runs.",
    ] + [profile_modification] + modifications_md
    if MISSING_SOURCE_POLICY:
        mods += ["- Fact-policy correction: the competitor-watch no-data rule is adapted consistently in role dataScope, escalationRules[0] and its working-method PROFILE section. An unavailable page/capture does not imply nonexistence, deletion, access denial or an HTTP status. Preserve the known unavailable state and unknown cause unless current material or a real response supplies the cause. Raw references remain unchanged.",
            "- Versioned native names: all six bundled methods use grok-marketing-" + VERSION.replace('.', '-') + "-<original-id>. Resource IDs, role-skill links, catalog skill bindings and routine skill references use the same mapping. This avoids replacing installations with older parent trust; it grants no permissions and upgrades no prior installation. Other method instruction bodies remain unchanged.",
            "- This version has not passed real-model content-quality verification. Generation and catalog validation do not establish factual correctness of an actual output."]
    if HUMAN_TITLES:
        mods.append("- Team display title: teloa.json and the catalog use the same Teloa human-readable titles. Repository identity stays in the source description and attribution, not the title. New family/version method names preserve older installations; only frontmatter and existing native-name references change, with execution bodies, raw references and licenses retained. Earlier version directories and installed objects are not modified.")
    write(out / "MODIFICATIONS.md", f"# Modifications\n\nDerived work: Teloa adapted this package from [{UPSTREAM['owner']}/{UPSTREAM['repo']}@{UPSTREAM['commit'][:12]}]({UPSTREAM_URL}) (MIT, Copyright (c) 2026 Cobus Greyling). Every change from the original files is listed here.\n\n" + "\n".join(mods) + "\n")
    bot_rows = "\n".join(f"| {text(templates[b][1]['name'])}{' (lead)' if team['lead'] == b else ''} | `{b}` | {text(templates[b][1]['title'])} | {', '.join(templates[b][1].get('skills') or [])} | {', '.join(templates[b][1].get('plugins') or []) or '—'} |" for b in bots)
    handoff_rows = "\n".join(f"- {text(templates[b][1]['name'])} → {h['to']}{'' if h['to'] in bots else ' (outside this team)'}: {text(h['when'])}" for b in bots for h in (templates[b][1].get('handoffs') or []))
    write(out / "README.md", f"""# {team['name']} team · {ZH[team_id]}

Teloa 市场候选，移植自 [{UPSTREAM['owner']}/{UPSTREAM['repo']}@{UPSTREAM['commit'][:12]}]({UPSTREAM_URL})（MIT，Copyright (c) 2026 Cobus Greyling）的 `teams/{team_id}`。原 PROFILE、template.yaml、team.yaml、skill.yaml 与示例逐字节保留在 `references/` 与 `skills/`；Teloa 的适配逐条列在 MODIFICATIONS.md。本包不是 xAI 官方内容，与原作者无关联声明以外的关系。

A Teloa market candidate ported from `teams/{team_id}` of the MIT repository above. Original files are kept byte for byte; every Teloa adaptation is listed in MODIFICATIONS.md.

## Lead and kickoff (from team.yaml)

- Lead: **{team['lead']}** ({text(templates[team['lead']][1]['name'])}). The coordinator is declared by role-coordination links to each member; the original lead also remains in the source definition.
- Why: {text(team['why'])}
- Group kickoff (original text): {text(team['group_kickoff'])}
- Autonomy: {team.get('autonomy', 'L1')} · max bots {team.get('max_bots')}

## Employees

| Employee | id | Title | Skills | Original plugins |
| --- | --- | --- | --- | --- |
{bot_rows}

## Handoffs (original text; not executable relations in Teloa)

{handoff_rows}

## Optional business dashboard

`{board_id}@1.0.0` · {board_title}: {board_goal}. Adopt it separately after previewing the record fields and choosing a compatible business. This team does not create a business or sample data. See `references/teloa-dashboard-guide.md`.

## Connections

Only read-only GitHub / Notion connections are declared (optional, `required: false`); the owner configures them on the connections page. {('Tools for ' + ', '.join(plugin_gaps) + ' are not declared by this package; provide material or configure the appropriate apps separately.') if plugin_gaps else ''} Nothing is connected, scheduled or run by adding this package.

## License

MIT (see LICENSE). Attribution: Cobus Greyling, {UPSTREAM['owner']}/{UPSTREAM['repo']}@{UPSTREAM['commit']}.
""")
    # catalog entry
    now = [
        localized(f"添加后创建原团队的 {len(bots)} 位员工（负责人：{ZH[team['lead']]}），每位员工绑定原技能方法与完整原 PROFILE 工作方法与资料；原技能的六段方法正文未改。", f"Adds the original team's {len(bots)} employees (lead: {text(templates[team['lead']][1]['name'])}), each bound to its original skills and complete PROFILE working method and reference; the six-field skill bodies are unchanged.", 300, "now1"),
        localized("团队定义、交接与启动指令以原文保留为资料参考；例行任务以未排程的工作模板提供，由你测试后再建计划。", "Team definition, handoffs and kickoff are kept verbatim as references; routines ship as unscheduled work templates for you to test and then schedule.", 300, "now2"),
    ]
    if MISSING_SOURCE_POLICY:
        now[0] = {"zh-CN": "创建 3 位保持暂停的员工，绑定有版本名称的方法；竞品员工的缺失来源规则经 Teloa 修正，原始参考与许可原样保留。", "zh-TW": "建立 3 位保持暫停的員工，綁定有版本名稱的方法；競品員工的缺失來源規則經 Teloa 修正，原始參考與授權原樣保留。", "en": "Adds 3 paused employees with versioned method names. Teloa corrects the competitor's missing-source rule; raw references and licenses are preserved."}
    needs = [
        localized("你已配置可用模型；员工在 L1 草稿自治级别工作，只产出待审成果。", "A working model configured by you; employees work at autonomy L1 and only produce review-ready artifacts.", 300, "needs1"),
        localized("需要 GitHub 或 Notion 只读数据时，由你在连接页配置对应连接器；" + (f"原模板还用到 {', '.join(plugin_gaps)}，本包未提供对应工具；可先提供材料，或另外配置应用并授权。" if plugin_gaps else ""), "Configure the GitHub or Notion connector yourself when read-only data is needed; " + (f"the originals also use {', '.join(plugin_gaps)}, whose tools are not declared here; provide material or configure and authorize suitable apps separately." if plugin_gaps else ""), 300, "needs2"),
    ]
    permissions = [
        localized("不发送、不发布、不合并、不付款、不改生产、不建工单、不加入序列；连接只声明只读工具。", "Never sends, publishes, merges, pays, changes production, files issues or enrolls anyone; connections declare read-only tools only.", 300, "perm1"),
        localized("不携带作者账号、密钥、记忆或会话；例行任务不自动启用。", "Carries no author accounts, secrets, memory or conversations; routines are not enabled automatically.", 300, "perm2"),
    ]
    entry = {
        "format": "teloa.market-catalog-entry/v1", "id": entry_id, "kind": "solution", "delivery": "install", "version": VERSION,
        "taxonomy": {"functions": TAXONOMY[team_id]["functions"], "industries": TAXONOMY[team_id]["industries"]},
        "solution": {
            "packageId": package_id,
            "title": titles,
            "summary": localized(ZH_TEAM_SUMMARY[team_id], EN_TEAM_SUMMARY[team_id], 500, "summary"),
            "scope": scope,
            "capabilities": {"now": now, "needs": needs, "permissions": permissions},
        },
        "upstream": None,
        "modifications": [
            localized(f"来源：{UPSTREAM['owner']}/{UPSTREAM['repo']}@{UPSTREAM['commit'][:12]} teams/{team_id}（MIT，Cobus Greyling）。原 template.yaml / PROFILE.md 映射为 teloa.role/v1，原件逐字节保留在 references/。", f"Source: {UPSTREAM['owner']}/{UPSTREAM['repo']}@{UPSTREAM['commit'][:12]} teams/{team_id} (MIT, Cobus Greyling). template.yaml / PROFILE.md mapped to teloa.role/v1; originals kept byte for byte under references/.", 1000, "mod1"),
            localized("原 SKILL.md 加 Teloa frontmatter 与修改声明，删去 Grok 的粘贴/斜杠命令说明；六段方法正文不变，skill.yaml 原样保留。", "Original SKILL.md gets Teloa frontmatter and a change notice; Grok paste/slash-command lines removed; the six-field method is unchanged and skill.yaml is kept verbatim.", 1000, "mod2"),
            localized("协调者以 role-coordination 关联显式映射到成员；启动指令与交接保留原文参考，不自动运行或授予权限；例行任务转为未排程工作模板；只声明 GitHub/Notion 只读连接。", "The coordinator is explicitly linked to each member by role-coordination. Kickoff and handoffs remain original references and do not automatically run work or grant authority. Routines become unscheduled work templates; only GitHub/Notion read-only connections are declared.", 1000, "mod3"),
        ],
        "license": {"spdx": "MIT", "files": ["LICENSE"]},
        "compatibility": {"status": "needs-configuration", "teloa": TELOA_RANGE, "dsh": DSH_RANGE, "conditions": [
            localized("添加时一次确认安装包内全部原技能；员工、资料、工作模板与可选连接按 Teloa 方案接收流程逐项启用，不自动运行。", "Adding installs all bundled original skills in one confirmation; employees, references, work templates and optional connections are enabled through Teloa's solution flow and never run on their own.", 500, "cond1"),
            localized("原模板为 Grok Bot 共享云电脑写就（浏览器、/workspace 文件、连接器）；在 Teloa 中浏览与文件能力取决于你授予员工的工具，未授予时员工只按你提供的材料工作。", "The originals were written for Grok Bot's shared cloud computer (browser, /workspace files, connectors); in Teloa browsing and file access depend on the tools you grant, otherwise employees work from the material you provide.", 500, "cond2"),
            localized("未在 Teloa 宿主中用真实模型端到端验证本团队；原仓库的示例输出是虚构样例。", "Not verified end to end with a real model in a Teloa host; the repository's example outputs are fictional samples.", 500, "cond3"),
        ]},
        "requires": {"tools": [], "network": any(b in NETWORK for b in bots), "runtimes": []},
        "review": {"status": "approved", "reviewedAt": REVIEWED_AT, "reviewer": "Teloa"},
    }
    if MISSING_SOURCE_POLICY:
        entry["modifications"].append({"zh-CN": "1.0.1 修正竞品员工三个执行位置的同一缺失来源规则：不可用不等于不存在或特定状态；原因只依据本轮材料或真实回执。六方法使用明确版本名称以保留旧安装；其他方法正文与原始参考不改。", "zh-TW": "1.0.1 修正競品員工三個執行位置的同一缺失來源規則：不可用不等於不存在或特定狀態；原因只依據本輪資料或真實回執。六方法使用明確版本名稱以保留舊安裝；其他方法正文與原始參考不改。", "en": "1.0.1 corrects the same missing-source rule in all three competitor execution fields: unavailability establishes no cause or status without current evidence. Six versioned method names preserve older installations; other method bodies and raw references are unchanged."})
    title_change = {"zh-CN": "团队清单与目录共用 Teloa 人类可读标题，来源保留在说明中；方法使用本团队版本名称，仅名称和对应引用变化，执行正文、原始参考、许可与既有版本保留。", "zh-TW": "團隊清單與目錄共用 Teloa 易讀標題，來源保留在說明中；方法使用本團隊版本名稱，僅名稱及對應引用變更，執行正文、原始參考、授權及既有版本保留。", "en": "The team manifest and catalog share human-readable Teloa titles; attribution stays in the description. Family/version method names change only native identities and their references; execution bodies, raw references, licenses and existing versions are retained."}
    if HUMAN_TITLES:
        entry["modifications"].append(title_change)
    write(ROOT / "catalog/solutions" / f"{entry_id}.json", entry)
    write(ROOT / "reviews/solutions" / f"{entry_id}.json", {
        "format": "teloa.official-template-review/v1", "entryId": entry_id, "version": VERSION, "reviewedAt": REVIEWED_AT, "reviewer": "Teloa", "verdict": "approve",
        "origin": {"kind": "derived", "repository": f"{UPSTREAM['owner']}/{UPSTREAM['repo']}", "commit": UPSTREAM["commit"], "path": f"teams/{team_id}", "license": "MIT", "licenseUrl": LICENSE_URL, "generatedBy": "tools/build-grok-bot-template-teams.py"},
        "originalFiles": report["originalFiles"][team_id],
        "pluginGaps": plugin_gaps,
        "checks": ([{"method": "source-check", "result": "pass", "evidence": "Original files copied byte for byte (sha256 listed in originalFiles); adapted working rules and native names are listed in MODIFICATIONS.md. Run catalog validation separately; the generator does not run it."}] if MISSING_SOURCE_POLICY or HUMAN_TITLES else [{"method": "test", "result": "pass", "evidence": "node tools/validate.mjs --pr passes with this package; see the batch result document for the exact run."}, {"method": "source-check", "result": "pass", "evidence": "Original files copied byte for byte (sha256 listed in originalFiles); SKILL.md changes limited to frontmatter, notice and removed Grok-only lines (MODIFICATIONS.md)."}]),
        "notVerified": ["Not run with a real model in a Teloa host", "Connectors not exercised with real accounts"],
    })
    # role entries + artifacts
    for bot in bots:
        tdir, t = templates[bot]
        rid = f"teloa.grok-{bot}"
        role_bytes = (out / f"roles/{bot}.json").read_bytes()
        definition = json.loads(role_bytes); definition.pop("format")
        role_dir = ROOT / "artifacts/roles" / rid / VERSION
        write(role_dir / "role.json", role_bytes)
        write(role_dir / "LICENSE", license_bytes)
        write(role_dir / "README.md", f"""# {text(t['name'])} · {ZH[bot]}

Teloa 市场候选员工，移植自 [{UPSTREAM['owner']}/{UPSTREAM['repo']}@{UPSTREAM['commit'][:12]}]({UPSTREAM_URL}) `{tdir.relative_to(src)}`（MIT，Cobus Greyling）。`role.json` 与团队包 `{entry_id}` 的 `roles/{bot}.json` 逐字节相同；原 PROFILE.md、template.yaml 与技能随团队包提供。单独添加时会从固定团队包提取本员工及其资料和方法，只创建这一位员工；无需先添加整个团队。连接与上岗仍需本人配置。

Ported from `{tdir.relative_to(src)}` of the MIT repository above. Adding this employee derives its own resources and methods from the pinned team package and creates only this employee; adding the whole team first is not required. Connections and activation remain separate owner actions.

- Title: {text(t['title'])}
- Autonomy: {t['autonomy']} · Team role: {'lead' if team['lead'] == bot else 'member'} of {team['name']}
- Original plugins: {', '.join(t.get('plugins') or []) or '—'}
""")
        plugin_gap_bot = sorted(p for p in (t.get("plugins") or []) if p not in CONNECTORS)
        role_entry = {
            "format": "teloa.market-catalog-entry/v1", "id": rid, "kind": "role", "delivery": "install", "version": VERSION,
            "taxonomy": {"functions": ROLE_FUNCTIONS[bot], "industries": TAXONOMY[team_id]["industries"]},
            "upstream": None,
            "role": {
                "roleId": bot,
                "title": {**localized(ZH[bot], text(t["name"]), 120, f"{bot} title"), "zh-TW": ZH_TW[bot]},
                "summary": localized(ZH_SUMMARY[bot], clip(f"{text(t['title'])}. {text(t['job'])} {text(t['tagline'])}", 500, f"{bot} summary en"), 500, f"{bot} summary"),
                "definition": definition,
                "skills": [native_skill_id(s, team_id) for s in list(t.get("skills") or []) + [f"{bot}-working-method"]],
                "scope": scope,
                "preferredModel": None,
                "fromSolution": {"packageId": package_id, "version": VERSION, "path": f"roles/{bot}.json"},
            },
            "modifications": [localized(f"来源 {UPSTREAM['owner']}/{UPSTREAM['repo']}@{UPSTREAM['commit'][:12]} {tdir.relative_to(src)}（MIT）；template.yaml 映射为 teloa.role/v1，原文随团队包 references/ 保留。", f"Source {UPSTREAM['owner']}/{UPSTREAM['repo']}@{UPSTREAM['commit'][:12]} {tdir.relative_to(src)} (MIT); template.yaml mapped to teloa.role/v1, originals kept under the team package's references/.", 1000, f"{bot} mod")],
            "license": {"spdx": "MIT", "files": ["LICENSE"], "url": LICENSE_URL},
            "compatibility": {"status": "needs-configuration", "teloa": TELOA_RANGE, "dsh": DSH_RANGE, "conditions": [
                localized("确认组成后，安装本员工所需的原技能和完整 PROFILE 工作方法，绑定实际方法名；只创建这一位员工，保持暂停。", "Confirm the composition to install this employee's original skills and complete PROFILE working method, bind the actual method names, and create only this employee in a paused state.", 500, f"{bot} cond1"),
                localized("原模板插件：" + (", ".join(t.get("plugins") or []) or "无") + ("；其中 " + ", ".join(plugin_gap_bot) + " 的工具未随本包提供；先提供材料，或另外配置应用并授权。" if plugin_gap_bot else "；GitHub/Notion 可在连接页配置只读连接。"), "Original plugins: " + (", ".join(t.get("plugins") or []) or "none") + ("; " + ", ".join(plugin_gap_bot) + " tools are not declared here; provide material or configure and authorize suitable apps separately." if plugin_gap_bot else "; GitHub/Notion read-only connections can be configured on the connections page."), 500, f"{bot} cond2"),
                localized("未在 Teloa 宿主中用真实模型端到端验证。", "Not verified end to end with a real model in a Teloa host.", 500, f"{bot} cond3"),
            ]},
            "requires": {"tools": [], "network": bot in NETWORK, "runtimes": []},
            "review": {"status": "approved", "reviewedAt": REVIEWED_AT, "reviewer": "Teloa"},
        }
        if MISSING_SOURCE_POLICY:
            role_entry["modifications"].append({"zh-CN": "本员工随营销团队 1.0.1 使用独立版本方法名称，保留旧安装；竞品员工的缺失来源规则已由 Teloa 修正，其他员工规则正文不变。原始参考、许可与全部既有版本保留。", "zh-TW": "本員工隨行銷團隊 1.0.1 使用獨立版本方法名稱，保留舊安裝；競品員工的缺失來源規則已由 Teloa 修正，其他員工規則正文不變。原始參考、授權與全部既有版本保留。", "en": "This employee uses independent versioned methods from marketing family 1.0.1, preserving old installations. Teloa corrects the competitor's missing-source rule; other employee instruction bodies are unchanged. Raw references, licenses and prior versions are preserved."})
            role_entry["compatibility"]["conditions"][0] = {"zh-CN": "确认本版本组成后安装独立命名的方法，只创建这一位员工并保持暂停；不会替换旧员工或旧方法。", "zh-TW": "確認本版本組成後安裝獨立命名的方法，只建立這一位員工並保持暫停；不會替換舊員工或舊方法。", "en": "Confirm this version's composition to install independently named methods and create only this paused employee; older employees and methods are not replaced."}
        if HUMAN_TITLES:
            role_entry["modifications"].append(title_change)
        write(ROOT / "catalog/roles" / f"{rid}.json", role_entry)
        write(ROOT / "reviews/roles" / f"{rid}.json", {
            "format": "teloa.official-template-review/v1", "entryId": rid, "version": VERSION, "reviewedAt": REVIEWED_AT, "reviewer": "Teloa", "verdict": "approve",
            "origin": {"kind": "derived", "repository": f"{UPSTREAM['owner']}/{UPSTREAM['repo']}", "commit": UPSTREAM["commit"], "path": str(tdir.relative_to(src)), "license": "MIT", "licenseUrl": LICENSE_URL, "fromSolution": f"{entry_id}@{VERSION} roles/{bot}.json", "teamRole": "lead" if team["lead"] == bot else "member"},
            "originalFiles": {k: v for k, v in report["originalFiles"][team_id].items() if k.startswith(str(tdir.relative_to(src)))},
            "checks": ([{"method": "source-check", "result": "pass", "evidence": "Employee role.json copied from its fixed family package; catalog definition and version point to the same source. Run catalog validation and sync-official-roles --check separately; the generator does not run them."}] if MISSING_SOURCE_POLICY or HUMAN_TITLES else [{"method": "test", "result": "pass", "evidence": "node tools/validate.mjs --pr and node tools/sync-official-roles.mjs --check pass; see the batch result document."}]),
            "notVerified": ["Not run with a real model in a Teloa host"],
        })

def main():
    global ROOT, VERSION, MISSING_SOURCE_POLICY, HUMAN_TITLES, REVIEWED_AT
    ap = argparse.ArgumentParser()
    ap.add_argument("--upstream-dir", required=True)
    ap.add_argument("--teams", default="product,marketing,sales")
    ap.add_argument("--version", default=VERSION)
    ap.add_argument("--output-root", type=pathlib.Path, default=ROOT)
    ap.add_argument("--missing-source-policy", choices=["evidence-v1"])
    ap.add_argument("--human-titles", action="store_true")
    ap.add_argument("--reviewed-at", default=None)
    args = ap.parse_args()
    if not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", args.version):
        raise SystemExit("version must be an exact three-part number")
    if args.human_titles:
        if {"marketing": "1.0.2", "product": "1.0.1", "sales": "1.0.1"}.get(args.teams) != args.version:
            raise SystemExit("human titles require the reviewed single-family successor version")
        if (args.missing_source_policy == "evidence-v1") != (args.teams == "marketing"):
            raise SystemExit("human-title marketing preserves evidence-v1; other families preserve their original rules")
    elif args.missing_source_policy and (args.teams != "marketing" or args.version != "1.0.1"):
        raise SystemExit("evidence-v1 is reviewed only for marketing family 1.0.1")
    if args.version != "1.0.0" and not args.missing_source_policy and not args.human_titles:
        raise SystemExit("a new family version requires an explicit reviewed adaptation")
    ROOT, VERSION, MISSING_SOURCE_POLICY, HUMAN_TITLES = args.output_root.resolve(), args.version, args.missing_source_policy, args.human_titles
    REVIEWED_AT = args.reviewed_at or (datetime.date.today().isoformat() if MISSING_SOURCE_POLICY or HUMAN_TITLES else REVIEWED_AT)
    src = pathlib.Path(args.upstream_dir).resolve()
    license_bytes = (src / "LICENSE").read_bytes()
    if not license_bytes.startswith(b"MIT License"):
        raise SystemExit("source LICENSE is not the expected MIT text")
    report = {"originalFiles": {}}
    teams = args.teams.split(",")
    for team_id in teams:
        files = {}
        team = read_yaml(src / "teams" / team_id / "team.yaml")
        files[f"teams/{team_id}/team.yaml"] = sha256((src / "teams" / team_id / "team.yaml").read_bytes())
        for bot in team["bots"]:
            tdir = list(src.glob(f"templates/*/{bot}"))[0]
            for p in sorted(x for x in tdir.rglob("*") if x.is_file()):
                files[str(p.relative_to(src))] = sha256(p.read_bytes())
            t = read_yaml(tdir / "template.yaml")
            for s in t.get("skills") or []:
                for p in sorted((src / "skills" / s).iterdir()):
                    files[str(p.relative_to(src))] = sha256(p.read_bytes())
            r = t.get("routine")
            if isinstance(r, dict) and r.get("id") and (src / "routines" / r["id"]).exists():
                for p in sorted((src / "routines" / r["id"]).iterdir()):
                    files[str(p.relative_to(src))] = sha256(p.read_bytes())
        report["originalFiles"][team_id] = files
    if MISSING_SOURCE_POLICY or HUMAN_TITLES:
        for team_id in teams:
            pinned = json.loads((REPOSITORY_ROOT / f"reviews/solutions/teloa.grok-{team_id}-team.json").read_text(encoding="utf-8"))
            if pinned["origin"]["commit"] != UPSTREAM["commit"] or report["originalFiles"][team_id] != pinned["originalFiles"]:
                raise SystemExit(f"upstream source hashes differ from the fixed {team_id} review")
    for team_id in teams:
        build_team(src, team_id, license_bytes, report)
    gaps = {k: sorted(v) for k, v in report.get("pluginGaps", {}).items()}
    print(json.dumps({"teams": teams, "pluginGaps": gaps, "licenseSha256": sha256(license_bytes)}, ensure_ascii=False, indent=1))

if __name__ == "__main__":
    main()
