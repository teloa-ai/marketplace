#!/usr/bin/env node
// GENERATED FILE - DO NOT EDIT. / 生成文件，请勿手改。
// Built in teloa-ai/teloa from scripts/市场目录校验.mjs and packages/contract by `node scripts/生成市场仓校验器.mjs`
// (pnpm build:market-validator). Validation rules are maintained only in that repository.
// Source commit: a424edc5f12d417327b1073092491ecc3f091011 (with uncommitted changes)
// Usage: node tools/validate.mjs [--write]   (--write regenerates INDEX.md and NOTICE)
import { access, lstat, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

//#region packages/contract/src/work-error.ts
var WorkError = class extends Error {
	code;
	/** 结构化附加事实（例如卸载阻塞项）：只放本人可见的可枚举内容，宿主按原样回传给客户端。 */
	details;
	constructor(code, message, details) {
		super(message);
		this.name = "WorkError";
		this.code = code;
		if (details !== void 0) this.details = details;
	}
};

//#endregion
//#region packages/contract/src/resources.ts
const isRecord = (v) => typeof v === "object" && v !== null && !Array.isArray(v);

//#endregion
//#region packages/contract/src/market-taxonomy.ts
/**
* 市场分类受控词表（规格 2026-09-25 §4.2）。
*
* 功能 10 键：小写 ASCII 与连字符，单一维度。
* 行业 6 一级键 + 9 二级键（写成 一级/二级）。
* 词表只在此处定义；界面文案放在客户端 i18n。
*/
const marketFunctionKeys = [
	"office-docs",
	"communication",
	"content-design",
	"data-research",
	"dev-tools",
	"cloud-ops",
	"security",
	"business-ops",
	"automation",
	"other"
];
const marketIndustryKeys = [
	"general",
	"cyber-security",
	"marketing",
	"media",
	"software",
	"other",
	"cyber-security/soc",
	"cyber-security/detection",
	"cyber-security/appsec",
	"cyber-security/grc",
	"marketing/new-media",
	"marketing/e-commerce",
	"media/video",
	"software/engineering",
	"software/product"
];
const industryParentMap = {
	"cyber-security/soc": "cyber-security",
	"cyber-security/detection": "cyber-security",
	"cyber-security/appsec": "cyber-security",
	"cyber-security/grc": "cyber-security",
	"marketing/new-media": "marketing",
	"marketing/e-commerce": "marketing",
	"media/video": "media",
	"software/engineering": "software",
	"software/product": "software"
};
/** 二级键返回它的一级键；一级键返回 undefined。 */
function marketIndustryParent(key) {
	return industryParentMap[key];
}
/** 只对一级行业键返回 true。 */
function isMarketIndustryRoot(value) {
	if (typeof value !== "string") return false;
	return marketIndustryKeys.includes(value) && !value.includes("/");
}
const bad$6 = (message) => new WorkError("teloa/invalid-input", message);
/**
* 读取并校验 taxonomy 对象。
* - 只接受 functions、industries 两个键。
* - functions：1–2 个，去重，全为已知键。
* - industries：1–4 个，去重，全为已知键。
* - 遇到未知键、数量违规、重复键或多余属性，抛 WorkError('teloa/invalid-input', …)。
*/
function readMarketTaxonomy(value) {
	if (!isRecord(value)) throw bad$6("taxonomy 格式不正确。");
	if (Object.keys(value).length !== 2 || !Object.hasOwn(value, "functions") || !Object.hasOwn(value, "industries")) throw bad$6("taxonomy 只能包含 functions 与 industries 两个键。");
	const rawFn = value.functions;
	const rawInd = value.industries;
	if (!Array.isArray(rawFn) || rawFn.length < 1 || rawFn.length > 2) throw bad$6("taxonomy.functions 必须是 1–2 个功能键。");
	if (!Array.isArray(rawInd) || rawInd.length < 1 || rawInd.length > 4) throw bad$6("taxonomy.industries 必须是 1–4 个行业键。");
	const fnKeys = rawFn;
	for (const k of fnKeys) if (!marketFunctionKeys.includes(k)) throw bad$6("taxonomy.functions 包含未知键：" + String(k));
	if (new Set(fnKeys).size !== fnKeys.length) throw bad$6("taxonomy.functions 不能有重复键。");
	const indKeys = rawInd;
	for (const k of indKeys) if (!marketIndustryKeys.includes(k)) throw bad$6("taxonomy.industries 包含未知键：" + String(k));
	if (new Set(indKeys).size !== indKeys.length) throw bad$6("taxonomy.industries 不能有重复键。");
	return {
		functions: [...fnKeys],
		industries: [...indKeys]
	};
}
/** 目录条目类型第一层（规格 §4）：应用 MARKET_CATEGORIES 与网站 kindLabel 的相对顺序都以此为准。 */
const marketEntryKinds = [
	"solution",
	"role",
	"skill",
	"connector",
	"model"
];

//#endregion
//#region packages/contract/src/model-policy.ts
const fields = (value, keys) => {
	if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some((key) => !keys.includes(key))) throw new WorkError("teloa/invalid-input", "模型配置格式不正确。");
	return value;
};
const token = (value, max) => typeof value === "string" && value.length > 0 && value.length <= max && value.trim() === value && !/[\s\x00-\x1f\x7f]/.test(value);
function readModelReference(value) {
	const row = fields(value, [
		"provider",
		"model",
		"reasoningEffort"
	]);
	if (!token(row.provider, 128) || !token(row.model, 256) || row.reasoningEffort !== void 0 && !token(row.reasoningEffort, 128)) throw new WorkError("teloa/invalid-input", "请选择有效的模型。");
	return {
		provider: row.provider,
		model: row.model,
		...row.reasoningEffort === void 0 ? {} : { reasoningEffort: row.reasoningEffort }
	};
}
const sameModelRoute = (a, b) => a.provider === b.provider && a.model === b.model;

//#endregion
//#region packages/contract/src/roles.ts
function roleInput(value, keys) {
	if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some((key) => !keys.includes(key))) throw new WorkError("teloa/invalid-input", "岗位请求包含未知字段或格式不正确。");
	return value;
}
function readRoleRuntimeConfig(value) {
	const source = roleInput(value, [
		"agentPresetId",
		"model",
		"fallbackModel"
	]);
	if (!Object.keys(source).length || source.agentPresetId !== void 0 && (typeof source.agentPresetId !== "string" || !/^[a-z0-9][-a-z0-9]{0,119}$/.test(source.agentPresetId))) throw new WorkError("teloa/invalid-input", "岗位运行配置不合法。");
	const model = source.model === void 0 ? void 0 : readModelReference(source.model), fallbackModel = source.fallbackModel === void 0 ? void 0 : readModelReference(source.fallbackModel);
	if (model && fallbackModel && sameModelRoute(model, fallbackModel)) throw new WorkError("teloa/invalid-input", "备用模型不能与首选模型相同。");
	const result = {
		...source.agentPresetId === void 0 ? {} : { agentPresetId: source.agentPresetId },
		...model ? { model } : {},
		...fallbackModel ? { fallbackModel } : {}
	};
	if (!Object.keys(result).length) throw new WorkError("teloa/invalid-input", "岗位运行配置不合法。");
	return result;
}
function roleDefinition(value) {
	const row = roleInput(value, [
		"name",
		"kind",
		"scopes",
		"duty",
		"dataScope",
		"executionScope",
		"skills",
		"knowledge",
		"responsibility",
		"runtimeConfig"
	]);
	const fail = () => {
		throw new WorkError("teloa/invalid-input", "岗位职责、范围或能力声明不合法。");
	};
	const text = (v, max) => typeof v === "string" && v.trim().length > 0 && v.length <= max ? v.trim() : fail();
	const list = (v, ids = false) => {
		if (!Array.isArray(v) || v.length > 30 || ids && !v.length) return fail();
		const items = v.map((item) => text(item, 128));
		if (ids && items.some((item) => !/^[-a-zA-Z0-9_]+$/.test(item))) return fail();
		return [...new Set(items)];
	};
	if (row.kind !== "employee" && row.kind !== "twin") return fail();
	let responsibility;
	if (row.responsibility !== void 0) {
		const source = roleInput(row.responsibility, [
			"triggers",
			"autonomousActions",
			"confirmationPoints",
			"escalationRules",
			"deliveryChecks"
		]);
		const entries = (value) => {
			if (!Array.isArray(value) || value.length > 30) return fail();
			return [...new Set(value.map((item) => text(item, 1e3)))];
		};
		responsibility = {
			triggers: entries(source.triggers),
			autonomousActions: entries(source.autonomousActions),
			confirmationPoints: entries(source.confirmationPoints),
			escalationRules: entries(source.escalationRules),
			deliveryChecks: entries(source.deliveryChecks)
		};
	}
	let runtimeConfig;
	if (row.runtimeConfig !== void 0) runtimeConfig = readRoleRuntimeConfig(row.runtimeConfig);
	return {
		name: text(row.name, 80),
		kind: row.kind,
		scopes: list(row.scopes, true),
		duty: text(row.duty, 4e3),
		dataScope: text(row.dataScope, 4e3),
		executionScope: text(row.executionScope, 4e3),
		skills: list(row.skills),
		knowledge: list(row.knowledge),
		...responsibility ? { responsibility } : {},
		...runtimeConfig ? { runtimeConfig } : {}
	};
}

//#endregion
//#region packages/contract/src/semver-range.ts
/**
* 条目 compatibility.teloa 的最小 semver 范围判定（规格 §4「最低应用版本」）。
* 只支持空格分隔的 >=、>、<=、<、= 比较子与 `*`；不支持 ^ ~ x-range ||，避免引入依赖。
*/
const semverPattern = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;
const bad$5 = (message) => new WorkError("teloa/invalid-input", message);
function parse(version) {
	const match = semverPattern.exec(version);
	if (!match) throw bad$5("版本号格式不正确：" + version);
	return {
		main: [
			Number(match[1]),
			Number(match[2]),
			Number(match[3])
		],
		pre: match[4] === void 0 ? null : match[4].split(".")
	};
}
/** 解析范围；`*` 返回空数组（恒满足）。语法错误抛 teloa/invalid-input。 */
function parseTeloaRange(range) {
	const trimmed = range.trim();
	if (!trimmed) throw bad$5("版本范围不能为空。");
	if (trimmed === "*") return [];
	return trimmed.split(/\s+/).map((part) => {
		const match = /^(>=|>|<=|<|=)?(.+)$/.exec(part);
		if (!match) throw bad$5("版本范围格式不正确：" + part);
		const version = match[2];
		parse(version);
		return {
			op: match[1] ?? "=",
			version
		};
	});
}

//#endregion
//#region packages/contract/src/market-catalog.ts
/**
* Teloa 官方市场目录格式（规格 2026-09-25 全球使用统计与官方生态建设 §4.1）。
*
* 条目由目录仓作者书写，快照索引由 `scripts/构建市场目录.mjs` 生成并随发行固定。
* 「官方」只表示 Teloa 目录收录并审核；上游作者、许可与适配修改分字段记录，不合并成一个认证。
* 兼容状态只有四值，具体条件放在 `compatibility.conditions`。
*/
const marketCatalogCompatibility = [
	"verified",
	"needs-configuration",
	"content-only",
	"unsupported"
];
/** 二期本机模型（模型二期规格 §4）：Ollama 唯一运行时；名称必须带 tag，digest 为 registry 清单摘要或 null（发布前由脚本填写）。 */
const ollamaModelNamePattern = /^[a-z0-9][a-z0-9._-]*:[a-z0-9._-]+$/;
const ollamaDigestPattern = /^sha256:[0-9a-f]{64}$/;
const bad$4 = (message) => new WorkError("teloa/invalid-input", message);
const exact$4 = (value, keys, label) => {
	if (!isRecord(value) || Object.keys(value).length !== keys.length || keys.some((key) => !Object.hasOwn(value, key))) throw bad$4(label + "格式不正确或包含未知字段。");
	return value;
};
const text = (value, label, max = 500) => {
	if (typeof value !== "string" || !value.trim() || value !== value.trim() || value.length > max || /[\x00-\x1f\x7f]/.test(value)) throw bad$4(label + "必须填写且不超过 " + max + " 字。");
	return value;
};
const list$1 = (value, label, max) => {
	if (!Array.isArray(value) || value.length > max) throw bad$4(label + "最多 " + max + " 项。");
	return value;
};
const distinct = (values, label) => {
	if (new Set(values).size !== values.length) throw bad$4(label + "不能重复。");
	return values;
};
const pattern = (value, regex, label) => {
	if (typeof value !== "string" || !regex.test(value)) throw bad$4(label + "格式不正确。");
	return value;
};
const catalogId = /^(?=.{1,120}$)[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*){1,2}$/;
/** 模型条目标识允许最多四段（如 `teloa.model.local.llama3.1`）；其余 kind 仍用两段 `catalogId`。 */
const modelCatalogIdPattern = /^(?=.{1,120}$)[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*){1,4}$/;
const modelCatalogId = modelCatalogIdPattern;
/** 与 DSH 技能名同一文法（kebab-case，≤64）。 */
const marketCatalogSkillName = /^(?=.{1,64}$)[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** 方案包 id 文法（与 content-store.ts stableId 一致，1-120 位字母数字连字符）。 */
const packageIdPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,119}$/;
/** 业务范围（与 validateManifest scope 一致）。 */
const scopePattern = /^[a-zA-Z0-9_-]{1,64}$/;
const semver$1 = /^(?=.{1,80}$)\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const hex40 = /^[0-9a-f]{40}$/;
const hex64 = /^[0-9a-f]{64}$/;
const githubName = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,98}[A-Za-z0-9])?$/;
const httpsUrl = /^https:\/\/[^/].{0,1000}$/;
const MARKET_CATALOG_MAX_FILE_SIZE = 2 * 1024 * 1024;
const MARKET_CATALOG_MAX_TOTAL_SIZE = 20 * 1024 * 1024;
const MARKET_CATALOG_FORBIDDEN_EXTENSIONS = /\.(?:py|sh|bash|zsh|js|mjs|cjs|ts|mts|cts|exe|bat|cmd|ps1|rb|pl|php)$/i;
const MAX_FILE = MARKET_CATALOG_MAX_FILE_SIZE;
const MAX_TOTAL = MARKET_CATALOG_MAX_TOTAL_SIZE;
const size = (value, label) => {
	if (!Number.isSafeInteger(value) || value < 0 || value > MAX_FILE) throw bad$4(label + "大小不正确。");
	return value;
};
function path(value, label) {
	const result = text(value, label, 500);
	if (result.startsWith("/") || result.split("/").some((part) => !part || part === "." || part === "..") || /[\\:?%#]/.test(result)) throw bad$4(label + "必须是安全的相对路径。");
	return result;
}
function localized(value, label, max = 500) {
	const row = exact$4(value, ["zh-CN", "en"], label);
	return {
		"zh-CN": text(row["zh-CN"], label + "（简体中文）", max),
		en: text(row.en, label + "（英文）", max)
	};
}
function date(value, label) {
	const result = pattern(value, /^\d{4}-\d{2}-\d{2}$/, label), parsed = /* @__PURE__ */ new Date(result + "T00:00:00.000Z");
	if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== result) throw bad$4(label + "不是有效日期。");
	return result;
}
function readCommonFields(row, opts = {}) {
	const licenseRow = exact$4(row.license, opts.licenseUrl ? [
		"spdx",
		"files",
		"url"
	] : ["spdx", "files"], "许可");
	const licenseFiles = distinct(list$1(licenseRow.files, "许可文件", 20).map((file) => path(file, "许可文件路径")), "许可文件");
	if (!licenseFiles.length && !opts.allowEmptyLicenseFiles) throw bad$4("许可文件至少一项。");
	const compatibilityRow = exact$4(row.compatibility, [
		"status",
		"teloa",
		"dsh",
		"conditions"
	], "兼容声明");
	if (!marketCatalogCompatibility.includes(compatibilityRow.status)) throw bad$4("兼容状态只能是 verified、needs-configuration、content-only 或 unsupported。");
	const teloaRange = text(compatibilityRow.teloa, "Teloa 兼容范围", 120);
	try {
		parseTeloaRange(teloaRange);
	} catch {
		throw bad$4("Teloa 兼容范围格式不正确：" + teloaRange);
	}
	const requiresRow = exact$4(row.requires, [
		"tools",
		"network",
		"runtimes"
	], "运行需求");
	if (typeof requiresRow.network !== "boolean") throw bad$4("联网需求必须是布尔值。");
	const reviewRow = exact$4(row.review, [
		"status",
		"reviewedAt",
		"reviewer"
	], "审核记录");
	if (reviewRow.status !== "approved") throw bad$4("目录只收录审核通过的条目。");
	return {
		modifications: list$1(row.modifications, "修改说明", 50).map((item) => localized(item, "修改说明", 1e3)),
		license: {
			spdx: text(licenseRow.spdx, "许可", 200),
			files: licenseFiles,
			...opts.licenseUrl ? { url: pattern(licenseRow.url, httpsUrl, "许可链接") } : {}
		},
		compatibility: {
			status: compatibilityRow.status,
			teloa: teloaRange,
			dsh: text(compatibilityRow.dsh, "DSH 兼容范围", 120),
			conditions: list$1(compatibilityRow.conditions, "兼容条件", 20).map((item) => localized(item, "兼容条件"))
		},
		requires: {
			tools: distinct(list$1(requiresRow.tools, "所需工具", 50).map((item) => pattern(item, /^[A-Za-z0-9_:.-]{1,120}$/, "工具名")), "所需工具"),
			network: requiresRow.network,
			runtimes: distinct(list$1(requiresRow.runtimes, "运行时", 20).map((item) => text(item, "运行时", 120)), "运行时")
		},
		review: {
			status: "approved",
			reviewedAt: date(reviewRow.reviewedAt, "审核日期"),
			reviewer: text(reviewRow.reviewer, "审核人", 200)
		}
	};
}
function readSkillUpstream(value) {
	const upstreamRow = exact$4(value, [
		"ecosystem",
		"author",
		"repository",
		"commit",
		"path",
		"license",
		"files"
	], "上游来源");
	const repositoryRow = exact$4(upstreamRow.repository, [
		"host",
		"owner",
		"repo"
	], "上游仓库");
	if (repositoryRow.host !== "github.com") throw bad$4("上游仓库目前只支持 github.com。");
	const upstreamFiles = list$1(upstreamRow.files, "上游文件", 500).map((input) => {
		const file = exact$4(input, [
			"path",
			"gitBlob",
			"size"
		], "上游文件");
		return {
			path: path(file.path, "上游文件路径"),
			gitBlob: pattern(file.gitBlob, hex40, "上游文件 blob 摘要"),
			size: size(file.size, "上游文件")
		};
	});
	if (!upstreamFiles.length) throw bad$4("上游文件至少一项。");
	distinct(upstreamFiles.map((file) => file.path), "上游文件路径");
	return {
		ecosystem: pattern(upstreamRow.ecosystem, /^[a-z0-9-]{1,40}$/, "上游生态"),
		author: text(upstreamRow.author, "上游作者", 200),
		repository: {
			host: "github.com",
			owner: pattern(repositoryRow.owner, githubName, "上游仓库 owner"),
			repo: pattern(repositoryRow.repo, githubName, "上游仓库名")
		},
		commit: pattern(upstreamRow.commit, hex40, "上游提交"),
		path: path(upstreamRow.path, "上游目录"),
		license: text(upstreamRow.license, "上游许可", 200),
		files: upstreamFiles
	};
}
function readSkillEntry(row) {
	if (row.format !== "teloa.market-catalog-entry/v1") throw bad$4("目录条目格式版本不受支持。");
	if (row.delivery !== "builtin" && row.delivery !== "install") throw bad$4("目录条目交付方式只能是 builtin 或 install。");
	const skillRow = exact$4(row.skill, [
		"name",
		"title",
		"summary"
	], "技能信息");
	const name = pattern(skillRow.name, marketCatalogSkillName, "技能名");
	if (row.delivery === "builtin" && !name.startsWith("teloa-")) throw bad$4("内置技能名必须以 teloa- 开头。");
	if (row.delivery === "install" && name.startsWith("teloa-")) throw bad$4("teloa- 前缀保留给内置技能，安装型条目不能使用。");
	if (row.upstream === null && row.delivery !== "builtin") throw bad$4("只有 Teloa 内置技能的 upstream 可以为 null。");
	return {
		format: "teloa.market-catalog-entry/v1",
		id: pattern(row.id, catalogId, "目录条目标识"),
		kind: "skill",
		delivery: row.delivery,
		version: pattern(row.version, semver$1, "条目版本"),
		taxonomy: readMarketTaxonomy(row.taxonomy),
		skill: {
			name,
			title: localized(skillRow.title, "技能标题", 120),
			summary: localized(skillRow.summary, "技能用途")
		},
		upstream: row.upstream === null ? null : readSkillUpstream(row.upstream),
		...readCommonFields(row)
	};
}
function readSolutionEntry(row) {
	if (row.format !== "teloa.market-catalog-entry/v1") throw bad$4("目录条目格式版本不受支持。");
	if (row.delivery !== "install") throw bad$4("方案条目只能以 install 方式交付。");
	if (row.upstream !== null) throw bad$4("方案条目的 upstream 必须为 null。");
	const solutionRow = exact$4(row.solution, [
		"packageId",
		"title",
		"summary",
		"scope",
		"capabilities"
	], "方案信息");
	const packageId = pattern(solutionRow.packageId, packageIdPattern, "方案包标识");
	const capabilitiesRow = exact$4(solutionRow.capabilities, [
		"now",
		"needs",
		"permissions"
	], "方案能力说明");
	const capabilityList = (value, label) => {
		const items = list$1(value, label, 20);
		if (!items.length) throw bad$4(label + "至少一项。");
		return items.map((item) => localized(item, label, 300));
	};
	return {
		format: "teloa.market-catalog-entry/v1",
		id: pattern(row.id, catalogId, "目录条目标识"),
		kind: "solution",
		delivery: "install",
		version: pattern(row.version, semver$1, "条目版本"),
		upstream: null,
		taxonomy: readMarketTaxonomy(row.taxonomy),
		solution: {
			packageId,
			title: localized(solutionRow.title, "方案标题", 120),
			summary: localized(solutionRow.summary, "方案用途"),
			scope: pattern(solutionRow.scope, scopePattern, "业务范围"),
			capabilities: {
				now: capabilityList(capabilitiesRow.now, "现在可做"),
				needs: capabilityList(capabilitiesRow.needs, "还需提供"),
				permissions: capabilityList(capabilitiesRow.permissions, "会请求的权限")
			}
		},
		...readCommonFields(row)
	};
}
const npmPackageName = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
const sha512Integrity = /^sha512-[A-Za-z0-9+/]+=*$/;
/** connector serverName：在 dsh-mcp-client 的 SERVER_NAME_PATTERN 之内，另禁 `__`（公开名 `mcp__<server>__<tool>` 按 `__` 分段）。 */
const connectorServerName = /^(?!.*__)[A-Za-z0-9_-]{1,32}$/;
/** env 变量名：允许混合大小写（部分官方包如 dingtalk-mcp 使用混合大小写变量名）。 */
const envVarName = /^[A-Za-z][A-Za-z0-9_]{0,127}$/;
/** 宿主写入的 OAuth 凭据槽前缀：env 变量名不得占用，避免与 oauth_* 槽同名 */
const reservedEnvVarPrefix = /^oauth_/i;
/** OAuth scope 记号：RFC 6749 §3.3 scope-token 字符集（不含空格、引号、反斜杠）。 */
const oauthScope = /^[\x21\x23-\x5B\x5D-\x7E]{1,200}$/;
function unreservedEnvVarName(name) {
	if (reservedEnvVarPrefix.test(name)) throw bad$4("环境变量名不得以 oauth_ 开头（为宿主 OAuth 凭据槽保留）。");
	return name;
}
const clientIdPatternAtom = /^(?:[^\\^$.|?*+()[\]{}]|\.|\\[dDwWsS]|\\[-\\^$.|?*+()[\]{}/]|\[\^?(?:[^\\[\]]|\\[dDwWsS]|\\[-\\^$.|?*+()[\]{}/])+\])/;
const clientIdPatternQuantifier = /^(?:[*+?]|\{\d{1,3}(,(\d{1,3})?)?\})/;
/** 配方声明的 client_id 正则：首尾锚定的短正则，只由简单原子加至多一层贪婪量词组成，可变长量词至多 2 个，避免回溯爆炸 */
function safeClientIdPattern(value) {
	if (typeof value !== "string" || value.length < 3 || value.length > 100) throw bad$4("clientIdPattern 必须是 3 到 100 个字符的正则。");
	if (!value.startsWith("^") || !value.endsWith("$") || value.endsWith("\\$")) throw bad$4("clientIdPattern 必须首尾锚定（^…$）。");
	let rest = value.slice(1, -1), variable = 0;
	while (rest) {
		const atom = clientIdPatternAtom.exec(rest);
		if (!atom) throw bad$4("clientIdPattern 只能由字面字符、\\d \\w \\s、字符类加单层量词组成（不得使用分组、选择、反向引用或嵌套 / 相邻量词）。");
		rest = rest.slice(atom[0].length);
		const quantifier = clientIdPatternQuantifier.exec(rest);
		if (!quantifier) continue;
		rest = rest.slice(quantifier[0].length);
		if (!quantifier[0].startsWith("{") || quantifier[1] !== void 0) variable++;
		if (variable > 2) throw bad$4("clientIdPattern 的可变长量词不得超过 2 个。");
	}
	try {
		new RegExp(value, "u");
	} catch {
		throw bad$4("clientIdPattern 不是合法正则。");
	}
	return value;
}
function readConnectorEntry(row) {
	if (row.format !== "teloa.market-catalog-entry/v1") throw bad$4("目录条目格式版本不受支持。");
	if (row.delivery !== "managed") throw bad$4("连接器条目只能以 managed 方式交付。");
	if (row.upstream !== null) throw bad$4("连接器条目的 upstream 必须为 null。");
	const connRow = exact$4(row.connector, [
		"serverName",
		"title",
		"summary",
		"auth",
		"recipe",
		"tools",
		"upstreamUrl"
	], "连接器信息");
	const serverName = pattern(connRow.serverName, connectorServerName, "连接器服务名");
	const authRow = isRecord(connRow.auth) ? connRow.auth : null;
	if (!authRow) throw bad$4("连接器认证格式不正确。");
	let auth;
	if (authRow.kind === "none") {
		exact$4(connRow.auth, ["kind"], "none 认证");
		auth = { kind: "none" };
	} else if (authRow.kind === "secret") {
		const ar = exact$4(connRow.auth, ["kind", "vars"], "secret 认证");
		auth = {
			kind: "secret",
			vars: list$1(ar.vars, "凭据变量", 20).map((v) => {
				const vRow = isRecord(v) ? v : null;
				if (!vRow) throw bad$4("凭据变量格式不正确。");
				if (typeof vRow.required !== "boolean") throw bad$4("凭据 required 必须是布尔值。");
				if (vRow.target === "env") {
					const vr = exact$4(v, [
						"target",
						"envVarName",
						"label",
						"required"
					], "env 凭据变量");
					return {
						target: "env",
						envVarName: unreservedEnvVarName(pattern(vr.envVarName, envVarName, "环境变量名")),
						label: localized(vr.label, "凭据说明"),
						required: vr.required
					};
				} else if (vRow.target === "bearer") {
					const vr = exact$4(v, [
						"target",
						"label",
						"required"
					], "bearer 凭据变量");
					return {
						target: "bearer",
						label: localized(vr.label, "凭据说明"),
						required: vr.required
					};
				} else if (vRow.target === "url-path") {
					const vr = exact$4(v, [
						"target",
						"label",
						"required"
					], "url-path 凭据变量");
					return {
						target: "url-path",
						label: localized(vr.label, "凭据说明"),
						required: vr.required
					};
				}
				throw bad$4("凭据变量 target 只支持 env、bearer 或 url-path。");
			})
		};
	} else if (authRow.kind === "oauth") {
		if (typeof authRow.supported !== "boolean") throw bad$4("oauth 认证的 supported 必须是布尔值。");
		if (authRow.supported) {
			const ar = authRow;
			if (Object.keys(ar).some((key) => ![
				"kind",
				"supported",
				"scopes",
				"requiresUserClientId",
				"requiresAllowlist",
				"clientIdPattern"
			].includes(key))) throw bad$4("oauth 认证格式不正确或包含未知字段。");
			const scopes = list$1(ar.scopes, "OAuth scope", 50).map((s) => pattern(s, oauthScope, "OAuth scope"));
			if (new Set(scopes).size !== scopes.length) throw bad$4("OAuth scope 不能重复。");
			const oauth = {
				kind: "oauth",
				supported: true,
				scopes
			};
			if (ar.requiresUserClientId !== void 0) {
				if (typeof ar.requiresUserClientId !== "boolean") throw bad$4("requiresUserClientId 必须是布尔值。");
				oauth.requiresUserClientId = ar.requiresUserClientId;
			}
			if (ar.clientIdPattern !== void 0) {
				if (oauth.requiresUserClientId !== true) throw bad$4("clientIdPattern 只能用于 requiresUserClientId:true 的连接器。");
				oauth.clientIdPattern = safeClientIdPattern(ar.clientIdPattern);
			}
			if (ar.requiresAllowlist !== void 0) {
				if (typeof ar.requiresAllowlist !== "boolean") throw bad$4("requiresAllowlist 必须是布尔值。");
				oauth.requiresAllowlist = ar.requiresAllowlist;
			}
			auth = oauth;
		} else {
			const ar = exact$4(connRow.auth, [
				"kind",
				"supported",
				"reason"
			], "oauth 认证");
			auth = {
				kind: "oauth",
				supported: false,
				reason: text(ar.reason, "OAuth 不支持原因", 500)
			};
		}
	} else throw bad$4("连接器认证类型只支持 none、secret 或 oauth。");
	const recipeRow = isRecord(connRow.recipe) ? connRow.recipe : null;
	if (!recipeRow) throw bad$4("连接器配方格式不正确。");
	let recipe;
	if (recipeRow.transport === "stdio") {
		const r = exact$4(connRow.recipe, [
			"transport",
			"package",
			"version",
			"integrity",
			"bin",
			"args"
		], "stdio 配方");
		recipe = {
			transport: "stdio",
			package: pattern(r.package, npmPackageName, "npm 包名"),
			version: pattern(r.version, semver$1, "npm 包版本"),
			integrity: pattern(r.integrity, sha512Integrity, "npm 包 integrity"),
			bin: path(r.bin, "bin 路径"),
			args: list$1(r.args, "固定参数", 50).map((a) => text(a, "参数", 1e3))
		};
	} else if (recipeRow.transport === "streamable-http") {
		const r = exact$4(connRow.recipe, ["transport", "url"], "streamable-http 配方");
		recipe = {
			transport: "streamable-http",
			url: pattern(r.url, httpsUrl, "远程地址")
		};
	} else if (recipeRow.transport === "streamable-http-template") {
		const r = exact$4(connRow.recipe, ["transport", "urlTemplate"], "streamable-http-template 配方");
		const tmpl = text(r.urlTemplate, "URL 模板", 500);
		const parts = tmpl.split("{secret}");
		if (parts.length !== 2) throw bad$4("URL 模板必须恰好包含一个 {secret} 占位符。");
		const prefix = parts[0];
		if (!/^https:\/\/[^/]/.test(prefix)) throw bad$4("URL 模板的固定前缀必须以有效的 https:// 主机名开头。");
		recipe = {
			transport: "streamable-http-template",
			urlTemplate: tmpl
		};
	} else throw bad$4("连接器传输类型只支持 stdio、streamable-http 或 streamable-http-template。");
	if (auth.kind === "secret") for (const v of auth.vars) {
		if (v.target === "env" && recipe.transport !== "stdio") throw bad$4(`env 凭据变量只对 stdio 传输有意义（当前传输：${recipe.transport}）。`);
		if (v.target === "bearer" && recipe.transport === "stdio") throw bad$4("bearer 凭据变量对 stdio 传输无意义（stdio 通过环境变量传递凭据）。");
		if (v.target === "bearer" && recipe.transport === "streamable-http-template") throw bad$4("bearer 凭据变量对 streamable-http-template 无意义，请改用 url-path。");
		if (v.target === "url-path" && recipe.transport !== "streamable-http-template") throw bad$4(`url-path 凭据变量只对 streamable-http-template 传输有意义（当前传输：${recipe.transport}）。`);
	}
	const tools = list$1(connRow.tools, "工具列表", 200).map((t) => {
		const tr = exact$4(t, [
			"name",
			"description",
			"readOnly"
		], "工具");
		if (typeof tr.readOnly !== "boolean") throw bad$4("工具 readOnly 必须是布尔值。");
		return {
			name: text(tr.name, "工具名", 120),
			description: localized(tr.description, "工具说明"),
			readOnly: tr.readOnly
		};
	});
	const upstreamUrl = text(connRow.upstreamUrl, "上游地址", 500);
	const common = readCommonFields(row);
	if (auth.kind === "oauth" && auth.supported && auth.requiresAllowlist && (common.compatibility.status !== "needs-configuration" || common.compatibility.conditions.length === 0)) throw bad$4("requiresAllowlist 的连接器兼容状态必须是 needs-configuration，并在兼容条件中写明白名单要求。");
	if (auth.kind === "oauth" && auth.supported && recipe.transport !== "streamable-http") throw bad$4("supported:true 的 OAuth 连接器配方必须是 streamable-http（固定 https 地址）。");
	if (auth.kind === "oauth" && !auth.supported && common.compatibility.status !== "unsupported") throw bad$4("supported:false 的 OAuth 连接器兼容状态必须是 unsupported。");
	return {
		format: "teloa.market-catalog-entry/v1",
		id: pattern(row.id, catalogId, "目录条目标识"),
		kind: "connector",
		delivery: "managed",
		version: pattern(row.version, semver$1, "条目版本"),
		upstream: null,
		taxonomy: readMarketTaxonomy(row.taxonomy),
		connector: {
			serverName,
			title: localized(connRow.title, "连接器标题", 120),
			summary: localized(connRow.summary, "连接器用途"),
			auth,
			recipe,
			tools,
			upstreamUrl
		},
		...common
	};
}
function readUpstreamSkillEntry(row) {
	if (row.format !== "teloa.market-catalog-entry/v1") throw bad$4("目录条目格式版本不受支持。");
	if (row.delivery !== "upstream") throw bad$4("上游条目交付方式必须是 upstream。");
	const skillRow = exact$4(row.skill, [
		"name",
		"title",
		"summary"
	], "技能信息");
	const name = pattern(skillRow.name, marketCatalogSkillName, "技能名");
	if (name.startsWith("teloa-")) throw bad$4("teloa- 前缀保留给内置技能，上游条目不能使用。");
	const upRow = isRecord(row.upstream) ? row.upstream : null;
	if (!upRow) throw bad$4("上游来源格式不正确。");
	let upstream;
	if (upRow.kind === "github") {
		const u = exact$4(row.upstream, [
			"kind",
			"repository",
			"commit",
			"path",
			"files"
		], "GitHub 上游");
		const repoRow = exact$4(u.repository, [
			"host",
			"owner",
			"repo"
		], "上游仓库");
		if (repoRow.host !== "github.com") throw bad$4("上游仓库目前只支持 github.com。");
		const files = list$1(u.files, "上游文件", 500).map((input) => {
			const file = exact$4(input, [
				"path",
				"gitBlob",
				"size"
			], "上游文件");
			return {
				path: path(file.path, "上游文件路径"),
				gitBlob: pattern(file.gitBlob, hex40, "上游文件 blob 摘要"),
				size: file.size === null ? null : size(file.size, "上游文件")
			};
		});
		distinct(files.map((f) => f.path), "上游文件路径");
		upstream = {
			kind: "github",
			repository: {
				host: "github.com",
				owner: pattern(repoRow.owner, githubName, "上游仓库 owner"),
				repo: pattern(repoRow.repo, githubName, "上游仓库名")
			},
			commit: pattern(u.commit, hex40, "上游提交"),
			path: path(u.path, "上游目录"),
			files
		};
	} else if (upRow.kind === "clawhub") {
		const u = exact$4(row.upstream, [
			"kind",
			"owner",
			"slug",
			"version",
			"files"
		], "ClawHub 上游");
		const files = list$1(u.files, "上游文件", 500).map((input) => {
			const file = exact$4(input, [
				"path",
				"sha256",
				"size"
			], "上游文件");
			return {
				path: path(file.path, "上游文件路径"),
				sha256: pattern(file.sha256, hex64, "上游文件摘要"),
				size: size(file.size, "上游文件")
			};
		});
		distinct(files.map((f) => f.path), "上游文件路径");
		upstream = {
			kind: "clawhub",
			owner: text(u.owner, "ClawHub 作者", 200),
			slug: pattern(u.slug, marketCatalogSkillName, "ClawHub 技能名"),
			version: text(u.version, "ClawHub 版本", 80),
			files
		};
	} else throw bad$4("上游来源类型只支持 github 或 clawhub。");
	const origRow = exact$4(row.origin, [
		"marketplace",
		"installs",
		"installsLabel",
		"countedAt"
	], "来源信息");
	const marketplaces = [
		"claude-code",
		"codex",
		"dsh",
		"openclaw",
		"clawhub",
		"hermes"
	];
	if (!marketplaces.includes(origRow.marketplace)) throw bad$4("来源市场不支持。");
	if (origRow.installs !== null && (!Number.isSafeInteger(origRow.installs) || origRow.installs < 0)) throw bad$4("安装量必须是非负整数或 null。");
	const origin = {
		marketplace: origRow.marketplace,
		installs: origRow.installs,
		installsLabel: text(origRow.installsLabel, "安装量显示文本", 200),
		countedAt: date(origRow.countedAt, "统计日期")
	};
	const altMarketplaces = [...marketplaces, "teloa"];
	const alternatives = list$1(row.alternatives, "其他来源", 50).map((input) => {
		const alt = exact$4(input, [
			"entryId",
			"marketplace",
			"installs"
		], "替代条目");
		if (!altMarketplaces.includes(alt.marketplace)) throw bad$4("替代条目来源不支持。");
		if (alt.installs !== null && (!Number.isSafeInteger(alt.installs) || alt.installs < 0)) throw bad$4("替代安装量必须是非负整数或 null。");
		return {
			entryId: pattern(alt.entryId, catalogId, "替代条目标识"),
			marketplace: alt.marketplace,
			installs: alt.installs
		};
	});
	const unsupportedKinds = [
		"agents",
		"commands",
		"hooks",
		"lsp",
		"scripts",
		"mcp"
	];
	const unsupportedComponents = list$1(row.unsupportedComponents, "不支持的组件", 20).map((input) => {
		const comp = exact$4(input, ["kind", "count"], "不支持的组件");
		if (!unsupportedKinds.includes(comp.kind)) throw bad$4("不支持的组件类型不正确。");
		if (!Number.isSafeInteger(comp.count) || comp.count < 1) throw bad$4("不支持的组件数量必须是正整数。");
		return {
			kind: comp.kind,
			count: comp.count
		};
	});
	return {
		format: "teloa.market-catalog-entry/v1",
		id: pattern(row.id, catalogId, "目录条目标识"),
		kind: "skill",
		delivery: "upstream",
		version: pattern(row.version, semver$1, "条目版本"),
		taxonomy: readMarketTaxonomy(row.taxonomy),
		skill: {
			name,
			title: localized(skillRow.title, "技能标题", 120),
			summary: localized(skillRow.summary, "技能用途")
		},
		upstream,
		origin,
		alternatives,
		unsupportedComponents,
		...readCommonFields(row, { allowEmptyLicenseFiles: true })
	};
}
const roleIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function readRoleEntry(row) {
	if (row.format !== "teloa.market-catalog-entry/v1") throw bad$4("目录条目格式版本不受支持。");
	if (row.delivery !== "install") throw bad$4("AI 同事条目只能以 install 方式交付。");
	if (row.upstream !== null) throw bad$4("AI 同事条目的 upstream 必须为 null。");
	const roleRow = exact$4(row.role, [
		"roleId",
		"title",
		"summary",
		"definition",
		"skills",
		"scope",
		"preferredModel",
		"fromSolution"
	], "岗位信息");
	const definitionRow = exact$4(roleRow.definition, [
		"name",
		"kind",
		"duty",
		"dataScope",
		"executionScope",
		"responsibility"
	], "岗位定义");
	let checked;
	try {
		checked = roleDefinition({
			...definitionRow,
			scopes: ["general"],
			skills: [],
			knowledge: []
		});
	} catch {
		throw bad$4("岗位定义不合法。");
	}
	if (!checked.responsibility) throw bad$4("岗位定义必须包含结构化职责。");
	const definition = {
		name: checked.name,
		kind: checked.kind,
		duty: checked.duty,
		dataScope: checked.dataScope,
		executionScope: checked.executionScope,
		responsibility: checked.responsibility
	};
	const skills = distinct(list$1(roleRow.skills, "依赖技能", 30).map((item) => pattern(item, marketCatalogSkillName, "技能名")), "依赖技能");
	let preferredModel = null;
	if (roleRow.preferredModel !== null) {
		const pm = exact$4(roleRow.preferredModel, ["entryId", "fallback"], "首选模型");
		if (pm.fallback !== "default" && pm.fallback !== "refuse") throw bad$4("首选模型回退策略只能是 default 或 refuse。");
		preferredModel = {
			entryId: pattern(pm.entryId, catalogId, "首选模型条目标识"),
			fallback: pm.fallback
		};
	}
	const fromRow = exact$4(roleRow.fromSolution, [
		"packageId",
		"version",
		"path"
	], "来源方案");
	const fromSolution = {
		packageId: pattern(fromRow.packageId, packageIdPattern, "来源方案包标识"),
		version: pattern(fromRow.version, semver$1, "来源方案版本"),
		path: path(fromRow.path, "来源方案内路径")
	};
	if (!/^roles\/[a-z0-9-]+\.json$/.test(fromSolution.path)) throw bad$4("来源方案内路径必须是 roles/<id>.json。");
	return {
		format: "teloa.market-catalog-entry/v1",
		id: pattern(row.id, catalogId, "目录条目标识"),
		kind: "role",
		delivery: "install",
		version: pattern(row.version, semver$1, "条目版本"),
		upstream: null,
		taxonomy: readMarketTaxonomy(row.taxonomy),
		role: {
			roleId: pattern(roleRow.roleId, roleIdPattern, "岗位标识"),
			title: localized(roleRow.title, "岗位标题", 120),
			summary: localized(roleRow.summary, "岗位用途"),
			definition,
			skills,
			scope: pattern(roleRow.scope, scopePattern, "业务范围"),
			preferredModel,
			fromSolution
		},
		...readCommonFields(row, {
			allowEmptyLicenseFiles: true,
			licenseUrl: true
		})
	};
}
const modelApis = [
	"openai-completions",
	"openai-responses",
	"anthropic-messages"
];
const piAiProviderId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const bool = (value, label) => {
	if (typeof value !== "boolean") throw bad$4(label + "必须是布尔值。");
	return value;
};
const nullableInt = (value, label) => {
	if (value === null) return null;
	if (!Number.isSafeInteger(value) || value < 1) throw bad$4(label + "必须是正整数或 null。");
	return value;
};
function readNativeModel(value) {
	const native = exact$4(value, ["kind", "providerId"], "原生模型");
	if (native.kind !== "dsh-speech" || native.providerId !== "sensevoice-local") throw bad$4("尚不支持这个原生模型准备器。");
	return {
		kind: "dsh-speech",
		providerId: "sensevoice-local"
	};
}
function readModelEntry(row) {
	if (row.format !== "teloa.market-catalog-entry/v1") throw bad$4("目录条目格式版本不受支持。");
	if (row.delivery !== "reference") throw bad$4("模型条目只能以 reference 方式交付，准备过程由原生服务管理。");
	if (row.upstream !== null) throw bad$4("模型条目的 upstream 必须为 null。");
	if (!isRecord(row.model)) throw bad$4("模型信息格式不正确。");
	if (row.model.form === "local-vertical") throw bad$4("form local-vertical 属三期，本期不收。");
	if (![
		"cloud",
		"local-general",
		"local-specialist"
	].includes(String(row.model.form))) throw bad$4("模型形态只支持 cloud、local-general 或 local-specialist。");
	const specialist = row.model.form === "local-specialist";
	const m = specialist ? exact$4(row.model, [
		"modelId",
		"title",
		"summary",
		"form",
		"usage",
		"capabilities",
		"contextWindow",
		"license",
		"cnReachable",
		"support",
		"notes",
		"native"
	], "模型信息") : exact$4({
		local: null,
		variants: null,
		...row.model
	}, [
		"modelId",
		"title",
		"summary",
		"form",
		"usage",
		"capabilities",
		"contextWindow",
		"license",
		"cnReachable",
		"support",
		"notes",
		"cloud",
		"local",
		"variants"
	], "模型信息");
	const usage = distinct(list$1(m.usage, "模型用法", 3).map((item) => {
		if (specialist ? item !== "speech-to-text" : item !== "chat" && item !== "embedding" && item !== "tool") throw bad$4(specialist ? "模型用法与运行形态不匹配。" : "模型用法只能是 chat、embedding 或 tool。");
		return item;
	}), "模型用法");
	if (!usage.length) throw bad$4("模型用法至少一项。");
	const cap = exact$4(m.capabilities, [
		"tools",
		"vision",
		"reasoning",
		"structured"
	], "模型能力");
	const lic = exact$4(m.license, [
		"spdx",
		"name",
		"url",
		"tier",
		"restrictions"
	], "模型许可");
	if (lic.tier !== "commercial" && lic.tier !== "restricted") throw bad$4("许可层级只收 commercial 或 restricted，不收 non-commercial。");
	const restrictions = list$1(lic.restrictions, "许可限制", 10).map((item) => localized(item, "许可限制", 300));
	if (lic.tier === "restricted" && !restrictions.length) throw bad$4("restricted 许可必须列出至少一条限制。");
	if (![
		"direct",
		"mirror",
		"proxy-required"
	].includes(String(m.cnReachable))) throw bad$4("国内可达性只能是 direct、mirror 或 proxy-required。");
	if (m.support !== "experimental" && m.support !== "supported") throw bad$4("支持状态只能是 experimental 或 supported。");
	if (specialist && (m.contextWindow !== null || Object.values(cap).some((value) => value !== false))) throw bad$4("语音模型不声明聊天上下文或聊天能力。");
	const base = {
		modelId: pattern(m.modelId, roleIdPattern, "模型标识"),
		title: localized(m.title, "模型标题", 120),
		summary: localized(m.summary, "模型用途"),
		capabilities: {
			tools: bool(cap.tools, "工具调用"),
			vision: bool(cap.vision, "视觉"),
			reasoning: bool(cap.reasoning, "推理"),
			structured: bool(cap.structured, "结构化输出")
		},
		contextWindow: nullableInt(m.contextWindow, "上下文窗口"),
		license: {
			spdx: text(lic.spdx, "许可标识", 200),
			name: text(lic.name, "许可名称", 200),
			url: pattern(lic.url, httpsUrl, "许可链接"),
			tier: lic.tier,
			restrictions
		},
		cnReachable: m.cnReachable,
		support: m.support,
		notes: list$1(m.notes, "说明", 10).map((item) => localized(item, "说明", 500))
	};
	const commonFields = readCommonFields(row, {
		allowEmptyLicenseFiles: true,
		licenseUrl: true
	});
	const head = {
		format: "teloa.market-catalog-entry/v1",
		id: pattern(row.id, modelCatalogId, "目录条目标识"),
		kind: "model",
		delivery: "reference",
		version: pattern(row.version, semver$1, "条目版本"),
		upstream: null,
		taxonomy: readMarketTaxonomy(row.taxonomy)
	};
	if (specialist) return {
		...head,
		model: {
			...base,
			form: "local-specialist",
			usage: ["speech-to-text"],
			native: readNativeModel(m.native)
		},
		...commonFields
	};
	const common = {
		...base,
		usage
	};
	if (m.form === "cloud") {
		if (m.local !== null || m.variants !== null) throw bad$4("云端模型的 local 与 variants 必须为 null。");
		return {
			...head,
			model: {
				...common,
				form: "cloud",
				cloud: readModelCloud(m.cloud),
				local: null,
				variants: null
			},
			...commonFields
		};
	}
	if (m.cloud !== null) throw bad$4("本机模型的 cloud 必须为 null。");
	if (exact$4(m.local, ["runtime"], "本机运行时").runtime !== "ollama") throw bad$4("本机运行时只支持 ollama。");
	if (!commonFields.requires.runtimes.includes("ollama")) throw bad$4("本机模型的 requires.runtimes 必须包含 ollama。");
	const gb = (x, label) => {
		if (!Number.isInteger(x) || x < 1 || x > 1024) throw bad$4(label + "须为 1–1024 的整数。");
		return x;
	};
	const gb2 = (x, label) => {
		if (!Number.isInteger(x) || x < 256 || x > 2e6) throw bad$4(label + "须为 256–2000000 的整数。");
		return x;
	};
	const variants = list$1(m.variants, "模型变体", 6).map((item) => {
		const v = exact$4(item, [
			"quant",
			"format",
			"sizeBytes",
			"sources",
			"hardware",
			"models"
		], "模型变体");
		if (v.format !== "gguf") throw bad$4("模型变体格式只收 gguf。");
		const sources = list$1(v.sources, "来源", 1).map((item) => {
			if (!isRecord(item) || item.kind !== "ollama") throw bad$4("本期来源只支持 ollama。");
			const s = exact$4(item, [
				"kind",
				"name",
				"digest"
			], "来源");
			const name = pattern(s.name, ollamaModelNamePattern, "Ollama 模型名称（必须带 tag）");
			if (s.digest !== null && (typeof s.digest !== "string" || !ollamaDigestPattern.test(s.digest))) throw bad$4("来源摘要必须为 sha256:64 位十六进制或 null。");
			return {
				kind: "ollama",
				name,
				digest: s.digest
			};
		});
		if (!sources.length) throw bad$4("来源至少一项。");
		const hardware = exact$4(v.hardware, [
			"minRamGb",
			"recommendedRamGb",
			"vramGb"
		], "硬件条件");
		const models = exact$4(v.models, [
			"id",
			"contextWindow",
			"maxTokens",
			"input"
		], "路由模型");
		if (models.id !== sources[0].name) throw bad$4("路由模型 id 必须与 Ollama 名称一致。");
		const input = distinct(list$1(models.input, "输入类型", 2).map((t) => {
			if (t !== "text" && t !== "image") throw bad$4("输入类型只支持 text/image。");
			return t;
		}), "输入类型");
		if (!input.includes("text")) throw bad$4("输入类型必须包含 text。");
		if (!Number.isSafeInteger(v.sizeBytes) || v.sizeBytes <= 0) throw bad$4("sizeBytes 须为正整数。");
		if (hardware.minRamGb > hardware.recommendedRamGb) throw bad$4("最低内存不能高于推荐内存。");
		if (models.maxTokens > models.contextWindow) throw bad$4("最大输出不能超过上下文窗口。");
		return {
			quant: pattern(v.quant, /^[A-Za-z0-9_]{1,16}$/, "量化标识"),
			format: "gguf",
			sizeBytes: v.sizeBytes,
			sources: [sources[0]],
			hardware: {
				minRamGb: gb(hardware.minRamGb, "最低内存"),
				recommendedRamGb: gb(hardware.recommendedRamGb, "推荐内存"),
				vramGb: hardware.vramGb === null ? null : gb(hardware.vramGb, "显存")
			},
			models: {
				id: models.id,
				contextWindow: gb2(models.contextWindow, "上下文"),
				maxTokens: gb2(models.maxTokens, "最大输出"),
				input
			}
		};
	});
	if (!variants.length) throw bad$4("模型变体至少一项。");
	distinct(variants.map((v) => v.sources[0].name), "Ollama 模型名称");
	return {
		...head,
		model: {
			...common,
			form: "local-general",
			cloud: null,
			local: { runtime: "ollama" },
			variants
		},
		...commonFields
	};
}
function readModelCloud(value) {
	const cloud = exact$4(value, [
		"provider",
		"models",
		"priceBand",
		"credentialLabel",
		"signupUrl"
	], "云端接入");
	const providerRow = isRecord(cloud.provider) ? cloud.provider : null;
	if (!providerRow) throw bad$4("云端 provider 格式不正确。");
	let provider;
	if (providerRow.kind === "pi-ai") {
		const p = exact$4(cloud.provider, ["kind", "id"], "pi-ai provider");
		provider = {
			kind: "pi-ai",
			id: pattern(p.id, piAiProviderId, "pi-ai provider 标识")
		};
	} else if (providerRow.kind === "custom") {
		const p = exact$4(cloud.provider, [
			"kind",
			"api",
			"baseURL"
		], "自定义 provider");
		if (!modelApis.includes(p.api)) throw bad$4("自定义 provider 协议只支持 openai-completions、openai-responses 或 anthropic-messages。");
		provider = {
			kind: "custom",
			api: p.api,
			baseURL: pattern(p.baseURL, httpsUrl, "自定义端点（必须 https）")
		};
	} else throw bad$4("云端 provider 类型只支持 pi-ai 或 custom。");
	const models = list$1(cloud.models, "起始模型列表", 50).map((input) => {
		const r = exact$4(input, [
			"id",
			"name",
			"contextWindow",
			"maxTokens",
			"input"
		], "模型");
		const inputs = distinct(list$1(r.input, "模型输入类型", 2).map((item) => {
			if (item !== "text" && item !== "image") throw bad$4("模型输入类型只能是 text 或 image。");
			return item;
		}), "模型输入类型");
		return {
			id: text(r.id, "模型 id", 120),
			name: text(r.name, "模型名称", 120),
			contextWindow: nullableInt(r.contextWindow, "上下文窗口"),
			maxTokens: nullableInt(r.maxTokens, "最大输出"),
			input: inputs
		};
	});
	if (!models.length) throw bad$4("起始模型列表至少一项。");
	distinct(models.map((item) => item.id), "模型 id");
	if (cloud.priceBand !== null && ![
		"low",
		"mid",
		"high"
	].includes(String(cloud.priceBand))) throw bad$4("价格档只能是 low、mid、high 或 null。");
	return {
		provider,
		models,
		priceBand: cloud.priceBand,
		credentialLabel: localized(cloud.credentialLabel, "凭据说明", 120),
		signupUrl: pattern(cloud.signupUrl, httpsUrl, "注册链接")
	};
}
function readMarketCatalogEntry(value) {
	if (!isRecord(value)) throw bad$4("目录条目格式不正确或包含未知字段。");
	if (value.kind === "skill") {
		if (value.delivery === "upstream") return readUpstreamSkillEntry(exact$4(value, [
			"format",
			"id",
			"kind",
			"delivery",
			"version",
			"taxonomy",
			"skill",
			"upstream",
			"origin",
			"alternatives",
			"unsupportedComponents",
			"modifications",
			"license",
			"compatibility",
			"requires",
			"review"
		], "上游技能条目"));
		return readSkillEntry(exact$4(value, [
			"format",
			"id",
			"kind",
			"delivery",
			"version",
			"taxonomy",
			"skill",
			"upstream",
			"modifications",
			"license",
			"compatibility",
			"requires",
			"review"
		], "技能条目"));
	}
	if (value.kind === "solution") return readSolutionEntry(exact$4(value, [
		"format",
		"id",
		"kind",
		"delivery",
		"version",
		"taxonomy",
		"solution",
		"upstream",
		"modifications",
		"license",
		"compatibility",
		"requires",
		"review"
	], "方案条目"));
	if (value.kind === "connector") return readConnectorEntry(exact$4(value, [
		"format",
		"id",
		"kind",
		"delivery",
		"version",
		"taxonomy",
		"upstream",
		"connector",
		"modifications",
		"license",
		"compatibility",
		"requires",
		"review"
	], "连接器条目"));
	if (value.kind === "role") return readRoleEntry(exact$4(value, [
		"format",
		"id",
		"kind",
		"delivery",
		"version",
		"taxonomy",
		"upstream",
		"role",
		"modifications",
		"license",
		"compatibility",
		"requires",
		"review"
	], "AI 同事条目"));
	if (value.kind === "model") return readModelEntry(exact$4(value, [
		"format",
		"id",
		"kind",
		"delivery",
		"version",
		"taxonomy",
		"upstream",
		"model",
		"modifications",
		"license",
		"compatibility",
		"requires",
		"review"
	], "模型条目"));
	throw bad$4("目录条目类型只支持 solution、role、skill、connector 或 model。");
}
/** 工件树摘要：按路径排序后对 [path,sha256,size] 序列求摘要；由调用方提供 sha256，契约包不依赖运行时加密库。 */
function marketCatalogTreeHash(files, sha256) {
	const ordered = [...files].sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0);
	return sha256(JSON.stringify(ordered.map((file) => [
		file.path,
		file.sha256,
		file.size
	])));
}
/** 读取条目工件清单并核对入口、许可与树摘要；不接触字节，字节摘要由持有字节的一方核对。 */
function readMarketCatalogArtifact(value, entry, sha256) {
	const row = exact$4(value, ["files", "treeHash"], "条目工件");
	const files = list$1(row.files, "工件文件", 500).map((input) => {
		const file = exact$4(input, [
			"path",
			"sha256",
			"size"
		], "工件文件");
		return {
			path: path(file.path, "工件文件路径"),
			sha256: pattern(file.sha256, hex64, "工件文件摘要"),
			size: size(file.size, "工件文件")
		};
	});
	distinct(files.map((file) => file.path), "工件文件路径");
	if (entry.kind === "skill" && entry.delivery !== "upstream") {
		const skillEntries = files.filter((file) => file.path.split("/").at(-1) === "SKILL.md");
		if (skillEntries.length !== 1 || skillEntries[0].path !== "SKILL.md") throw bad$4("条目工件必须恰有一个位于根目录的 SKILL.md。");
	} else if (entry.kind === "solution") {
		if (!files.some((file) => file.path === "teloa.json")) throw bad$4("方案条目工件必须包含根目录的 teloa.json。");
	} else if (entry.kind === "role") {
		if (!files.some((file) => file.path === "role.json")) throw bad$4("AI 同事条目工件必须包含根目录的 role.json。");
		if (files.some((file) => ![
			"role.json",
			"README.md",
			"LICENSE",
			"LICENSE.txt"
		].includes(file.path))) throw bad$4("AI 同事条目工件只允许 role.json、README.md 与许可文件（LICENSE 或 LICENSE.txt）。");
	} else if (entry.kind === "model") throw bad$4("模型条目没有工件。");
	if (entry.license.files.some((license) => !files.some((file) => file.path === license))) throw bad$4("许可文件必须包含在条目工件中。");
	if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL) throw bad$4("条目工件总大小不能超过 20 MiB。");
	const treeHash = pattern(row.treeHash, hex64, "工件树摘要");
	if (marketCatalogTreeHash(files, sha256) !== treeHash) throw bad$4("工件树摘要与文件清单不一致。");
	return {
		files,
		treeHash
	};
}
function readMarketCatalogIndex(value, sha256) {
	const row = exact$4(value, [
		"format",
		"catalogVersion",
		"entries"
	], "目录快照");
	if (row.format !== "teloa.market-catalog/v1") throw bad$4("目录快照格式版本不受支持。");
	const catalogVersion = pattern(row.catalogVersion, /^[0-9A-Za-z][0-9A-Za-z.-]{0,39}$/, "目录版本");
	const entries = list$1(row.entries, "目录条目", 500).map((input) => {
		if (!isRecord(input)) throw bad$4("目录条目格式不正确。");
		const { artifact, ...rest } = input, entry = readMarketCatalogEntry(rest);
		if (entry.kind === "model") {
			if (artifact !== null) throw bad$4("模型条目的 artifact 必须为 null。");
			return {
				...entry,
				artifact: null
			};
		}
		return {
			...entry,
			artifact: readMarketCatalogArtifact(artifact, entry, sha256)
		};
	});
	distinct(entries.map((entry) => entry.id), "目录条目标识");
	distinct(entries.filter((e) => e.kind === "skill").map((e) => e.skill.name), "目录技能名");
	distinct(entries.filter((e) => e.kind === "solution").map((e) => e.solution.packageId), "方案包标识");
	distinct(entries.filter((e) => e.kind === "connector").map((e) => e.connector.serverName), "连接器服务名");
	distinct(entries.filter((e) => e.kind === "role").map((e) => e.role.roleId), "岗位标识");
	distinct(entries.filter((e) => e.kind === "model").map((e) => e.model.modelId), "模型标识");
	return {
		format: "teloa.market-catalog/v1",
		catalogVersion,
		entries
	};
}

//#endregion
//#region packages/contract/src/market-index.ts
/** v1 索引冻结收录的 kind。 */
const MARKET_INDEX_V1_KINDS = [
	"skill",
	"solution",
	"connector"
];
/** v1 冻结时的行业词表：旧版应用遇到词表外的键会整份拒收，发布端把之后新增的二级键在 v1 中降为其一级键。 */
const MARKET_INDEX_V1_INDUSTRIES = [
	"general",
	"cyber-security",
	"marketing",
	"media",
	"software",
	"other",
	"cyber-security/soc",
	"cyber-security/detection",
	"cyber-security/appsec",
	"cyber-security/grc",
	"marketing/new-media",
	"media/video"
];
const bad$3 = (message) => new WorkError("teloa/invalid-input", message);
const catalogVersionPattern = /^[0-9A-Za-z][0-9A-Za-z.-]{0,39}$/;
function envelope(value, format) {
	if (!isRecord(value) || Object.keys(value).length !== 3 || !Object.hasOwn(value, "format") || !Object.hasOwn(value, "catalogVersion") || !Object.hasOwn(value, "entries")) throw bad$3("市场索引格式不正确或包含未知字段。");
	if (value.format !== format) throw bad$3("市场索引格式版本不受支持。");
	if (typeof value.catalogVersion !== "string" || !catalogVersionPattern.test(value.catalogVersion)) throw bad$3("市场索引目录版本格式不正确。");
	if (!Array.isArray(value.entries) || value.entries.length > 1e3) throw bad$3("市场索引条目最多 1000 项。");
	return {
		catalogVersion: value.catalogVersion,
		entries: value.entries
	};
}
/** Teloa 自编的内置技能没有外部固定来源（upstream 为 null），只随发行快照提供，不进在线索引（v1 / v2 都不收；旧版读取器要求 upstream）。 */
function noBuiltinWithoutUpstream(entries) {
	if (entries.some((entry) => entry.kind === "skill" && entry.upstream === null)) throw bad$3("市场索引不收无上游来源的 Teloa 内置技能。");
}
function orderedIds(ids) {
	if (new Set(ids).size !== ids.length) throw bad$3("市场索引条目标识不能重复。");
	for (let at = 1; at < ids.length; at += 1) if (ids[at - 1] >= ids[at]) throw bad$3("市场索引条目必须按标识升序排列。");
}
function readMarketIndex(value) {
	const { catalogVersion, entries: raw } = envelope(value, "teloa.market-index/v1");
	const entries = raw.map((item) => readMarketCatalogEntry(item));
	if (entries.some((entry) => !MARKET_INDEX_V1_KINDS.includes(entry.kind))) throw bad$3("v1 索引只收 skill、solution、connector；其余类型请发布到 v2 索引。");
	noBuiltinWithoutUpstream(entries);
	orderedIds(entries.map((entry) => entry.id));
	return {
		format: "teloa.market-index/v1",
		catalogVersion,
		entries
	};
}
/** v2 发布端组装：只做结构检查（kind 须为已知类型、compatibility.teloa 范围语法严格可解析、标识升序去重），不按本机版本过滤、不产生 skipped。 */
function assembleMarketIndexV2(value) {
	const { catalogVersion, entries: raw } = envelope(value, "teloa.market-index/v2");
	const entries = raw.map((item) => {
		if (!isRecord(item) || typeof item.id !== "string") throw bad$3("市场索引条目格式不正确。");
		if (!marketEntryKinds.includes(item.kind)) throw bad$3("市场索引条目类型不受支持：" + item.id);
		const range = isRecord(item.compatibility) ? item.compatibility.teloa : void 0;
		if (typeof range === "string") try {
			parseTeloaRange(range);
		} catch {
			throw bad$3("市场索引条目 Teloa 兼容范围语法不正确：" + item.id);
		}
		return readMarketCatalogEntry(item);
	});
	noBuiltinWithoutUpstream(entries);
	orderedIds(entries.map((entry) => entry.id));
	return {
		format: "teloa.market-index/v2",
		catalogVersion,
		entries
	};
}

//#endregion
//#region packages/contract/src/industry-definitions.ts
const bad$2 = (message) => new WorkError("teloa/invalid-input", message);
const exact$3 = (value, keys, message) => {
	if (!isRecord(value) || Object.keys(value).length !== keys.length || keys.some((key) => !(key in value))) throw bad$2(message);
	return value;
};
/** 服务名不得含 `__`：公开名以 `mcp__<server>__` 分段，含 `__` 的服务名能对上别的服务器命名空间里原始名含 `__` 的工具。 */
const serverName = /^(?!.*__)[A-Za-z0-9_-]{1,32}$/;
/** MCP 原始工具名：允许点号分段（飞书官方 MCP 形如 `im.v1.message.list`），但不能以点开头、结尾或连续两点。 */
const toolName = /^(?!.*\.\.)[A-Za-z0-9_-][A-Za-z0-9_.-]{0,62}[A-Za-z0-9_-]$|^[A-Za-z0-9_-]$/;
const list = (value, pattern, max, message) => {
	if (!Array.isArray(value) || !value.length || value.length > max || value.some((item) => typeof item !== "string" || !pattern.test(item)) || new Set(value).size !== value.length) throw bad$2(message);
	return [...value];
};
function readIndustryMcpConnectionDefinition(value) {
	const row = exact$3(value, [
		"format",
		"serverName",
		"tools"
	], "行业 MCP 连接定义格式不正确。");
	if (row.format !== "teloa.mcp-connection/v1" || typeof row.serverName !== "string" || !serverName.test(row.serverName)) throw bad$2("行业 MCP 连接定义格式不正确。");
	return {
		format: "teloa.mcp-connection/v1",
		serverName: row.serverName,
		tools: list(row.tools, toolName, 64, "行业 MCP 连接工具名必须非空、去重且只含字母数字下划线连字符与点号。")
	};
}

//#endregion
//#region packages/contract/src/localized-metadata.ts
const bad$1 = (message) => new WorkError("teloa/invalid-input", message);
const record = (value) => {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw bad$1("本地化元数据格式不正确。");
	return value;
};
const exact$2 = (value, keys) => {
	const row = record(value);
	if (Object.keys(row).some((key) => !keys.includes(key))) throw bad$1("本地化元数据格式不正确或包含未知字段。");
	return row;
};
const locale = (value) => {
	if (typeof value !== "string" || !value.trim() || value.length > 80) throw bad$1("locale 标识不正确。");
	try {
		const values = Intl.getCanonicalLocales(value.trim());
		if (values.length !== 1) throw Error();
		return values[0];
	} catch {
		throw bad$1("locale 标识不正确。");
	}
};
function localizedMetadata(input) {
	const row = exact$2(input, [
		"original",
		"defaultLocale",
		"locales"
	]);
	if (typeof row.original !== "string" || !row.original.trim() || new TextEncoder().encode(row.original).byteLength > 16 * 1024) throw bad$1("本地化元数据稳定原文不能为空或超过限制。");
	const defaultLocale = locale(row.defaultLocale), raw = record(row.locales), entries = {};
	if (Object.keys(raw).length > 100) throw bad$1("本地化 locale map 不能超过 100 项。");
	for (const [key, inputValue] of Object.entries(raw)) {
		const normalized = locale(key);
		if (Object.hasOwn(entries, normalized)) throw bad$1("本地化 locale map 包含重复的规范 locale。");
		if (typeof inputValue === "string") {
			if (!inputValue.trim() || new TextEncoder().encode(inputValue).byteLength > 16 * 1024) throw bad$1("本地化 locale 值不能为空或超过限制。");
			entries[normalized] = inputValue;
			continue;
		}
		const alias = exact$2(inputValue, ["fallback"]);
		entries[normalized] = { fallback: locale(alias.fallback) };
	}
	const sorted = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
	for (const start of Object.keys(sorted)) {
		const seen = /* @__PURE__ */ new Set();
		let current = start;
		while (typeof sorted[current] !== "string") {
			if (seen.has(current)) throw bad$1("本地化 fallback 不能形成环。");
			seen.add(current);
			const value = sorted[current];
			if (!value || typeof value === "string" || !Object.hasOwn(sorted, value.fallback)) throw bad$1("本地化 fallback 必须指向 locale map 中的已声明项。");
			current = value.fallback;
		}
	}
	return {
		original: row.original,
		defaultLocale,
		locales: sorted
	};
}

//#endregion
//#region packages/contract/src/business-source-mapping.ts
const maxNamedFields = 8;
/** 缺键/多键都指出具体字段名，照 `business-definitions.ts` 的 `exact`。 */
const exactWith = (code) => (value, keys, message) => {
	if (!isRecord(value)) throw new WorkError(code, message);
	const missing = keys.filter((key) => !(key in value)), extra = Object.keys(value).filter((key) => !keys.includes(key));
	if (!missing.length && !extra.length) return value;
	const parts = [];
	if (missing.length) parts.push("缺少字段 " + missing.slice(0, maxNamedFields).join("、"));
	if (extra.length) parts.push("不认识的字段 " + extra.slice(0, maxNamedFields).join("、"));
	throw new WorkError(code, message.replace(/。$/, "") + "：" + parts.join("；") + "。");
};
const exact$1 = exactWith("teloa/invalid-input");
const exactHost = exactWith("teloa/invalid-host-response");

//#endregion
//#region packages/contract/src/business-chart-spec.ts
const localTimeUnits = [
	"year",
	"quarter",
	"month",
	"week",
	"day",
	"dayofyear",
	"date",
	"hours",
	"minutes",
	"seconds",
	"milliseconds",
	"yearquarter",
	"yearquartermonth",
	"yearmonth",
	"yearmonthdate",
	"yearmonthdatehours",
	"yearmonthdatehoursminutes",
	"yearmonthdatehoursminutesseconds",
	"yearweek",
	"yearweekday",
	"yearweekdayhours",
	"yearweekdayhoursminutes",
	"yearweekdayhoursminutesseconds",
	"yeardayofyear",
	"quartermonth",
	"monthdate",
	"monthdatehours",
	"monthdatehoursminutes",
	"monthdatehoursminutesseconds",
	"weekday",
	"weekdayhours",
	"weekdayhoursminutes",
	"weekdayhoursminutesseconds",
	"dayhours",
	"dayhoursminutes",
	"dayhoursminutesseconds",
	"hoursminutes",
	"hoursminutesseconds",
	"minutesseconds",
	"secondsmilliseconds"
];
const timeUnits = [...localTimeUnits, ...localTimeUnits.map((unit) => "utc" + unit)];

//#endregion
//#region packages/contract/src/pending-requests.ts
/**
* 只有这些浏览器写命令能进入跨浏览器恢复目录。这里故意不用“所有带 requestId 的命令”推断，
* 新增命令需要经过载荷与凭据边界审查后再明确加入。
* 携带凭据原值的命令（im/channels/save）不得列入：目录会原样冻结请求体。它按 channelId 覆盖保存，天然幂等，无需跨浏览器恢复。
*/
const pendingRequestEndpoints = [
	"security-actions/propose",
	"security-actions/submit",
	"security-actions/decide",
	"security-actions/withdraw-submission",
	"security-actions/withdraw-approval",
	"security-actions/acknowledge-failure",
	"security-actions/execute",
	"security-actions/observe",
	"task-runs/prepare",
	"tasks/materials/add",
	"business-tasks/create",
	"tasks/create",
	"tasks/transition",
	"roles/create",
	"plans/create",
	"plans/change",
	"plans/trigger",
	"handoffs/change",
	"object-conversations/change",
	"role-memory/create",
	"role-memory/confirm",
	"role-memory/withdraw",
	"artifacts/create",
	"industry-loads/create",
	"industry-loads/unload",
	"industry-loads/upgrade",
	"industry-knowledge/instantiate",
	"industry-data-sources/instantiate",
	"industry-data-sources/authorize",
	"industry-execution-tools/instantiate",
	"industry-execution-tools/authorize",
	"industry-mcp-connections/instantiate",
	"industry-mcp-connections/connect",
	"industry-plugins/instantiate",
	"industry-plugins/install",
	"industry-roles/instantiate",
	"industry-tasks/create",
	"industry-plans/create",
	"skill-installations/install",
	"market-plugins/install",
	"skill-selections/change",
	"skill-availability/change",
	"market-content/import",
	"market-content/import-github",
	"market-content/import-github-skill",
	"market-catalog/add",
	"market/github/resolve",
	"groups/create",
	"groups/change",
	"groups/messages/send",
	"groups/resources/save",
	"groups/resources/withdraw",
	"groups/agent-grants/change",
	"groups/tasks/create",
	"groups/attachments/withdraw",
	"business-dashboards/refresh",
	"business-sync/run",
	"im/channels/enable",
	"im/channels/disable",
	"im/channels/remove",
	"im/pairing/create",
	"im/bindings/remove",
	"im/bindings/change",
	"im/groups/bind",
	"im/groups/unbind"
];
const endpointSet = new Set(pendingRequestEndpoints);

//#endregion
//#region packages/contract/src/industry-model-dependencies.ts
/** 模型用途与聊天模型选择分开；声明只引用市场固定版本，不携带下载地址、凭据或执行代码。 */
const industryModelUsages = [
	"speech-to-text",
	"text-to-speech",
	"embedding",
	"rerank",
	"ocr",
	"classification",
	"extraction",
	"chat"
];
const industryPackageFormats = ["teloa.business-package/v2", "teloa.business-package/v3"];
const isIndustryPackageFormat = (value) => industryPackageFormats.some((format) => format === value);
/** 缺省与显式空列表不能混同：v2 不允许携带这个字段，v3 的声明一旦存在就必须有内容。 */
function readIndustryModelDependencies(value) {
	const bad = () => new WorkError("teloa/invalid-input", "模型依赖须包含 1～16 项固定目录版本、用途及必需标记，不能包含下载地址或运行配置。");
	if (!Array.isArray(value) || !value.length || value.length > 16) throw bad();
	const seen = /* @__PURE__ */ new Set();
	return value.map((input) => {
		if (!isRecord(input) || Object.keys(input).length !== 4 || Object.keys(input).some((key) => ![
			"catalogId",
			"version",
			"usage",
			"required"
		].includes(key))) throw bad();
		if (typeof input.catalogId !== "string" || !/^(?=.{1,120}$)[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*){1,2}$/.test(input.catalogId) || typeof input.version !== "string" || input.version.length > 80 || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(input.version) || !industryModelUsages.includes(input.usage) || typeof input.required !== "boolean") throw bad();
		const key = input.catalogId + "\0" + input.usage;
		if (seen.has(key)) throw bad();
		seen.add(key);
		return {
			catalogId: input.catalogId,
			version: input.version,
			usage: input.usage,
			required: input.required
		};
	});
}
/** 清单、固定快照和 RPC 读取共用边界，避免某条链忽略新依赖后继续执行。 */
function industryResourceModelDependencies(kind, value) {
	if (value === void 0) return {};
	if (kind !== "skill" && kind !== "work-template") throw new WorkError("teloa/invalid-input", "模型依赖只能声明在技能或任务模板上。");
	return { modelDependencies: readIndustryModelDependencies(value) };
}

//#endregion
//#region packages/backend/src/market/content-store.ts
const kinds = [
	"role",
	"knowledge",
	"skill",
	"mcp",
	"plugin",
	"data-source",
	"execution-tool",
	"work-template",
	"plan",
	"object-type",
	"business-view",
	"business-action"
];
const relationTargets = {
	"role-knowledge": ["knowledge"],
	"role-skill": ["skill"],
	"role-connection": [
		"mcp",
		"data-source",
		"execution-tool"
	],
	"role-work": ["work-template", "plan"]
};
const bad = (message = "市场内容请求格式不正确或包含未知字段。") => new WorkError("teloa/invalid-input", message);
const stableId = (value) => typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9-]{0,119}$/.test(value);
const semver = (value) => typeof value === "string" && value.length <= 80 && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value);
const exact = (value, keys) => {
	if (!isRecord(value) || Object.keys(value).some((key) => !keys.includes(key))) throw bad();
	return value;
};
const requiredText = (value, label, max) => {
	if (typeof value !== "string" || !value.trim() || value.length > max) throw bad(label + "必须填写且不超过 " + max + " 字。");
	return value.trim();
};
const safePath = (value) => {
	const path = requiredText(value, "内容路径", 500);
	if (path.startsWith("/") || path.split("/").some((part) => !part || part === "." || part === "..") || /[\\:?%#\u0000-\u001f\u007f]/.test(path)) throw bad("内容路径必须是安全的包内相对路径。");
	return path;
};
function localizedFields(input, originals) {
	const row = exact(input, ["title", "description"]), result = {};
	for (const field of ["title", "description"]) if (row[field] !== void 0) {
		if (originals[field] === void 0) throw bad("此市场内容不支持该本地化字段。");
		const value = localizedMetadata(row[field]);
		if (value.original !== originals[field]) throw bad("本地化元数据的稳定原文必须与市场内容字段一致。");
		result[field] = value;
	}
	return result;
}
function id(value, label = "资源标识") {
	if (!stableId(value)) throw bad(label + "仅允许字母、数字和连字符。");
	return value;
}
function validateManifest(input) {
	const hasScope = isRecord(input) && Object.hasOwn(input, "scope");
	const row = exact(input, [
		"format",
		"id",
		"title",
		"version",
		"domain",
		"scope",
		"description",
		"localized",
		"resources",
		"relations",
		"entrypoints"
	]);
	if (!isIndustryPackageFormat(row.format)) throw bad("只支持 teloa.business-package/v2 或 v3 行业模板。");
	if (!semver(row.version)) throw bad("行业模板版本必须是固定的三段版本号。");
	if (!Array.isArray(row.resources) || !row.resources.length || row.resources.length > 500) throw bad("行业资源需包含 1～500 项。");
	const resources = row.resources.map((input) => {
		const value = exact(input, [
			"id",
			"kind",
			"title",
			"localized",
			"version",
			"required",
			"source",
			...row.format === "teloa.business-package/v3" ? ["modelDependencies"] : []
		]), resourceId = id(value.id), title = requiredText(value.title, "资源名称", 120);
		if (!kinds.includes(value.kind) || !semver(value.version) || typeof value.required !== "boolean") throw bad("行业资源类型、版本或 required 无效。");
		const sourceValue = exact(value.source, [
			"kind",
			"path",
			"id",
			"version"
		]);
		let normalizedSource;
		if (sourceValue.kind === "local") {
			exact(sourceValue, ["kind", "path"]);
			normalizedSource = {
				kind: "local",
				path: safePath(sourceValue.path)
			};
		} else if (sourceValue.kind === "public") {
			exact(sourceValue, [
				"kind",
				"id",
				"version"
			]);
			if (!stableId(sourceValue.id) || !semver(sourceValue.version) || sourceValue.version !== value.version) throw bad("公共资源必须固定身份和与声明一致的版本。");
			normalizedSource = {
				kind: "public",
				id: sourceValue.id,
				version: sourceValue.version
			};
		} else throw bad("行业资源来源必须是包内路径或固定公共引用。");
		return {
			id: resourceId,
			kind: value.kind,
			title,
			...value.localized === void 0 ? {} : { localized: localizedFields(exact(value.localized, ["title"]), { title }) },
			version: value.version,
			required: value.required,
			source: normalizedSource,
			...industryResourceModelDependencies(value.kind, value.modelDependencies)
		};
	});
	const byId = new Map(resources.map((value) => [value.id, value]));
	if (byId.size !== resources.length) throw bad("行业资源标识重复。");
	if (!Array.isArray(row.relations) || row.relations.length > 2e3) throw bad("行业资源关联不能超过 2000 项。");
	const seen = /* @__PURE__ */ new Set(), relations = row.relations.map((input) => {
		const value = exact(input, [
			"kind",
			"from",
			"to"
		]), kind = requiredText(value.kind, "关联类型", 80), from = id(value.from), to = id(value.to);
		const fromResource = byId.get(from), toResource = byId.get(to), allowed = relationTargets[kind];
		if (!fromResource || !toResource) throw bad("行业资源关联指向不存在的资源。");
		if (!allowed || fromResource.kind !== "role" || !allowed.includes(toResource.kind)) throw bad("行业资源关联类型不匹配。");
		const key = kind + ":" + from + ":" + to;
		if (seen.has(key)) throw bad("行业资源关联重复。");
		seen.add(key);
		return {
			kind,
			from,
			to
		};
	});
	if (!Array.isArray(row.entrypoints) || row.entrypoints.length > 500) throw bad("行业入口不能超过 500 项。");
	const entrypoints = row.entrypoints.map((value) => id(value, "业务入口"));
	if (new Set(entrypoints).size !== entrypoints.length) throw bad("业务入口重复。");
	for (const entry of entrypoints) if (!["skill", "work-template"].includes(byId.get(entry)?.kind ?? "")) throw bad("业务入口必须引用存在的 Skill 或工作模板。");
	const title = requiredText(row.title, "行业名称", 120), description = requiredText(row.description, "行业定位", 2e3), domain = requiredText(row.domain, "行业分类", 80), scope = hasScope ? requiredText(row.scope, "业务范围", 80) : domain;
	if (!/^[a-zA-Z0-9_-]{1,64}$/.test(scope)) throw bad("业务范围只能是 1–64 位字母、数字、下划线或连字符。");
	return {
		format: row.format,
		id: id(row.id, "行业标识"),
		title,
		version: row.version,
		domain,
		scope,
		description,
		...row.localized === void 0 ? {} : { localized: localizedFields(row.localized, {
			title,
			description
		}) },
		resources,
		relations,
		entrypoints
	};
}

//#endregion
//#region packages/harness-dsh/src/managed-package-install.ts
const execFileAsync = promisify(execFile);
let installQueue = Promise.resolve();
/** 随附 lock 的每个包只能从 npm 官方源取；与目录构建的收录要求一致。 */
const managedPackageRegistry = "https://registry.npmjs.org/";
const lockKeyPat = /^node_modules\/(?:@[a-z0-9~-][a-z0-9._~-]*\/)?[a-z0-9~-][a-z0-9._~-]*(?:\/node_modules\/(?:@[a-z0-9~-][a-z0-9._~-]*\/)?[a-z0-9~-][a-z0-9._~-]*)*$/i;
const sha512Pat = /^sha512-[A-Za-z0-9+/]{86}==$/;
/**
* 随附 lock 与配方声明逐项核对后才可用于安装：lockfile v3；根只依赖配方包且精确钉到配方版本；
* 顶层条目版本与 integrity 等于配方；其余每个条目键合法、非 link、带 sha512 integrity，resolved 在 npm 官方源下。任何一处不符抛 teloa/forbidden。
*/
function readManagedPackageLock(value, recipe) {
	const missing = () => new WorkError("teloa/forbidden", "该安装包缺少完整的随附依赖锁定。");
	if (!isRecord(value) || value.lockfileVersion !== 3 || typeof value.name !== "string" || typeof value.version !== "string" || !isRecord(value.packages)) throw missing();
	const packages = value.packages, root = packages[""], top = packages[`node_modules/${recipe.package}`];
	const dependencies = isRecord(root) && isRecord(root.dependencies) ? Object.entries(root.dependencies) : [];
	if (dependencies.length !== 1 || dependencies[0][0] !== recipe.package || dependencies[0][1] !== recipe.version || !isRecord(top) || top.version !== recipe.version || top.integrity !== recipe.integrity) throw new WorkError("teloa/forbidden", "该安装包的随附依赖锁定与配方声明不一致。");
	for (const [key, entry] of Object.entries(packages)) {
		if (key === "") continue;
		if (!lockKeyPat.test(key) || !isRecord(entry) || entry.link !== void 0 || typeof entry.version !== "string" || typeof entry.integrity !== "string" || !sha512Pat.test(entry.integrity)) throw missing();
		if (typeof entry.resolved !== "string" || !entry.resolved.startsWith("https://registry.npmjs.org/")) throw new WorkError("teloa/forbidden", "该安装包的随附依赖锁定含非 npm 官方源的下载地址。");
	}
	return value;
}

//#endregion
//#region scripts/市场目录校验.mjs
/** 条目类型 → 目录名：catalog/<目录>/<id>.json 与 artifacts/<目录>/<id>/<version>/，放错目录即失败。 */
const MARKET_KIND_DIRECTORIES = Object.freeze({
	solution: "solutions",
	role: "roles",
	skill: "skills",
	connector: "connectors",
	model: "models"
});
const kindOfDirectory = new Map(Object.entries(MARKET_KIND_DIRECTORIES).map(([kind, directory]) => [directory, kind]));
const entryFilePath = (entry) => `catalog/${MARKET_KIND_DIRECTORIES[entry.kind]}/${entry.id}.json`;
const artifactDirectoryPath = (entry) => `artifacts/${MARKET_KIND_DIRECTORIES[entry.kind]}/${entry.id}/${entry.version}`;
/** 市场仓托管工件的条目：非上游、非引用型（model）。 */
const isHostedEntry = (entry) => entry.delivery !== "upstream" && entry.kind !== "model";
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const canonical = (value) => JSON.stringify(value, (_key, item) => item && typeof item === "object" && !Array.isArray(item) ? Object.fromEntries(Object.keys(item).sort().map((key) => [key, item[key]])) : item);
const safe = (path) => !!path && !path.startsWith("/") && !path.split("/").some((part) => !part || part === "." || part === "..") && !/[\\:?%#\u0000-\u001f\u007f]/.test(path);
const decoder = new TextDecoder("utf-8", { fatal: true });
/** 报错文案：英文优先、中文附后。 */
const message = (en, zh) => `${en} / ${zh}`;
const fail = (en, zh) => {
	throw new Error(message(en, zh));
};
const reason = (error) => error instanceof Error ? error.message : String(error);
const exists = (path) => lstat(path).then(() => true, (error) => {
	if (error?.code === "ENOENT") return false;
	throw error;
});
const listDirectory = async (path) => {
	try {
		return (await readdir(path)).sort();
	} catch (error) {
		if (error?.code === "ENOENT") return [];
		throw error;
	}
};
const MARKET_LICENSE_FILES = ["LICENSE", "LICENSE.txt"];
const normalized = (text) => text.replace(/\s+/g, " ");
const mitBody = (text) => /Permission is hereby granted, free of charge, to any person obtaining a copy/.test(text);
const licenseMatchers = {
	"MIT": (text) => mitBody(text) && /The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software/.test(text),
	"MIT-0": (text) => mitBody(text) && !/The above copyright notice and this permission notice shall be included/.test(text),
	"Apache-2.0": (text) => /Apache License,? Version 2\.0/.test(text),
	"ISC": (text) => /Permission to use, copy, modify, and\/or distribute this software for any purpose with or without fee is hereby granted/.test(text),
	"BSD-2-Clause": (text) => /Redistribution and use in source and binary forms/.test(text) && !/Neither the name/.test(text),
	"BSD-3-Clause": (text) => /Redistribution and use in source and binary forms/.test(text) && /Neither the name/.test(text)
};
/** 许可正文与 SPDX 标识是否相符；返回错误说明，相符时返回 null。 */
function licenseTextProblem(spdx, text) {
	const body = normalized(text);
	const matcher = licenseMatchers[spdx];
	if (matcher) return matcher(body) ? null : message(`the text is not the ${spdx} license`, `正文不是 ${spdx} 许可`);
	if (/https:\/\/\S+/.test(body)) return null;
	if (!spdx.startsWith("LicenseRef-") && body.length >= 1e3) return null;
	return spdx.startsWith("LicenseRef-") ? message(`${spdx} requires a link to the terms (https://…) in the license file`, `${spdx} 须在许可文件里给出条款链接（https://…）`) : message(`${spdx} requires the full license text or a link to the terms (https://…) in the license file`, `${spdx} 须在许可文件里给出完整许可正文或条款链接（https://…）`);
}
/** 读 catalog/<类型目录>/*.json：目录名只能是五个类型目录，文件所在目录必须等于条目 kind，文件名等于条目标识。 */
async function readCatalogEntries(root) {
	const catalogDirectory = join(root, "catalog"), read = [];
	const directories = Object.values(MARKET_KIND_DIRECTORIES).join(",");
	for (const directory of await listDirectory(catalogDirectory)) {
		const kind = kindOfDirectory.get(directory);
		if (!kind) fail(`catalog/${directory} is not a type directory; entries belong in catalog/{${directories}}/`, `catalog/${directory} 不是类型目录；条目只能放在 catalog/{${directories}}/ 下`);
		if (!(await lstat(join(catalogDirectory, directory))).isDirectory()) fail(`catalog/${directory} must be a directory`, `catalog/${directory} 必须是目录`);
		for (const name of await listDirectory(join(catalogDirectory, directory))) {
			const file = `catalog/${directory}/${name}`;
			if (!name.endsWith(".json") || name.startsWith(".")) fail(`${file} is not an entry file; type directories hold only <id>.json`, `${file} 不是条目文件；类型目录里只放 <id>.json`);
			let raw, entry;
			try {
				raw = JSON.parse(await readFile(join(root, file), "utf8"));
			} catch (error) {
				fail(`${file}: ${reason(error)}`, `${file}：${reason(error)}`);
			}
			const range = raw?.compatibility?.teloa;
			if (typeof range === "string") try {
				parseTeloaRange(range);
			} catch {
				const label = typeof raw.id === "string" ? raw.id : file;
				fail(`${label} has an invalid compatibility.teloa range: ${range}`, `${label} 的 compatibility.teloa 范围语法不正确：${range}`);
			}
			try {
				entry = readMarketCatalogEntry(raw);
			} catch (error) {
				fail(`${file}: ${reason(error)}`, `${file}：${reason(error)}`);
			}
			if (name !== entry.id + ".json") fail(`${file} must be named after the entry id: ${entry.id}.json`, `${file} 文件名必须等于条目标识 ${entry.id}.json`);
			if (entry.kind !== kind) fail(`${file} is in the wrong directory: a ${entry.kind} entry belongs at ${entryFilePath(entry)}`, `${file} 放错目录：${entry.kind} 条目应在 ${entryFilePath(entry)}`);
			if (entry.kind === "model" && entry.model.form === "cloud" && entry.model.cloud.provider.kind === "custom") modelEndpointHost(entry);
			read.push({
				entry,
				raw,
				file
			});
		}
	}
	const seen = /* @__PURE__ */ new Map();
	for (const { entry, file } of read) {
		if (seen.has(entry.id)) fail(`${file} duplicates the entry id of ${seen.get(entry.id)}`, `${file} 与 ${seen.get(entry.id)} 条目标识重复`);
		seen.set(entry.id, file);
	}
	return read.sort((left, right) => left.entry.id < right.entry.id ? -1 : left.entry.id > right.entry.id ? 1 : 0);
}
/** 自定义模型端点的主机名；契约只核对 https 前缀，这里解析失败即报条目错误。 */
function modelEndpointHost(entry) {
	const baseURL = entry.model.cloud.provider.baseURL;
	try {
		return new URL(baseURL).hostname;
	} catch {
		fail(`${entry.id} has an unparseable model endpoint: ${baseURL}`, `${entry.id} 的模型接入地址无法解析：${baseURL}`);
	}
}
async function walk(directory, base = directory) {
	const files = [];
	for (const item of (await readdir(directory)).sort()) {
		const absolute = join(directory, item), info = await lstat(absolute), path = relative(base, absolute).split(sep).join("/");
		if (item.startsWith(".")) fail(`${path} is a hidden file; artifacts must not contain dot files (for example .DS_Store)`, `${path} 是隐藏文件；目录工件不收录点文件（例如 .DS_Store）`);
		if (info.isSymbolicLink()) fail(`${path} is a symbolic link`, `${path} 是符号链接`);
		if (info.isDirectory()) {
			files.push(...await walk(absolute, base));
			continue;
		}
		if (!info.isFile()) fail(`${path} is not a regular file`, `${path} 不是普通文件`);
		if (info.mode & 73) fail(`${path} has the executable bit set`, `${path} 带可执行权限`);
		if (MARKET_CATALOG_FORBIDDEN_EXTENSIONS.test(path)) fail(`${path} is an executable script; artifacts must not contain scripts`, `${path} 是可执行脚本，目录工件不收录脚本`);
		if (!safe(path)) fail(`${path} is not a safe path`, `${path} 路径不安全`);
		if (info.size > 2097152) fail(`${path} exceeds 2 MiB`, `${path} 超过 2 MiB`);
		files.push({
			path,
			absolute
		});
	}
	return files;
}
function frontmatter(text, expectedName, label) {
	if (!text.startsWith("---\n")) fail(`${label}: SKILL.md has no frontmatter`, `${label} 的 SKILL.md 缺少 frontmatter`);
	const end = text.indexOf("\n---\n", 4);
	if (end < 0) fail(`${label}: SKILL.md frontmatter is not closed`, `${label} 的 SKILL.md frontmatter 未闭合`);
	const fields = {};
	for (const line of text.slice(4, end).split("\n")) {
		const match = /^([a-z][a-z0-9_-]*): (.+)$/.exec(line);
		if (!match) fail(`${label}: frontmatter allows only single-line name and description: ${line}`, `${label} 的 frontmatter 只允许单行 name 与 description：${line}`);
		if (Object.hasOwn(fields, match[1])) fail(`${label}: duplicate frontmatter field ${match[1]}`, `${label} 的 frontmatter 字段重复：${match[1]}`);
		fields[match[1]] = match[2].replace(/^"(.*)"$/, "$1");
	}
	const keys = Object.keys(fields).sort().join(",");
	if (keys !== "description,name") fail(`${label}: frontmatter allows only name and description, found ${keys}`, `${label} 的 frontmatter 只允许 name 与 description，实际为 ${keys}`);
	if (fields.name !== expectedName) fail(`${label}: SKILL.md name does not match the entry's skill name`, `${label} 的 SKILL.md name 与条目技能名不一致`);
	if (!fields.description.trim() || fields.description.length > 1024) fail(`${label}: description must be non-empty and at most 1024 characters`, `${label} 的 description 必须非空且不超过 1024 字`);
	if (!text.slice(end + 5).trim()) fail(`${label}: SKILL.md body is empty`, `${label} 的 SKILL.md 正文为空`);
}
function verifyLicenseFiles(entry, fileBytes) {
	const present = MARKET_LICENSE_FILES.filter((name) => fileBytes.has(name));
	const names = MARKET_LICENSE_FILES.join(" or "), namesZh = MARKET_LICENSE_FILES.join(" 或 ");
	if (!present.length) fail(`${entry.id}: hosted artifact has no license file; ${artifactDirectoryPath(entry)}/ must contain ${names}`, `${entry.id} 的托管工件缺少许可文件：${artifactDirectoryPath(entry)}/ 根下须有 ${namesZh}`);
	for (const name of present) {
		if (!entry.license.files.includes(name)) fail(`${entry.id}: license file ${name} must be listed in the entry's license.files`, `${entry.id} 的许可文件 ${name} 须列在条目 license.files 里`);
		const problem = licenseTextProblem(entry.license.spdx, decoder.decode(fileBytes.get(name)));
		if (problem) fail(`${entry.id}: ${name} does not match the entry license ${entry.license.spdx}: ${problem}`, `${entry.id} 的 ${name} 与条目许可 ${entry.license.spdx} 不符：${problem}`);
	}
}
/** artifacts/ 下只放托管条目：类型目录固定，<id> 必须是该类型的托管条目；历史版本目录同样须自带许可文件。 */
async function verifyArtifactTree(root, hosted) {
	const byDirectory = /* @__PURE__ */ new Map();
	for (const entry of hosted) {
		const directory = MARKET_KIND_DIRECTORIES[entry.kind];
		if (!byDirectory.has(directory)) byDirectory.set(directory, /* @__PURE__ */ new Set());
		byDirectory.get(directory).add(entry.id);
	}
	for (const directory of await listDirectory(join(root, "artifacts"))) {
		const ids = byDirectory.get(directory);
		if (!kindOfDirectory.has(directory) || directory === "models") fail(`artifacts/${directory} is not a hosted type directory; artifacts belong in artifacts/{solutions,roles,skills,connectors}/`, `artifacts/${directory} 不是托管类型目录；工件只能放在 artifacts/{solutions,roles,skills,connectors}/ 下`);
		for (const id of await listDirectory(join(root, "artifacts", directory))) {
			if (!ids?.has(id)) fail(`artifacts/${directory}/${id} has no matching hosted ${kindOfDirectory.get(directory)} entry (upstream entries are not hosted)`, `artifacts/${directory}/${id} 没有对应的 ${kindOfDirectory.get(directory)} 托管条目（上游条目不托管副本）`);
			for (const version of await listDirectory(join(root, "artifacts", directory, id))) {
				const base = join(root, "artifacts", directory, id, version);
				if (!(await lstat(base)).isDirectory()) fail(`artifacts/${directory}/${id}/${version} must be a version directory`, `artifacts/${directory}/${id}/${version} 必须是版本目录`);
				if (!(await Promise.all(MARKET_LICENSE_FILES.map((name) => exists(join(base, name))))).some(Boolean)) fail(`artifacts/${directory}/${id}/${version} has no license file (${MARKET_LICENSE_FILES.join(" or ")})`, `artifacts/${directory}/${id}/${version} 缺少许可文件（${MARKET_LICENSE_FILES.join(" 或 ")}）`);
			}
		}
	}
}
/**
* 校验整个目录源，返回全部条目（含上游）与应用快照所需的索引、文件字节。
* generateLock(recipe,lockPath)：stdio 连接器缺随附 lock 时的生成钩子；不给则缺 lock 直接失败（--check 与市场仓校验器）。
* allowNullDigest：本机通用模型（Ollama）变体允许 digest 为 null（发布前由 scripts/核实Ollama条目摘要.mjs --write 填写）；默认拒绝。
*/
async function validateMarketplace(root, { generateLock, allowNullDigest = false } = {}) {
	const read = await readCatalogEntries(root);
	const hosted = read.map((item) => item.entry).filter(isHostedEntry);
	const rawById = new Map(read.map((item) => [item.entry.id, item.raw]));
	const official = read.map((item) => item.entry).filter((entry) => entry.delivery !== "upstream");
	const entries = [], files = {};
	const skillOwners = /* @__PURE__ */ new Map();
	const claimSkillName = (skillName, entryId) => {
		const owner = skillOwners.get(skillName);
		if (owner && owner !== entryId) fail(`${entryId}: skill ${skillName} has the same name as ${owner}; skill names must be unique within a host, rename it`, `${entryId} 的技能 ${skillName} 与 ${owner} 重名；同一宿主内技能名必须唯一，请改名`);
		skillOwners.set(skillName, entryId);
	};
	const solutionsByPackage = new Map(official.filter((entry) => entry.kind === "solution").map((entry) => [entry.solution.packageId, entry]));
	const connectorsByServer = new Map(official.filter((entry) => entry.kind === "connector").map((entry) => [entry.connector.serverName, entry]));
	const localNames = /* @__PURE__ */ new Map();
	for (const entry of official) {
		if (entry.kind === "model" && entry.model.form === "local-general") for (const variant of entry.model.variants) {
			const name = variant.sources[0].name;
			if (localNames.has(name)) fail(`duplicate Ollama model name ${name} (${localNames.get(name)} and ${entry.id})`, `Ollama 模型名称重复：${name}（${localNames.get(name)} 与 ${entry.id}）`);
			localNames.set(name, entry.id);
			if (variant.sources[0].digest === null && !allowNullDigest) fail(`${entry.id}: ${name} has no source digest; run node scripts/核实Ollama条目摘要.mjs --write first`, `${entry.id} 的 ${name} 缺少来源摘要；先运行 node scripts/核实Ollama条目摘要.mjs --write`);
		}
		if (entry.kind === "model") {
			entries.push({
				...entry,
				artifact: null
			});
			continue;
		}
		const artifactRoot = join(root, artifactDirectoryPath(entry));
		const stdioConnector = entry.kind === "connector" && entry.connector.recipe.transport === "stdio";
		if (stdioConnector) {
			const lockPath = join(artifactRoot, "package-lock.json");
			if (!await exists(lockPath)) {
				if (!generateLock) fail(`${entry.id} has no bundled dependency lock package-lock.json; run pnpm build:market-catalog to generate it`, `${entry.id} 缺少随附依赖锁定 package-lock.json：运行 pnpm build:market-catalog 生成`);
				try {
					await generateLock(entry.connector.recipe, lockPath);
				} catch (error) {
					const detail = error?.stderr?.toString().trim() || error?.message || String(error);
					fail(`${entry.id}: failed to generate package-lock.json: ${detail}`, `${entry.id} 的 package-lock.json 生成失败：${detail}`);
				}
			}
		}
		let listed;
		try {
			listed = await walk(artifactRoot);
		} catch (error) {
			if (error?.code === "ENOENT") fail(`${entry.id} has no artifact directory ${artifactDirectoryPath(entry)}`, `${entry.id} 缺少工件目录 ${artifactDirectoryPath(entry)}`);
			throw error;
		}
		if (!listed.length || listed.length > 500) fail(`${entry.id}: artifact must contain between 1 and 500 files`, `${entry.id} 工件文件数必须在 1–500 之间`);
		const artifactFiles = [];
		let total = 0;
		const fileBytes = /* @__PURE__ */ new Map();
		for (const file of listed) {
			const bytes = await readFile(file.absolute);
			total += bytes.byteLength;
			if (total > 20971520) fail(`${entry.id}: artifact exceeds 20 MiB in total`, `${entry.id} 工件总大小超过 20 MiB`);
			if (entry.kind === "skill" && file.path === "SKILL.md") {
				frontmatter(decoder.decode(bytes), entry.skill.name, entry.id);
				claimSkillName(entry.skill.name, entry.id);
			}
			artifactFiles.push({
				path: file.path,
				sha256: sha256(bytes),
				size: bytes.byteLength
			});
			files[entry.id + "/" + entry.version + "/" + file.path] = bytes.toString("base64");
			fileBytes.set(file.path, bytes);
		}
		verifyLicenseFiles(entry, fileBytes);
		if (stdioConnector) {
			const bytes = fileBytes.get("package-lock.json");
			if (!bytes) fail(`${entry.id}: package-lock.json is missing`, `${entry.id} 的 package-lock.json 缺失`);
			try {
				readManagedPackageLock(JSON.parse(decoder.decode(bytes)), entry.connector.recipe);
			} catch (error) {
				fail(`${entry.id}: package-lock.json is invalid: ${reason(error)}`, `${entry.id} 的 package-lock.json 无效：${reason(error)}`);
			}
		}
		if (entry.kind === "solution") {
			const manifestBytes = fileBytes.get("teloa.json");
			if (!manifestBytes) fail(`${entry.id} has no root teloa.json`, `${entry.id} 缺少根目录 teloa.json`);
			let manifest;
			try {
				manifest = validateManifest(JSON.parse(decoder.decode(manifestBytes)));
			} catch (error) {
				fail(`${entry.id}: teloa.json is invalid: ${reason(error)}`, `${entry.id} 的 teloa.json 无效：${reason(error)}`);
			}
			if (manifest.id !== entry.solution.packageId) fail(`${entry.id}: teloa.json id (${manifest.id}) does not match solution.packageId (${entry.solution.packageId})`, `${entry.id} 的 teloa.json id（${manifest.id}）与条目 solution.packageId（${entry.solution.packageId}）不一致`);
			if (manifest.scope !== entry.solution.scope) fail(`${entry.id}: teloa.json scope (${manifest.scope}) does not match solution.scope (${entry.solution.scope})`, `${entry.id} 的 teloa.json scope（${manifest.scope}）与条目 solution.scope（${entry.solution.scope}）不一致`);
			if (!isMarketIndustryRoot(manifest.domain)) fail(`${entry.id}: teloa.json domain (${manifest.domain}) is not a valid top-level industry key`, `${entry.id} 的 teloa.json domain（${manifest.domain}）不是合法的一级行业键。`);
			if (!entry.taxonomy.industries.some((ind) => {
				return (ind.includes("/") ? ind.split("/")[0] : ind) === manifest.domain;
			})) fail(`${entry.id}: taxonomy.industries (${JSON.stringify(entry.taxonomy.industries)}) does not match domain (${manifest.domain}); at least one industry key must start with the domain`, `${entry.id} 的 taxonomy.industries（${JSON.stringify(entry.taxonomy.industries)}）与 domain（${manifest.domain}）不一致，至少一个行业键的一级应等于 domain。`);
			for (const resource of manifest.resources) if (resource.required && resource.source.kind === "local" && !fileBytes.has(resource.source.path)) fail(`${entry.id} is missing the required resource file ${resource.source.path} listed in the manifest`, `${entry.id} 缺少清单中必需的资源文件 ${resource.source.path}`);
			for (const resource of manifest.resources) {
				if (resource.kind !== "mcp" || resource.source.kind !== "local") continue;
				if (!fileBytes.has(resource.source.path)) fail(`${entry.id}: connection definition file ${resource.source.path} of ${resource.id} does not exist`, `${entry.id} 的 ${resource.id} 的连接声明文件 ${resource.source.path} 不存在`);
				let definition;
				try {
					definition = readIndustryMcpConnectionDefinition(JSON.parse(decoder.decode(fileBytes.get(resource.source.path))));
				} catch (error) {
					fail(`${entry.id}: connection definition of ${resource.id} is invalid: ${reason(error)}`, `${entry.id} 的 ${resource.id} 的连接声明无效：${reason(error)}`);
				}
				const connector = connectorsByServer.get(definition.serverName);
				if (!connector) fail(`${entry.id}: connection server ${definition.serverName} of ${resource.id} is not a catalog connector`, `${entry.id} 的 ${resource.id} 的连接服务 ${definition.serverName} 不在目录连接器里`);
				for (const tool of definition.tools) {
					const declared = connector.connector.tools.find((item) => item.name === tool);
					if (!declared) fail(`${entry.id}: tool ${tool} declared by ${resource.id} is not in the tool list of connector ${connector.id}`, `${entry.id} 的 ${resource.id} 声明的工具 ${tool} 不在连接器 ${connector.id} 的工具清单里`);
					if (declared.readOnly) continue;
					const roles = manifest.relations.filter((relation) => relation.kind === "role-connection" && relation.to === resource.id).map((relation) => manifest.resources.find((item) => item.id === relation.from && item.kind === "role"));
					const confirmed = (role) => {
						if (role?.source.kind !== "local" || !fileBytes.has(role.source.path)) return false;
						try {
							const points = JSON.parse(decoder.decode(fileBytes.get(role.source.path)))?.responsibility?.confirmationPoints;
							return Array.isArray(points) && points.some((point) => typeof point === "string" && point.split(/[^A-Za-z0-9_-]+/).includes(tool));
						} catch {
							return false;
						}
					};
					if (!roles.length || !roles.every(confirmed)) fail(`${entry.id}: tool ${tool} declared by ${resource.id} is not read-only; every linked role must name ${tool} (as a whole token) in its confirmationPoints`, `${entry.id} 的 ${resource.id} 声明的工具 ${tool} 不是只读工具：须在每个关联岗位的 confirmationPoints 里写明工具名 ${tool} 的确认点（须作为完整记号出现）`);
				}
			}
			for (const [path, bytes] of fileBytes) {
				const match = /^skills\/([^/]+)\/SKILL\.md$/.exec(path);
				if (match) {
					frontmatter(decoder.decode(bytes), match[1], entry.id + "/skills/" + match[1]);
					claimSkillName(match[1], entry.id);
				}
			}
		}
		if (entry.kind === "role") {
			if ([...fileBytes.keys()].some((path) => path !== "role.json" && path !== "README.md" && !MARKET_LICENSE_FILES.includes(path))) fail(`${entry.id}: artifact may contain only role.json, README.md and the license file`, `${entry.id} 的工件只允许 role.json、README.md 与许可文件`);
			const roleBytes = fileBytes.get("role.json");
			if (!roleBytes) fail(`${entry.id} has no role.json`, `${entry.id} 缺少 role.json`);
			const solution = solutionsByPackage.get(entry.role.fromSolution.packageId);
			if (!solution) fail(`${entry.id}: source solution entry not found (packageId ${entry.role.fromSolution.packageId})`, `${entry.id} 找不到来源方案条目（packageId ${entry.role.fromSolution.packageId}）`);
			if (entry.version !== solution.version || entry.role.fromSolution.version !== solution.version) fail(`${entry.id}: version (${entry.version}) must equal the source solution entry version (${solution.id}@${solution.version}); bump the role entry whenever the solution's roles/<id>.json changes`, `${entry.id} 的版本（${entry.version}）必须等于所指方案条目版本（${solution.id}@${solution.version}）：方案 roles/<id>.json 变更时 role 条目版本须同步递增`);
			if (entry.role.scope !== solution.solution.scope) fail(`${entry.id}: scope does not match the source solution (entry ${entry.role.scope}, ${solution.id} is ${solution.solution.scope})`, `${entry.id} 的 scope 与所属方案不一致（条目 ${entry.role.scope}，${solution.id} 为 ${solution.solution.scope}）`);
			if (entry.role.fromSolution.path !== "roles/" + entry.role.roleId + ".json") fail(`${entry.id}: fromSolution.path must be roles/${entry.role.roleId}.json (matching roleId), found ${entry.role.fromSolution.path}`, `${entry.id} 的 fromSolution.path 必须是 roles/${entry.role.roleId}.json（与 roleId 对应），实为 ${entry.role.fromSolution.path}`);
			let sourceBytes;
			try {
				sourceBytes = await readFile(join(root, artifactDirectoryPath(solution), entry.role.fromSolution.path));
			} catch {
				fail(`${entry.id}: source solution has no ${entry.role.fromSolution.path}`, `${entry.id} 的来源方案缺少 ${entry.role.fromSolution.path}`);
			}
			if (!Buffer.from(roleBytes).equals(sourceBytes)) fail(`${entry.id}: role.json differs byte-for-byte from ${solution.id}@${solution.version}/${entry.role.fromSolution.path}`, `${entry.id} 的 role.json 与方案 ${solution.id}@${solution.version}/${entry.role.fromSolution.path} 字节不一致`);
			let parsed;
			try {
				parsed = JSON.parse(decoder.decode(roleBytes));
			} catch {
				fail(`${entry.id}: role.json is not valid JSON`, `${entry.id} 的 role.json 不是合法 JSON`);
			}
			if (parsed?.format !== "teloa.role/v1") fail(`${entry.id}: role.json must be teloa.role/v1`, `${entry.id} 的 role.json 必须是 teloa.role/v1`);
			const { format: _format, ...definition } = parsed;
			if (canonical(definition) !== canonical(rawById.get(entry.id).role.definition)) fail(`${entry.id}: definition does not match role.json`, `${entry.id} 的 definition 与 role.json 不一致`);
		}
		entries.push({
			...entry,
			artifact: {
				files: artifactFiles,
				treeHash: marketCatalogTreeHash(artifactFiles, sha256)
			}
		});
	}
	await verifyArtifactTree(root, hosted);
	entries.sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
	const catalogVersion = (await readFile(join(root, "catalog-version.txt"), "utf8")).trim();
	const index = {
		format: "teloa.market-catalog/v1",
		catalogVersion,
		entries
	};
	readMarketCatalogIndex(index, sha256);
	return {
		all: read.map((item) => item.entry),
		catalogVersion,
		index,
		files
	};
}
/** v1 条目投影：词表外的行业二级键降为一级键（去重），其余字段不变。 */
function v1Entry(entry) {
	const industries = [...new Set(entry.taxonomy.industries.map((key) => MARKET_INDEX_V1_INDUSTRIES.includes(key) ? key : marketIndustryParent(key)))];
	if (industries.some((key) => !MARKET_INDEX_V1_INDUSTRIES.includes(key))) fail(`${entry.id}: industry key cannot be mapped to the frozen v1 vocabulary`, `${entry.id} 的行业键无法映射到 v1 冻结词表`);
	return {
		...entry,
		taxonomy: {
			...entry.taxonomy,
			industries
		}
	};
}
/** 读取目录源，同一批条目组装两份索引：v1 冻结只收三类，且排除 OAuth 连接器（旧版读取器只认 {kind, reason}，
*  supported 字段会使其整份拒收；旧版应用也无法发起授权）；v2 收全部。两份都不收无上游来源的 Teloa 内置技能
*  （只随发行快照提供；契约读取器同样拒收）。字节固定（无时间戳），重复生成一致。
*  条目结构沿用契约读取器；工件字节级校验由 validateMarketplace 负责，这里只核对托管工件目录存在。 */
async function buildMarketIndexes(root) {
	const all = (await readCatalogEntries(root)).map((item) => item.entry);
	for (const entry of all.filter(isHostedEntry)) try {
		await access(join(root, artifactDirectoryPath(entry)));
	} catch {
		fail(`${entry.id} has no artifact directory ${artifactDirectoryPath(entry)}`, `${entry.id} 缺少工件目录 ${artifactDirectoryPath(entry)}`);
	}
	const entries = all.filter((entry) => !(entry.kind === "skill" && entry.delivery !== "upstream" && entry.upstream === null));
	const catalogVersion = (await readFile(join(root, "catalog-version.txt"), "utf8")).trim();
	const v1Index = readMarketIndex({
		format: "teloa.market-index/v1",
		catalogVersion,
		entries: entries.filter((entry) => MARKET_INDEX_V1_KINDS.includes(entry.kind) && !(entry.kind === "connector" && entry.connector.auth.kind === "oauth")).map(v1Entry)
	});
	const v2Index = assembleMarketIndexV2({
		format: "teloa.market-index/v2",
		catalogVersion,
		entries
	});
	const pack = (index) => ({
		index,
		bytes: Buffer.from(JSON.stringify(index), "utf8")
	});
	return {
		v1: pack(v1Index),
		v2: pack(v2Index)
	};
}
function entryTitle(entry) {
	return entry.kind === "skill" ? entry.skill.title : entry.kind === "solution" ? entry.solution.title : entry.kind === "connector" ? entry.connector.title : entry.kind === "role" ? entry.role.title : entry.model.title;
}
const upstreamLabel = (upstream) => upstream.kind === "clawhub" ? `ClawHub ${upstream.owner}/${upstream.slug}@${upstream.version}` : `GitHub ${upstream.repository.owner}/${upstream.repository.repo}`;
const upstreamLocation = (upstream) => upstream.kind === "clawhub" ? `ClawHub ${upstream.owner}/${upstream.slug} version ${upstream.version}` : `https://github.com/${upstream.repository.owner}/${upstream.repository.repo}/tree/${upstream.commit}/${upstream.path}`;
const cell = (value) => String(value).replaceAll(/[|\[\]\\]/g, (match) => "\\" + match).replaceAll("\n", " ");
const SECTIONS = [
	["solution", "Solutions · 方案"],
	["role", "AI teammates · AI 同事"],
	["skill", "Skills · 技能"],
	["connector", "Connectors · 连接器"],
	["model", "Models · 模型"]
];
/** INDEX.md：按类型分节的全条目表（名称、ID、来源、许可、兼容状态、版本、条目文件链接）。 */
function renderIndexMarkdown(all, catalogVersion) {
	const source = (entry) => entry.delivery === "upstream" ? `Upstream · ${upstreamLabel(entry.upstream)}` : entry.kind === "skill" && entry.upstream ? `Teloa · from ${upstreamLabel(entry.upstream)}` : "Teloa";
	const lines = [
		"# Catalog index · 目录索引",
		"",
		`_Generated from \`catalog/\` by \`node tools/validate.mjs --write\` (source repository: \`pnpm build:market-catalog\`); do not edit by hand. ${all.length} entries, catalog version ${catalogVersion}. Browse and search: https://market.teloa.ai_`,
		"",
		"_由 `catalog/` 自动生成，请勿手改。在线浏览与搜索：https://market.teloa.ai_",
		""
	];
	for (const [kind, heading] of SECTIONS) {
		const entries = all.filter((entry) => entry.kind === kind);
		if (!entries.length) continue;
		lines.push(`## ${heading} (${entries.length})`, "", "| Name · 名称 | ID | Source · 来源 | License · 许可 | Compatibility · 兼容 | Version · 版本 | Entry · 条目 |", "| --- | --- | --- | --- | --- | --- | --- |");
		for (const entry of entries) {
			const title = entryTitle(entry), file = entryFilePath(entry);
			const links = `[${file}](${file})` + (isHostedEntry(entry) ? ` · [files](${artifactDirectoryPath(entry)}/)` : "");
			lines.push(`| ${cell(title.en)} · ${cell(title["zh-CN"])} | \`${entry.id}\` | ${cell(source(entry))} | ${cell(entry.license.spdx)} | ${entry.compatibility.status} | ${cell(entry.version)} | ${links} |`);
		}
		lines.push("");
	}
	return lines.join("\n");
}
/** NOTICE：仓库许可说明，加上全部托管工件与上游条目的署名与许可。 */
function renderNotice(all) {
	const hosted = all.filter(isHostedEntry), upstream = all.filter((entry) => entry.delivery === "upstream");
	const lines = [
		"Teloa Official Marketplace Catalog",
		"Copyright 2026 Teloa contributors",
		"",
		"Catalog metadata, documentation and Teloa-authored artifacts in this repository",
		"are licensed under the Apache License, Version 2.0 (see LICENSE).",
		"",
		"Third-party material keeps its own copyright and license. Every hosted artifact",
		"directory (artifacts/<type>/<id>/<version>/) ships its own license file.",
		"Upstream entries are metadata only: their files are fetched from the pinned",
		"source when added and are not stored in this repository.",
		"",
		"LicenseRef-*-Terms identifiers on connectors name the terms of a remote service,",
		"not a license for content in this repository.",
		"",
		"This file is generated from catalog/ by tools/validate.mjs; do not edit by hand.",
		"",
		`== Hosted artifacts (${hosted.length}) ==`,
		""
	];
	for (const entry of hosted) {
		const attribution = entry.kind === "skill" && entry.upstream ? `${entry.upstream.author} (${upstreamLocation(entry.upstream)})` : entry.kind === "connector" ? `Teloa contributors; connects to ${entry.connector.recipe.transport === "stdio" ? `npm package ${entry.connector.recipe.package}@${entry.connector.recipe.version}` : entry.connector.upstreamUrl}` : "Teloa contributors";
		lines.push(`${entry.id}@${entry.version}  ${artifactDirectoryPath(entry)}/`, `  Attribution: ${attribution}`, `  License: ${entry.license.spdx} (${entry.license.files.join(", ")})`, "");
	}
	lines.push(`== Upstream entries, not hosted (${upstream.length}) ==`, "");
	for (const entry of upstream) lines.push(`${entry.id}@${entry.version}`, `  Source: ${upstreamLocation(entry.upstream)}`, `  License: ${entry.license.spdx}`, "");
	return lines.join("\n");
}
/** 目录源里应与 catalog/ 一致的生成文件：路径（相对目录根）→ 期望内容。 */
function generatedMarketplaceFiles(all, catalogVersion) {
	return {
		"INDEX.md": renderIndexMarkdown(all, catalogVersion),
		"NOTICE": renderNotice(all)
	};
}

//#endregion
//#region scripts/市场仓校验器入口.mjs
const args = process.argv.slice(2);
const write = args.includes("--write");
const at = args.indexOf("--root");
const root = at < 0 ? resolve(dirname(fileURLToPath(import.meta.url)), "..") : resolve(args[at + 1]);
try {
	const { all, catalogVersion } = await validateMarketplace(root);
	await buildMarketIndexes(root);
	const drifted = [];
	for (const [path, content] of Object.entries(generatedMarketplaceFiles(all, catalogVersion))) {
		if (await readFile(join(root, path), "utf8").catch(() => null) === content) continue;
		if (write) await writeFile(join(root, path), content);
		else drifted.push(path);
	}
	if (drifted.length) throw new Error(`${drifted.join(", ")} out of date; run node tools/validate.mjs --write / 与 catalog/ 不一致，请运行 node tools/validate.mjs --write`);
	console.log(`Marketplace catalog OK / 目录校验通过: ${all.length} entries, catalog version ${catalogVersion}${write ? "; INDEX.md and NOTICE up to date" : ""}.`);
} catch (error) {
	console.error("Marketplace validation failed / 目录校验失败: " + (error instanceof Error ? error.message : String(error)));
	process.exit(1);
}

//#endregion
export {  };