#!/usr/bin/env node
// GENERATED FILE - DO NOT EDIT. / 生成文件，请勿手改。
// Built in teloa-ai/teloa from scripts/市场目录校验.mjs and packages/contract by `node scripts/生成市场仓校验器.mjs`
// (pnpm build:market-validator). Validation rules are maintained only in that repository.
// Source commit: 33209f3c767bfa3c0b283382e82cdfab921cb048
// Usage: node tools/validate.mjs [--write | --pr] [--format text|json|github]   (--write regenerates INDEX.md and NOTICE; --pr skips them for pull requests; json/github for automated review)
import { access, lstat, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync } from "node:fs";

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
const bad$16 = (message) => new WorkError("teloa/invalid-input", message);
/**
* 读取并校验 taxonomy 对象。
* - 只接受 functions、industries 两个键。
* - functions：1–2 个，去重，全为已知键。
* - industries：1–4 个，去重，全为已知键。
* - 遇到未知键、数量违规、重复键或多余属性，抛 WorkError('teloa/invalid-input', …)。
*/
function readMarketTaxonomy(value) {
	if (!isRecord(value)) throw bad$16("taxonomy 格式不正确。");
	if (Object.keys(value).length !== 2 || !Object.hasOwn(value, "functions") || !Object.hasOwn(value, "industries")) throw bad$16("taxonomy 只能包含 functions 与 industries 两个键。");
	const rawFn = value.functions;
	const rawInd = value.industries;
	if (!Array.isArray(rawFn) || rawFn.length < 1 || rawFn.length > 2) throw bad$16("taxonomy.functions 必须是 1–2 个功能键。");
	if (!Array.isArray(rawInd) || rawInd.length < 1 || rawInd.length > 4) throw bad$16("taxonomy.industries 必须是 1–4 个行业键。");
	const fnKeys = rawFn;
	for (const k of fnKeys) if (!marketFunctionKeys.includes(k)) throw bad$16("taxonomy.functions 包含未知键：" + String(k));
	if (new Set(fnKeys).size !== fnKeys.length) throw bad$16("taxonomy.functions 不能有重复键。");
	const indKeys = rawInd;
	for (const k of indKeys) if (!marketIndustryKeys.includes(k)) throw bad$16("taxonomy.industries 包含未知键：" + String(k));
	if (new Set(indKeys).size !== indKeys.length) throw bad$16("taxonomy.industries 不能有重复键。");
	return {
		functions: [...fnKeys],
		industries: [...indKeys]
	};
}
/** 目录条目类型第一层（规格 §4）：应用 MARKET_CATEGORIES 与网站 kindLabel 的相对顺序都以此为准。 */
const marketEntryKinds = [
	"solution",
	"dashboard",
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
const token$1 = (value, max) => typeof value === "string" && value.length > 0 && value.length <= max && value.trim() === value && !/[\s\x00-\x1f\x7f]/.test(value);
function readModelReference(value) {
	const row = fields(value, [
		"provider",
		"model",
		"reasoningEffort"
	]);
	if (!token$1(row.provider, 128) || !token$1(row.model, 256) || row.reasoningEffort !== void 0 && !token$1(row.reasoningEffort, 128)) throw new WorkError("teloa/invalid-input", "请选择有效的模型。");
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
	if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some((key) => !keys.includes(key))) throw new WorkError("teloa/invalid-input", "员工请求包含未知字段或格式不正确。");
	return value;
}
function readRoleRuntimeConfig(value) {
	const source = roleInput(value, [
		"agentPresetId",
		"model",
		"fallbackModel"
	]);
	if (!Object.keys(source).length || source.agentPresetId !== void 0 && (typeof source.agentPresetId !== "string" || !/^[a-z0-9][-a-z0-9]{0,119}$/.test(source.agentPresetId))) throw new WorkError("teloa/invalid-input", "员工运行配置不合法。");
	const model = source.model === void 0 ? void 0 : readModelReference(source.model), fallbackModel = source.fallbackModel === void 0 ? void 0 : readModelReference(source.fallbackModel);
	if (model && fallbackModel && sameModelRoute(model, fallbackModel)) throw new WorkError("teloa/invalid-input", "备用模型不能与首选模型相同。");
	const result = {
		...source.agentPresetId === void 0 ? {} : { agentPresetId: source.agentPresetId },
		...model ? { model } : {},
		...fallbackModel ? { fallbackModel } : {}
	};
	if (!Object.keys(result).length) throw new WorkError("teloa/invalid-input", "员工运行配置不合法。");
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
		throw new WorkError("teloa/invalid-input", "员工职责、范围或能力声明不合法。");
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
const bad$15 = (message) => new WorkError("teloa/invalid-input", message);
function parse(version) {
	const match = semverPattern.exec(version);
	if (!match) throw bad$15("版本号格式不正确：" + version);
	return {
		main: [
			Number(match[1]),
			Number(match[2]),
			Number(match[3])
		],
		pre: match[4] === void 0 ? null : match[4].split(".")
	};
}
function compareIdentifiers(a, b) {
	const na = /^\d+$/.test(a), nb = /^\d+$/.test(b);
	if (na && nb) {
		const x = Number(a), y = Number(b);
		return x < y ? -1 : x > y ? 1 : 0;
	}
	if (na) return -1;
	if (nb) return 1;
	return a < b ? -1 : a > b ? 1 : 0;
}
function compareSemver(a, b) {
	const left = parse(a), right = parse(b);
	for (let at = 0; at < 3; at += 1) {
		if (left.main[at] < right.main[at]) return -1;
		if (left.main[at] > right.main[at]) return 1;
	}
	if (left.pre === null && right.pre === null) return 0;
	if (left.pre === null) return 1;
	if (right.pre === null) return -1;
	const length = Math.max(left.pre.length, right.pre.length);
	for (let at = 0; at < length; at += 1) {
		const x = left.pre[at], y = right.pre[at];
		if (x === void 0) return -1;
		if (y === void 0) return 1;
		const result = compareIdentifiers(x, y);
		if (result !== 0) return result;
	}
	return 0;
}
/** 解析范围；`*` 返回空数组（恒满足）。语法错误抛 teloa/invalid-input。 */
function parseTeloaRange(range) {
	const trimmed = range.trim();
	if (!trimmed) throw bad$15("版本范围不能为空。");
	if (trimmed === "*") return [];
	return trimmed.split(/\s+/).map((part) => {
		const match = /^(>=|>|<=|<|=)?(.+)$/.exec(part);
		if (!match) throw bad$15("版本范围格式不正确：" + part);
		const version = match[2];
		parse(version);
		return {
			op: match[1] ?? "=",
			version
		};
	});
}
/** 本机版本是否满足范围；范围或版本语法错误一律返回 false（读取器据此把条目计入 newerApp）。 */
function teloaRangeSatisfies(range, version) {
	let comparators;
	try {
		comparators = parseTeloaRange(range);
		parse(version);
	} catch {
		return false;
	}
	return comparators.every(({ op, version: target }) => {
		const result = compareSemver(version, target);
		return op === ">=" ? result >= 0 : op === ">" ? result > 0 : op === "<=" ? result <= 0 : op === "<" ? result < 0 : result === 0;
	});
}
/** 范围是否有不低于 minimum 的下界（>=、>、=）：用于新字段的版本闸，把不认识新字段的旧版应用排除在兼容范围外。语法错误抛 teloa/invalid-input。 */
function teloaRangeHasLowerBound(range, minimum) {
	return parseTeloaRange(range).some(({ op, version }) => op !== "<=" && op !== "<" && compareSemver(version, minimum) >= 0);
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
const skillSecretMethods = [
	"GET",
	"POST",
	"PUT",
	"PATCH",
	"DELETE"
];
/** 记录里保存声明指纹的保留槽：不是密钥值，契约禁止声明同名变量，known-values 排除它。 */
const skillSecretBindingSlot = "TELOA_BINDING_SHA256";
/** 带 `secrets` 的条目依赖的宿主工具（计划关键决定 9）。 */
const skillSecretHttpTool = "teloa_skill_http";
/** 带 `secrets` 的条目 `compatibility.teloa` 不得接受的最后一个旧版：旧应用不认识 secrets，读到会当作未知字段整份拒绝。 */
const skillSecretLastUnsupportedTeloa = "0.2.0-alpha.6";
/**
* 目录扩展字段的统一版本闸（规格 2026-09-27 §3）：使用 `httpGuide`、`secretGroup`、`secrets[].allowHeaders`、含 `_` 的注入头名、
* 连接器 `header`/`basic` 变量、`instructionsMaxBytes`、stdio `args` 的 `${NAME}` 引用之一的条目，`compatibility.teloa` 不得满足此版本。
* 旧读取器按 exact 键整份拒收未知字段，版本闸与 v1 过滤（`marketEntryNeedsV2`）是唯一不让旧应用整份读不了索引的办法。
*/
const catalogExtensionsLastUnsupportedTeloa = "0.2.0-alpha.6";
/** GitHub 目录添加与审核文件过滤从此版本提供；发布与生成共用，发版前须复核。 */
const githubCatalogMinimumTeloa = "0.2.0-alpha.7";
/** 推荐替代（`alternatives[].recommended`）与连接器其他来源（`alternatives`）从此版本提供：旧版 v2 读取器按未知字段整份拒收，条目须用兼容下界排除旧版；发布与生成共用，发版前须复核。 */
const marketAlternativesMinimumTeloa = "0.2.0-alpha.7";
/** 二次开发资源（`derivation`）、install 条目原版文件摘要与许可映射（`upstream.files[].sha256|repositoryPath`）、安装量来源（`origin.installsSource`）从此版本提供：
*  旧版读取器按未知字段整份拒收，条目须用兼容下界排除旧版，且不进 v1 索引；发布与生成共用，发版前须复核。 */
const marketDerivativeMinimumTeloa = "0.2.0-alpha.7";
/** 二次开发修改七类，互斥、按此顺序取优先（security > fixed > removed > adapted > added > improved > localized）。 */
const marketDerivativeChangeTypes = [
	"security",
	"fixed",
	"removed",
	"adapted",
	"added",
	"improved",
	"localized"
];
/** 二期本机模型（模型二期规格 §4）：Ollama 唯一运行时；名称必须带 tag，digest 为 registry 清单摘要或 null（发布前由脚本填写）。 */
const ollamaModelNamePattern = /^[a-z0-9][a-z0-9._-]*:[a-z0-9._-]+$/;
const ollamaDigestPattern = /^sha256:[0-9a-f]{64}$/;
const bad$14 = (message) => new WorkError("teloa/invalid-input", message);
const exact$9 = (value, keys, label) => {
	if (!isRecord(value) || Object.keys(value).length !== keys.length || keys.some((key) => !Object.hasOwn(value, key))) throw bad$14(label + "格式不正确或包含未知字段。");
	return value;
};
const text$2 = (value, label, max = 500) => {
	if (typeof value !== "string" || !value.trim() || value !== value.trim() || value.length > max || /[\x00-\x1f\x7f]/.test(value)) throw bad$14(label + "必须填写且不超过 " + max + " 字。");
	return value;
};
const list$1 = (value, label, max) => {
	if (!Array.isArray(value) || value.length > max) throw bad$14(label + "最多 " + max + " 项。");
	return value;
};
const distinct = (values, label) => {
	if (new Set(values).size !== values.length) throw bad$14(label + "不能重复。");
	return values;
};
const pattern = (value, regex, label) => {
	if (typeof value !== "string" || !regex.test(value)) throw bad$14(label + "格式不正确。");
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
const semver$4 = /^(?=.{1,80}$)\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const hex40 = /^[0-9a-f]{40}$/;
const hex64 = /^[0-9a-f]{64}$/;
const githubName = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,98}[A-Za-z0-9])?$/;
/**
* GitHub 仓库名实际规则：ASCII 字母、数字、`.`、`-`、`_`，1–100 位，可以点开头或以 `-`/`_` 结尾（如 `.github`、`foo-`）；
* 只排除纯 `.`/`..` 与 `.git` 结尾（GitHub 本身不允许创建）。请求校验、内容仓与宿主传输层共用此定义，避免三处漂移。
*/
const GITHUB_REPOSITORY_NAME = /^(?!\.\.?$)(?!.*\.git$)[A-Za-z0-9._-]{1,100}$/i;
const httpsUrl = /^https:\/\/[^/].{0,1000}$/;
const MARKET_CATALOG_MAX_FILE_SIZE = 2 * 1024 * 1024;
const MARKET_CATALOG_MAX_TOTAL_SIZE = 20 * 1024 * 1024;
const MARKET_CATALOG_MAX_FILES = 500;
const MARKET_CATALOG_FORBIDDEN_EXTENSIONS = /\.(?:py|sh|bash|zsh|js|mjs|cjs|ts|mts|cts|exe|bat|cmd|ps1|rb|pl|php|lobster)$/i;
/** 未确认许可的资源只能展示固定出处，不能安装或托管正文。 */
const PROVENANCE_ONLY_SPDX = "NOASSERTION";
const MARKET_CATALOG_LEGAL_FILENAME = /^(?:(?:licen[sc]e|notice|copying)(?:\.(?:txt|md|rst))?|third_party_notices\.md)$/i;
const MAX_FILE = MARKET_CATALOG_MAX_FILE_SIZE;
const MAX_TOTAL = MARKET_CATALOG_MAX_TOTAL_SIZE;
const size = (value, label) => {
	if (!Number.isSafeInteger(value) || value < 0 || value > MAX_FILE) throw bad$14(label + "大小不正确。");
	return value;
};
const invisiblePathCharacter = /[\u0080-\u009f\u200e\u200f\u2028\u2029\u202a-\u202e\u2066-\u2069]/;
function path(value, label) {
	const result = text$2(value, label, 500);
	if (result.startsWith("/") || result.split("/").some((part) => !part || part === "." || part === "..") || /[\\:?%#]/.test(result) || invisiblePathCharacter.test(result)) throw bad$14(label + "必须是安全的相对路径。");
	return result;
}
/**
* 许可补充沿用同一仓库/提交；不能借映射导入其他技能或改写 SKILL.md。祖先目录许可判定上游条目与 install 条目共用；
* 安装位置按条目形态：上游条目只能 `licenses/upstream/<原路径>`，市场保存文件的 install 条目另可放根目录 `LICENSE`/`LICENSE.txt`（规格 D10）。
*/
function marketCatalogGithubFileRepositoryPath(directory, file, shape = "upstream") {
	const root = path(directory, "上游目录"), target = path(file.path, "上游文件路径");
	if (file.repositoryPath === void 0) return root + "/" + target;
	const source = path(file.repositoryPath, "许可文件仓库路径"), parts = source.split("/"), name = parts.at(-1), parent = parts.slice(0, -1).join("/");
	const placed = target === "licenses/upstream/" + source || shape === "install" && (target === "LICENSE" || target === "LICENSE.txt") && /^licen[sc]e(?:\.(?:txt|md))?$/i.test(name);
	if (!MARKET_CATALOG_LEGAL_FILENAME.test(name) || parent !== "" && !root.startsWith(parent + "/") || parts.some((part) => part.startsWith(".") || part === "scripts") || !placed) throw bad$14("目录外引用仅允许祖先目录的许可文件，并保留规范安装路径。");
	if (file.size === null) throw bad$14("目录外许可文件必须固定大小。");
	return source;
}
function localized(value, label, max = 500) {
	const row = exact$9(value, ["zh-CN", "en"], label);
	return {
		"zh-CN": text$2(row["zh-CN"], label + "（简体中文）", max),
		en: text$2(row.en, label + "（英文）", max)
	};
}
const secretEnvVar = /^[A-Z][A-Z0-9_]{1,63}$/;
const secretHeaderName = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const secretQueryName = /^[A-Za-z][A-Za-z0-9_.-]{0,63}$/;
const secretSkillName = /^[a-z][a-z0-9-]{0,63}$/;
/** 共享密钥组标识（规格 2026-09-27 §4.5）。 */
const secretGroupPattern = /^[a-z][a-z0-9-]{1,63}$/;
/** 代发调用指引每种语言的上限：2000 字符、40 行，只允许 `\n` 一种控制字符。 */
const httpGuideMaxLength = 2e3;
const httpGuideMaxLines = 40;
const secretOrigin = /^https:\/\/(?=[a-z0-9.-]{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const secretForbiddenTlds = /* @__PURE__ */ new Set([
	"localhost",
	"local",
	"internal",
	"arpa",
	"test",
	"invalid",
	"example",
	"onion",
	"lan",
	"home",
	"corp",
	"localdomain",
	"intranet",
	"private"
]);
const forbiddenSecretHeaders = /* @__PURE__ */ new Set([
	"authorization",
	"cookie",
	"host",
	"proxy-authorization",
	"content-length",
	"transfer-encoding",
	"connection",
	"te",
	"upgrade",
	"keep-alive",
	"expect",
	"trailer",
	"forwarded"
]);
const forbiddenSecretHeaderPrefixes = ["proxy-", "x-forwarded-"];
const routingSpoofHeaders = /* @__PURE__ */ new Set([
	"range",
	"if-range",
	"accept-encoding",
	"x-http-method-override",
	"x-method-override",
	"x-http-method",
	"x-real-ip",
	"x-original-url",
	"x-rewrite-url",
	"x-original-host",
	"x-host",
	"x-http-host-override",
	"true-client-ip",
	"x-client-ip",
	"x-cluster-client-ip",
	"x-originating-ip",
	"x-remote-ip",
	"x-remote-addr",
	"client-ip",
	"via",
	"cf-connecting-ip",
	"fastly-client-ip"
]);
const forbiddenModelHeaders = /* @__PURE__ */ new Set([
	...forbiddenSecretHeaders,
	...routingSpoofHeaders,
	"x-api-key",
	"api-key",
	"apikey",
	"x-apikey",
	"x-api-token",
	"api-token",
	"x-auth-token",
	"auth-token",
	"x-access-token",
	"access-token",
	"x-token",
	"x-auth-key"
]);
const forbiddenModelHeaderSegments = /* @__PURE__ */ new Set([
	"auth",
	"authorization",
	"token",
	"secret",
	"session",
	"cookie",
	"password",
	"passwd",
	"credential",
	"credentials",
	"signature",
	"apikey"
]);
/** 分段模式的显式例外（归一名）：命中分段规则但语义不是凭据的头。 */
const modelHeaderSegmentExceptions = Object.freeze(["idempotency-key"]);
const skillHttpBaseHeaders = /* @__PURE__ */ new Set([
	"accept",
	"accept-language",
	"content-type",
	"user-agent",
	"idempotency-key"
]);
/**
* 头名归一：小写并把 `_` 换成 `-`。CGI / WSGI / PHP 类后端把 `-` 与 `_` 映射成同一个环境变量（含 httpoxy 的 `Proxy`→`HTTP_PROXY`），
* 所以 `X_Forwarded_For`、`Proxy_Authorization` 与被禁头等同处理；宿主比对「模型给的头与注入头重名」也按此归一。
*/
function normalizedHeaderName(name) {
	return name.toLowerCase().replaceAll("_", "-");
}
function isForbiddenSecretHeader(name) {
	const normalized = normalizedHeaderName(name);
	return forbiddenSecretHeaders.has(normalized) || forbiddenSecretHeaderPrefixes.some((prefix) => normalized.startsWith(prefix));
}
/** 规格 §4.3 全集：模型不得设置的请求头（含 `Proxy-*`、`X-Forwarded-*`），按归一化名判定。 */
function isForbiddenModelHeader(name) {
	const normalized = normalizedHeaderName(name);
	if (forbiddenModelHeaders.has(normalized) || forbiddenSecretHeaderPrefixes.some((prefix) => normalized.startsWith(prefix))) return true;
	if (modelHeaderSegmentExceptions.includes(normalized)) return false;
	const segments = normalized.split("-");
	return segments.some((segment, i) => forbiddenModelHeaderSegments.has(segment) || segment === "api" && segments[i + 1] === "key");
}
const skillSecretMaxPathLength = 2048;
const secretSafePath = /^\/[A-Za-z0-9\-._~!$&'()*+,=:@\/%]*$/;
const secretBadEncoding = /%(?![2-7][0-9a-f])|%(?:2f|5c|2e|25|3b|3f|23|7f)/i;
/**
* 声明期与运行期共用的路径守卫：拒绝编码分隔（%2F %5C）、编码点（%2E）、双重编码（%25xx）、编码控制 / 非 ASCII 字节、
* 反斜杠、`;` 参数段、`.`/`..` 段、连续斜杠、非 ASCII、空段以外的怪形态与超长路径；WHATWG 规范化后必须与原文一致。
*/
function skillSecretPathSafe(pathname) {
	if (typeof pathname !== "string" || pathname.length > 2048 || !secretSafePath.test(pathname) || secretBadEncoding.test(pathname)) return false;
	if (pathname.includes("//") || pathname.split("/").some((seg) => seg === "." || seg === "..")) return false;
	try {
		return new URL("https://h" + pathname).pathname === pathname;
	} catch {
		return false;
	}
}
function readSecretPathPrefix(value) {
	if (typeof value !== "string" || value.length > 256 || !skillSecretPathSafe(value)) throw bad$14("技能密钥路径前缀格式不正确。");
	return value;
}
/** 技能密钥声明：只声明变量名、注入位置与目标地址，绝不含值。 */
function readSkillSecrets(value, skillName) {
	const rows = list$1(value, "技能密钥声明", 8);
	if (!rows.length) throw bad$14("技能密钥声明至少一项。");
	if (!secretSkillName.test(skillName)) throw bad$14("声明密钥的技能名必须是小写字母开头的连字符标识。");
	const secrets = rows.map((input) => {
		const named = isRecord(input) && (input.target === "header" || input.target === "query");
		const keys = [
			"envVarName",
			"label",
			"required",
			"target",
			"endpoints",
			...named ? ["name"] : [],
			...isRecord(input) && input.methods !== void 0 ? ["methods"] : [],
			...isRecord(input) && input.allowHeaders !== void 0 ? ["allowHeaders"] : []
		];
		const row = exact$9(input, keys, "技能密钥声明");
		if (row.target !== "bearer" && row.target !== "header" && row.target !== "query") throw bad$14("技能密钥注入位置只能是 bearer、header 或 query。");
		if (typeof row.required !== "boolean") throw bad$14("技能密钥 required 必须是布尔值。");
		const endpointRows = list$1(row.endpoints, "技能密钥目标地址", 4);
		if (!endpointRows.length) throw bad$14("技能密钥目标地址至少一项。");
		const endpoints = endpointRows.map((item) => {
			const ep = exact$9(item, ["origin", "pathPrefixes"], "技能密钥目标地址");
			const origin = pattern(ep.origin, secretOrigin, "技能密钥目标地址 origin");
			if (secretForbiddenTlds.has(origin.slice(origin.lastIndexOf(".") + 1))) throw bad$14("技能密钥目标地址 origin 不能是本地或特殊用途域名。");
			const prefixes = distinct(list$1(ep.pathPrefixes, "技能密钥路径前缀", 8).map(readSecretPathPrefix), "技能密钥路径前缀");
			if (!prefixes.length) throw bad$14("技能密钥路径前缀至少一项。");
			return {
				origin,
				pathPrefixes: prefixes
			};
		});
		distinct(endpoints.map((ep) => ep.origin), "技能密钥目标地址 origin");
		const methods = row.methods === void 0 ? ["GET", "POST"] : distinct(list$1(row.methods, "技能密钥方法", 5).map((m) => {
			if (!skillSecretMethods.includes(m)) throw bad$14("技能密钥方法只能是 GET、POST、PUT、PATCH、DELETE。");
			return m;
		}), "技能密钥方法");
		if (!methods.length) throw bad$14("技能密钥方法至少一项。");
		const envVarName = pattern(row.envVarName, secretEnvVar, "技能密钥变量名");
		if (envVarName === "TELOA_BINDING_SHA256") throw bad$14("技能密钥变量名为保留名。");
		const secret = {
			envVarName,
			label: localized(row.label, "技能密钥名称", 120),
			required: row.required,
			target: row.target,
			endpoints,
			methods
		};
		if (named) {
			const name = pattern(row.name, row.target === "header" ? secretHeaderName : secretQueryName, "技能密钥注入名");
			if (row.target === "header" && isForbiddenSecretHeader(name)) throw bad$14("技能密钥注入头名不允许。");
			secret.name = name;
		}
		if (row.allowHeaders !== void 0) {
			const allowHeaders = list$1(row.allowHeaders, "附加请求头", 8).map((item) => pattern(item, secretHeaderName, "附加请求头名"));
			if (!allowHeaders.length) throw bad$14("附加请求头至少一项。");
			distinct(allowHeaders.map(normalizedHeaderName), "附加请求头");
			for (const header of allowHeaders) {
				if (isForbiddenModelHeader(header)) throw bad$14("附加请求头不能是模型禁用头：" + header + "。");
				if (skillHttpBaseHeaders.has(normalizedHeaderName(header))) throw bad$14("附加请求头已在基础白名单内，不必重复声明：" + header + "。");
			}
			secret.allowHeaders = allowHeaders;
		}
		return secret;
	});
	distinct(secrets.map((secret) => secret.envVarName), "技能密钥变量名");
	distinct(secrets.map((secret) => secret.target === "bearer" ? "header:authorization" : secret.target === "header" ? "header:" + normalizedHeaderName(secret.name) : "query:" + secret.name), "技能密钥注入位置");
	const injected = new Set(secrets.filter((secret) => secret.target === "header").map((secret) => normalizedHeaderName(secret.name)));
	for (const secret of secrets) for (const header of secret.allowHeaders ?? []) if (injected.has(normalizedHeaderName(header))) throw bad$14("附加请求头不能与本条目的注入头重名：" + header + "。");
	return secrets;
}
/** 带 `secrets` 的条目版本闸（计划关键决定 9）：旧应用不认识 secrets，条目必须把不认识的版本排除在兼容范围外，并声明依赖宿主工具。 */
function readSkillSecretGate(entry) {
	if (entry.compatibility.status !== "needs-configuration") throw bad$14("声明密钥的技能条目兼容状态必须是 needs-configuration。");
	if (teloaRangeSatisfies(entry.compatibility.teloa, "0.2.0-alpha.6")) throw bad$14("声明密钥的技能条目 Teloa 兼容范围不能包含 0.2.0-alpha.6 及更早版本。");
	if (!entry.requires.tools.includes("teloa_skill_http")) throw bad$14("声明密钥的技能条目 requires.tools 必须包含 teloa_skill_http。");
}
/** 目录扩展字段的版本闸（规格 2026-09-27 §3）：旧读取器按 exact 键整份拒收未知字段，条目必须把不认识的版本排除在兼容范围外。 */
function readExtensionsGate(entry) {
	if (teloaRangeSatisfies(entry.compatibility.teloa, "0.2.0-alpha.6")) throw bad$14("使用目录扩展字段的条目 Teloa 兼容范围不能包含 0.2.0-alpha.6 及更早版本。");
}
/**
* 代发调用指引正文：1–2000 字符、至多 40 行，只允许 `\n`，首尾不留空白；C1 控制字符与双向覆盖 / 隔离字符会在模型提示里视觉隐藏内容，一并拒绝。
* 行/段分隔符 U+2028/U+2029 会让模型把其后的内容当作新行、绕过下方逐 `\n` 行的前缀检查，LRM/RLM U+200E/U+200F 与 U+2060–U+2069 整段（含隐形运算符 U+2061–U+2064）
* 可藏在【】之间——与宿主确认卡预览的替换集（U+2060–U+2069 整段）对齐，一并拒绝（复审 LOW-2、审查 R1 L5）。
*/
function guideText(value, label) {
	if (typeof value !== "string" || !value.trim() || value !== value.trim() || value.length > httpGuideMaxLength || /[\x00-\x09\x0b-\x1f\x7f-\x9f\xad\u200b-\u200f\u2028-\u202e\u2060-\u2069\ufeff]/.test(value) || value.split("\n").length > httpGuideMaxLines) throw bad$14(label + "必须填写，不超过 2000 字、40 行，且只允许换行一种控制字符，不得含双向覆盖字符或零宽字符。");
	if (value.split("\n").some((line) => hostPrefixLine.test(line))) throw bad$14(label + "的任何一行都不得以【Teloa】开头（该前缀保留给宿主提示）。");
	return value;
}
const hostPrefixLine = /^\s*【\s*teloa\s*】/i;
function readHttpGuide(value) {
	const row = exact$9(value, ["zh-CN", "en"], "调用指引");
	return {
		"zh-CN": guideText(row["zh-CN"], "调用指引（简体中文）"),
		en: guideText(row.en, "调用指引（英文）")
	};
}
const stdioEnvRefName = /^[A-Z][A-Z0-9_]{1,63}$/;
/**
* stdio `args` 里的 `${NAME}` 引用（规格 2026-09-27 §7.3）：合法时返回引用名列表（无引用为空数组），任一 `${` 不构成 `${NAME}`
* 或紧跟在 `$` 之后即畸形，返回 undefined。宿主不做替换：`args` 原样传给子进程，由桥接进程从自身环境展开，密钥不进 argv。
*/
function stdioArgEnvRefs(arg) {
	const refs = [];
	for (let at = arg.indexOf("${"); at >= 0; at = arg.indexOf("${", at)) {
		if (at > 0 && arg[at - 1] === "$") return void 0;
		const close = arg.indexOf("}", at);
		if (close < 0) return void 0;
		const name = arg.slice(at + 2, close);
		if (!stdioEnvRefName.test(name)) return void 0;
		refs.push(name);
		at = close + 1;
	}
	return refs;
}
/** 连接器是否用了目录扩展字段（header/basic 变量、instructionsMaxBytes、stdio args 的 `${NAME}`）：用了就必须过扩展版本闸，与鉴权类型无关。 */
function usesConnectorExtensions(connector) {
	const { auth, recipe, instructionsMaxBytes } = connector;
	if (instructionsMaxBytes !== void 0) return true;
	if (auth.kind === "secret" && auth.vars.some((item) => item.target === "header" || item.target === "basic")) return true;
	return recipe.transport === "stdio" && recipe.args.some((arg) => arg.includes("${"));
}
/** v1 冻结索引不能收的条目：旧应用按 exact 键整份拒收未知字段（secrets、全部目录扩展字段与二次开发相关字段），旧版连接器读取器也不认识 OAuth 的 supported 字段。 */
function marketEntryNeedsV2(entry) {
	if (entry.kind === "dashboard") return true;
	if (entry.kind === "skill") return entry.secrets !== void 0 || entry.httpGuide !== void 0 || entry.secretGroup !== void 0 || marketEntryUsesDerivativeFields(entry);
	if (entry.kind !== "connector") return false;
	return entry.connector.auth.kind === "oauth" || usesConnectorExtensions(entry.connector);
}
/**
* 共享密钥组一致性（规格 2026-09-27 §4.5）：同组条目必须声明完全相同的变量集合，每个变量的 envVarName / label / required / target / name 相同，
* 且 endpoints 的 origin 集合相同；pathPrefixes、methods、allowHeaders 可以不同。快照读取与目录构建按目录整体调用；宿主运行时按同组成员再核一次。
*/
function assertSecretGroupsConsistent(entries) {
	const seen = /* @__PURE__ */ new Map();
	for (const entry of entries) {
		if (entry.secretGroup === void 0 || entry.secrets === void 0) continue;
		const shape = JSON.stringify([...entry.secrets].sort((left, right) => left.envVarName < right.envVarName ? -1 : 1).map((secret) => [
			secret.envVarName,
			secret.label["zh-CN"],
			secret.label.en,
			secret.required,
			secret.target,
			secret.name ?? null,
			[...new Set(secret.endpoints.map((endpoint) => endpoint.origin))].sort()
		]));
		const first = seen.get(entry.secretGroup);
		if (!first) {
			seen.set(entry.secretGroup, {
				id: entry.id,
				shape
			});
			continue;
		}
		if (first.shape !== shape) throw bad$14("共享密钥组 " + entry.secretGroup + " 的声明不一致：" + first.id + " 与 " + entry.id + " 的变量集合或目标 origin 集合不同。");
	}
}
/** 推荐替代与连接器其他来源的版本闸：带这些新字段的条目，兼容范围须有不低于 marketAlternativesMinimumTeloa 的下界。 */
function readAlternativesGate(entry) {
	if ((entry.kind === "connector" ? entry.alternatives !== void 0 : "alternatives" in entry && !!entry.alternatives?.some((item) => item.recommended)) && !teloaRangeHasLowerBound(entry.compatibility.teloa, "0.2.0-alpha.7")) throw bad$14("带推荐替代或连接器其他来源的条目，Teloa 兼容下界须为 0.2.0-alpha.7 或更高（旧版应用不认识这些字段）。");
}
/** 条目是否用了二次开发相关新字段（版本闸用它；v1 过滤经 marketEntryNeedsV2 并入同一判定）。 */
function marketEntryUsesDerivativeFields(entry) {
	if (entry.kind !== "skill") return false;
	if (entry.delivery === "upstream") return entry.origin.installsSource !== void 0;
	return entry.derivation !== void 0 || !!entry.upstream?.files.some((file) => file.sha256 !== void 0 || file.repositoryPath !== void 0);
}
/** 二次开发相关新字段的版本闸：兼容范围须有不低于 marketDerivativeMinimumTeloa 的下界。 */
function readDerivativeGate(entry) {
	if (marketEntryUsesDerivativeFields(entry) && !teloaRangeHasLowerBound(entry.compatibility.teloa, "0.2.0-alpha.7")) throw bad$14("用到二次开发说明、原版文件摘要、许可映射或安装量来源的条目，Teloa 兼容下界须为 0.2.0-alpha.7 或更高（旧版应用不认识这些字段）。");
}
function date(value, label) {
	const result = pattern(value, /^\d{4}-\d{2}-\d{2}$/, label), parsed = /* @__PURE__ */ new Date(result + "T00:00:00.000Z");
	if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== result) throw bad$14(label + "不是有效日期。");
	return result;
}
function readCommonFields(row, opts = {}) {
	const licenseRow = exact$9(row.license, opts.licenseUrl ? [
		"spdx",
		"files",
		"url"
	] : ["spdx", "files"], "许可");
	const licenseFiles = distinct(list$1(licenseRow.files, "许可文件", 20).map((file) => path(file, "许可文件路径")), "许可文件");
	const compatibilityRow = exact$9(row.compatibility, [
		"status",
		"teloa",
		"dsh",
		"conditions"
	], "兼容声明");
	if (!marketCatalogCompatibility.includes(compatibilityRow.status)) throw bad$14("兼容状态只能是 verified、needs-configuration、content-only 或 unsupported。");
	if (licenseRow.spdx === "NOASSERTION" && (row.kind !== "skill" || row.delivery !== "upstream" || compatibilityRow.status !== "unsupported" || licenseFiles.length !== 0)) throw bad$14("NOASSERTION 只用于不可添加的上游仅出处条目。");
	if (!licenseFiles.length && !opts.allowEmptyLicenseFiles) throw bad$14("许可文件至少一项。");
	const teloaRange = text$2(compatibilityRow.teloa, "Teloa 兼容范围", 120);
	try {
		parseTeloaRange(teloaRange);
	} catch {
		throw bad$14("Teloa 兼容范围格式不正确：" + teloaRange);
	}
	const requiresRow = exact$9(row.requires, [
		"tools",
		"network",
		"runtimes"
	], "运行需求");
	if (typeof requiresRow.network !== "boolean") throw bad$14("联网需求必须是布尔值。");
	const reviewRow = exact$9(row.review, [
		"status",
		"reviewedAt",
		"reviewer"
	], "审核记录");
	if (reviewRow.status !== "approved") throw bad$14("目录只收录审核通过的条目。");
	return {
		modifications: list$1(row.modifications, "修改说明", 50).map((item) => localized(item, "修改说明", 1e3)),
		license: {
			spdx: text$2(licenseRow.spdx, "许可", 200),
			files: licenseFiles,
			...opts.licenseUrl ? { url: pattern(licenseRow.url, httpsUrl, "许可链接") } : {}
		},
		compatibility: {
			status: compatibilityRow.status,
			teloa: teloaRange,
			dsh: text$2(compatibilityRow.dsh, "DSH 兼容范围", 120),
			conditions: list$1(compatibilityRow.conditions, "兼容条件", 20).map((item) => localized(item, "兼容条件"))
		},
		requires: {
			tools: distinct(list$1(requiresRow.tools, "所需工具", 50).map((item) => pattern(item, /^[A-Za-z0-9_:.-]{1,120}$/, "工具名")), "所需工具"),
			network: requiresRow.network,
			runtimes: distinct(list$1(requiresRow.runtimes, "运行时", 20).map((item) => text$2(item, "运行时", 120)), "运行时")
		},
		review: {
			status: "approved",
			reviewedAt: date(reviewRow.reviewedAt, "审核日期"),
			reviewer: text$2(reviewRow.reviewer, "审核人", 200)
		}
	};
}
function readSkillUpstream(value) {
	const upstreamRow = exact$9(value, [
		"ecosystem",
		"author",
		"repository",
		"commit",
		"path",
		"license",
		"files"
	], "上游来源");
	const repositoryRow = exact$9(upstreamRow.repository, [
		"host",
		"owner",
		"repo"
	], "上游仓库");
	if (repositoryRow.host !== "github.com") throw bad$14("上游仓库目前只支持 github.com。");
	const upstreamFiles = list$1(upstreamRow.files, "上游文件", 500).map((input) => {
		const present = (key) => isRecord(input) && Object.hasOwn(input, key) ? [key] : [];
		const file = exact$9(input, [
			"path",
			"gitBlob",
			"size",
			...present("sha256"),
			...present("repositoryPath")
		], "上游文件");
		return {
			path: path(file.path, "上游文件路径"),
			gitBlob: pattern(file.gitBlob, hex40, "上游文件 blob 摘要"),
			size: size(file.size, "上游文件"),
			...Object.hasOwn(file, "sha256") ? { sha256: pattern(file.sha256, hex64, "上游文件 sha256 摘要") } : {},
			...Object.hasOwn(file, "repositoryPath") ? { repositoryPath: path(file.repositoryPath, "许可文件仓库路径") } : {}
		};
	});
	if (!upstreamFiles.length) throw bad$14("上游文件至少一项。");
	distinct(upstreamFiles.map((file) => file.path), "上游文件路径");
	const directory = path(upstreamRow.path, "上游目录");
	distinct(upstreamFiles.map((file) => marketCatalogGithubFileRepositoryPath(directory, file, "install").normalize("NFC").toLocaleLowerCase("en-US")), "上游仓库文件路径");
	return {
		ecosystem: pattern(upstreamRow.ecosystem, /^[a-z0-9-]{1,40}$/, "上游生态"),
		author: text$2(upstreamRow.author, "上游作者", 200),
		repository: {
			host: "github.com",
			owner: pattern(repositoryRow.owner, githubName, "上游仓库 owner"),
			repo: pattern(repositoryRow.repo, GITHUB_REPOSITORY_NAME, "上游仓库名")
		},
		commit: pattern(upstreamRow.commit, hex40, "上游提交"),
		path: directory,
		license: text$2(upstreamRow.license, "上游许可", 200),
		files: upstreamFiles
	};
}
const derivativeChangeId = /^[A-Z][A-Z0-9]{1,7}-M\d{2,4}$/;
/** 大小写不敏感文件系统上的同一路径（与上游条目仓库路径去重同一折叠）。 */
const foldPath = (value) => value.normalize("NFC").toLocaleLowerCase("en-US");
const derivativeUpstreamRef = /^([^/@:\s]+)\/([^/@:\s]+)@([0-9a-f]{40}):(.+)$/;
/** 二次开发说明（规格 D2、D3、D5）：修改只登记在 changes；每条 upstream 指向本条目锁定的同一仓库、提交与某个原版文件，null 只给原版没有的新文件。 */
function readDerivation(value, upstream, modifications) {
	const row = exact$9(value, ["unchangedFiles", "changes"], "二次开发说明");
	if (modifications.length) throw bad$14("二次开发条目的修改只登记在 derivation.changes，modifications 必须为空。");
	if (upstream.files.some((file) => file.sha256 === void 0)) throw bad$14("二次开发条目的每个原版文件都必须固定 sha256 摘要。");
	const originals = new Set(upstream.files.map((file) => file.path));
	const repositoryPathOf = new Map(upstream.files.map((file) => [file.path, marketCatalogGithubFileRepositoryPath(upstream.path, file, "install")]));
	const repositoryPaths = new Set(repositoryPathOf.values());
	const originalByFold = new Map(upstream.files.map((file) => [foldPath(file.path), file.path]));
	const changeRows = list$1(row.changes, "修改清单", 200);
	if (!changeRows.length) throw bad$14("修改清单至少一项。");
	const changes = changeRows.map((input) => {
		const hasSection = isRecord(input) && Object.hasOwn(input, "section");
		const item = exact$9(input, [
			"id",
			"type",
			"path",
			...hasSection ? ["section"] : [],
			"upstream",
			"summary",
			"reason"
		], "修改条目");
		const id = pattern(item.id, derivativeChangeId, "修改编号");
		if (!marketDerivativeChangeTypes.includes(item.type)) throw bad$14("修改类型只能是 " + marketDerivativeChangeTypes.join("、") + "。");
		const filePath = path(item.path, "修改文件路径");
		const section = hasSection ? text$2(item.section, "修改位置", 200) : void 0;
		if (section !== void 0 && invisiblePathCharacter.test(section)) throw bad$14("修改位置不能含不可见或双向控制字符。");
		const sameFold = originalByFold.get(foldPath(filePath));
		if (sameFold !== void 0 && sameFold !== filePath) throw bad$14("修改 " + id + " 的文件 " + filePath + " 与原版文件 " + sameFold + " 只差大小写，会在不区分大小写的文件系统上覆盖原版文件。");
		if (item.upstream === null) {
			if (originals.has(filePath)) throw bad$14("修改 " + id + " 的文件 " + filePath + " 是原版文件，upstream 必须指向原版文件。");
			if (item.type === "removed") throw bad$14("removed 修改 " + id + " 必须用 upstream 指明被移除的原版文件。");
		} else {
			const ref = typeof item.upstream === "string" ? derivativeUpstreamRef.exec(item.upstream) : null;
			if (!ref || ref[1] !== upstream.repository.owner || ref[2] !== upstream.repository.repo || ref[3] !== upstream.commit) throw bad$14("修改 " + id + " 的 upstream 必须写成 <owner>/<repo>@<40 位提交>:<仓库内路径>，且与条目锁定的仓库和提交一致。");
			const source = path(ref[4], "修改的原版文件路径");
			if (!repositoryPaths.has(source)) throw bad$14("修改 " + id + " 的 upstream 必须指向本条目的某个原版文件。");
			if (originals.has(filePath) && repositoryPathOf.get(filePath) !== source) throw bad$14("修改 " + id + " 改的是原版文件 " + filePath + "，upstream 必须指向该文件在原版仓库里的路径。");
		}
		if (item.type === "removed" && !originals.has(filePath)) throw bad$14("removed 修改 " + id + " 的文件 " + filePath + " 必须是原版文件。");
		return {
			id,
			type: item.type,
			path: filePath,
			...section === void 0 ? {} : { section },
			upstream: item.upstream,
			summary: localized(item.summary, "修改摘要", 1e3),
			reason: localized(item.reason, "修改原因", 1e3)
		};
	});
	distinct(changes.map((change) => change.id), "修改编号");
	const unchangedFiles = distinct(list$1(row.unchangedFiles, "未修改文件", 500).map((item) => path(item, "未修改文件路径")), "未修改文件");
	for (const file of unchangedFiles) {
		if (!originals.has(file)) throw bad$14("未修改文件 " + file + " 不是原版文件。");
		if (changes.some((change) => change.path === file)) throw bad$14("未修改文件 " + file + " 同时被修改清单引用。");
	}
	if (originals.has("MODIFICATIONS.md") && !changes.some((change) => change.path === "MODIFICATIONS.md")) throw bad$14("原版自带 MODIFICATIONS.md，须在修改清单里登记对它的改写。");
	return {
		unchangedFiles,
		changes
	};
}
function readSkillEntry(row) {
	if (row.format !== "teloa.market-catalog-entry/v1") throw bad$14("目录条目格式版本不受支持。");
	if (row.delivery !== "builtin" && row.delivery !== "install") throw bad$14("目录条目交付方式只能是 builtin 或 install。");
	const skillRow = exact$9(row.skill, [
		"name",
		"title",
		"summary"
	], "技能信息");
	const name = pattern(skillRow.name, marketCatalogSkillName, "技能名");
	if (row.delivery === "builtin" && !name.startsWith("teloa-")) throw bad$14("内置技能名必须以 teloa- 开头。");
	if (row.delivery === "install" && name.startsWith("teloa-")) throw bad$14("teloa- 前缀保留给内置技能，安装型条目不能使用。");
	if (row.upstream === null && row.delivery !== "builtin") throw bad$14("只有 Teloa 内置技能的 upstream 可以为 null。");
	if (Object.hasOwn(row, "derivation") && (row.delivery !== "install" || row.upstream === null)) throw bad$14("二次开发说明只用于有原版来源的安装型技能条目。");
	const upstream = row.upstream === null ? null : readSkillUpstream(row.upstream), common = readCommonFields(row);
	return {
		format: "teloa.market-catalog-entry/v1",
		id: pattern(row.id, catalogId, "目录条目标识"),
		kind: "skill",
		delivery: row.delivery,
		version: pattern(row.version, semver$4, "条目版本"),
		taxonomy: readMarketTaxonomy(row.taxonomy),
		skill: {
			name,
			title: localized(skillRow.title, "技能标题", 120),
			summary: localized(skillRow.summary, "技能用途")
		},
		upstream,
		...common,
		...Object.hasOwn(row, "derivation") ? { derivation: readDerivation(row.derivation, upstream, common.modifications) } : {}
	};
}
function readSolutionEntry(row) {
	if (row.format !== "teloa.market-catalog-entry/v1") throw bad$14("目录条目格式版本不受支持。");
	if (row.delivery !== "install") throw bad$14("方案条目只能以 install 方式交付。");
	if (row.upstream !== null) throw bad$14("方案条目的 upstream 必须为 null。");
	const solutionRow = exact$9(row.solution, [
		"packageId",
		"title",
		"summary",
		"scope",
		"capabilities"
	], "方案信息");
	const packageId = pattern(solutionRow.packageId, packageIdPattern, "方案包标识");
	const capabilitiesRow = exact$9(solutionRow.capabilities, [
		"now",
		"needs",
		"permissions"
	], "方案能力说明");
	const capabilityList = (value, label) => {
		const items = list$1(value, label, 20);
		if (!items.length) throw bad$14(label + "至少一项。");
		return items.map((item) => localized(item, label, 300));
	};
	return {
		format: "teloa.market-catalog-entry/v1",
		id: pattern(row.id, catalogId, "目录条目标识"),
		kind: "solution",
		delivery: "install",
		version: pattern(row.version, semver$4, "条目版本"),
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
/** alpha.7 尚未发行；新类型与完整配置资源同批提供，不冒充旧安装器可以读取。 */
const marketDashboardMinimumTeloa = "0.2.0-alpha.7";
function readDashboardEntry(row) {
	const { dashboard, ...rest } = row;
	const { solution, ...entry } = readSolutionEntry({
		...rest,
		kind: "solution",
		solution: dashboard
	});
	if (!teloaRangeHasLowerBound(entry.compatibility.teloa, "0.2.0-alpha.7")) throw bad$14("业务看板资源的 Teloa 兼容下界须为 0.2.0-alpha.7 或更高。");
	return {
		...entry,
		kind: "dashboard",
		dashboard: solution
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
/**
* 宿主与运行时保留的环境变量名（审查修复 L-2，按大写比较）：受管 stdio 子进程继承宿主环境，连接器凭据变量若占用这些名字，
* 就能改写可执行搜索路径、Node / 动态链接器加载行为、代理与证书信任，或冒充 Teloa / DSH 自身配置。
*/
const reservedEnvVarNames = /* @__PURE__ */ new Set([
	"PATH",
	"PATHEXT",
	"HOME",
	"USERPROFILE",
	"SHELL",
	"COMSPEC",
	"SYSTEMROOT",
	"WINDIR",
	"USER",
	"USERNAME",
	"LOGNAME",
	"PWD",
	"TMPDIR",
	"TMP",
	"TEMP",
	"IFS",
	"ENV",
	"BASH_ENV",
	"NODE_OPTIONS",
	"NODE_PATH",
	"NODE_EXTRA_CA_CERTS",
	"NODE_TLS_REJECT_UNAUTHORIZED",
	"SSL_CERT_FILE",
	"SSL_CERT_DIR",
	"HTTP_PROXY",
	"HTTPS_PROXY",
	"ALL_PROXY",
	"NO_PROXY"
]);
const reservedEnvVarNamePrefixes = [
	"LD_",
	"DYLD_",
	"TELOA_",
	"DSH_",
	"NPM_CONFIG_"
];
/** 连接器 header 鉴权头名（规格 §7.1）：不含 `_`（远端是该连接器自己的服务，不存在 CGI 映射伪装问题）；Authorization 允许。 */
const connectorHeaderName = /^[A-Za-z][A-Za-z0-9-]{0,63}$/;
/** 鉴权头 scheme：`Bearer`、`Sentry-Bearer` 这类单词，或 `Token token=` 这类以 `=` 结尾的两段形。 */
const connectorHeaderScheme = /^[A-Za-z][A-Za-z0-9._-]{0,31}(?: [A-Za-z][A-Za-z0-9._-]{0,31}=)?$/;
const connectorTransportHeaders = /* @__PURE__ */ new Set([
	"accept",
	"content-type",
	"last-event-id",
	"mcp-session-id",
	"mcp-protocol-version"
]);
/**
* 连接器鉴权头禁用判定（审查修复 L-3）：与技能侧共用同一实现——注入头禁用集与 `Proxy-*`、`X-Forwarded-*` 前缀（isForbiddenSecretHeader）、
* 路由伪装 / 方法覆盖 / 编码协商头（与 isForbiddenModelHeader 同一集合），按 normalizedHeaderName 归一后判定；另禁 MCP 传输自管头。
* `Authorization` 允许（远端是该连接器自己的服务）。模型侧的凭据词分段规则不适用：连接器鉴权头本身就是凭据头，按该规则 `X-Api-Key`、`Authorization` 都会被禁。
*/
function isForbiddenConnectorHeader(name) {
	const normalized = normalizedHeaderName(name);
	if (normalized === "authorization") return false;
	return isForbiddenSecretHeader(normalized) || routingSpoofHeaders.has(normalized) || connectorTransportHeaders.has(normalized);
}
/** OAuth scope 记号：RFC 6749 §3.3 scope-token 字符集（不含空格、引号、反斜杠）。 */
const oauthScope = /^[\x21\x23-\x5B\x5D-\x7E]{1,200}$/;
function unreservedEnvVarName(name) {
	if (reservedEnvVarPrefix.test(name)) throw bad$14("环境变量名不得以 oauth_ 开头（为宿主 OAuth 凭据槽保留）。");
	const upper = name.toUpperCase();
	if (reservedEnvVarNames.has(upper) || reservedEnvVarNamePrefixes.some((prefix) => upper.startsWith(prefix))) throw bad$14("环境变量名 " + name + " 为宿主或运行时保留（PATH、HOME、NODE_OPTIONS、代理与证书变量，以及 LD_、DYLD_、TELOA_、DSH_、NPM_CONFIG_ 开头），不能用作连接器凭据变量。");
	return name;
}
const clientIdPatternAtom = /^(?:[^\\^$.|?*+()[\]{}]|\.|\\[dDwWsS]|\\[-\\^$.|?*+()[\]{}/]|\[\^?(?:[^\\[\]]|\\[dDwWsS]|\\[-\\^$.|?*+()[\]{}/])+\])/;
const clientIdPatternQuantifier = /^(?:[*+?]|\{\d{1,3}(,(\d{1,3})?)?\})/;
/** 配方声明的 client_id 正则：首尾锚定的短正则，只由简单原子加至多一层贪婪量词组成，可变长量词至多 2 个，避免回溯爆炸 */
function safeClientIdPattern(value) {
	if (typeof value !== "string" || value.length < 3 || value.length > 100) throw bad$14("clientIdPattern 必须是 3 到 100 个字符的正则。");
	if (!value.startsWith("^") || !value.endsWith("$") || value.endsWith("\\$")) throw bad$14("clientIdPattern 必须首尾锚定（^…$）。");
	let rest = value.slice(1, -1), variable = 0;
	while (rest) {
		const atom = clientIdPatternAtom.exec(rest);
		if (!atom) throw bad$14("clientIdPattern 只能由字面字符、\\d \\w \\s、字符类加单层量词组成（不得使用分组、选择、反向引用或嵌套 / 相邻量词）。");
		rest = rest.slice(atom[0].length);
		const quantifier = clientIdPatternQuantifier.exec(rest);
		if (!quantifier) continue;
		rest = rest.slice(quantifier[0].length);
		if (!quantifier[0].startsWith("{") || quantifier[1] !== void 0) variable++;
		if (variable > 2) throw bad$14("clientIdPattern 的可变长量词不得超过 2 个。");
	}
	try {
		new RegExp(value, "u");
	} catch {
		throw bad$14("clientIdPattern 不是合法正则。");
	}
	return value;
}
function readConnectorEntry(row) {
	if (row.format !== "teloa.market-catalog-entry/v1") throw bad$14("目录条目格式版本不受支持。");
	if (row.delivery !== "managed") throw bad$14("连接器条目只能以 managed 方式交付。");
	if (row.upstream !== null) throw bad$14("连接器条目的 upstream 必须为 null。");
	const connRow = exact$9(row.connector, [
		"serverName",
		"title",
		"summary",
		"auth",
		"recipe",
		"tools",
		"upstreamUrl",
		...isRecord(row.connector) && row.connector.instructionsMaxBytes !== void 0 ? ["instructionsMaxBytes"] : []
	], "连接器信息");
	const serverName = pattern(connRow.serverName, connectorServerName, "连接器服务名");
	const authRow = isRecord(connRow.auth) ? connRow.auth : null;
	if (!authRow) throw bad$14("连接器认证格式不正确。");
	let auth;
	if (authRow.kind === "none") {
		exact$9(connRow.auth, ["kind"], "none 认证");
		auth = { kind: "none" };
	} else if (authRow.kind === "secret") {
		const ar = exact$9(connRow.auth, ["kind", "vars"], "secret 认证");
		const vars = list$1(ar.vars, "凭据变量", 20).map((v) => {
			const vRow = isRecord(v) ? v : null;
			if (!vRow) throw bad$14("凭据变量格式不正确。");
			if (typeof vRow.required !== "boolean") throw bad$14("凭据 required 必须是布尔值。");
			if (vRow.target === "env") {
				const vr = exact$9(v, [
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
				const vr = exact$9(v, [
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
				const vr = exact$9(v, [
					"target",
					"label",
					"required"
				], "url-path 凭据变量");
				return {
					target: "url-path",
					label: localized(vr.label, "凭据说明"),
					required: vr.required
				};
			} else if (vRow.target === "header") {
				const vr = exact$9(v, [
					"target",
					"name",
					"label",
					"required",
					...vRow.scheme !== void 0 ? ["scheme"] : []
				], "header 凭据变量");
				const name = pattern(vr.name, connectorHeaderName, "鉴权头名");
				if (isForbiddenConnectorHeader(name)) throw bad$14("鉴权头名不允许：" + name + "。");
				const item = {
					target: "header",
					name,
					label: localized(vr.label, "凭据说明"),
					required: vr.required
				};
				if (vr.scheme !== void 0) item.scheme = pattern(vr.scheme, connectorHeaderScheme, "鉴权头 scheme");
				return item;
			} else if (vRow.target === "basic") {
				const vr = exact$9(v, [
					"target",
					"userLabel",
					"label",
					"required"
				], "basic 凭据变量");
				return {
					target: "basic",
					userLabel: localized(vr.userLabel, "用户名说明"),
					label: localized(vr.label, "凭据说明"),
					required: vr.required
				};
			}
			throw bad$14("凭据变量 target 只支持 env、bearer、url-path、header 或 basic。");
		});
		if (vars.filter((item) => item.target === "bearer" || item.target === "basic" || item.target === "header" && item.name.toLowerCase() === "authorization").length > 1) throw bad$14("产生 Authorization 头的凭据变量（bearer、authorization 头、basic）至多一个。");
		distinct(vars.flatMap((item) => item.target === "header" ? [item.name.toLowerCase()] : []), "鉴权头名");
		auth = {
			kind: "secret",
			vars
		};
	} else if (authRow.kind === "oauth") {
		if (typeof authRow.supported !== "boolean") throw bad$14("oauth 认证的 supported 必须是布尔值。");
		if (authRow.supported) {
			const ar = authRow;
			if (Object.keys(ar).some((key) => ![
				"kind",
				"supported",
				"scopes",
				"requiresUserClientId",
				"requiresAllowlist",
				"clientIdPattern"
			].includes(key))) throw bad$14("oauth 认证格式不正确或包含未知字段。");
			const scopes = list$1(ar.scopes, "OAuth scope", 50).map((s) => pattern(s, oauthScope, "OAuth scope"));
			if (new Set(scopes).size !== scopes.length) throw bad$14("OAuth scope 不能重复。");
			const oauth = {
				kind: "oauth",
				supported: true,
				scopes
			};
			if (ar.requiresUserClientId !== void 0) {
				if (typeof ar.requiresUserClientId !== "boolean") throw bad$14("requiresUserClientId 必须是布尔值。");
				oauth.requiresUserClientId = ar.requiresUserClientId;
			}
			if (ar.clientIdPattern !== void 0) {
				if (oauth.requiresUserClientId !== true) throw bad$14("clientIdPattern 只能用于 requiresUserClientId:true 的连接器。");
				oauth.clientIdPattern = safeClientIdPattern(ar.clientIdPattern);
			}
			if (ar.requiresAllowlist !== void 0) {
				if (typeof ar.requiresAllowlist !== "boolean") throw bad$14("requiresAllowlist 必须是布尔值。");
				oauth.requiresAllowlist = ar.requiresAllowlist;
			}
			auth = oauth;
		} else {
			const ar = exact$9(connRow.auth, [
				"kind",
				"supported",
				"reason"
			], "oauth 认证");
			auth = {
				kind: "oauth",
				supported: false,
				reason: text$2(ar.reason, "OAuth 不支持原因", 500)
			};
		}
	} else throw bad$14("连接器认证类型只支持 none、secret 或 oauth。");
	const recipeRow = isRecord(connRow.recipe) ? connRow.recipe : null;
	if (!recipeRow) throw bad$14("连接器配方格式不正确。");
	let recipe;
	if (recipeRow.transport === "stdio") {
		const r = exact$9(connRow.recipe, [
			"transport",
			"package",
			"version",
			"integrity",
			"bin",
			"args"
		], "stdio 配方");
		const pkg = pattern(r.package, npmPackageName, "npm 包名");
		const ver = pattern(r.version, semver$4, "npm 包版本");
		const integ = pattern(r.integrity, sha512Integrity, "npm 包 integrity");
		const binPath = path(r.bin, "bin 路径");
		const args = list$1(r.args, "固定参数", 50).map((a) => text$2(a, "参数", 1e3));
		const declaredEnv = new Set(auth.kind === "secret" ? auth.vars.flatMap((item) => item.target === "env" ? [item.envVarName] : []) : []);
		for (const arg of args) {
			const refs = stdioArgEnvRefs(arg);
			if (refs === void 0) throw bad$14("参数里的 ${ 必须构成 ${NAME} 引用（大写字母、数字、下划线）：" + arg);
			for (const name of refs) if (!declaredEnv.has(name)) throw bad$14("参数引用了未声明的 env 凭据变量 " + name + "：" + arg);
		}
		recipe = {
			transport: "stdio",
			package: pkg,
			version: ver,
			integrity: integ,
			bin: binPath,
			args
		};
	} else if (recipeRow.transport === "streamable-http") {
		const r = exact$9(connRow.recipe, ["transport", "url"], "streamable-http 配方");
		recipe = {
			transport: "streamable-http",
			url: pattern(r.url, httpsUrl, "远程地址")
		};
	} else if (recipeRow.transport === "streamable-http-template") {
		const r = exact$9(connRow.recipe, ["transport", "urlTemplate"], "streamable-http-template 配方");
		const tmpl = text$2(r.urlTemplate, "URL 模板", 500);
		const parts = tmpl.split("{secret}");
		if (parts.length !== 2) throw bad$14("URL 模板必须恰好包含一个 {secret} 占位符。");
		const prefix = parts[0];
		if (!/^https:\/\/[^/]/.test(prefix)) throw bad$14("URL 模板的固定前缀必须以有效的 https:// 主机名开头。");
		recipe = {
			transport: "streamable-http-template",
			urlTemplate: tmpl
		};
	} else throw bad$14("连接器传输类型只支持 stdio、streamable-http 或 streamable-http-template。");
	if (auth.kind === "secret") for (const v of auth.vars) {
		if (v.target === "env" && recipe.transport !== "stdio") throw bad$14(`env 凭据变量只对 stdio 传输有意义（当前传输：${recipe.transport}）。`);
		if (v.target === "bearer" && recipe.transport === "stdio") throw bad$14("bearer 凭据变量对 stdio 传输无意义（stdio 通过环境变量传递凭据）。");
		if (v.target === "bearer" && recipe.transport === "streamable-http-template") throw bad$14("bearer 凭据变量对 streamable-http-template 无意义，请改用 url-path。");
		if (v.target === "url-path" && recipe.transport !== "streamable-http-template") throw bad$14(`url-path 凭据变量只对 streamable-http-template 传输有意义（当前传输：${recipe.transport}）。`);
		if ((v.target === "header" || v.target === "basic") && recipe.transport !== "streamable-http") throw bad$14(`${v.target} 凭据变量只对 streamable-http 传输有意义（当前传输：${recipe.transport}）。`);
	}
	let instructionsMaxBytes;
	if (connRow.instructionsMaxBytes !== void 0) {
		const n = connRow.instructionsMaxBytes;
		if (!Number.isSafeInteger(n) || n <= 4096 || n > 32768 || n % 1024 !== 0) throw bad$14("instructionsMaxBytes 必须是大于 4096、不超过 32768 且为 1024 整数倍的整数。");
		instructionsMaxBytes = n;
	}
	const tools = list$1(connRow.tools, "工具列表", 200).map((t) => {
		const tr = exact$9(t, [
			"name",
			"description",
			"readOnly"
		], "工具");
		if (typeof tr.readOnly !== "boolean") throw bad$14("工具 readOnly 必须是布尔值。");
		return {
			name: text$2(tr.name, "工具名", 120),
			description: localized(tr.description, "工具说明"),
			readOnly: tr.readOnly
		};
	});
	const upstreamUrl = text$2(connRow.upstreamUrl, "上游地址", 500);
	const common = readCommonFields(row);
	if (auth.kind === "oauth" && auth.supported && auth.requiresAllowlist && (common.compatibility.status !== "needs-configuration" || common.compatibility.conditions.length === 0)) throw bad$14("requiresAllowlist 的连接器兼容状态必须是 needs-configuration，并在兼容条件中写明白名单要求。");
	if (auth.kind === "oauth" && auth.supported && recipe.transport !== "streamable-http") throw bad$14("supported:true 的 OAuth 连接器配方必须是 streamable-http（固定 https 地址）。");
	if (auth.kind === "oauth" && !auth.supported && common.compatibility.status !== "unsupported") throw bad$14("supported:false 的 OAuth 连接器兼容状态必须是 unsupported。");
	const entry = {
		format: "teloa.market-catalog-entry/v1",
		id: pattern(row.id, catalogId, "目录条目标识"),
		kind: "connector",
		delivery: "managed",
		version: pattern(row.version, semver$4, "条目版本"),
		upstream: null,
		taxonomy: readMarketTaxonomy(row.taxonomy),
		connector: {
			serverName,
			title: localized(connRow.title, "连接器标题", 120),
			summary: localized(connRow.summary, "连接器用途"),
			auth,
			recipe,
			tools,
			upstreamUrl,
			...instructionsMaxBytes === void 0 ? {} : { instructionsMaxBytes }
		},
		...Object.hasOwn(row, "alternatives") ? { alternatives: readAlternatives(row.alternatives) } : {},
		...common
	};
	if (usesConnectorExtensions(entry.connector)) readExtensionsGate(entry);
	return entry;
}
/** 其他来源共用读法；推荐只允许显式 true，缺省保持旧条目形状。 */
function readAlternatives(value) {
	const marketplaces = [
		"claude-code",
		"codex",
		"dsh",
		"openclaw",
		"clawhub",
		"hermes",
		"teloa"
	];
	const alternatives = list$1(value, "其他来源", 50).map((input) => {
		const hasRecommended = isRecord(input) && Object.hasOwn(input, "recommended");
		const alt = exact$9(input, [
			"entryId",
			"marketplace",
			"installs",
			...hasRecommended ? ["recommended"] : []
		], "替代条目");
		if (!marketplaces.includes(alt.marketplace)) throw bad$14("替代条目来源不支持。");
		if (alt.installs !== null && (!Number.isSafeInteger(alt.installs) || alt.installs < 0)) throw bad$14("替代安装量必须是非负整数或 null。");
		if (hasRecommended && alt.recommended !== true) throw bad$14("推荐替代只能为 true 或省略。");
		return {
			entryId: pattern(alt.entryId, catalogId, "替代条目标识"),
			marketplace: alt.marketplace,
			installs: alt.installs,
			...hasRecommended ? { recommended: true } : {}
		};
	});
	distinct(alternatives.map((item) => item.entryId), "替代条目标识");
	if (alternatives.filter((item) => item.recommended).length > 1) throw bad$14("推荐替代最多一项。");
	return alternatives;
}
/** 完整目录检查关联；v2 读取端传原始标识集，避免把按版本跳过的目标误判为源数据缺失。 */
function validateMarketCatalogAlternatives(entries, availableIds = new Set(entries.map((entry) => entry.id))) {
	for (const entry of entries) {
		if (!("alternatives" in entry)) continue;
		for (const alternative of entry.alternatives ?? []) {
			if (alternative.entryId === entry.id) throw bad$14("条目 " + entry.id + " 的替代资源不能指向自身。");
			if (!availableIds.has(alternative.entryId)) throw bad$14("替代条目 " + alternative.entryId + " 不在目录中。");
		}
	}
}
function readUpstreamSkillEntry(row) {
	if (row.format !== "teloa.market-catalog-entry/v1") throw bad$14("目录条目格式版本不受支持。");
	if (row.delivery !== "upstream") throw bad$14("上游条目交付方式必须是 upstream。");
	const skillRow = exact$9(row.skill, [
		"name",
		"title",
		"summary"
	], "技能信息");
	const name = pattern(skillRow.name, marketCatalogSkillName, "技能名");
	if (name.startsWith("teloa-")) throw bad$14("teloa- 前缀保留给内置技能，上游条目不能使用。");
	const upRow = isRecord(row.upstream) ? row.upstream : null;
	if (!upRow) throw bad$14("上游来源格式不正确。");
	let upstream;
	if (upRow.kind === "github") {
		const u = exact$9(row.upstream, [
			"kind",
			"repository",
			"commit",
			"path",
			"files"
		], "GitHub 上游");
		const repoRow = exact$9(u.repository, [
			"host",
			"owner",
			"repo"
		], "上游仓库");
		if (repoRow.host !== "github.com") throw bad$14("上游仓库目前只支持 github.com。");
		const files = list$1(u.files, "上游文件", 500).map((input) => {
			const file = exact$9(input, [
				"path",
				"gitBlob",
				"sha256",
				"size",
				...isRecord(input) && Object.hasOwn(input, "repositoryPath") ? ["repositoryPath"] : []
			], "上游文件");
			return {
				path: path(file.path, "上游文件路径"),
				gitBlob: pattern(file.gitBlob, hex40, "上游文件 blob 摘要"),
				sha256: pattern(file.sha256, hex64, "上游文件 sha256 摘要"),
				size: file.size === null ? null : size(file.size, "上游文件"),
				...Object.hasOwn(file, "repositoryPath") ? { repositoryPath: path(file.repositoryPath, "许可文件仓库路径") } : {}
			};
		});
		const directory = path(u.path, "上游目录"), fold = (value) => value.normalize("NFC").toLocaleLowerCase("en-US");
		distinct(files.map((f) => fold(f.path)), "上游文件路径");
		distinct(files.map((f) => fold(marketCatalogGithubFileRepositoryPath(directory, f))), "上游仓库文件路径");
		upstream = {
			kind: "github",
			repository: {
				host: "github.com",
				owner: pattern(repoRow.owner, githubName, "上游仓库 owner"),
				repo: pattern(repoRow.repo, GITHUB_REPOSITORY_NAME, "上游仓库名")
			},
			commit: pattern(u.commit, hex40, "上游提交"),
			path: directory,
			files
		};
	} else if (upRow.kind === "clawhub") {
		const u = exact$9(row.upstream, [
			"kind",
			"owner",
			"slug",
			"version",
			"files"
		], "ClawHub 上游");
		const files = list$1(u.files, "上游文件", 500).map((input) => {
			const file = exact$9(input, [
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
			owner: text$2(u.owner, "ClawHub 作者", 200),
			slug: pattern(u.slug, marketCatalogSkillName, "ClawHub 技能名"),
			version: text$2(u.version, "ClawHub 版本", 80),
			files
		};
	} else throw bad$14("上游来源类型只支持 github 或 clawhub。");
	const hasInstallsSource = isRecord(row.origin) && Object.hasOwn(row.origin, "installsSource");
	const origRow = exact$9(row.origin, [
		"marketplace",
		"installs",
		"installsLabel",
		"countedAt",
		...hasInstallsSource ? ["installsSource"] : []
	], "来源信息");
	if (![
		"claude-code",
		"codex",
		"dsh",
		"openclaw",
		"clawhub",
		"hermes"
	].includes(origRow.marketplace)) throw bad$14("来源市场不支持。");
	if (origRow.installs !== null && (!Number.isSafeInteger(origRow.installs) || origRow.installs < 0)) throw bad$14("安装量必须是非负整数或 null。");
	const origin = {
		marketplace: origRow.marketplace,
		installs: origRow.installs,
		installsLabel: text$2(origRow.installsLabel, "安装量显示文本", 200),
		countedAt: date(origRow.countedAt, "统计日期")
	};
	if (hasInstallsSource) {
		if (origin.installs === null) throw bad$14("安装量为 null 时不能写安装量来源。");
		origin.installsSource = readInstallsSource(origRow.installsSource);
	} else if (origin.installs !== null && origin.marketplace !== "clawhub") throw bad$14("非 ClawHub 来源的安装量必须写明可复核的安装量来源（origin.installsSource）。");
	const alternatives = readAlternatives(row.alternatives);
	const unsupportedKinds = [
		"agents",
		"commands",
		"hooks",
		"lsp",
		"scripts",
		"mcp"
	];
	const unsupportedComponents = list$1(row.unsupportedComponents, "不支持的组件", 20).map((input) => {
		const comp = exact$9(input, ["kind", "count"], "不支持的组件");
		if (!unsupportedKinds.includes(comp.kind)) throw bad$14("不支持的组件类型不正确。");
		if (!Number.isSafeInteger(comp.count) || comp.count < 1) throw bad$14("不支持的组件数量必须是正整数。");
		return {
			kind: comp.kind,
			count: comp.count
		};
	});
	const common = readCommonFields(row, { allowEmptyLicenseFiles: true });
	if (common.license.files.some((name) => !upstream.files.some((file) => file.path === name))) throw bad$14("上游许可文件必须包含在固定文件清单中。");
	if (upstream.kind === "github" && upstream.files.some((file) => file.repositoryPath !== void 0 && !common.license.files.includes(file.path))) throw bad$14("目录外许可映射必须列入许可文件清单。");
	return {
		format: "teloa.market-catalog-entry/v1",
		id: pattern(row.id, catalogId, "目录条目标识"),
		kind: "skill",
		delivery: "upstream",
		version: pattern(row.version, semver$4, "条目版本"),
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
		...common
	};
}
/** 安装量来源地址：https、规范形式（`new URL` 往返不变），不带账号、端口、查询或片段，≤1000。 */
function readInstallsSource(value) {
	const row = exact$9(value, ["url", "scope"], "安装量来源");
	if (row.scope !== "resource" && row.scope !== "plugin") throw bad$14("安装量口径只能是 resource 或 plugin。");
	const url = text$2(row.url, "安装量来源地址", 1e3);
	let parsed;
	try {
		parsed = new URL(url);
	} catch {
		throw bad$14("安装量来源地址格式不正确。");
	}
	if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port || parsed.search || parsed.hash || url.includes("?") || url.includes("#") || parsed.href !== url) throw bad$14("安装量来源地址必须是 https，且不带账号、端口、查询或片段。");
	const host = parsed.hostname;
	if (host.startsWith("[") || /^\d+(?:\.\d+){3}$/.test(host) || host === "localhost" || host.endsWith(".localhost")) throw bad$14("安装量来源地址必须是公开域名，不能是 IP 地址或 localhost。");
	return {
		url,
		scope: row.scope
	};
}
const roleIdPattern$1 = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function readRoleEntry(row) {
	if (row.format !== "teloa.market-catalog-entry/v1") throw bad$14("目录条目格式版本不受支持。");
	if (row.delivery !== "install") throw bad$14("AI 员工条目只能以 install 方式交付。");
	if (row.upstream !== null) throw bad$14("AI 员工条目的 upstream 必须为 null。");
	const roleRow = exact$9(row.role, [
		"roleId",
		"title",
		"summary",
		"definition",
		"skills",
		"scope",
		"preferredModel",
		"fromSolution"
	], "岗位信息");
	const definitionRow = exact$9(roleRow.definition, [
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
		throw bad$14("岗位定义不合法。");
	}
	if (!checked.responsibility) throw bad$14("岗位定义必须包含结构化职责。");
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
		const pm = exact$9(roleRow.preferredModel, ["entryId", "fallback"], "首选模型");
		if (pm.fallback !== "default" && pm.fallback !== "refuse") throw bad$14("首选模型回退策略只能是 default 或 refuse。");
		preferredModel = {
			entryId: pattern(pm.entryId, catalogId, "首选模型条目标识"),
			fallback: pm.fallback
		};
	}
	const fromRow = exact$9(roleRow.fromSolution, [
		"packageId",
		"version",
		"path"
	], "来源方案");
	const fromSolution = {
		packageId: pattern(fromRow.packageId, packageIdPattern, "来源方案包标识"),
		version: pattern(fromRow.version, semver$4, "来源方案版本"),
		path: path(fromRow.path, "来源方案内路径")
	};
	if (!/^roles\/[a-z0-9-]+\.json$/.test(fromSolution.path)) throw bad$14("来源方案内路径必须是 roles/<id>.json。");
	return {
		format: "teloa.market-catalog-entry/v1",
		id: pattern(row.id, catalogId, "目录条目标识"),
		kind: "role",
		delivery: "install",
		version: pattern(row.version, semver$4, "条目版本"),
		upstream: null,
		taxonomy: readMarketTaxonomy(row.taxonomy),
		role: {
			roleId: pattern(roleRow.roleId, roleIdPattern$1, "岗位标识"),
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
	if (typeof value !== "boolean") throw bad$14(label + "必须是布尔值。");
	return value;
};
const nullableInt = (value, label) => {
	if (value === null) return null;
	if (!Number.isSafeInteger(value) || value < 1) throw bad$14(label + "必须是正整数或 null。");
	return value;
};
const localSpecialistBindings = [{
	usage: ["speech-to-text"],
	native: {
		kind: "dsh-speech",
		providerId: "sensevoice-local"
	}
}, {
	usage: ["embedding"],
	native: {
		kind: "teloa-embedding",
		providerId: "qwen3-embedding-0.6b"
	}
}];
function readNativeModel(value, usage) {
	const native = exact$9(value, ["kind", "providerId"], "原生模型");
	const binding = localSpecialistBindings.find((item) => item.native.kind === native.kind && item.native.providerId === native.providerId);
	if (!binding) throw bad$14("尚不支持这个原生模型准备器。");
	if (usage.length !== 1 || usage[0] !== binding.usage[0]) throw bad$14("模型用法与原生模型准备器不匹配。");
	return structuredClone(binding);
}
function readModelEntry(row) {
	if (row.format !== "teloa.market-catalog-entry/v1") throw bad$14("目录条目格式版本不受支持。");
	if (row.delivery !== "reference") throw bad$14("模型条目只能以 reference 方式交付，准备过程由原生服务管理。");
	if (row.upstream !== null) throw bad$14("模型条目的 upstream 必须为 null。");
	if (!isRecord(row.model)) throw bad$14("模型信息格式不正确。");
	if (row.model.form === "local-vertical") throw bad$14("form local-vertical 属三期，本期不收。");
	if (![
		"cloud",
		"local-general",
		"local-specialist"
	].includes(String(row.model.form))) throw bad$14("模型形态只支持 cloud、local-general 或 local-specialist。");
	const specialist = row.model.form === "local-specialist";
	const m = specialist ? exact$9(row.model, [
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
	], "模型信息") : exact$9({
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
		if (specialist ? item !== "speech-to-text" && item !== "embedding" : item !== "chat" && item !== "embedding" && item !== "tool") throw bad$14(specialist ? "模型用法与运行形态不匹配。" : "模型用法只能是 chat、embedding 或 tool。");
		return item;
	}), "模型用法");
	if (!usage.length) throw bad$14("模型用法至少一项。");
	const cap = exact$9(m.capabilities, [
		"tools",
		"vision",
		"reasoning",
		"structured"
	], "模型能力");
	const lic = exact$9(m.license, [
		"spdx",
		"name",
		"url",
		"tier",
		"restrictions"
	], "模型许可");
	if (lic.tier !== "commercial" && lic.tier !== "restricted") throw bad$14("许可层级只收 commercial 或 restricted，不收 non-commercial。");
	const restrictions = list$1(lic.restrictions, "许可限制", 10).map((item) => localized(item, "许可限制", 300));
	if (lic.tier === "restricted" && !restrictions.length) throw bad$14("restricted 许可必须列出至少一条限制。");
	if (![
		"direct",
		"mirror",
		"proxy-required"
	].includes(String(m.cnReachable))) throw bad$14("国内可达性只能是 direct、mirror 或 proxy-required。");
	if (m.support !== "experimental" && m.support !== "supported") throw bad$14("支持状态只能是 experimental 或 supported。");
	if (specialist && (m.contextWindow !== null || Object.values(cap).some((value) => value !== false))) throw bad$14("本地垂类模型不声明聊天上下文或聊天能力。");
	const base = {
		modelId: pattern(m.modelId, roleIdPattern$1, "模型标识"),
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
			spdx: text$2(lic.spdx, "许可标识", 200),
			name: text$2(lic.name, "许可名称", 200),
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
		version: pattern(row.version, semver$4, "条目版本"),
		upstream: null,
		taxonomy: readMarketTaxonomy(row.taxonomy)
	};
	if (specialist) return {
		...head,
		model: {
			...base,
			form: "local-specialist",
			...readNativeModel(m.native, usage)
		},
		...commonFields
	};
	const common = {
		...base,
		usage
	};
	if (m.form === "cloud") {
		if (m.local !== null || m.variants !== null) throw bad$14("云端模型的 local 与 variants 必须为 null。");
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
	if (m.cloud !== null) throw bad$14("本机模型的 cloud 必须为 null。");
	if (exact$9(m.local, ["runtime"], "本机运行时").runtime !== "ollama") throw bad$14("本机运行时只支持 ollama。");
	if (!commonFields.requires.runtimes.includes("ollama")) throw bad$14("本机模型的 requires.runtimes 必须包含 ollama。");
	const gb = (x, label) => {
		if (!Number.isInteger(x) || x < 1 || x > 1024) throw bad$14(label + "须为 1–1024 的整数。");
		return x;
	};
	const gb2 = (x, label) => {
		if (!Number.isInteger(x) || x < 256 || x > 2e6) throw bad$14(label + "须为 256–2000000 的整数。");
		return x;
	};
	const variants = list$1(m.variants, "模型变体", 6).map((item) => {
		const v = exact$9(item, [
			"quant",
			"format",
			"sizeBytes",
			"sources",
			"hardware",
			"models"
		], "模型变体");
		if (v.format !== "gguf") throw bad$14("模型变体格式只收 gguf。");
		const sources = list$1(v.sources, "来源", 1).map((item) => {
			if (!isRecord(item) || item.kind !== "ollama") throw bad$14("本期来源只支持 ollama。");
			const s = exact$9(item, [
				"kind",
				"name",
				"digest"
			], "来源");
			const name = pattern(s.name, ollamaModelNamePattern, "Ollama 模型名称（必须带 tag）");
			if (s.digest !== null && (typeof s.digest !== "string" || !ollamaDigestPattern.test(s.digest))) throw bad$14("来源摘要必须为 sha256:64 位十六进制或 null。");
			return {
				kind: "ollama",
				name,
				digest: s.digest
			};
		});
		if (!sources.length) throw bad$14("来源至少一项。");
		const hardware = exact$9(v.hardware, [
			"minRamGb",
			"recommendedRamGb",
			"vramGb"
		], "硬件条件");
		const models = exact$9(v.models, [
			"id",
			"contextWindow",
			"maxTokens",
			"input"
		], "路由模型");
		if (models.id !== sources[0].name) throw bad$14("路由模型 id 必须与 Ollama 名称一致。");
		const input = distinct(list$1(models.input, "输入类型", 2).map((t) => {
			if (t !== "text" && t !== "image") throw bad$14("输入类型只支持 text/image。");
			return t;
		}), "输入类型");
		if (!input.includes("text")) throw bad$14("输入类型必须包含 text。");
		if (!Number.isSafeInteger(v.sizeBytes) || v.sizeBytes <= 0) throw bad$14("sizeBytes 须为正整数。");
		if (hardware.minRamGb > hardware.recommendedRamGb) throw bad$14("最低内存不能高于推荐内存。");
		if (models.maxTokens > models.contextWindow) throw bad$14("最大输出不能超过上下文窗口。");
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
	if (!variants.length) throw bad$14("模型变体至少一项。");
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
	const cloud = exact$9(value, [
		"provider",
		"models",
		"priceBand",
		"credentialLabel",
		"signupUrl"
	], "云端接入");
	const providerRow = isRecord(cloud.provider) ? cloud.provider : null;
	if (!providerRow) throw bad$14("云端 provider 格式不正确。");
	let provider;
	if (providerRow.kind === "pi-ai") {
		const p = exact$9(cloud.provider, ["kind", "id"], "pi-ai provider");
		provider = {
			kind: "pi-ai",
			id: pattern(p.id, piAiProviderId, "pi-ai provider 标识")
		};
	} else if (providerRow.kind === "custom") {
		const p = exact$9(cloud.provider, [
			"kind",
			"api",
			"baseURL"
		], "自定义 provider");
		if (!modelApis.includes(p.api)) throw bad$14("自定义 provider 协议只支持 openai-completions、openai-responses 或 anthropic-messages。");
		provider = {
			kind: "custom",
			api: p.api,
			baseURL: pattern(p.baseURL, httpsUrl, "自定义端点（必须 https）")
		};
	} else throw bad$14("云端 provider 类型只支持 pi-ai 或 custom。");
	const models = list$1(cloud.models, "起始模型列表", 50).map((input) => {
		const r = exact$9(input, [
			"id",
			"name",
			"contextWindow",
			"maxTokens",
			"input"
		], "模型");
		const inputs = distinct(list$1(r.input, "模型输入类型", 2).map((item) => {
			if (item !== "text" && item !== "image") throw bad$14("模型输入类型只能是 text 或 image。");
			return item;
		}), "模型输入类型");
		return {
			id: text$2(r.id, "模型 id", 120),
			name: text$2(r.name, "模型名称", 120),
			contextWindow: nullableInt(r.contextWindow, "上下文窗口"),
			maxTokens: nullableInt(r.maxTokens, "最大输出"),
			input: inputs
		};
	});
	if (!models.length) throw bad$14("起始模型列表至少一项。");
	distinct(models.map((item) => item.id), "模型 id");
	if (cloud.priceBand !== null && ![
		"low",
		"mid",
		"high"
	].includes(String(cloud.priceBand))) throw bad$14("价格档只能是 low、mid、high 或 null。");
	return {
		provider,
		models,
		priceBand: cloud.priceBand,
		credentialLabel: localized(cloud.credentialLabel, "凭据说明", 120),
		signupUrl: pattern(cloud.signupUrl, httpsUrl, "注册链接")
	};
}
function readMarketCatalogEntry(value) {
	if (!isRecord(value)) throw bad$14("目录条目格式不正确或包含未知字段。");
	if (value.kind === "skill") {
		const { secrets, httpGuide, secretGroup, ...rest } = value;
		const entry = rest.delivery === "upstream" ? readUpstreamSkillEntry(exact$9(rest, [
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
		], "上游技能条目")) : readSkillEntry(exact$9(rest, [
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
			"review",
			...Object.hasOwn(rest, "derivation") ? ["derivation"] : []
		], "技能条目"));
		readAlternativesGate(entry);
		readDerivativeGate(entry);
		if (secrets === void 0) {
			if (httpGuide !== void 0) throw bad$14("调用指引 httpGuide 只能与 secrets 同时出现。");
			if (secretGroup !== void 0) throw bad$14("共享密钥组 secretGroup 只能与 secrets 同时出现。");
			return entry;
		}
		readSkillSecretGate(entry);
		const read = readSkillSecrets(secrets, entry.skill.name);
		const result = {
			...entry,
			secrets: read
		};
		if (httpGuide !== void 0) result.httpGuide = readHttpGuide(httpGuide);
		if (secretGroup !== void 0) result.secretGroup = pattern(secretGroup, secretGroupPattern, "共享密钥组");
		if (httpGuide !== void 0 || secretGroup !== void 0 || read.some((secret) => secret.allowHeaders !== void 0 || secret.target === "header" && secret.name.includes("_"))) readExtensionsGate(entry);
		return result;
	}
	if (value.kind === "solution") return readSolutionEntry(exact$9(value, [
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
	if (value.kind === "dashboard") return readDashboardEntry(exact$9(value, [
		"format",
		"id",
		"kind",
		"delivery",
		"version",
		"taxonomy",
		"dashboard",
		"upstream",
		"modifications",
		"license",
		"compatibility",
		"requires",
		"review"
	], "业务看板条目"));
	if (value.kind === "connector") {
		const entry = readConnectorEntry(exact$9(value, [
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
			"review",
			...Object.hasOwn(value, "alternatives") ? ["alternatives"] : []
		], "连接器条目"));
		readAlternativesGate(entry);
		return entry;
	}
	if (value.kind === "role") return readRoleEntry(exact$9(value, [
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
	], "AI 员工条目"));
	if (value.kind === "model") return readModelEntry(exact$9(value, [
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
	throw bad$14("目录条目类型只支持 solution、dashboard、role、skill、connector 或 model。");
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
	const row = exact$9(value, ["files", "treeHash"], "条目工件");
	const files = list$1(row.files, "工件文件", 500).map((input) => {
		const file = exact$9(input, [
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
		if (skillEntries.length !== 1 || skillEntries[0].path !== "SKILL.md") throw bad$14("条目工件必须恰有一个位于根目录的 SKILL.md。");
		if (entry.derivation) {
			distinct(files.map((file) => foldPath(file.path)), "工件文件路径（不区分大小写）");
			readDerivativeArtifact(files, entry.derivation, entry.upstream.files);
		}
	} else if (entry.kind === "solution" || entry.kind === "dashboard") {
		if (!files.some((file) => file.path === "teloa.json")) throw bad$14("方案条目工件必须包含根目录的 teloa.json。");
	} else if (entry.kind === "role") {
		if (!files.some((file) => file.path === "role.json")) throw bad$14("AI 员工条目工件必须包含根目录的 role.json。");
		if (files.some((file) => ![
			"role.json",
			"README.md",
			"LICENSE",
			"LICENSE.txt"
		].includes(file.path))) throw bad$14("AI 员工条目工件只允许 role.json、README.md 与许可文件（LICENSE 或 LICENSE.txt）。");
	} else if (entry.kind === "model") throw bad$14("模型条目没有工件。");
	if (entry.license.files.some((license) => !files.some((file) => file.path === license))) throw bad$14("许可文件必须包含在条目工件中。");
	if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL) throw bad$14("条目工件总大小不能超过 20 MiB。");
	const treeHash = pattern(row.treeHash, hex64, "工件树摘要");
	if (marketCatalogTreeHash(files, sha256) !== treeHash) throw bad$14("工件树摘要与文件清单不一致。");
	return {
		files,
		treeHash
	};
}
/** 二次开发条目的工件清单（规格 D6、D7）：未修改文件摘要等于原版锁定摘要；除根目录 MODIFICATIONS.md 外每个文件都已登记；不在工件里的原版文件都有 removed 修改。 */
function readDerivativeArtifact(files, derivation, originals) {
	const byPath = new Map(files.map((file) => [file.path, file]));
	if (!byPath.has("MODIFICATIONS.md")) throw bad$14("二次开发条目工件必须包含根目录的 MODIFICATIONS.md。");
	for (const name of derivation.unchangedFiles) if (byPath.get(name)?.sha256 !== originals.find((file) => file.path === name).sha256) throw bad$14("未修改文件 " + name + " 与原版锁定摘要不一致（工件缺少该文件或内容已改动）。");
	const shipped = derivation.changes.find((change) => change.type === "removed" && byPath.has(change.path));
	if (shipped) throw bad$14("工件文件 " + shipped.path + " 登记为移除（" + shipped.id + "），但仍随附。");
	const listed = /* @__PURE__ */ new Set([...derivation.unchangedFiles, ...derivation.changes.map((change) => change.path)]);
	const unlisted = files.find((file) => file.path !== "MODIFICATIONS.md" && !listed.has(file.path));
	if (unlisted) throw bad$14("工件文件 " + unlisted.path + " 既不在未修改文件中，也没有被任何修改登记。");
	const removed = originals.find((file) => !byPath.has(file.path) && !derivation.changes.some((change) => change.type === "removed" && change.path === file.path));
	if (removed) throw bad$14("原版文件 " + removed.path + " 不在工件中，须登记一条 removed 修改。");
}
function readMarketCatalogIndex(value, sha256) {
	const row = exact$9(value, [
		"format",
		"catalogVersion",
		"entries"
	], "目录快照");
	if (row.format !== "teloa.market-catalog/v1") throw bad$14("目录快照格式版本不受支持。");
	const catalogVersion = pattern(row.catalogVersion, /^[0-9A-Za-z][0-9A-Za-z.-]{0,39}$/, "目录版本");
	const entries = list$1(row.entries, "目录条目", 500).map((input) => {
		if (!isRecord(input)) throw bad$14("目录条目格式不正确。");
		const { artifact, ...rest } = input, entry = readMarketCatalogEntry(rest);
		if (entry.kind === "model") {
			if (artifact !== null) throw bad$14("模型条目的 artifact 必须为 null。");
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
	validateMarketCatalogAlternatives(entries);
	distinct(entries.filter((e) => e.kind === "skill").map((e) => e.skill.name), "目录技能名");
	distinct(entries.filter((e) => e.kind === "solution").map((e) => e.solution.packageId), "方案包标识");
	distinct(entries.filter((e) => e.kind === "dashboard").map((e) => e.dashboard.packageId), "看板包标识");
	distinct(entries.filter((e) => e.kind === "connector").map((e) => e.connector.serverName), "连接器服务名");
	distinct(entries.filter((e) => e.kind === "role").map((e) => e.role.roleId), "岗位标识");
	distinct(entries.filter((e) => e.kind === "model").map((e) => e.model.modelId), "模型标识");
	assertSecretGroupsConsistent(entries.flatMap((e) => e.kind === "skill" ? [e] : []));
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
const bad$13 = (message) => new WorkError("teloa/invalid-input", message);
const catalogVersionPattern = /^[0-9A-Za-z][0-9A-Za-z.-]{0,39}$/;
function envelope(value, format) {
	if (!isRecord(value) || Object.keys(value).length !== 3 || !Object.hasOwn(value, "format") || !Object.hasOwn(value, "catalogVersion") || !Object.hasOwn(value, "entries")) throw bad$13("市场索引格式不正确或包含未知字段。");
	if (value.format !== format) throw bad$13("市场索引格式版本不受支持。");
	if (typeof value.catalogVersion !== "string" || !catalogVersionPattern.test(value.catalogVersion)) throw bad$13("市场索引目录版本格式不正确。");
	if (!Array.isArray(value.entries) || value.entries.length > 1e3) throw bad$13("市场索引条目最多 1000 项。");
	return {
		catalogVersion: value.catalogVersion,
		entries: value.entries
	};
}
/** Teloa 自编的内置技能没有外部固定来源（upstream 为 null），只随发行快照提供，不进在线索引（v1 / v2 都不收；旧版读取器要求 upstream）。 */
function noBuiltinWithoutUpstream(entries) {
	if (entries.some((entry) => entry.kind === "skill" && entry.upstream === null)) throw bad$13("市场索引不收无上游来源的 Teloa 内置技能。");
}
function orderedIds(ids) {
	if (new Set(ids).size !== ids.length) throw bad$13("市场索引条目标识不能重复。");
	for (let at = 1; at < ids.length; at += 1) if (ids[at - 1] >= ids[at]) throw bad$13("市场索引条目必须按标识升序排列。");
}
function readMarketIndex(value) {
	const { catalogVersion, entries: raw } = envelope(value, "teloa.market-index/v1");
	const entries = raw.map((item) => readMarketCatalogEntry(item));
	if (entries.some((entry) => !MARKET_INDEX_V1_KINDS.includes(entry.kind))) throw bad$13("v1 索引只收 skill、solution、connector；其余类型请发布到 v2 索引。");
	if (entries.some(marketEntryNeedsV2)) throw bad$13("v1 索引不收声明密钥、使用目录扩展字段、二次开发相关字段（二次开发说明、原版文件摘要、许可映射、安装量来源）或 OAuth 认证的条目；请发布到 v2 索引。");
	if (entries.some((entry) => entry.kind === "connector" && entry.alternatives !== void 0)) throw bad$13("v1 索引不收连接器其他来源；请发布到 v2 索引。");
	if (entries.some((entry) => "alternatives" in entry && entry.alternatives?.some((item) => item.recommended))) throw bad$13("v1 索引不收推荐替代标记；请发布到 v2 索引。");
	noBuiltinWithoutUpstream(entries);
	orderedIds(entries.map((entry) => entry.id));
	validateMarketCatalogAlternatives(entries);
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
		if (!isRecord(item) || typeof item.id !== "string") throw bad$13("市场索引条目格式不正确。");
		if (!marketEntryKinds.includes(item.kind)) throw bad$13("市场索引条目类型不受支持：" + item.id);
		const range = isRecord(item.compatibility) ? item.compatibility.teloa : void 0;
		if (typeof range === "string") try {
			parseTeloaRange(range);
		} catch {
			throw bad$13("市场索引条目 Teloa 兼容范围语法不正确：" + item.id);
		}
		return readMarketCatalogEntry(item);
	});
	noBuiltinWithoutUpstream(entries);
	orderedIds(entries.map((entry) => entry.id));
	validateMarketCatalogAlternatives(entries);
	return {
		format: "teloa.market-index/v2",
		catalogVersion,
		entries
	};
}

//#endregion
//#region packages/contract/src/industry-definitions.ts
const bad$12 = (message) => new WorkError("teloa/invalid-input", message);
const exact$8 = (value, keys, message) => {
	if (!isRecord(value) || Object.keys(value).length !== keys.length || keys.some((key) => !(key in value))) throw bad$12(message);
	return value;
};
/** 服务名不得含 `__`：公开名以 `mcp__<server>__` 分段，含 `__` 的服务名能对上别的服务器命名空间里原始名含 `__` 的工具。 */
const serverName = /^(?!.*__)[A-Za-z0-9_-]{1,32}$/;
/** MCP 原始工具名：允许点号分段（飞书官方 MCP 形如 `im.v1.message.list`），但不能以点开头、结尾或连续两点。 */
const toolName$1 = /^(?!.*\.\.)[A-Za-z0-9_-][A-Za-z0-9_.-]{0,62}[A-Za-z0-9_-]$|^[A-Za-z0-9_-]$/;
const list = (value, pattern, max, message) => {
	if (!Array.isArray(value) || !value.length || value.length > max || value.some((item) => typeof item !== "string" || !pattern.test(item)) || new Set(value).size !== value.length) throw bad$12(message);
	return [...value];
};
function readIndustryMcpConnectionDefinition(value) {
	const row = exact$8(value, [
		"format",
		"serverName",
		"tools"
	], "行业 MCP 连接定义格式不正确。");
	if (row.format !== "teloa.mcp-connection/v1" || typeof row.serverName !== "string" || !serverName.test(row.serverName)) throw bad$12("行业 MCP 连接定义格式不正确。");
	return {
		format: "teloa.mcp-connection/v1",
		serverName: row.serverName,
		tools: list(row.tools, toolName$1, 64, "行业 MCP 连接工具名必须非空、去重且只含字母数字下划线连字符与点号。")
	};
}

//#endregion
//#region packages/contract/src/industry-update-compare.ts
/** 稳定序列化：对象按键名排序后展开，`undefined` 也有确定写法，供摘要与逐项比较共用。 */
function industryUpdateCanonical(value) {
	if (Array.isArray(value)) return "[" + value.map(industryUpdateCanonical).join(",") + "]";
	if (value && typeof value === "object") return "{" + Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => JSON.stringify(key) + ":" + industryUpdateCanonical(item)).join(",") + "}";
	return JSON.stringify(value) ?? "undefined";
}

//#endregion
//#region packages/contract/src/business-scopes.ts
/**
* 业务范围键（机器键；显示名另存于范围标签的 title）：1–64 位字母、数字、下划线或连字符。
* 行业模板加载、页内新建业务、业务声明的 `domain`、看板与同步的读写、客户端一律按它校验——声明处就拒收不合规的范围，
* 不会出现「草案能确认、看板读不出」。与任务、资料等范围列的正则取交集（见 backend `isBusinessScopeDomain`）。
*/
const businessScopeKeyPattern = /^[a-zA-Z0-9_-]{1,64}$/;
const isBusinessScopeKey = (value) => typeof value === "string" && businessScopeKeyPattern.test(value);
/** 业务范围键不合规时的统一文案。 */
const businessScopeKeyRule = "业务范围只能是 1–64 位字母、数字、下划线或连字符";

//#endregion
//#region packages/contract/src/localized-metadata.ts
const bad$11 = (message) => new WorkError("teloa/invalid-input", message);
const record = (value) => {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw bad$11("本地化元数据格式不正确。");
	return value;
};
const exact$7 = (value, keys) => {
	const row = record(value);
	if (Object.keys(row).some((key) => !keys.includes(key))) throw bad$11("本地化元数据格式不正确或包含未知字段。");
	return row;
};
const locale = (value) => {
	if (typeof value !== "string" || !value.trim() || value.length > 80) throw bad$11("locale 标识不正确。");
	try {
		const values = Intl.getCanonicalLocales(value.trim());
		if (values.length !== 1) throw Error();
		return values[0];
	} catch {
		throw bad$11("locale 标识不正确。");
	}
};
function localizedMetadata(input) {
	const row = exact$7(input, [
		"original",
		"defaultLocale",
		"locales"
	]);
	if (typeof row.original !== "string" || !row.original.trim() || new TextEncoder().encode(row.original).byteLength > 16 * 1024) throw bad$11("本地化元数据稳定原文不能为空或超过限制。");
	const defaultLocale = locale(row.defaultLocale), raw = record(row.locales), entries = {};
	if (Object.keys(raw).length > 100) throw bad$11("本地化 locale map 不能超过 100 项。");
	for (const [key, inputValue] of Object.entries(raw)) {
		const normalized = locale(key);
		if (Object.hasOwn(entries, normalized)) throw bad$11("本地化 locale map 包含重复的规范 locale。");
		if (typeof inputValue === "string") {
			if (!inputValue.trim() || new TextEncoder().encode(inputValue).byteLength > 16 * 1024) throw bad$11("本地化 locale 值不能为空或超过限制。");
			entries[normalized] = inputValue;
			continue;
		}
		const alias = exact$7(inputValue, ["fallback"]);
		entries[normalized] = { fallback: locale(alias.fallback) };
	}
	const sorted = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
	for (const start of Object.keys(sorted)) {
		const seen = /* @__PURE__ */ new Set();
		let current = start;
		while (typeof sorted[current] !== "string") {
			if (seen.has(current)) throw bad$11("本地化 fallback 不能形成环。");
			seen.add(current);
			const value = sorted[current];
			if (!value || typeof value === "string" || !Object.hasOwn(sorted, value.fallback)) throw bad$11("本地化 fallback 必须指向 locale map 中的已声明项。");
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
//#region packages/contract/src/plan-schedule.ts
/** 时区白名单的唯一真源：判据与界面下拉都从这里取，不各自抄一份。 */
const scheduleTimezones = [
	"Asia/Singapore",
	"Asia/Shanghai",
	"UTC"
];

//#endregion
//#region packages/contract/src/business-sync-schedule.ts
/** 默认最小 60 秒，短于 600 秒提示外部 API 额度与本机资源，上限 30 天；全是字面量常量，不做设置项。 */
const businessSyncLimits = {
	minIntervalSeconds: 60,
	warnIntervalSeconds: 600,
	maxIntervalSeconds: 2592e3
};
const bad$10 = (message) => new WorkError("teloa/invalid-input", message);
const exact$6 = (value, keys, message) => {
	if (!isRecord(value)) throw bad$10(message);
	const missing = keys.filter((key) => !(key in value)), extra = Object.keys(value).filter((key) => !keys.includes(key));
	if (missing.length || extra.length) throw bad$10(message.replace(/。$/, "") + "：" + [...missing.length ? ["缺少字段 " + missing.join("、")] : [], ...extra.length ? ["不认识的字段 " + extra.join("、")] : []].join("；") + "。");
	return value;
};
const timezone = (value) => scheduleTimezones.includes(value);
const clockTime = /^([01]\d|2[0-3]):[0-5]\d$/;
const cronFieldText = /^[0-9*,/-]+$/;
const cronBounds = [
	{
		key: "minute",
		min: 0,
		max: 59
	},
	{
		key: "hour",
		min: 0,
		max: 23
	},
	{
		key: "dayOfMonth",
		min: 1,
		max: 31
	},
	{
		key: "month",
		min: 1,
		max: 12
	},
	{
		key: "dayOfWeek",
		min: 0,
		max: 7
	}
];
function cronField(text, min, max) {
	if (!cronFieldText.test(text)) return void 0;
	const values = /* @__PURE__ */ new Set();
	let any = false;
	for (const item of text.split(",")) {
		const [range, step, ...rest] = item.split("/");
		if (rest.length || range === void 0 || range === "" || step === "") return void 0;
		let from, to;
		if (range === "*") {
			from = min;
			to = max;
			if (step === void 0) any = true;
		} else {
			const bounds = range.split("-");
			if (bounds.length > 2 || bounds.some((bound) => !/^\d{1,2}$/.test(bound))) return void 0;
			from = Number(bounds[0]);
			to = bounds.length === 2 ? Number(bounds[1]) : step === void 0 ? from : max;
			if (from < min || to > max || from > to) return void 0;
		}
		const by = step === void 0 ? 1 : /^\d{1,2}$/.test(step) ? Number(step) : 0;
		if (by < 1) return void 0;
		for (let value = from; value <= to; value += by) values.add(value);
	}
	return {
		values,
		any
	};
}
function cronSpec(expression) {
	if (expression.length > 128) return void 0;
	const fields = expression.split(" ");
	if (fields.length !== 5) return void 0;
	const spec = {};
	for (const [index, { key, min, max }] of cronBounds.entries()) {
		const field = cronField(fields[index], min, max);
		if (!field) return void 0;
		spec[key] = field;
	}
	if (spec.dayOfWeek.values.delete(7)) spec.dayOfWeek.values.add(0);
	return spec;
}
/**
* 读取即核对可达性：只看日 / 月 / 周三段能否在日历上同时成立（时分两段总有取值）。
* 从闰年 2024-01-01 起扫 1461 天，覆盖四年一次的 2 月 29 日与每个日期落在每个星期几的情形；
* `0 0 31 2 *` 这类永不触发的组合在读取时就拒绝，不留到调度时才发现。日与周的「或」规则与 `nextCronOccurrence` 同一条。
*/
const cronReachDays = 1461;
function cronReachable(spec) {
	for (let offset = 0; offset < cronReachDays; offset++) {
		const calendar = new Date(Date.UTC(2024, 0, 1 + offset));
		if (!spec.month.values.has(calendar.getUTCMonth() + 1)) continue;
		const dayMatch = spec.dayOfMonth.values.has(calendar.getUTCDate()), weekMatch = spec.dayOfWeek.values.has(calendar.getUTCDay());
		if (spec.dayOfMonth.any ? weekMatch : spec.dayOfWeek.any ? dayMatch : dayMatch || weekMatch) return true;
	}
	return false;
}
/**
* `acknowledgeShortInterval` 与周期本体写在同一个对象里：周期短于 60 秒必须为 true
* （规格：短于默认最小值须显式覆盖并再次确认），其余情况可缺省（按 false 读）。
*/
function readBusinessSyncSchedule(value) {
	if (!isRecord(value)) throw bad$10("同步周期格式不正确。");
	const hasAck = value.acknowledgeShortInterval !== void 0, ack = hasAck ? ["acknowledgeShortInterval"] : [];
	if (hasAck && typeof value.acknowledgeShortInterval !== "boolean") throw bad$10("同步周期的短周期确认位必须是布尔值。");
	const acknowledgeShortInterval = value.acknowledgeShortInterval === true;
	let schedule;
	if (value.kind === "every") {
		const row = exact$6(value, [
			"kind",
			"seconds",
			...ack
		], "同步周期格式不正确。");
		if (!Number.isSafeInteger(row.seconds) || Number(row.seconds) < 1 || Number(row.seconds) > businessSyncLimits.maxIntervalSeconds) throw bad$10("同步间隔秒数必须是 1 到 2592000（30 天）之间的整数。");
		if (Number(row.seconds) < businessSyncLimits.minIntervalSeconds && !acknowledgeShortInterval) throw bad$10("同步间隔短于默认最小值 60 秒，必须把 acknowledgeShortInterval 设为 true 以确认接受外部 API 额度与本机资源占用。");
		schedule = {
			kind: "every",
			seconds: row.seconds
		};
	} else if (value.kind === "hourly") {
		const row = exact$6(value, [
			"kind",
			"minute",
			...ack
		], "同步周期格式不正确。");
		if (!Number.isSafeInteger(row.minute) || Number(row.minute) < 0 || Number(row.minute) > 59) throw bad$10("每小时同步的分钟必须是 0 到 59 之间的整数。");
		schedule = {
			kind: "hourly",
			minute: row.minute
		};
	} else if (value.kind === "daily") {
		const row = exact$6(value, [
			"kind",
			"time",
			"timezone",
			...ack
		], "同步周期格式不正确。");
		if (typeof row.time !== "string" || !clockTime.test(row.time)) throw bad$10("每日同步时刻必须写成 HH:MM。");
		if (!timezone(row.timezone)) throw bad$10("同步时区不在白名单内，允许：" + scheduleTimezones.join(" / ") + "。");
		schedule = {
			kind: "daily",
			time: row.time,
			timezone: row.timezone
		};
	} else if (value.kind === "cron") {
		const row = exact$6(value, [
			"kind",
			"expression",
			"timezone",
			...ack
		], "同步周期格式不正确。");
		const spec = typeof row.expression === "string" ? cronSpec(row.expression) : void 0;
		if (!spec) throw bad$10("cron 表达式必须是 5 段（分 时 日 月 周），只认数字、*、,、-、/，不支持名称与 L/W/#。");
		if (!cronReachable(spec)) throw bad$10("cron 表达式的日、月与周组合在日历上永远不会触发，请核对。");
		if (!timezone(row.timezone)) throw bad$10("同步时区不在白名单内，允许：" + scheduleTimezones.join(" / ") + "。");
		schedule = {
			kind: "cron",
			expression: row.expression,
			timezone: row.timezone
		};
	} else throw bad$10("同步周期种类不合法，当前为「" + String(value.kind) + "」，允许：every / hourly / daily / cron。");
	return {
		schedule,
		acknowledgeShortInterval
	};
}

//#endregion
//#region packages/contract/src/business-source-mapping.ts
/** 资源上限，全是字面量常量，不做设置项。 */
const businessSourceMappingLimits = {
	mappings: 64,
	primaryKeys: 3,
	pathLength: 256,
	mappingsPerScope: 32
};
/** 除对象类型字段 `name` 外可作映射目标的平台列。 */
const businessMappingPlatformFields = [
	"title",
	"summary",
	"observedAt"
];
const bad$9 = (message) => new WorkError("teloa/invalid-input", message);
const maxNamedFields$2 = 8;
/** 缺键/多键都指出具体字段名，照 `business-definitions.ts` 的 `exact`。 */
const exactWith = (code) => (value, keys, message) => {
	if (!isRecord(value)) throw new WorkError(code, message);
	const missing = keys.filter((key) => !(key in value)), extra = Object.keys(value).filter((key) => !keys.includes(key));
	if (!missing.length && !extra.length) return value;
	const parts = [];
	if (missing.length) parts.push("缺少字段 " + missing.slice(0, maxNamedFields$2).join("、"));
	if (extra.length) parts.push("不认识的字段 " + extra.slice(0, maxNamedFields$2).join("、"));
	throw new WorkError(code, message.replace(/。$/, "") + "：" + parts.join("；") + "。");
};
const exact$5 = exactWith("teloa/invalid-input");
/** 回显原值只取前 80 字：原值来自声明正文，整段回显会把任意长的文本带进错误文案与模型上下文。 */
const invalidEnum$2 = (message, value, allowed) => {
	const shown = String(value);
	return bad$9(message.replace(/。$/, "") + "，当前为「" + (shown.length > 80 ? shown.slice(0, 80) + "…" : shown) + "」，允许：" + allowed.join(" / ") + "。");
};
function atPath$2(path, run) {
	try {
		return run();
	} catch (error) {
		if (error instanceof WorkError) throw new WorkError(error.code, path + "：" + error.message);
		throw error;
	}
}
/** 以下判据与 `business-definitions.ts` 逐字相同：字段标识、本地标识、数据源标识、精确三段号、单行标签、业务范围。 */
const fieldName$4 = /^[a-z0-9][a-z0-9_-]{0,62}$/;
const localId$3 = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,119}$/;
const sourceIdPattern$1 = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,119}$/;
const exactSemver$2 = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const label$3 = (value, max) => typeof value === "string" && !!value.trim() && value === value.trim() && value.length <= max && !/[\x00-\x08\x0a-\x1f\x7f]/.test(value);
const domainText$2 = (value) => isBusinessScopeKey(value) && value !== "general";
const semver$3 = (value) => typeof value === "string" && value.length <= 80 && exactSemver$2.test(value);
/** MCP 服务器名与 `mcp__<server>__<tool>` 全名里的服务器段同规矩（`isCapabilitySnapshot`）。 */
const mcpServerName = /^[A-Za-z0-9_-]{1,64}$/;
/** 角色标识与会话等资源标识同规矩。 */
const roleIdPattern = /^[a-zA-Z0-9_-]{1,128}$/;
const positiveInt = (value, min, max) => Number.isSafeInteger(value) && Number(value) >= min && Number(value) <= max;
const segmentPattern = /\.([A-Za-z_][A-Za-z0-9_-]*)|\['((?:[^'\\]|\\['\\])*)'\]|\[(0|[1-9]\d*)\]|\[(\*)\]/y;
function parseJsonPath(path) {
	if (typeof path !== "string" || !path.length || path.length > businessSourceMappingLimits.pathLength || path[0] !== "$") return void 0;
	const segments = [];
	segmentPattern.lastIndex = 1;
	while (segmentPattern.lastIndex < path.length) {
		const start = segmentPattern.lastIndex, match = segmentPattern.exec(path);
		if (!match || match.index !== start) return void 0;
		if (match[1] !== void 0) segments.push({
			kind: "key",
			name: match[1]
		});
		else if (match[2] !== void 0) segments.push({
			kind: "key",
			name: match[2].replace(/\\(['\\])/g, "$1")
		});
		else if (match[3] !== void 0) segments.push({
			kind: "index",
			index: Number(match[3])
		});
		else segments.push({ kind: "all" });
	}
	if (segments.some((segment, index) => segment.kind === "all" && index !== segments.length - 1)) return void 0;
	return segments;
}
/** 声明里的单值路径：合法且不带 `[*]`。 */
function valuePath(value, message) {
	const segments = typeof value === "string" ? parseJsonPath(value) : void 0;
	if (!segments || segments.some((segment) => segment.kind === "all")) throw bad$9(message);
	return value;
}
function mappingSource(value) {
	if (!isRecord(value)) throw bad$9("数据源映射的来源定义格式不正确。");
	if (value.kind === "business-data-port") {
		const row = exact$5(value, ["kind", "sourceId"], "数据源映射的来源定义格式不正确。");
		if (typeof row.sourceId !== "string" || !sourceIdPattern$1.test(row.sourceId)) throw bad$9("业务数据端口标识不合法。");
		return {
			kind: "business-data-port",
			sourceId: row.sourceId
		};
	}
	if (value.kind === "mcp-tool") {
		const hasPagination = value.pagination !== void 0;
		const row = exact$5(value, [
			"kind",
			"serverName",
			"tool",
			"arguments",
			"itemsPath",
			...hasPagination ? ["pagination"] : []
		], "数据源映射的来源定义格式不正确。");
		if (typeof row.serverName !== "string" || !mcpServerName.test(row.serverName)) throw bad$9("MCP 服务器名不合法。");
		if (!label$3(row.tool, 128)) throw bad$9("MCP 工具名不合法。");
		if (!isRecord(row.arguments) || Object.keys(row.arguments).length > 32) throw bad$9("MCP 工具参数必须是不超过 32 项的对象。");
		const args = {};
		for (const [key, item] of Object.entries(row.arguments)) {
			if (!label$3(key, 64)) throw bad$9("MCP 工具参数名不合法。");
			if (typeof item === "string") {
				if (item.length > 4e3 || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(item)) throw bad$9("MCP 工具参数「" + key + "」的取值不合法。");
			} else if (typeof item === "number") {
				if (!Number.isFinite(item)) throw bad$9("MCP 工具参数「" + key + "」的取值不合法。");
			} else if (typeof item !== "boolean") throw bad$9("MCP 工具参数「" + key + "」只能是字符串、数字或布尔值，不接受对象、数组与 null。");
			args[key] = item;
		}
		if (!(typeof row.itemsPath === "string" ? parseJsonPath(row.itemsPath) : void 0)) throw bad$9("MCP 工具结果的记录路径（itemsPath）不合法。");
		let pagination;
		if (hasPagination) {
			const item = atPath$2("pagination", () => exact$5(row.pagination, ["cursorArgument", "nextCursorPath"], "MCP 工具分页声明格式不正确。"));
			if (!label$3(item.cursorArgument, 64)) throw bad$9("pagination：续页参数名（cursorArgument）不合法。");
			if (Object.hasOwn(args, item.cursorArgument)) throw bad$9("pagination：续页参数名「" + item.cursorArgument + "」与 arguments 里已有的参数重名。");
			const nextCursorPath = atPath$2("pagination", () => valuePath(item.nextCursorPath, "下一页游标路径（nextCursorPath）不合法：只支持 $、.name、['name'] 与 [n]，不带 [*]。"));
			pagination = {
				cursorArgument: item.cursorArgument,
				nextCursorPath
			};
		}
		return {
			kind: "mcp-tool",
			serverName: row.serverName,
			tool: row.tool,
			arguments: args,
			itemsPath: row.itemsPath,
			...pagination ? { pagination } : {}
		};
	}
	if (value.kind === "role-result") {
		const hasRoleId = value.roleId !== void 0;
		const row = exact$5(value, ["kind", ...hasRoleId ? ["roleId"] : []], "数据源映射的来源定义格式不正确。");
		if (hasRoleId && (typeof row.roleId !== "string" || !roleIdPattern.test(row.roleId))) throw bad$9("AI 员工标识不合法。");
		return {
			kind: "role-result",
			...hasRoleId ? { roleId: row.roleId } : {}
		};
	}
	throw invalidEnum$2("数据源映射的来源种类不在白名单内。", value.kind, [
		"business-data-port",
		"mcp-tool",
		"role-result"
	]);
}
function fieldMapping(value) {
	const row = exact$5(value, ["path", "field"], "字段映射格式不正确。");
	const path = valuePath(row.path, "字段映射路径不合法：只支持 $、.name、['name'] 与 [n]，不带 [*]。");
	if (typeof row.field !== "string" || !(fieldName$4.test(row.field) || businessMappingPlatformFields.includes(row.field))) throw bad$9("字段映射目标必须是对象类型字段标识或 " + businessMappingPlatformFields.join(" / ") + "。");
	return {
		path,
		field: row.field
	};
}
function readBusinessSourceMappingDefinition(value) {
	if (!isRecord(value)) throw bad$9("数据源映射声明格式不正确。");
	const hasLocalized = value.localized !== void 0, hasCursor = value.incrementalCursor !== void 0, hasDeletedAt = value.deletedAtPath !== void 0, hasRetention = value.retentionDays !== void 0, hasPageSize = value.pageSize !== void 0;
	const keys = [
		"format",
		"id",
		"version",
		"domain",
		"title",
		...hasLocalized ? ["localized"] : [],
		"objectType",
		"source",
		"mapping",
		"primaryKey",
		...hasCursor ? ["incrementalCursor"] : [],
		"deletionSemantics",
		...hasDeletedAt ? ["deletedAtPath"] : [],
		"schedule",
		"acknowledgeShortInterval",
		...hasRetention ? ["retentionDays"] : [],
		...hasPageSize ? ["pageSize"] : []
	];
	const row = exact$5(value, keys, "数据源映射声明格式不正确。");
	if (row.format !== "teloa.business-source-mapping/v1") throw invalidEnum$2("数据源映射声明格式不正确。", row.format, ["teloa.business-source-mapping/v1"]);
	if (typeof row.id !== "string" || !localId$3.test(row.id)) throw bad$9("数据源映射标识不合法。");
	if (!semver$3(row.version)) throw bad$9("数据源映射版本必须是精确三段号。");
	if (!domainText$2(row.domain)) throw bad$9("数据源映射所属业务范围不合法：" + businessScopeKeyRule + "，general 一律拒绝。");
	if (!label$3(row.title, 120)) throw bad$9("数据源映射标题不合法。");
	if (typeof row.objectType !== "string" || !localId$3.test(row.objectType)) throw bad$9("数据源映射的目标对象类型标识不合法。");
	const source = atPath$2("source", () => mappingSource(row.source));
	/**
	* 空映射 = 原样落库：只给业务数据端口，端口回包已是快照形状、自带 id 与 version（端口是版本权威）。
	* 因此主键固定为快照自身的 `id`，删除语义只有 compare（端口不返回删除时刻）。
	*/
	const raw = source.kind === "business-data-port" && Array.isArray(row.mapping) && row.mapping.length === 0;
	if (!Array.isArray(row.mapping) || !raw && row.mapping.length < 1 || row.mapping.length > businessSourceMappingLimits.mappings) throw bad$9("字段映射必须是 1–" + businessSourceMappingLimits.mappings + " 项（只有业务数据端口来源可写空数组，表示原样落库）。");
	const mapping = row.mapping.map((item, index) => atPath$2(`mapping[${index}]`, () => fieldMapping(item)));
	const fields = mapping.map((item) => item.field);
	if (new Set(fields).size !== fields.length) throw bad$9("字段映射的目标字段不得重复。");
	if (!Array.isArray(row.primaryKey) || row.primaryKey.length < 1 || row.primaryKey.length > businessSourceMappingLimits.primaryKeys || new Set(row.primaryKey).size !== row.primaryKey.length) throw bad$9("主键必须是 1–" + businessSourceMappingLimits.primaryKeys + " 个去重字段。");
	if (raw) {
		if (row.primaryKey.length !== 1 || row.primaryKey[0] !== "id") throw bad$9("原样落库的映射主键固定为 ['id']（端口快照自带对象标识）。");
		if (row.deletionSemantics !== "compare") throw bad$9("原样落库的映射只支持 compare 删除语义（业务数据端口不返回删除时刻）。");
	} else if (row.primaryKey.some((key) => typeof key !== "string" || !fields.includes(key))) throw bad$9("主键引用的字段必须出现在字段映射的目标里。");
	let incrementalCursor;
	if (hasCursor) {
		const cursor = atPath$2("incrementalCursor", () => exact$5(row.incrementalCursor, ["path", "kind"], "增量游标格式不正确。"));
		const path = atPath$2("incrementalCursor", () => valuePath(cursor.path, "增量游标路径不合法。"));
		if (cursor.kind !== "timestamp" && cursor.kind !== "sequence") throw invalidEnum$2("增量游标种类不合法。", cursor.kind, ["timestamp", "sequence"]);
		incrementalCursor = {
			path,
			kind: cursor.kind
		};
		if (source.kind === "mcp-tool" && source.pagination?.cursorArgument === "cursor") throw bad$9("带增量游标（incrementalCursor）的映射，续页参数名（source.pagination.cursorArgument）不得为 cursor：水位固定以参数 cursor 透传，请换一个续页参数名。");
	}
	if (row.deletionSemantics !== "tombstone" && row.deletionSemantics !== "compare") throw invalidEnum$2("删除语义不合法。", row.deletionSemantics, ["tombstone", "compare"]);
	if (row.deletionSemantics === "tombstone") {
		if (!hasDeletedAt) throw bad$9("tombstone 删除语义必须声明 deletedAtPath。");
	} else if (hasDeletedAt) throw bad$9("compare 删除语义不得声明 deletedAtPath。");
	const deletedAtPath = hasDeletedAt ? atPath$2("deletedAtPath", () => valuePath(row.deletedAtPath, "删除时刻路径不合法。")) : void 0;
	if (typeof row.acknowledgeShortInterval !== "boolean") throw bad$9("acknowledgeShortInterval 必须是布尔值。");
	if (!isRecord(row.schedule)) throw bad$9("同步周期格式不正确。");
	if ("acknowledgeShortInterval" in row.schedule) throw bad$9("schedule：短周期确认位请写在声明顶层的 acknowledgeShortInterval，不写进 schedule 里。");
	const { schedule, acknowledgeShortInterval } = atPath$2("schedule", () => readBusinessSyncSchedule({
		...row.schedule,
		acknowledgeShortInterval: row.acknowledgeShortInterval
	}));
	if (hasRetention && !positiveInt(row.retentionDays, 1, 365)) throw bad$9("保留天数必须是 1 到 365 之间的整数。");
	if (hasPageSize && !positiveInt(row.pageSize, 1, 100)) throw bad$9("每页条数必须是 1 到 100 之间的整数。");
	let localized;
	if (hasLocalized) {
		if (!isRecord(row.localized) || !Object.keys(row.localized).length || Object.keys(row.localized).some((key) => key !== "title")) throw bad$9("数据源映射本地化元数据不合法。");
		const result = {};
		if (row.localized.title !== void 0) {
			let metadata;
			try {
				metadata = localizedMetadata(row.localized.title);
			} catch {
				throw bad$9("数据源映射标题本地化元数据不合法。");
			}
			if (metadata.original !== row.title || Object.values(metadata.locales).some((item) => typeof item === "string" && !label$3(item, 120))) throw bad$9("数据源映射标题本地化元数据不合法。");
			result.title = metadata;
		}
		localized = result;
	}
	return {
		format: "teloa.business-source-mapping/v1",
		id: row.id,
		version: row.version,
		domain: row.domain,
		title: row.title,
		...localized ? { localized } : {},
		objectType: row.objectType,
		source,
		mapping,
		primaryKey: [...row.primaryKey],
		...incrementalCursor ? { incrementalCursor } : {},
		deletionSemantics: row.deletionSemantics,
		...deletedAtPath !== void 0 ? { deletedAtPath } : {},
		schedule,
		acknowledgeShortInterval,
		...hasRetention ? { retentionDays: row.retentionDays } : {},
		...hasPageSize ? { pageSize: row.pageSize } : {}
	};
}
const exactHost = exactWith("teloa/invalid-host-response");

//#endregion
//#region packages/contract/src/business-chart-spec.ts
/**
* 白名单语义：不在允许集内的键一律拒绝；`forbiddenAnywhere` 是在任意深度额外做的显式拦截（`axis.format` 除外）。
* `allowedMarkKeys` / `allowedTransformKeys` 是结论 §3.1 里 mark 对象与 transform 项的允许键，一并导出供客户端对照。
*/
const businessChartSpecKeys = {
	allowedTopLevel: [
		"mark",
		"encoding",
		"transform",
		"width",
		"height",
		"title"
	],
	allowedMarkTypes: [
		"bar",
		"line",
		"arc",
		"area",
		"point"
	],
	allowedMarkKeys: [
		"type",
		"point",
		"interpolate",
		"tooltip",
		"innerRadius"
	],
	allowedEncodingChannels: [
		"x",
		"y",
		"color",
		"theta",
		"size",
		"tooltip"
	],
	allowedEncodingKeys: [
		"field",
		"type",
		"timeUnit",
		"aggregate",
		"title",
		"sort",
		"scale",
		"axis"
	],
	allowedTransforms: [
		"aggregate",
		"timeUnit",
		"fold",
		"window",
		"stack"
	],
	allowedTransformKeys: [
		"aggregate",
		"groupby",
		"timeUnit",
		"field",
		"as",
		"fold",
		"window",
		"stack",
		"sort",
		"offset"
	],
	forbiddenAnywhere: [
		"data",
		"url",
		"values",
		"datasets",
		"content",
		"usermeta",
		"params",
		"selection",
		"calculate",
		"filter",
		"loader",
		"href",
		"description",
		"expr",
		"signal",
		"format",
		"layer",
		"repeat",
		"facet",
		"concat",
		"hconcat",
		"vconcat",
		"spec",
		"resolve",
		"config",
		"autosize",
		"padding",
		"background",
		"projection",
		"lookup",
		"loess",
		"regression",
		"density",
		"quantile",
		"sample",
		"impute",
		"bin",
		"joinaggregate",
		"flatten",
		"pivot",
		"extent",
		"condition",
		"test",
		"labelExpr"
	]
};
const businessChartSpecLimits = {
	depth: 8,
	nodes: 400,
	bytes: 16384
};
/** 结论 §3.1 未逐项列出、但允许键的值对象必需的下一层键：`scale.type`、`axis.format`、聚合/窗口算子项、排序项。 */
const scaleKeys = ["type"];
const axisKeys = ["format"];
const operationKeys = [
	"op",
	"field",
	"as"
];
const sortKeys = ["field", "order"];
const encodingTypes = [
	"quantitative",
	"ordinal",
	"nominal",
	"temporal"
];
const functionLike = /^\s*(function\b|\(?[\w$,\s]*\)?\s*=>)/;
const token = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
/** Vega-Lite 合法枚举：编码通道的聚合算子（不含返回数组的 `values` 与对象形态的 argmin/argmax）、时间单位（含 utc 前缀）、比例尺种类。 */
const aggregateOps = [
	"count",
	"valid",
	"missing",
	"distinct",
	"sum",
	"product",
	"mean",
	"average",
	"variance",
	"variancep",
	"stdev",
	"stdevp",
	"stderr",
	"median",
	"q1",
	"q3",
	"ci0",
	"ci1",
	"min",
	"max"
];
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
const scaleTypes = [
	"linear",
	"log",
	"sqrt",
	"pow",
	"symlog",
	"time",
	"utc",
	"band",
	"point",
	"ordinal"
];
/**
* `axis.format` 是任意深度禁止键 `format` 的唯一例外，因此只放行两种格式串（≤ 32 字）：
* d3-format 数值格式，或 d3-time-format 时间格式（`%` 指令与日期常用分隔符交替，`%%` 为字面百分号，悬空的 `%` 不收）。
* 时间轴（`type:'temporal'` 的 x / y）上的 `axis.format` 在客户端渲染时由平台按界面语言与数据粒度覆盖（规格 2026-09-28 §6），
* 数值轴的照旧生效；这里仍照上面两种格式校验并放行——改成拒收会让已生效的声明读不出来。
*/
const numberFormat = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/;
const timeFormat = /^(?:%[-_0]?[aAbBcdefgGHIjLmMpqQsSuUVwWxXyYZ%]|[A-Za-z0-9 :\/.,\-])+$/;
const axisFormat = (value) => typeof value === "string" && value.length >= 1 && value.length <= 32 && (numberFormat.test(value) || timeFormat.test(value));
const reject = (path, message) => new WorkError("teloa/invalid-input", "图表规范 " + path + " " + message);
const text$1 = (value) => typeof value === "string" && value.length <= 200 && !/[\x00-\x08\x0a-\x1f\x7f]/.test(value);
const strings = (value, item = text$1) => Array.isArray(value) && value.length >= 1 && value.length <= 32 && value.every(item);
function keysIn(value, allowed, path) {
	if (!isRecord(value)) throw reject(path, "必须是对象。");
	for (const key of Object.keys(value)) if (!allowed.includes(key)) throw reject(path + "." + key, "不在允许键内，允许：" + allowed.join(" / ") + "。");
	return value;
}
function stringAt(value, path, pattern) {
	if (!text$1(value) || pattern && !pattern.test(value)) throw reject(path, "取值不合法。");
}
function enumAt(value, path, allowed) {
	if (typeof value !== "string" || !allowed.includes(value)) throw reject(path, "取值不在 Vega-Lite 允许的取值内。");
}
/** 第一遍：规模上限，与任意深度的禁止键和形如函数的字符串；禁止键按子先于父报告，路径写到最深那一层。 */
function scan(value, path, depth, state) {
	if (++state.nodes > businessChartSpecLimits.nodes) throw reject("spec", "节点数超过 " + businessChartSpecLimits.nodes + "。");
	if (typeof value === "string") {
		if (functionLike.test(value)) throw reject(path, "取值形如函数，不允许。");
		return;
	}
	if (value === null || typeof value === "boolean") return;
	if (typeof value === "number") {
		if (!Number.isFinite(value)) throw reject(path, "取值必须是有限数字。");
		return;
	}
	if (!Array.isArray(value) && !isRecord(value)) throw reject(path, "取值类型不允许。");
	if (depth > businessChartSpecLimits.depth) throw reject(path, "嵌套深度超过 " + businessChartSpecLimits.depth + "。");
	if (Array.isArray(value)) {
		value.forEach((item, index) => scan(item, path + "[" + index + "]", depth + 1, state));
		return;
	}
	for (const [key, item] of Object.entries(value)) {
		const child = path + "." + key;
		scan(item, child, depth + 1, state);
		if (businessChartSpecKeys.forbiddenAnywhere.includes(key) && !(key === "format" && path.endsWith(".axis"))) throw reject(child, "是禁止键。");
	}
}
function mark(value, path) {
	if (typeof value === "string") {
		if (!businessChartSpecKeys.allowedMarkTypes.includes(value)) throw reject(path, "图形种类不允许，允许：" + businessChartSpecKeys.allowedMarkTypes.join(" / ") + "。");
		return;
	}
	const row = keysIn(value, businessChartSpecKeys.allowedMarkKeys, path);
	if (!businessChartSpecKeys.allowedMarkTypes.includes(row.type)) throw reject(path + ".type", "图形种类不允许，允许：" + businessChartSpecKeys.allowedMarkTypes.join(" / ") + "。");
	if (row.point !== void 0 && typeof row.point !== "boolean") throw reject(path + ".point", "必须是布尔值。");
	if (row.tooltip !== void 0 && typeof row.tooltip !== "boolean") throw reject(path + ".tooltip", "必须是布尔值。");
	if (row.interpolate !== void 0) stringAt(row.interpolate, path + ".interpolate", token);
	if (row.innerRadius !== void 0 && !(typeof row.innerRadius === "number" && row.innerRadius >= 0)) throw reject(path + ".innerRadius", "必须是非负数。");
}
function channel(value, path) {
	const row = keysIn(value, businessChartSpecKeys.allowedEncodingKeys, path);
	if (row.field !== void 0) stringAt(row.field, path + ".field");
	if (row.type !== void 0 && !encodingTypes.includes(row.type)) throw reject(path + ".type", "取值不允许，允许：" + encodingTypes.join(" / ") + "。");
	if (row.timeUnit !== void 0) enumAt(row.timeUnit, path + ".timeUnit", timeUnits);
	if (row.aggregate !== void 0) enumAt(row.aggregate, path + ".aggregate", aggregateOps);
	if (row.title !== void 0) stringAt(row.title, path + ".title");
	if (row.sort !== void 0 && !text$1(row.sort) && !strings(row.sort)) throw reject(path + ".sort", "只允许字符串或字符串数组。");
	if (row.scale !== void 0) {
		const scale = keysIn(row.scale, scaleKeys, path + ".scale");
		if (scale.type !== void 0) enumAt(scale.type, path + ".scale.type", scaleTypes);
	}
	if (row.axis !== void 0) {
		const axis = keysIn(row.axis, axisKeys, path + ".axis");
		if (axis.format !== void 0 && !axisFormat(axis.format)) throw reject(path + ".axis.format", "只允许 32 字以内的 d3 数值格式或时间格式。");
	}
}
function encoding(value, path) {
	const row = keysIn(value, businessChartSpecKeys.allowedEncodingChannels, path);
	for (const [key, item] of Object.entries(row)) {
		if (key === "tooltip" && Array.isArray(item)) {
			item.forEach((entry, index) => channel(entry, path + ".tooltip[" + index + "]"));
			continue;
		}
		channel(item, path + "." + key);
	}
}
function operations(value, path) {
	if (!Array.isArray(value) || !value.length || value.length > 16) throw reject(path, "必须是 1–16 项算子。");
	value.forEach((item, index) => {
		const row = keysIn(item, operationKeys, path + "[" + index + "]");
		stringAt(row.op, path + "[" + index + "].op", token);
		if (row.field !== void 0) stringAt(row.field, path + "[" + index + "].field");
		stringAt(row.as, path + "[" + index + "].as");
	});
}
function transform(value, path) {
	if (!Array.isArray(value) || value.length > 8) throw reject(path, "必须是不超过 8 项的数组。");
	value.forEach((item, index) => {
		const at = path + "[" + index + "]", row = keysIn(item, businessChartSpecKeys.allowedTransformKeys, at);
		if (!businessChartSpecKeys.allowedTransforms.some((key) => key in row)) throw reject(at, "必须含 " + businessChartSpecKeys.allowedTransforms.join(" / ") + " 之一。");
		if (row.aggregate !== void 0) operations(row.aggregate, at + ".aggregate");
		if (row.window !== void 0) operations(row.window, at + ".window");
		for (const key of ["groupby", "fold"]) if (row[key] !== void 0 && !strings(row[key])) throw reject(at + "." + key, "必须是 1–32 个字符串。");
		for (const key of [
			"timeUnit",
			"stack",
			"offset"
		]) if (row[key] !== void 0) stringAt(row[key], at + "." + key, key === "stack" ? void 0 : token);
		if (row.field !== void 0) stringAt(row.field, at + ".field");
		if (row.as !== void 0 && !text$1(row.as) && !strings(row.as)) throw reject(at + ".as", "只允许字符串或字符串数组。");
		if (row.sort !== void 0) {
			if (!Array.isArray(row.sort) || !row.sort.length || row.sort.length > 8) throw reject(at + ".sort", "必须是 1–8 项排序。");
			row.sort.forEach((entry, position) => {
				const sort = keysIn(entry, sortKeys, at + ".sort[" + position + "]");
				stringAt(sort.field, at + ".sort[" + position + "].field");
				if (sort.order !== void 0 && sort.order !== "ascending" && sort.order !== "descending") throw reject(at + ".sort[" + position + "].order", "只允许 ascending / descending。");
			});
		}
	});
}
/**
* 深度遍历：任何键不在白名单、任何字符串值形如函数、任何禁止键（含 `url`/`values`/`datasets`）→ `teloa/invalid-input`，
* reason 写明路径（如 `spec.encoding.tooltip.content`）。序列化 ≤ 16 KiB、深度 ≤ 8、节点 ≤ 400。
* 先序列化出副本、只在副本上校验并返回副本：原对象上的取值器与 `toJSON` 因此只被读一次，校验的与返回的是同一份字节。
*/
function readBusinessChartSpec(value) {
	if (!isRecord(value)) throw new WorkError("teloa/invalid-input", "图表规范格式不正确。");
	const extra = Object.keys(value).filter((key) => key !== "engine" && key !== "spec"), missing = ["engine", "spec"].filter((key) => !(key in value));
	if (extra.length || missing.length) throw new WorkError("teloa/invalid-input", "图表规范格式不正确：" + [...missing.length ? ["缺少字段 " + missing.join("、")] : [], ...extra.length ? ["不认识的字段 " + extra.join("、")] : []].join("；") + "。");
	if (value.engine !== "vega-lite") throw new WorkError("teloa/invalid-input", "图表规范引擎不合法，当前为「" + String(value.engine) + "」，允许：vega-lite。");
	let serialized;
	try {
		serialized = JSON.stringify(value.spec);
	} catch {
		throw reject("spec", "无法序列化。");
	}
	if (typeof serialized !== "string") throw reject("spec", "必须是对象。");
	if (new TextEncoder().encode(serialized).byteLength > businessChartSpecLimits.bytes) throw reject("spec", "序列化后超过 16 KiB（" + businessChartSpecLimits.bytes + " 字节）。");
	const copy = JSON.parse(serialized);
	if (!isRecord(copy)) throw reject("spec", "必须是对象。");
	scan(copy, "spec", 1, { nodes: 0 });
	const spec = keysIn(copy, businessChartSpecKeys.allowedTopLevel, "spec");
	if (spec.mark === void 0) throw reject("spec.mark", "缺失，mark 必填。");
	mark(spec.mark, "spec.mark");
	if (spec.encoding !== void 0) encoding(spec.encoding, "spec.encoding");
	if (spec.transform !== void 0) transform(spec.transform, "spec.transform");
	for (const key of ["width", "height"]) if (spec[key] !== void 0 && !(typeof spec[key] === "number" && spec[key] > 0 && spec[key] <= 4096)) throw reject("spec." + key, "必须是 1–4096 的数字。");
	if (spec.title !== void 0) stringAt(spec.title, "spec.title");
	return {
		engine: "vega-lite",
		spec: copy
	};
}

//#endregion
//#region packages/contract/src/business-dashboards.ts
/**
* 组件与看板声明（规格 §4.3/§4.4）：组件 = 只读 SQL + 展示配置，看板 = 12 列网格上的组件布局 + 刷新周期。
* SQL 在契约层只限长度，语法树白名单与改写由服务端做（`BusinessSqlGuard`）；列名跨声明核对也留给服务端。
* 看板 `filters`（整页时间范围）与组件 `drilldown`（点击下钻）已在二期放开（二期规格 §3.1、§4.1）。
*/
const businessWidgetKinds = [
	"chart",
	"metric",
	"table",
	"board",
	"pipeline",
	"list",
	"view-ref"
];
/** 整页时间范围的预设键（二期规格 §3.1）：只给相对区间，区间文本由服务端常量映射，界面只选枚举。 */
const businessTimeRanges = [
	"24h",
	"7d",
	"30d",
	"90d",
	"all"
];
/** 资源与执行边界上限，全是字面量常量，不做设置项。 */
const businessDashboardLimits = {
	widgetsPerDashboard: 12,
	dashboardsPerScope: 16,
	widgetsPerScope: 64,
	sqlBytes: 8192,
	resultRows: 1e4,
	rowBytes: 1048576,
	resultBytes: 8388608,
	concurrencyPerScope: 5,
	queueWaitMs: 1e4,
	statementTimeoutMs: 5e3,
	workMem: "256MB",
	tempFileLimit: "512MB",
	retentionDays: 90,
	scopeRowQuota: 5e5
};
const bad$8 = (message) => new WorkError("teloa/invalid-input", message);
const maxNamedFields$1 = 8;
/** 缺键/多键都指出具体字段名，照 `business-definitions.ts` 的 `exact`。 */
const exact$4 = (value, keys, message) => {
	if (!isRecord(value)) throw bad$8(message);
	const missing = keys.filter((key) => !(key in value)), extra = Object.keys(value).filter((key) => !keys.includes(key));
	if (!missing.length && !extra.length) return value;
	const parts = [];
	if (missing.length) parts.push("缺少字段 " + missing.slice(0, maxNamedFields$1).join("、"));
	if (extra.length) parts.push("不认识的字段 " + extra.slice(0, maxNamedFields$1).join("、"));
	throw bad$8(message.replace(/。$/, "") + "：" + parts.join("；") + "。");
};
/** 可选键：返回取值不是 `undefined` 的那些可选键，供拼进 exact 的键表；键在而取值为 `undefined` 时不列入，exact 会把它报为不认识的字段。 */
const optional = (value, keys) => isRecord(value) ? keys.filter((key) => value[key] !== void 0) : [];
/** 回显原值只取前 80 字：原值来自声明正文，整段回显会把任意长的文本带进错误文案与模型上下文。 */
const invalidEnum$1 = (message, value, allowed) => {
	const shown = String(value);
	return bad$8(message.replace(/。$/, "") + "，当前为「" + (shown.length > 80 ? shown.slice(0, 80) + "…" : shown) + "」，允许：" + allowed.join(" / ") + "。");
};
function atPath$1(path, run) {
	try {
		return run();
	} catch (error) {
		if (error instanceof WorkError) throw new WorkError(error.code, path + "：" + error.message);
		throw error;
	}
}
/** 以下判据与 `business-definitions.ts` 逐字相同：本地标识、精确三段号、单行标签、业务范围。 */
const localId$2 = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,119}$/;
const exactSemver$1 = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const label$2 = (value, max) => typeof value === "string" && !!value.trim() && value === value.trim() && value.length <= max && !/[\x00-\x08\x0a-\x1f\x7f]/.test(value);
const domainText$1 = (value) => isBusinessScopeKey(value) && value !== "general";
const semver$2 = (value) => typeof value === "string" && value.length <= 80 && exactSemver$1.test(value);
/** SQL 结果列名：PostgreSQL 标识符上限 63 字节，只认 ASCII 标识符（大小写敏感，与 `AS` 别名逐字对应）。 */
const columnName = /^[A-Za-z_][A-Za-z0-9_]{0,62}$/;
const column = (value) => typeof value === "string" && columnName.test(value);
const dedup = (value, min, max, item) => Array.isArray(value) && value.length >= min && value.length <= max && new Set(value).size === value.length && value.every(item);
const gridInt = (value, min, max) => Number.isSafeInteger(value) && Number(value) >= min && Number(value) <= max;
const timeRange = (value) => businessTimeRanges.includes(value);
/** timeFilter.table：逻辑表名（对象类型 id 的 `-` 已写成 `_`）；column：对象字段标识（与 `business-definitions.ts` 的字段标识同一判据）或两个系统时间列。 */
const logicalTable = /^[a-zA-Z0-9][a-zA-Z0-9_]{0,119}$/;
const timeColumn = (value) => typeof value === "string" && (value === "_observed_at" || value === "_synced_at" || /^[a-z0-9][a-z0-9_-]{0,62}$/.test(value));
/** drilldown.match.field：对象字段标识（与 `business-definitions.ts` 的字段标识同一判据）。 */
const fieldName$3 = /^[a-z0-9][a-z0-9_-]{0,62}$/;
function titleLocalized(value, title, message) {
	if (!isRecord(value) || !Object.keys(value).length || Object.keys(value).some((key) => key !== "title")) throw bad$8(message);
	const result = {};
	if (value.title !== void 0) {
		let metadata;
		try {
			metadata = localizedMetadata(value.title);
		} catch {
			throw bad$8(message);
		}
		if (metadata.original !== title || Object.values(metadata.locales).some((item) => typeof item === "string" && !label$2(item, 120))) throw bad$8(message);
		result.title = metadata;
	}
	return result;
}
/** 周期与顶层确认位：确认位不得写进周期对象，读时合并后交给同一读取器（照映射声明）。 */
function refreshOf(refresh, acknowledge) {
	if (typeof acknowledge !== "boolean") throw bad$8("acknowledgeShortInterval 必须是布尔值。");
	if (!isRecord(refresh)) throw bad$8("refresh：刷新周期格式不正确。");
	if ("acknowledgeShortInterval" in refresh) throw bad$8("refresh：短周期确认位请写在声明顶层的 acknowledgeShortInterval，不写进 refresh 里。");
	const { schedule, acknowledgeShortInterval } = atPath$1("refresh", () => readBusinessSyncSchedule({
		...refresh,
		acknowledgeShortInterval: acknowledge
	}));
	return {
		refresh: schedule,
		acknowledgeShortInterval
	};
}
function head(row, format, noun) {
	if (row.format !== format) throw invalidEnum$1(noun + "格式不正确。", row.format, [format]);
	if (typeof row.id !== "string" || !localId$2.test(row.id)) throw bad$8(noun + "标识不合法。");
	if (!semver$2(row.version)) throw bad$8(noun + "版本必须是精确三段号。");
	if (!domainText$1(row.domain)) throw bad$8(noun + "所属业务范围不合法：" + businessScopeKeyRule + "，general 一律拒绝。");
	if (!label$2(row.title, 120)) throw bad$8(noun + "标题不合法。");
}
const kindOnly = (kind, key, allowed, present) => {
	if (allowed.includes(kind) && !present && key !== "table") throw bad$8(`组件种类 ${kind} 必须声明 ${key}。`);
	if (!allowed.includes(kind) && present) throw bad$8(`组件种类 ${kind} 不得声明 ${key}。`);
};
function threshold(value) {
	const row = exact$4(value, [
		"field",
		"op",
		"value",
		"tone"
	], "阈值格式不正确。");
	if (!column(row.field)) throw bad$8("阈值列名不合法。");
	if (row.op !== "gte" && row.op !== "lte") throw invalidEnum$1("阈值算子不合法。", row.op, ["gte", "lte"]);
	if (typeof row.value !== "number" || !Number.isFinite(row.value)) throw bad$8("阈值必须是有限数字。");
	if (row.tone !== "good" && row.tone !== "warn" && row.tone !== "bad") throw invalidEnum$1("阈值色调不合法。", row.tone, [
		"good",
		"warn",
		"bad"
	]);
	return {
		field: row.field,
		op: row.op,
		value: row.value,
		tone: row.tone
	};
}
function readBusinessWidgetDefinition(value) {
	if (!isRecord(value)) throw bad$8("组件声明格式不正确。");
	const present = optional(value, [
		"localized",
		"query",
		"viewRef",
		"chart",
		"metric",
		"board",
		"pipeline",
		"table",
		"thresholds",
		"refresh",
		"acknowledgeShortInterval",
		"timeFilter",
		"drilldown"
	]);
	const row = exact$4(value, [
		"format",
		"id",
		"version",
		"domain",
		"title",
		"kind",
		...present
	], "组件声明格式不正确。");
	head(row, "teloa.business-widget/v1", "组件声明");
	if (!businessWidgetKinds.includes(row.kind)) throw invalidEnum$1("组件种类不合法。", row.kind, businessWidgetKinds);
	const kind = row.kind, has = (key) => present.includes(key);
	kindOnly(kind, "query", businessWidgetKinds.filter((item) => item !== "view-ref"), has("query"));
	kindOnly(kind, "viewRef", ["view-ref"], has("viewRef"));
	kindOnly(kind, "chart", ["chart"], has("chart"));
	kindOnly(kind, "metric", ["metric"], has("metric"));
	kindOnly(kind, "board", ["board"], has("board"));
	kindOnly(kind, "pipeline", ["pipeline"], has("pipeline"));
	kindOnly(kind, "table", ["table", "list"], has("table"));
	const result = {
		format: "teloa.business-widget/v1",
		id: row.id,
		version: row.version,
		domain: row.domain,
		title: row.title,
		kind
	};
	if (has("localized")) result.localized = titleLocalized(row.localized, result.title, "组件标题本地化元数据不合法。");
	if (has("query")) {
		if (typeof row.query !== "string" || !row.query.trim() || row.query.includes("\0")) throw bad$8("组件 SQL 必须是非空文本。");
		if (new TextEncoder().encode(row.query).byteLength > businessDashboardLimits.sqlBytes) throw bad$8("组件 SQL 超过 " + businessDashboardLimits.sqlBytes + " 字节。");
		result.query = row.query;
	}
	if (has("viewRef")) {
		if (typeof row.viewRef !== "string" || !localId$2.test(row.viewRef)) throw bad$8("组件引用的视图标识不合法。");
		result.viewRef = row.viewRef;
	}
	if (has("chart")) result.chart = atPath$1("chart", () => readBusinessChartSpec(row.chart));
	if (has("metric")) {
		const metric = atPath$1("metric", () => exact$4(row.metric, ["valueColumn", ...optional(row.metric, ["previousColumn", "unit"])], "指标配置格式不正确。"));
		if (!column(metric.valueColumn) || metric.previousColumn !== void 0 && !column(metric.previousColumn)) throw bad$8("metric：指标列名不合法。");
		if (metric.unit !== void 0 && !label$2(metric.unit, 16)) throw bad$8("metric：指标单位不合法。");
		result.metric = {
			valueColumn: metric.valueColumn,
			...metric.previousColumn !== void 0 ? { previousColumn: metric.previousColumn } : {},
			...metric.unit !== void 0 ? { unit: metric.unit } : {}
		};
	}
	if (has("board")) {
		const board = atPath$1("board", () => exact$4(row.board, [
			"statusColumn",
			"titleColumn",
			"idColumn",
			"statuses"
		], "看板卡片配置格式不正确。"));
		if (!column(board.statusColumn) || !column(board.titleColumn) || !column(board.idColumn)) throw bad$8("board：列名不合法。");
		if (!dedup(board.statuses, 1, 12, (item) => label$2(item, 80))) throw bad$8("board：状态列必须是 1–12 个去重取值。");
		result.board = {
			statusColumn: board.statusColumn,
			titleColumn: board.titleColumn,
			idColumn: board.idColumn,
			statuses: [...board.statuses]
		};
	}
	if (has("pipeline")) {
		const pipeline = atPath$1("pipeline", () => exact$4(row.pipeline, [
			"stageColumn",
			"countColumn",
			...optional(row.pipeline, ["durationColumn"]),
			"stages"
		], "流水线配置格式不正确。"));
		if (!column(pipeline.stageColumn) || !column(pipeline.countColumn) || pipeline.durationColumn !== void 0 && !column(pipeline.durationColumn)) throw bad$8("pipeline：列名不合法。");
		if (!dedup(pipeline.stages, 1, 12, (item) => label$2(item, 80))) throw bad$8("pipeline：阶段必须是 1–12 个去重取值。");
		result.pipeline = {
			stageColumn: pipeline.stageColumn,
			countColumn: pipeline.countColumn,
			...pipeline.durationColumn !== void 0 ? { durationColumn: pipeline.durationColumn } : {},
			stages: [...pipeline.stages]
		};
	}
	if (has("table")) {
		const table = atPath$1("table", () => exact$4(row.table, ["columns"], "表格配置格式不正确。"));
		if (!dedup(table.columns, 1, 64, column)) throw bad$8("table：列必须是 1–64 个去重列名。");
		result.table = { columns: [...table.columns] };
	}
	if (has("thresholds")) {
		if (!Array.isArray(row.thresholds) || row.thresholds.length > 4) throw bad$8("阈值不得超过 4 条。");
		result.thresholds = row.thresholds.map((item, index) => atPath$1(`thresholds[${index}]`, () => threshold(item)));
	}
	if (has("acknowledgeShortInterval") && !has("refresh")) throw bad$8("acknowledgeShortInterval 只能与 refresh 一起声明。");
	if (has("refresh")) {
		const refresh = refreshOf(row.refresh, has("acknowledgeShortInterval") ? row.acknowledgeShortInterval : false);
		result.refresh = refresh.refresh;
		if (has("acknowledgeShortInterval")) result.acknowledgeShortInterval = refresh.acknowledgeShortInterval;
	}
	if (has("timeFilter")) {
		if (kind === "view-ref") throw bad$8("组件种类 view-ref 不得声明 timeFilter：它没有 SQL，整页时间范围无从生效。");
		if (result.metric?.previousColumn !== void 0) throw bad$8("metric.previousColumn 与 timeFilter 不能同时声明：上期对比要读时间范围之外的数据。");
		const filter = atPath$1("timeFilter", () => exact$4(row.timeFilter, ["table", "column"], "时间范围接入配置格式不正确。"));
		if (typeof filter.table !== "string" || !logicalTable.test(filter.table)) throw bad$8("timeFilter：表名不合法，须是 SQL 里写的逻辑表名。");
		if (!timeColumn(filter.column)) throw bad$8("timeFilter：列名不合法，须是对象字段标识或 _observed_at / _synced_at。");
		result.timeFilter = {
			table: filter.table,
			column: filter.column
		};
	}
	if (has("drilldown")) result.drilldown = drilldownOf(row.drilldown, result);
	return result;
}
/** 下钻：点哪一行、取哪一列在各种类里必须说得清，说不清的写法在这里就拒（声明收下即生效）。 */
function drilldownOf(value, widget) {
	const kind = widget.kind;
	if (kind === "view-ref") throw bad$8("组件种类 view-ref 不得声明 drilldown：视图引用本身就是台账视图。");
	const row = atPath$1("drilldown", () => exact$4(value, ["objectType", ...optional(value, ["idColumn", "match"])], "下钻配置格式不正确。"));
	if (typeof row.objectType !== "string" || !localId$2.test(row.objectType)) throw bad$8("drilldown：对象类型标识不合法。");
	if (row.idColumn !== void 0 && row.match !== void 0) throw bad$8("drilldown：idColumn 与 match 只能写一个。");
	if (kind === "metric" && (row.idColumn !== void 0 || row.match !== void 0)) throw bad$8("组件种类 metric 的 drilldown 只能写 objectType：指标卡只有一行，没有可点的维度。");
	if (kind === "pipeline" && row.idColumn !== void 0) throw bad$8("组件种类 pipeline 的 drilldown 不得写 idColumn：阶段是聚合出来的，对不上单个对象。");
	const result = { objectType: row.objectType };
	if (row.idColumn !== void 0) {
		if (!column(row.idColumn)) throw bad$8("drilldown：idColumn 列名不合法。");
		result.idColumn = row.idColumn;
	}
	if (row.match !== void 0) {
		const match = atPath$1("drilldown.match", () => exact$4(row.match, ["column", "field"], "下钻取值匹配配置格式不正确。"));
		if (!column(match.column)) throw bad$8("drilldown.match：column 列名不合法。");
		if (typeof match.field !== "string" || !fieldName$3.test(match.field)) throw bad$8("drilldown.match：field 须是对象字段标识。");
		if (kind === "pipeline" && match.column !== widget.pipeline.stageColumn) throw bad$8("drilldown.match：流水线的 column 须是 stageColumn（" + widget.pipeline.stageColumn + "），点的是阶段。");
		result.match = {
			column: match.column,
			field: match.field
		};
	}
	const used = result.idColumn ?? result.match?.column;
	if (kind === "chart" && used !== void 0 && !chartFields(widget.chart.spec).includes(used)) throw bad$8("drilldown：下钻用到的列 " + used + " 不在图表编码字段里，点击图形时数据里没有这一列。");
	return result;
}
function filtersOf(value) {
	const row = atPath$1("filters", () => exact$4(value, ["timeRange"], "看板筛选格式不正确。"));
	const range = atPath$1("filters.timeRange", () => exact$4(row.timeRange, ["options", "default"], "时间范围配置格式不正确。"));
	if (!dedup(range.options, 1, businessTimeRanges.length, timeRange)) throw bad$8("filters.timeRange：options 必须是 1–" + businessTimeRanges.length + " 个去重取值，允许：" + businessTimeRanges.join(" / ") + "。");
	if (!timeRange(range.default) || !range.options.includes(range.default)) throw bad$8("filters.timeRange：default 必须是 options 中的一项。");
	return { timeRange: {
		options: [...range.options],
		default: range.default
	} };
}
function layoutItem(value) {
	const row = exact$4(value, [
		"widget",
		"x",
		"y",
		"w",
		"h"
	], "布局项格式不正确。");
	if (typeof row.widget !== "string" || !localId$2.test(row.widget)) throw bad$8("布局项的组件标识不合法。");
	if (!gridInt(row.x, 0, 11) || !gridInt(row.w, 1, 12) || Number(row.x) + Number(row.w) > 12) throw bad$8("布局项越出 12 列网格：要求 0≤x<12、1≤w≤12、x+w≤12。");
	if (!gridInt(row.h, 1, 12) || !gridInt(row.y, 0, Number.MAX_SAFE_INTEGER)) throw bad$8("布局项高度须为 1–12、纵向位置须为非负整数。");
	return {
		widget: row.widget,
		x: row.x,
		y: row.y,
		w: row.w,
		h: row.h
	};
}
function readBusinessDashboardDefinition(value) {
	if (!isRecord(value)) throw bad$8("看板声明格式不正确。");
	const present = optional(value, ["localized", "filters"]);
	const row = exact$4(value, [
		"format",
		"id",
		"version",
		"domain",
		"title",
		"widgets",
		"layout",
		"refresh",
		"acknowledgeShortInterval",
		...present
	], "看板声明格式不正确。");
	head(row, "teloa.business-dashboard/v1", "看板声明");
	if (!dedup(row.widgets, 1, businessDashboardLimits.widgetsPerDashboard, (item) => typeof item === "string" && localId$2.test(item))) throw bad$8("看板组件必须是 1–" + businessDashboardLimits.widgetsPerDashboard + " 个去重的组件标识。");
	const widgets = row.widgets;
	if (!Array.isArray(row.layout)) throw bad$8("看板布局必须是数组。");
	const layout = row.layout.map((item, index) => atPath$1(`layout[${index}]`, () => layoutItem(item)));
	const placed = layout.map((item) => item.widget);
	if (placed.length !== widgets.length || new Set(placed).size !== placed.length || widgets.some((widget) => !placed.includes(widget))) throw bad$8("看板布局必须为每个组件恰好放置一次，且不得放置未列出的组件。");
	for (let left = 0; left < layout.length; left++) for (let right = left + 1; right < layout.length; right++) {
		const a = layout[left], b = layout[right];
		if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) throw bad$8(`看板布局重叠：${a.widget} 与 ${b.widget}。`);
	}
	const refresh = refreshOf(row.refresh, row.acknowledgeShortInterval);
	const result = {
		format: "teloa.business-dashboard/v1",
		id: row.id,
		version: row.version,
		domain: row.domain,
		title: row.title,
		widgets: [...widgets],
		layout,
		...refresh
	};
	if (present.includes("localized")) result.localized = titleLocalized(row.localized, result.title, "看板标题本地化元数据不合法。");
	if (present.includes("filters")) result.filters = filtersOf(row.filters);
	return result;
}
/** 图表编码里引用到的列名，去掉 transform 自己产出的那些（`as`；fold 不写 as 时产出 key/value）。 */
function chartFields(spec) {
	const produced = /* @__PURE__ */ new Set();
	const walk = (value) => {
		if (Array.isArray(value)) {
			value.forEach(walk);
			return;
		}
		if (!isRecord(value)) return;
		for (const [key, item] of Object.entries(value)) {
			if (key === "as") {
				for (const name of Array.isArray(item) ? item : [item]) if (typeof name === "string") produced.add(name);
			}
			if (key === "fold" && value.as === void 0) {
				produced.add("key");
				produced.add("value");
			}
			walk(item);
		}
	};
	walk(spec.transform);
	const fields = [];
	const encoding = isRecord(spec.encoding) ? spec.encoding : {};
	for (const channel of Object.values(encoding)) for (const item of Array.isArray(channel) ? channel : [channel]) if (isRecord(item) && typeof item.field === "string" && !produced.has(item.field) && !fields.includes(item.field)) fields.push(item.field);
	return fields;
}

//#endregion
//#region packages/contract/src/business-definitions.ts
const businessFieldTypes = [
	"text",
	"number",
	"enum",
	"datetime",
	"reference",
	"duration",
	"boolean"
];
const businessViewKinds = [
	"list",
	"distribution",
	"trend",
	"board-card"
];
const businessAggregations = [
	"count",
	"sum",
	"avg",
	"min",
	"max"
];
const businessTimeBuckets = [
	"hour",
	"day",
	"week",
	"month"
];
const businessChartTypes = [
	"table",
	"bar",
	"pie",
	"line",
	"number"
];
const businessFilterOperators = [
	"eq",
	"ne",
	"in",
	"gte",
	"lte"
];
/**
* 相对时间窗：白名单枚举，没有算术、没有相对天数参数（由 AppSec 的「SLA 到期趋势」逼出来）。
* `overdue` 含义固定为「该 `datetime` 字段早于计算时刻」，不可配置。
*/
const businessViewWindows = [
	"last-24h",
	"last-7d",
	"last-30d",
	"next-7d",
	"next-30d",
	"overdue"
];
/** `kind × chart` 允许组合，写死不留自由搭配。 */
const businessViewCharts = {
	list: ["table"],
	distribution: [
		"bar",
		"pie",
		"table"
	],
	trend: ["line", "bar"],
	"board-card": ["number"]
};
/** 字段类型 × 维度 / 度量 / 聚合 / 算子交叉约束表（规格 §2.5），契约与服务端共用同一份，不得再抄一份。 */
const businessFieldCapabilities = {
	text: {
		dimension: true,
		measure: false,
		aggregations: [],
		operators: [
			"eq",
			"ne",
			"in"
		]
	},
	number: {
		dimension: false,
		measure: true,
		aggregations: [
			"sum",
			"avg",
			"min",
			"max"
		],
		operators: [
			"eq",
			"ne",
			"gte",
			"lte"
		]
	},
	enum: {
		dimension: true,
		measure: false,
		aggregations: [],
		operators: [
			"eq",
			"ne",
			"in"
		]
	},
	datetime: {
		dimension: true,
		measure: true,
		aggregations: ["min", "max"],
		operators: ["gte", "lte"]
	},
	reference: {
		dimension: true,
		measure: false,
		aggregations: [],
		operators: ["eq", "in"]
	},
	duration: {
		dimension: false,
		measure: true,
		aggregations: [
			"sum",
			"avg",
			"min",
			"max"
		],
		operators: [
			"eq",
			"ne",
			"gte",
			"lte"
		]
	},
	boolean: {
		dimension: true,
		measure: false,
		aggregations: [],
		operators: ["eq", "ne"]
	}
};
/** 资源上限，全是字面量常量，不做设置项。 */
const businessLedgerLimits = {
	scanRows: 5e3,
	objectTypes: 16,
	viewsPerType: 8,
	measures: 4,
	filters: 8,
	dimensionValues: 50,
	listRows: 100
};
const bad$7 = (message) => new WorkError("teloa/invalid-input", message);
/** 缺键/多键都指出具体字段名（不带路径的泛化文案让模型无从下手排查，见页内新建业务定义的可用性缺陷复盘）。 */
const maxNamedFields = 8;
const exact$3 = (value, keys, message) => {
	if (!isRecord(value)) throw bad$7(message);
	const missing = keys.filter((key) => !(key in value)), extra = Object.keys(value).filter((key) => !keys.includes(key));
	if (!missing.length && !extra.length) return value;
	const parts = [];
	if (missing.length) parts.push("缺少字段 " + missing.slice(0, maxNamedFields).join("、"));
	if (extra.length) parts.push("不认识的字段 " + extra.slice(0, maxNamedFields).join("、"));
	throw bad$7(message.replace(/。$/, "") + "：" + parts.join("；") + "。");
};
/** 枚举/字面量取值不合法时把实际取值与允许列表一并报出，避免模型靠猜。 */
const invalidEnum = (message, value, allowed) => bad$7(message.replace(/。$/, "") + "，当前为「" + String(value) + "」，允许：" + allowed.join(" / ") + "。");
/** 嵌套读取器在抛错时补上位置前缀（`fields[2]`、`measures[0]`、`dimension` 等），错误码不变。 */
function atPath(path, run) {
	try {
		return run();
	} catch (error) {
		if (error instanceof WorkError) throw new WorkError(error.code, path + "：" + error.message);
		throw error;
	}
}
/** 字段 / 度量 / 维度标识：视图与动作只引用它，界面改标签不影响引用。至多 63 字符：看板 SQL 里它就是列名，PG 标识符超过 63 字节会被静默截断。 */
const fieldName$2 = /^[a-z0-9][a-z0-9_-]{0,62}$/;
/** 对象类型 / 视图 / 动作 / 目标本地标识：与清单资源标识同规矩，不接受下划线。 */
const localId$1 = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,119}$/;
const sourceIdPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,119}$/;
const toolName = /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)+$/;
const exactSemver = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
/**
* 声明文本会同时进两个地方：界面（文本节点）与模型上下文（台账摘要、动作说明）。
* 基础判据抄 `business-data.ts` 的 `text()`（禁 C0 控制符与 DEL，但放行 `\t`/`\n`/`\r`），
* 在此之上再显式禁 `\r` 与 `\n`——声明文本全部是单行标签，允许换行等于允许在模型上下文里
* 另起一段，那是注入面（规格 §8 第 1 条）；`\t` 不构成注入面，顺带放行不禁。
*/
const label$1 = (value, max) => typeof value === "string" && !!value.trim() && value === value.trim() && value.length <= max && !/[\x00-\x08\x0a-\x1f\x7f]/.test(value);
const domainText = (value) => isBusinessScopeKey(value) && value !== "general";
const semver$1 = (value) => typeof value === "string" && value.length <= 80 && exactSemver.test(value);
const dedupList = (values, min, max, item) => Array.isArray(values) && values.length >= min && values.length <= max && new Set(values).size === values.length && values.every(item);
function localizedShape(value, keys, message) {
	if (!isRecord(value) || !Object.keys(value).length || Object.keys(value).some((key) => !keys.includes(key))) throw bad$7(message);
	return value;
}
function localizedText(value, original, max, message) {
	let metadata;
	try {
		metadata = localizedMetadata(value);
	} catch {
		throw bad$7(message);
	}
	if (metadata.original !== original || Object.values(metadata.locales).some((item) => typeof item === "string" && !label$1(item, max))) throw bad$7(message);
	return metadata;
}
function fieldDefinition(value) {
	if (!isRecord(value)) throw bad$7("业务对象字段定义格式不正确。");
	const hasValues = value.values !== void 0, hasReference = value.referenceType !== void 0, hasLocalized = value.localized !== void 0;
	const keys = [
		"name",
		"label",
		...hasLocalized ? ["localized"] : [],
		"type",
		"required",
		"from",
		...hasValues ? ["values"] : [],
		...hasReference ? ["referenceType"] : []
	];
	const row = exact$3(value, keys, "业务对象字段定义格式不正确。");
	if (typeof row.name !== "string" || !fieldName$2.test(row.name)) throw bad$7("业务对象字段标识不合法。");
	if (!label$1(row.label, 80)) throw bad$7("业务对象字段标签不合法。");
	if (!businessFieldTypes.includes(row.type)) throw invalidEnum("业务对象字段类型不合法。", row.type, businessFieldTypes);
	const type = row.type;
	if (typeof row.required !== "boolean") throw bad$7("业务对象字段是否必填不合法。");
	if (!label$1(row.from, 120)) throw bad$7("业务对象字段来源不合法。");
	if (type === "enum") {
		if (!dedupList(row.values, 2, 32, (item) => label$1(item, 80))) throw bad$7("枚举取值必须是 2–32 个去重且不超 80 字的取值。");
	} else if (hasValues) throw bad$7("该字段类型不得带取值列表。");
	if (type === "reference") {
		if (typeof row.referenceType !== "string" || !localId$1.test(row.referenceType)) throw bad$7("引用目标类型标识不合法。");
	} else if (hasReference) throw bad$7("该字段类型不得带引用目标类型。");
	let localized;
	if (hasLocalized) {
		const metadata = localizedShape(row.localized, ["label", "values"], "业务对象字段本地化元数据不合法。"), result = {};
		if (metadata.label !== void 0) result.label = localizedText(metadata.label, row.label, 80, "业务对象字段标签本地化元数据不合法。");
		if (metadata.values !== void 0) {
			if (type !== "enum" || !Array.isArray(metadata.values) || metadata.values.length !== row.values.length) throw bad$7("业务对象枚举取值本地化元数据不合法。");
			result.values = metadata.values.map((item, index) => localizedText(item, row.values[index], 80, "业务对象枚举取值本地化元数据不合法。"));
		}
		localized = result;
	}
	return {
		name: row.name,
		label: row.label,
		...localized ? { localized } : {},
		type,
		required: row.required,
		from: row.from,
		...hasValues ? { values: [...row.values] } : {},
		...hasReference ? { referenceType: row.referenceType } : {}
	};
}
function progressDefinition(value, fields) {
	if (!isRecord(value)) throw bad$7("业务对象进度摘要定义格式不正确。");
	const hasChangedAtField = value.changedAtField !== void 0;
	const row = exact$3(value, [
		"stageField",
		"unfinished",
		"waitingForYou",
		...hasChangedAtField ? ["changedAtField"] : []
	], "业务对象进度摘要定义格式不正确。");
	if (typeof row.stageField !== "string" || !fieldName$2.test(row.stageField)) throw bad$7("业务对象进度阶段字段不合法。");
	const stage = fields.find((field) => field.name === row.stageField);
	if (!stage || stage.type !== "enum" || !stage.values) throw bad$7("业务对象进度阶段必须引用枚举字段。");
	const declared = (values, min) => dedupList(values, min, stage.values.length, (item) => typeof item === "string" && stage.values.includes(item));
	if (!declared(row.unfinished, 1) || !declared(row.waitingForYou, 0)) throw bad$7("业务对象进度取值必须是阶段枚举的去重子集。");
	if (row.waitingForYou.some((value) => !row.unfinished.includes(value))) throw bad$7("业务对象等待确认取值必须属于未完成取值。");
	if (hasChangedAtField) {
		if (typeof row.changedAtField !== "string" || !fieldName$2.test(row.changedAtField) || fields.find((field) => field.name === row.changedAtField)?.type !== "datetime") throw bad$7("业务对象最近变化字段必须引用日期时间字段。");
	}
	return {
		stageField: row.stageField,
		unfinished: [...row.unfinished],
		waitingForYou: [...row.waitingForYou],
		...hasChangedAtField ? { changedAtField: row.changedAtField } : {}
	};
}
function readBusinessObjectTypeDefinition(value) {
	if (!isRecord(value)) throw bad$7("业务对象类型定义格式不正确。");
	const hasDefaultAction = value.defaultAction !== void 0, hasProgress = value.progress !== void 0, hasLocalized = value.localized !== void 0;
	const keys = [
		"format",
		"id",
		"version",
		"domain",
		"title",
		...hasLocalized ? ["localized"] : [],
		"unit",
		"lead",
		"sourceId",
		"fields",
		...hasProgress ? ["progress"] : [],
		...hasDefaultAction ? ["defaultAction"] : []
	];
	const row = exact$3(value, keys, "业务对象类型定义格式不正确。");
	if (row.format !== "teloa.business-object-type/v1") throw invalidEnum("业务对象类型定义格式不正确。", row.format, ["teloa.business-object-type/v1"]);
	if (typeof row.id !== "string" || !localId$1.test(row.id)) throw bad$7("业务对象类型标识不合法。");
	if (!semver$1(row.version)) throw bad$7("业务对象类型版本必须是精确三段号。");
	if (!domainText(row.domain)) throw bad$7("业务对象类型所属业务范围不合法：" + businessScopeKeyRule + "，general 一律拒绝。");
	if (!label$1(row.title, 120)) throw bad$7("业务对象类型标题不合法。");
	if (!label$1(row.unit, 8)) throw bad$7("业务对象类型计数单位不合法。");
	if (!label$1(row.lead, 500)) throw bad$7("业务对象类型处境说明不合法。");
	if (typeof row.sourceId !== "string" || !sourceIdPattern.test(row.sourceId)) throw bad$7("业务对象类型绑定的数据源标识不合法。");
	if (!Array.isArray(row.fields) || row.fields.length < 1 || row.fields.length > 50) throw bad$7("业务对象类型字段必须是 1–50 项。");
	const fields = row.fields.map((item, index) => atPath(`fields[${index}]`, () => fieldDefinition(item)));
	if (new Set(fields.map((field) => field.name)).size !== fields.length || new Set(fields.map((field) => field.from)).size !== fields.length) throw bad$7("业务对象类型字段标识或来源不得重复。");
	const progress = hasProgress ? atPath("progress", () => progressDefinition(row.progress, fields)) : void 0;
	if (hasDefaultAction && (typeof row.defaultAction !== "string" || !localId$1.test(row.defaultAction))) throw bad$7("业务对象类型默认动作标识不合法。");
	let localized;
	if (hasLocalized) {
		const metadata = localizedShape(row.localized, [
			"title",
			"unit",
			"lead"
		], "业务对象类型本地化元数据不合法。"), result = {};
		if (metadata.title !== void 0) result.title = localizedText(metadata.title, row.title, 120, "业务对象类型标题本地化元数据不合法。");
		if (metadata.unit !== void 0) result.unit = localizedText(metadata.unit, row.unit, 8, "业务对象类型计数单位本地化元数据不合法。");
		if (metadata.lead !== void 0) result.lead = localizedText(metadata.lead, row.lead, 500, "业务对象类型处境说明本地化元数据不合法。");
		localized = result;
	}
	return {
		format: "teloa.business-object-type/v1",
		id: row.id,
		version: row.version,
		domain: row.domain,
		title: row.title,
		...localized ? { localized } : {},
		unit: row.unit,
		lead: row.lead,
		sourceId: row.sourceId,
		fields,
		...progress ? { progress } : {},
		...hasDefaultAction ? { defaultAction: row.defaultAction } : {}
	};
}
/**
* `filters` 与度量的 `where` 共用同一条读取路径，算子一律按 `businessFilterOperators`
* 全量校验（规格 §2.5「`where` 受与 `filters` 完全相同的算子约束」）——契约层不知道
* `field` 在对应对象类型里的真实类型，算子×字段类型的交叉约束（§2.5 表）留给读取层
* 核对（§3.3，同「动作 inputs 数量对齐工作模板」一样是跨声明检查）。
* `values` 上限 32 与 `fieldDefinition` 的枚举取值上限对齐：筛选值本质是枚举成员的子集。
*/
function filterClause(value, message) {
	const row = exact$3(value, [
		"field",
		"op",
		"values"
	], message);
	if (typeof row.field !== "string" || !fieldName$2.test(row.field)) throw bad$7(message);
	if (!businessFilterOperators.includes(row.op)) throw invalidEnum(message, row.op, businessFilterOperators);
	const op = row.op;
	if (!dedupList(row.values, 1, 32, (item) => label$1(item, 80))) throw bad$7(message);
	if (op !== "in" && row.values.length !== 1) throw bad$7(message);
	return {
		field: row.field,
		op,
		values: [...row.values]
	};
}
function measureDefinition(value) {
	if (!isRecord(value)) throw bad$7("业务视图度量定义格式不正确。");
	const hasField = value.field !== void 0, hasWhere = value.where !== void 0, hasLocalized = value.localized !== void 0;
	const keys = [
		"id",
		"label",
		...hasLocalized ? ["localized"] : [],
		"aggregation",
		...hasField ? ["field"] : [],
		...hasWhere ? ["where"] : []
	];
	const row = exact$3(value, keys, "业务视图度量定义格式不正确。");
	if (typeof row.id !== "string" || !fieldName$2.test(row.id)) throw bad$7("业务视图度量标识不合法。");
	if (!label$1(row.label, 80)) throw bad$7("业务视图度量标签不合法。");
	if (!businessAggregations.includes(row.aggregation)) throw invalidEnum("业务视图度量聚合方式不合法。", row.aggregation, businessAggregations);
	const aggregation = row.aggregation;
	if (aggregation === "count") {
		if (hasField) throw bad$7("count 聚合不得绑定字段。");
	} else if (typeof row.field !== "string" || !fieldName$2.test(row.field)) throw bad$7("非 count 聚合必须绑定字段。");
	const where = hasWhere ? atPath("where", () => filterClause(row.where, "业务视图度量筛选不合法。")) : void 0;
	let localized;
	if (hasLocalized) {
		const metadata = localizedShape(row.localized, ["label"], "业务视图度量本地化元数据不合法。"), result = {};
		if (metadata.label !== void 0) result.label = localizedText(metadata.label, row.label, 80, "业务视图度量标签本地化元数据不合法。");
		localized = result;
	}
	return {
		id: row.id,
		label: row.label,
		...localized ? { localized } : {},
		aggregation,
		...hasField ? { field: row.field } : {},
		...where ? { where } : {}
	};
}
function dimensionDefinition(value, kind) {
	if (!isRecord(value)) throw bad$7("业务视图维度定义格式不正确。");
	const hasBucket = value.bucket !== void 0;
	const keys = [
		"field",
		"limit",
		...hasBucket ? ["bucket"] : []
	];
	const row = exact$3(value, keys, "业务视图维度定义格式不正确。");
	if (typeof row.field !== "string" || !fieldName$2.test(row.field)) throw bad$7("业务视图维度字段不合法。");
	if (!Number.isSafeInteger(row.limit) || Number(row.limit) < 1 || Number(row.limit) > businessLedgerLimits.dimensionValues) throw bad$7("业务视图维度取值上限不合法。");
	if (kind === "trend") {
		if (!hasBucket) throw bad$7("趋势视图的维度必须带分桶。");
		if (!businessTimeBuckets.includes(row.bucket)) throw invalidEnum("趋势视图的维度分桶不合法。", row.bucket, businessTimeBuckets);
	} else if (hasBucket) throw bad$7("分布视图的维度不得带分桶。");
	return {
		field: row.field,
		limit: row.limit,
		...hasBucket ? { bucket: row.bucket } : {}
	};
}
function sortDefinition(value, measureIds) {
	if (!isRecord(value)) throw bad$7("业务视图排序定义格式不正确。");
	const hasMeasureId = value.measureId !== void 0;
	const keys = [
		"by",
		"direction",
		...hasMeasureId ? ["measureId"] : []
	];
	const row = exact$3(value, keys, "业务视图排序定义格式不正确。");
	if (row.by !== "dimension" && row.by !== "measure") throw invalidEnum("业务视图排序依据不合法。", row.by, ["dimension", "measure"]);
	if (row.direction !== "asc" && row.direction !== "desc") throw invalidEnum("业务视图排序方向不合法。", row.direction, ["asc", "desc"]);
	if (row.by === "measure") {
		if (typeof row.measureId !== "string" || !measureIds.includes(row.measureId)) throw bad$7("业务视图排序依据的度量必须是本视图已声明的度量。");
	} else if (hasMeasureId) throw bad$7("按维度排序不得带度量标识。");
	return {
		by: row.by,
		direction: row.direction,
		...hasMeasureId ? { measureId: row.measureId } : {}
	};
}
function windowDefinition(value) {
	const row = exact$3(value, ["field", "relative"], "业务视图时间窗定义格式不正确。");
	if (typeof row.field !== "string" || !fieldName$2.test(row.field)) throw bad$7("业务视图时间窗字段不合法。");
	if (!businessViewWindows.includes(row.relative)) throw invalidEnum("业务视图时间窗相对区间不在白名单内。", row.relative, businessViewWindows);
	return {
		field: row.field,
		relative: row.relative
	};
}
function readBusinessViewDefinition(value) {
	if (!isRecord(value)) throw bad$7("业务视图定义格式不正确。");
	if (!businessViewKinds.includes(value.kind)) throw invalidEnum("业务视图种类不合法。", value.kind, businessViewKinds);
	const kind = value.kind;
	const hasDimension = kind === "distribution" || kind === "trend", hasSort = kind !== "board-card", hasWindow = value.window !== void 0, hasLocalized = value.localized !== void 0;
	const keys = [
		"format",
		"id",
		"version",
		"domain",
		"title",
		...hasLocalized ? ["localized"] : [],
		"kind",
		"chart",
		"objectType",
		...hasDimension ? ["dimension"] : [],
		"measures",
		"filters",
		...hasSort ? ["sort"] : [],
		...hasWindow ? ["window"] : [],
		"limit"
	];
	const row = exact$3(value, keys, "业务视图定义格式不正确。");
	if (row.format !== "teloa.business-view/v1") throw invalidEnum("业务视图定义格式不正确。", row.format, ["teloa.business-view/v1"]);
	if (typeof row.id !== "string" || !localId$1.test(row.id)) throw bad$7("业务视图标识不合法。");
	if (!semver$1(row.version)) throw bad$7("业务视图版本必须是精确三段号。");
	if (!domainText(row.domain)) throw bad$7("业务视图所属业务范围不合法：" + businessScopeKeyRule + "，general 一律拒绝。");
	if (!label$1(row.title, 120)) throw bad$7("业务视图标题不合法。");
	if (!businessChartTypes.includes(row.chart)) throw invalidEnum("业务视图图表类型不合法。", row.chart, businessChartTypes);
	if (!businessViewCharts[kind].includes(row.chart)) throw invalidEnum("该视图种类不支持所选图表类型。", row.chart, businessViewCharts[kind]);
	const chart = row.chart;
	if (typeof row.objectType !== "string" || !localId$1.test(row.objectType)) throw bad$7("业务视图统计的对象类型标识不合法。");
	const dimension = hasDimension ? atPath("dimension", () => dimensionDefinition(row.dimension, kind)) : void 0;
	if (!Array.isArray(row.measures) || !row.measures.length || row.measures.length > businessLedgerLimits.measures) throw bad$7("业务视图度量数量不合法。");
	if ((kind === "list" || kind === "board-card" || chart === "pie") && row.measures.length !== 1) throw bad$7("清单、大盘卡与饼图视图必须恰好一项度量。");
	const measures = row.measures.map((item, index) => atPath(`measures[${index}]`, () => measureDefinition(item)));
	if (new Set(measures.map((measure) => measure.id)).size !== measures.length) throw bad$7("业务视图度量标识不得重复。");
	if (!Array.isArray(row.filters) || row.filters.length > businessLedgerLimits.filters) throw bad$7("业务视图筛选数量不合法。");
	const filters = row.filters.map((filter, index) => atPath(`filters[${index}]`, () => filterClause(filter, "业务视图筛选不合法。")));
	const sort = hasSort ? atPath("sort", () => sortDefinition(row.sort, measures.map((measure) => measure.id))) : void 0;
	const window = hasWindow ? atPath("window", () => windowDefinition(row.window)) : void 0;
	if (kind === "board-card") {
		if (row.limit !== 1) throw bad$7("大盘卡视图行数固定为 1。");
	} else if (kind === "list") {
		if (!Number.isSafeInteger(row.limit) || Number(row.limit) < 1 || Number(row.limit) > businessLedgerLimits.listRows) throw bad$7("清单视图行数必须在 1 到 100 之间。");
	} else if (!Number.isSafeInteger(row.limit) || Number(row.limit) < 1 || Number(row.limit) > businessLedgerLimits.dimensionValues) throw bad$7("视图行数不合法。");
	let localized;
	if (hasLocalized) {
		const metadata = localizedShape(row.localized, ["title"], "业务视图本地化元数据不合法。"), result = {};
		if (metadata.title !== void 0) result.title = localizedText(metadata.title, row.title, 120, "业务视图标题本地化元数据不合法。");
		localized = result;
	}
	return {
		format: "teloa.business-view/v1",
		id: row.id,
		version: row.version,
		domain: row.domain,
		title: row.title,
		...localized ? { localized } : {},
		kind,
		chart,
		objectType: row.objectType,
		...dimension ? { dimension } : {},
		measures,
		filters,
		...sort ? { sort } : {},
		...window ? { window } : {},
		limit: row.limit
	};
}
/** `from:'field'|'object'|'literal'` 逐字取值；`allowLiteral=false` 用于 `execution-tool` 的 `targetFrom`（目标必须来自对象）。 */
function actionInput(value, allowLiteral) {
	if (!isRecord(value)) throw bad$7("业务动作输入定义格式不正确。");
	if (value.from === "field") {
		const row = exact$3(value, ["from", "field"], "业务动作输入定义格式不正确。");
		if (typeof row.field !== "string" || !fieldName$2.test(row.field)) throw bad$7("业务动作输入字段不合法。");
		return {
			from: "field",
			field: row.field
		};
	}
	if (value.from === "object") {
		const row = exact$3(value, ["from", "part"], "业务动作输入定义格式不正确。");
		if (row.part !== "title" && row.part !== "id" && row.part !== "summary") throw invalidEnum("业务动作输入的对象部位不合法。", row.part, [
			"title",
			"id",
			"summary"
		]);
		return {
			from: "object",
			part: row.part
		};
	}
	if (value.from === "literal" && allowLiteral) {
		const row = exact$3(value, ["from", "value"], "业务动作输入定义格式不正确。");
		if (!label$1(row.value, 4e3)) throw bad$7("业务动作字面量输入不合法。");
		return {
			from: "literal",
			value: row.value
		};
	}
	throw invalidEnum("业务动作输入来源不合法。", value.from, allowLiteral ? [
		"field",
		"object",
		"literal"
	] : ["field", "object"]);
}
function actionTarget(value) {
	if (!isRecord(value)) throw bad$7("业务动作目标定义格式不正确。");
	if (value.kind === "work-template") {
		const row = exact$3(value, ["kind", "localId"], "业务动作目标定义格式不正确。");
		if (typeof row.localId !== "string" || !localId$1.test(row.localId)) throw bad$7("业务动作工作模板标识不合法。");
		return {
			kind: "work-template",
			localId: row.localId
		};
	}
	if (value.kind === "execution-tool") {
		const row = exact$3(value, [
			"kind",
			"localId",
			"tool",
			"workTemplate",
			"targetFrom"
		], "业务动作目标定义格式不正确。");
		if (typeof row.localId !== "string" || !localId$1.test(row.localId)) throw bad$7("业务动作执行工具本地标识不合法。");
		if (typeof row.tool !== "string" || row.tool.length > 128 || !toolName.test(row.tool)) throw bad$7("业务动作执行工具剧本标识不合法。");
		if (typeof row.workTemplate !== "string" || !localId$1.test(row.workTemplate)) throw bad$7("业务动作执行工具关联的工作模板标识不合法。");
		const targetFrom = atPath("targetFrom", () => actionInput(row.targetFrom, false));
		return {
			kind: "execution-tool",
			localId: row.localId,
			tool: row.tool,
			workTemplate: row.workTemplate,
			targetFrom
		};
	}
	throw invalidEnum("业务动作目标种类不在白名单内。", value.kind, ["work-template", "execution-tool"]);
}
function readBusinessActionDefinition(value) {
	const hasLocalized = isRecord(value) && value.localized !== void 0;
	const row = exact$3(value, [
		"format",
		"id",
		"version",
		"domain",
		"title",
		...hasLocalized ? ["localized"] : [],
		"objectType",
		"target",
		"inputs"
	], "业务动作定义格式不正确。");
	if (row.format !== "teloa.business-action/v1") throw invalidEnum("业务动作定义格式不正确。", row.format, ["teloa.business-action/v1"]);
	if (typeof row.id !== "string" || !localId$1.test(row.id)) throw bad$7("业务动作标识不合法。");
	if (!semver$1(row.version)) throw bad$7("业务动作版本必须是精确三段号。");
	if (!domainText(row.domain)) throw bad$7("业务动作所属业务范围不合法：" + businessScopeKeyRule + "，general 一律拒绝。");
	if (!label$1(row.title, 120)) throw bad$7("业务动作标题不合法。");
	if (typeof row.objectType !== "string" || !localId$1.test(row.objectType)) throw bad$7("业务动作作用的对象类型标识不合法。");
	const target = atPath("target", () => actionTarget(row.target));
	if (!Array.isArray(row.inputs) || !row.inputs.length || row.inputs.length > 100) throw bad$7("业务动作输入必须是 1–100 项。");
	const inputs = row.inputs.map((item, index) => atPath(`inputs[${index}]`, () => actionInput(item, true)));
	let localized;
	if (hasLocalized) {
		const metadata = localizedShape(row.localized, ["title"], "业务动作本地化元数据不合法。"), result = {};
		if (metadata.title !== void 0) result.title = localizedText(metadata.title, row.title, 120, "业务动作标题本地化元数据不合法。");
		localized = result;
	}
	return {
		format: "teloa.business-action/v1",
		id: row.id,
		version: row.version,
		domain: row.domain,
		title: row.title,
		...localized ? { localized } : {},
		objectType: row.objectType,
		target,
		inputs
	};
}
/** 定制层资源上限，与 `businessLedgerLimits` 同规矩：全是字面量常量，不做设置项。 */
const businessCustomizationLimits = {
	bodyBytes: 131072,
	draftsPerScope: 32,
	versionsPerDefinition: 50,
	diffRows: 400
};
/** 按 kind 分派到六个 read*：草案、本地声明、试算三条路径共用唯一一处分派，不各写一遍。 */
function readBusinessDefinitionBody(kind, value) {
	if (kind === "object-type") return readBusinessObjectTypeDefinition(value);
	if (kind === "view") return readBusinessViewDefinition(value);
	if (kind === "source-mapping") return readBusinessSourceMappingDefinition(value);
	if (kind === "widget") return readBusinessWidgetDefinition(value);
	if (kind === "dashboard") return readBusinessDashboardDefinition(value);
	return readBusinessActionDefinition(value);
}
/**
* 规范化正文：industryUpdateCanonical 的输出，同一份声明必得同一个字节串（差异基准与 bodyHash 都取它）。
* 入参是对应 `read*` 的返回值——那六个函数的返回里没有取值为 `undefined` 的键，因此输出一定是合法 JSON。
*/
function businessDefinitionCanonicalBody(definition) {
	const body = industryUpdateCanonical(definition);
	if (new TextEncoder().encode(body).byteLength > businessCustomizationLimits.bodyBytes) throw bad$7("业务声明正文超过 128 KiB。");
	return body;
}

//#endregion
//#region packages/contract/src/business-configuration.ts
const businessConfigurationLimits = {
	canonicalBytes: 2097152,
	definitions: 256,
	pages: 24,
	sources: 16,
	pendingDraftsPerOwner: 16
};
const businessConfigurationFormat = "teloa.business-configuration/v1";
const businessConfigurationDefinitionKinds = [
	"object-type",
	"view",
	"source-mapping",
	"widget",
	"dashboard"
];
const bad$6 = (message) => new WorkError("teloa/invalid-input", message);
const localId = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,119}$/;
const fieldName$1 = /^[a-z0-9][a-z0-9_-]{0,62}$/;
const title = (value) => typeof value === "string" && !!value.trim() && value === value.trim() && value.length <= 80 && !/[\x00-\x08\x0a-\x1f\x7f]/.test(value);
const identity = (kind, id) => kind + "\0" + id;
function exact$2(value, required, optional, message) {
	if (!isRecord(value) || required.some((key) => !(key in value)) || Object.keys(value).some((key) => !required.includes(key) && !optional.includes(key))) throw bad$6(message);
	return value;
}
function identifier(value, message) {
	if (typeof value !== "string" || !localId.test(value)) throw bad$6(message);
	return value;
}
function kind(value) {
	if (!businessConfigurationDefinitionKinds.includes(value)) throw bad$6("配置定义类型不在首片白名单内。");
	return value;
}
function unique(items, key, message) {
	if (new Set(items.map(key)).size !== items.length) throw bad$6(message);
	return items;
}
function bounded(value, max, message) {
	if (!Array.isArray(value) || value.length > max) throw bad$6(message);
	return value;
}
function source(value) {
	const row = exact$2(value, ["sourceId", "kind"], [], "配置来源格式不正确。");
	if (row.kind !== "local-records") throw bad$6("配置来源类型只允许 local-records。");
	return {
		sourceId: identifier(row.sourceId, "配置来源标识不合法。"),
		kind: "local-records"
	};
}
function readBusinessConfigurationPage(value) {
	if (!isRecord(value)) throw bad$6("配置页面格式不正确。");
	if (value.kind === "records") {
		const row = exact$2(value, [
			"id",
			"title",
			"kind",
			"objectType",
			"fields",
			"allowCreate",
			"allowEdit",
			"allowArchive"
		], [], "记录页面格式不正确。");
		if (!title(row.title)) throw bad$6("页面标题不合法。");
		const fields = bounded(row.fields, 50, "记录页面字段超过上限。").map((value) => {
			if (typeof value !== "string" || !fieldName$1.test(value)) throw bad$6("记录页面字段须使用字段 name。");
			return value;
		});
		if (!fields.length) throw bad$6("记录页面至少声明一个字段。");
		unique(fields, (value) => value, "记录页面字段重复。");
		if (typeof row.allowCreate !== "boolean" || typeof row.allowEdit !== "boolean" || typeof row.allowArchive !== "boolean") throw bad$6("记录页面操作开关须为布尔值。");
		return {
			id: identifier(row.id, "页面标识不合法。"),
			title: row.title,
			kind: "records",
			objectType: identifier(row.objectType, "记录页面对象类型标识不合法。"),
			fields,
			allowCreate: row.allowCreate,
			allowEdit: row.allowEdit,
			allowArchive: row.allowArchive
		};
	}
	if (value.kind === "dashboard") {
		const row = exact$2(value, [
			"id",
			"title",
			"kind",
			"dashboardId"
		], [], "看板页面格式不正确。");
		if (!title(row.title)) throw bad$6("页面标题不合法。");
		return {
			id: identifier(row.id, "页面标识不合法。"),
			title: row.title,
			kind: "dashboard",
			dashboardId: identifier(row.dashboardId, "看板页面绑定标识不合法。")
		};
	}
	throw bad$6("配置页面类型不在首片白名单内。");
}
function candidateDefinition(value) {
	const row = exact$2(value, ["kind", "definition"], [], "配置定义格式不正确。");
	const selected = kind(row.kind);
	const definition = readBusinessDefinitionBody(selected, row.definition);
	businessDefinitionCanonicalBody(definition);
	return {
		kind: selected,
		definition
	};
}
function common(value) {
	const row = exact$2(value, [
		"format",
		"scope",
		"title",
		"sources",
		"definitions",
		"pages"
	], ["homePageId"], "配置格式不正确。");
	if (row.format !== "teloa.business-configuration/v1") throw bad$6("配置格式版本不支持。");
	if (!isBusinessScopeKey(row.scope) || row.scope === "general") throw bad$6("配置业务范围不合法。");
	if (!title(row.title)) throw bad$6("配置标题不合法。");
	const sources = bounded(row.sources, businessConfigurationLimits.sources, "配置来源超过上限。").map(source);
	if (sources.length !== 1) throw bad$6("首片配置须有一个平台分配的本地记录来源。");
	unique(sources, (item) => item.sourceId, "配置来源标识重复。");
	const pages = unique(bounded(row.pages, businessConfigurationLimits.pages, "配置页面超过上限。").map(readBusinessConfigurationPage), (item) => item.id, "配置页面标识重复。");
	const homePageId = row.homePageId === void 0 ? void 0 : identifier(row.homePageId, "配置首页标识不合法。");
	if (pages.length ? homePageId === void 0 || !pages.some((item) => item.id === homePageId) : homePageId !== void 0) throw bad$6("配置首页必须绑定现有页面；空草案不得指定首页。");
	return {
		format: businessConfigurationFormat,
		scope: row.scope,
		title: row.title,
		sources,
		pages,
		...homePageId === void 0 ? {} : { homePageId },
		definitions: row.definitions
	};
}
function checkSize(value) {
	if (new TextEncoder().encode(industryUpdateCanonical(value)).byteLength > businessConfigurationLimits.canonicalBytes) throw bad$6("配置规范 JSON 超过 2 MiB。");
}
function checkPageBindings(pages, keys) {
	for (const page of pages) {
		const target = page.kind === "records" ? identity("object-type", page.objectType) : identity("dashboard", page.dashboardId);
		if (!keys.has(target)) throw bad$6("页面绑定的定义不存在：" + page.id + "。");
	}
}
function readBusinessConfigurationCandidate(value) {
	const row = common(value);
	const definitions = unique(bounded(row.definitions, businessConfigurationLimits.definitions, "配置定义超过上限。").map(candidateDefinition), (item) => identity(item.kind, item.definition.id), "配置定义身份重复。");
	for (const item of definitions) if (item.definition.domain !== row.scope) throw bad$6("配置定义所属业务范围与配置不一致。");
	const result = {
		...row,
		definitions
	};
	checkPageBindings(result.pages, new Set(definitions.map((item) => identity(item.kind, item.definition.id))));
	checkSize(result);
	return result;
}

//#endregion
//#region packages/contract/src/group-attachments.ts
const groupAttachmentFileMaxBytes = 16 * 1024 * 1024;
/**
* 上传请求体上限，防的是「超限的请求在被拒之前先吃掉宿主内存」：取满额文件档的 base64 长度，外加 64 KiB 字段余量
* （requestId、groupId、版本、MIME、≤120 字文件名经 JSON 转义，远小于这个量）。超过即在读请求体之前拒绝。
*/
const groupAttachmentUploadMaxBodyBytes = 4 * Math.ceil(groupAttachmentFileMaxBytes / 3) + 64 * 1024;

//#endregion
//#region packages/contract/src/business-views-v2.ts
const businessViewFormatV2 = "teloa.business-view/v2";
/** 基础字段沿 v1 能力表；富字段只补业务快照域当前具备的两类统计语义。 */
const businessRichViewFieldCapabilities = {
	money: {
		dimension: false,
		measure: true,
		aggregations: [
			"sum",
			"avg",
			"min",
			"max"
		],
		operators: [
			"eq",
			"ne",
			"gte",
			"lte"
		]
	},
	"multi-enum": {
		dimension: true,
		measure: false,
		aggregations: [],
		operators: ["contains", "overlaps"]
	},
	"multi-reference": {
		dimension: false,
		measure: false,
		aggregations: [],
		operators: ["contains", "overlaps"]
	}
};
const bad$5 = (message = "业务类型化视图格式或字段引用不合法。") => new WorkError("teloa/invalid-input", message);
const currency = (value) => typeof value === "string" && /^[A-Z]{3}$/.test(value);
function filterShadow(value) {
	if (!isRecord(value)) return value;
	return {
		...value,
		op: value.op === "contains" ? "eq" : value.op === "overlaps" ? "in" : value.op
	};
}
/** 仅用于 v1 共同结构校验；不能持久化替身，也不能据此执行富字段统计。 */
function businessViewV2LegacyShape(view) {
	return {
		...view,
		format: "teloa.business-view/v1",
		measures: view.measures.map(({ currency: _, where, ...measure }) => ({
			...measure,
			...where ? { where: filterShadow(where) } : {}
		})),
		filters: view.filters.map((filter) => filterShadow(filter))
	};
}
function readBusinessViewDefinitionV2(value) {
	if (!isRecord(value) || value.format !== "teloa.business-view/v2" || !Array.isArray(value.measures) || !Array.isArray(value.filters)) throw bad$5();
	const currencies = /* @__PURE__ */ new Map();
	const measures = value.measures.map((value, index) => {
		if (!isRecord(value)) return value;
		const { currency: code, ...measure } = value;
		if (Object.hasOwn(value, "currency")) {
			if (!currency(code) || value.aggregation === "count") throw bad$5("金额度量的币种必须是大写三字母且不能用于 count。");
			currencies.set(index, code);
		}
		return {
			...measure,
			...Object.hasOwn(measure, "where") ? { where: filterShadow(measure.where) } : {}
		};
	});
	const legacy = readBusinessViewDefinition({
		...value,
		format: "teloa.business-view/v1",
		measures,
		filters: value.filters.map(filterShadow)
	});
	const filter = (parsed, original) => ({
		...parsed,
		op: original.op
	});
	return {
		...legacy,
		format: businessViewFormatV2,
		measures: legacy.measures.map((measure, index) => ({
			...measure,
			...currencies.has(index) ? { currency: currencies.get(index) } : {},
			...measure.where ? { where: filter(measure.where, value.measures[index].where) } : {}
		})),
		filters: legacy.filters.map((parsed, index) => filter(parsed, value.filters[index]))
	};
}
function readBusinessViewDefinitionVersioned(value) {
	if (!isRecord(value)) throw bad$5();
	if (value.format === "teloa.business-view/v1") return readBusinessViewDefinition(value);
	if (value.format === "teloa.business-view/v2") return readBusinessViewDefinitionV2(value);
	throw bad$5("业务视图格式版本不支持。");
}
/** 跨声明校验统一读取真实类型，不把 rich 验证影子当 text 使用。 */
function assertBusinessViewV2References(value, objectValue) {
	const view = readBusinessViewDefinitionVersioned(value), object = readBusinessObjectTypeDefinitionVersioned(objectValue);
	if (view.objectType !== object.id || view.domain !== object.domain) throw bad$5("视图引用的对象类型或业务范围不一致。");
	const fields = new Map(object.fields.map((field) => [field.name, field]));
	const field = (name) => {
		const found = fields.get(name);
		if (!found || view.format === "teloa.business-view/v1" && "format" in found) throw bad$5("视图引用的字段不存在或旧视图不支持富字段。");
		return found;
	};
	const capabilities = (definition) => "format" in definition ? businessRichViewFieldCapabilities[definition.type] : businessFieldCapabilities[definition.type];
	if (view.dimension) {
		const target = field(view.dimension.field);
		if (!capabilities(target).dimension || view.kind === "trend" && target.type !== "datetime" || view.kind === "distribution" && target.type === "datetime") throw bad$5("字段类型不支持该视图维度。");
	}
	if (view.window && field(view.window.field).type !== "datetime") throw bad$5("时间窗只能引用 datetime 字段。");
	const filter = (clause) => {
		const target = field(clause.field);
		if (!capabilities(target).operators.includes(clause.op)) throw bad$5("字段类型不支持该筛选算子。");
		if (target.type === "multi-enum" && clause.values.some((value) => !target.values.includes(value))) throw bad$5("多选筛选只能引用声明成员。");
		if (target.type === "multi-reference" && clause.values.some((value) => !isBusinessRecordId(value))) throw bad$5("关联筛选必须引用合法记录身份。");
		if (target.type === "money") for (const value of clause.values) readBusinessRichFieldValue(target, value);
	};
	for (const clause of view.filters) filter(clause);
	for (const measure of view.measures) {
		if (measure.aggregation !== "count") {
			const target = field(measure.field);
			if (!capabilities(target).measure || !capabilities(target).aggregations.includes(measure.aggregation)) throw bad$5("字段类型不支持该聚合。");
			const code = "currency" in measure ? measure.currency : void 0;
			if (target.type === "money" ? !currency(code) || !target.currencies.includes(code) : code !== void 0) throw bad$5("金额度量必须绑定声明币种，基础度量不得声明币种。");
		}
		if (measure.where) filter(measure.where);
	}
}

//#endregion
//#region packages/contract/src/pending-requests.ts
/**
* 只有这些浏览器写命令能进入跨浏览器恢复目录。这里故意不用“所有带 requestId 的命令”推断，
* 新增命令需要经过载荷与凭据边界审查后再明确加入。
* 携带凭据原值的命令（im/channels/save）不得列入：目录会原样冻结请求体。它按 channelId 覆盖保存，天然幂等，无需跨浏览器恢复。
* market-content/import 的原文件可达 20 MiB，不重复冻结到此目录；客户端只保存固定请求身份并通过 market-content/receipt 恢复。
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
const industryPackageFormats = [
	"teloa.business-package/v2",
	"teloa.business-package/v3",
	"teloa.business-package/v4"
];
const isIndustryPackageFormat = (value) => industryPackageFormats.some((format) => format === value);
/** 新完整配置资源仅进入显式 v4；旧格式继续按原资源白名单读取，不能悄悄忽略页面。 */
function assertIndustryConfigurationResourceFormat(format, kind) {
	if (kind === "business-configuration" && format !== "teloa.business-package/v4") throw new WorkError("teloa/invalid-input", "完整业务配置资源仅支持 teloa.business-package/v4。");
}
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
//#region packages/contract/src/local-retrieval.ts
const utf8 = new TextEncoder();

//#endregion
//#region packages/contract/src/business-records.ts
const text = (v, max, empty = false) => typeof v === "string" && v === v.trim() && (empty || v.length > 0) && v.length <= max && !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(v);
/** 单选、多选与回包共用记录身份边界，不从显示名称猜测或修正身份。 */
function isBusinessRecordId(value) {
	return text(value, 200) && /^[\p{L}\p{N}][\p{L}\p{N}._:@/+ -]*$/u.test(value);
}

//#endregion
//#region packages/contract/src/business-rich-fields.ts
const businessRichFieldFormat = "teloa.business-rich-field/v2";
const fieldName = /^[a-z0-9][a-z0-9_-]{0,62}$/;
const currencyCode = /^[A-Z]{3}$/;
const decimalPattern = /^-?(?:0|[1-9]\d{0,17})(?:\.\d{1,4})?$/;
const bad$4 = () => new WorkError("teloa/invalid-input", "富字段声明或取值不合法。");
const label = (value, max) => typeof value === "string" && !!value.trim() && value === value.trim() && value.length <= max && !/[\x00-\x08\x0a-\x1f\x7f]/.test(value);
const exact$1 = (value, keys) => isRecord(value) && keys.every((key) => Object.hasOwn(value, key)) && Object.keys(value).every((key) => keys.includes(key));
/** v2 声明独立于既有七类字段；旧对象定义读取器继续严格拒收新类型。 */
function readBusinessRichFieldDefinition(value) {
	if (!isRecord(value)) throw bad$4();
	const shared = [
		"format",
		"name",
		"label",
		"from",
		"required",
		"type"
	];
	const keys = value.type === "money" ? [...shared, "currencies"] : value.type === "multi-enum" ? [...shared, "values"] : value.type === "multi-reference" ? [...shared, "referenceType"] : [];
	if (!keys.length || !exact$1(value, keys) || value.format !== "teloa.business-rich-field/v2" || typeof value.name !== "string" || !fieldName.test(value.name) || !label(value.label, 80) || !label(value.from, 120) || typeof value.required !== "boolean") throw bad$4();
	const common = {
		format: businessRichFieldFormat,
		name: value.name,
		label: value.label,
		from: value.from,
		required: value.required
	};
	if (value.type === "money") {
		if (!Array.isArray(value.currencies) || value.currencies.length < 1 || value.currencies.length > 16 || value.currencies.some((item) => typeof item !== "string" || !currencyCode.test(item)) || new Set(value.currencies).size !== value.currencies.length) throw bad$4();
		return {
			...common,
			type: "money",
			currencies: [...value.currencies]
		};
	}
	if (value.type === "multi-reference") {
		if (typeof value.referenceType !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,119}$/.test(value.referenceType)) throw bad$4();
		return {
			...common,
			type: "multi-reference",
			referenceType: value.referenceType
		};
	}
	if (!Array.isArray(value.values) || value.values.length < 2 || value.values.length > 32 || value.values.some((item) => !label(item, 80)) || new Set(value.values).size !== value.values.length) throw bad$4();
	return {
		...common,
		type: "multi-enum",
		values: [...value.values]
	};
}
function scaledDecimal(decimal) {
	if (!decimalPattern.test(decimal) || decimal.includes(".") && decimal.endsWith("0")) throw bad$4();
	const negative = decimal.startsWith("-"), [whole, fraction = ""] = (negative ? decimal.slice(1) : decimal).split(".");
	const scaled = BigInt(whole) * 10000n + BigInt(fraction.padEnd(4, "0"));
	if (negative && scaled === 0n) throw bad$4();
	return negative ? -scaled : scaled;
}
/** 只接规范字符串；不静默改写请求正文或既有快照哈希。 */
function readBusinessRichFieldValue(definition, raw) {
	const field = readBusinessRichFieldDefinition(definition);
	if (raw === void 0 || raw === "") {
		if (field.required) throw bad$4();
		return;
	}
	if (typeof raw !== "string" || raw.length > 2e3) throw bad$4();
	let value;
	try {
		value = JSON.parse(raw);
	} catch {
		throw bad$4();
	}
	if (field.type === "money") {
		if (!exact$1(value, ["currency", "decimal"]) || typeof value.currency !== "string" || !field.currencies.includes(value.currency) || typeof value.decimal !== "string" || JSON.stringify({
			currency: value.currency,
			decimal: value.decimal
		}) !== raw) throw bad$4();
		return {
			type: "money",
			currency: value.currency,
			decimal: value.decimal,
			scaled: scaledDecimal(value.decimal),
			canonical: raw
		};
	}
	if (field.type === "multi-reference") {
		if (!Array.isArray(value) || value.length < 1 || value.length > 32 || value.some((item) => !isBusinessRecordId(item)) || new Set(value).size !== value.length || JSON.stringify(value) !== raw) throw bad$4();
		const ids = [...value].sort();
		if (ids.some((id, index) => id !== value[index])) throw bad$4();
		return {
			type: "multi-reference",
			ids,
			canonical: raw
		};
	}
	if (!Array.isArray(value) || value.length < 1 || value.length > 32 || value.some((item) => typeof item !== "string") || new Set(value).size !== value.length || JSON.stringify(value) !== raw) throw bad$4();
	const selected = new Set(value), ordered = field.values.filter((item) => selected.has(item));
	if (ordered.length !== value.length || ordered.some((item, index) => item !== value[index])) throw bad$4();
	return {
		type: "multi-enum",
		values: ordered,
		canonical: raw
	};
}

//#endregion
//#region packages/contract/src/business-definitions-v2.ts
const businessObjectTypeFormatV2 = "teloa.business-object-type/v2";
const bad$3 = () => new WorkError("teloa/invalid-input", "业务对象类型格式版本不支持。");
const isRich = (value) => isRecord(value) && value.format === "teloa.business-rich-field/v2";
/** 仅供旧版的共同字段、进度与身份校验；不持久化该替身定义。 */
function businessObjectTypeV2LegacyShape(definition) {
	const { constraints: _, ...common } = definition;
	return {
		...common,
		format: "teloa.business-object-type/v1",
		fields: definition.fields.map((field) => {
			if (!("format" in field)) return field;
			return {
				name: field.name,
				label: field.label,
				type: "text",
				required: field.required,
				from: field.from
			};
		})
	};
}
/** v2 复用 v1 的共同结构和交叉约束，但旧入口仍只接受 v1。 */
function readBusinessObjectTypeDefinitionV2(value) {
	if (!isRecord(value) || value.format !== "teloa.business-object-type/v2" || !Array.isArray(value.fields)) throw bad$3();
	const rich = /* @__PURE__ */ new Map();
	const validationFields = value.fields.map((field, index) => {
		if (!isRich(field)) return field;
		const parsed = readBusinessRichFieldDefinition(field);
		rich.set(index, parsed);
		return {
			name: parsed.name,
			label: parsed.label,
			type: "text",
			required: parsed.required,
			from: parsed.from
		};
	});
	const { constraints: rawConstraints, ...common } = value;
	const legacy = readBusinessObjectTypeDefinition({
		...common,
		format: "teloa.business-object-type/v1",
		fields: validationFields
	});
	const fields = legacy.fields.map((field, index) => rich.get(index) ?? field);
	let constraints;
	if (Object.hasOwn(value, "constraints")) {
		if (!isRecord(rawConstraints) || Object.keys(rawConstraints).length !== 1 || !Array.isArray(rawConstraints.uniqueFields) || rawConstraints.uniqueFields.length < 1 || rawConstraints.uniqueFields.length > 50 || new Set(rawConstraints.uniqueFields).size !== rawConstraints.uniqueFields.length || rawConstraints.uniqueFields.some((name) => typeof name !== "string" || !fields.some((field) => field.name === name && field.type !== "multi-enum"))) throw bad$3();
		constraints = { uniqueFields: [...rawConstraints.uniqueFields] };
	}
	return {
		...legacy,
		format: businessObjectTypeFormatV2,
		fields,
		...constraints ? { constraints } : {}
	};
}
function readBusinessObjectTypeDefinitionVersioned(value) {
	if (!isRecord(value)) throw bad$3();
	if (value.format === "teloa.business-object-type/v1") return readBusinessObjectTypeDefinition(value);
	if (value.format === "teloa.business-object-type/v2") return readBusinessObjectTypeDefinitionV2(value);
	throw bad$3();
}

//#endregion
//#region packages/contract/src/business-configuration-v2.ts
const businessConfigurationFormatV2 = "teloa.business-configuration/v2";
const bad$2 = (message) => new WorkError("teloa/invalid-input", message);
const unknownFormat = () => bad$2("业务配置格式版本不支持。");
function checkReferences(candidate) {
	const objects = new Map(candidate.definitions.filter((item) => item.kind === "object-type").map((item) => [item.definition.id, item.definition]));
	const views = new Map(candidate.definitions.filter((item) => item.kind === "view").map((item) => [item.definition.id, item.definition]));
	const widgets = new Map(candidate.definitions.filter((item) => item.kind === "widget").map((item) => [item.definition.id, item.definition]));
	const sources = new Set(candidate.sources.map((item) => item.sourceId));
	const hasRichFields = [...objects.values()].some((object) => object.fields.some((field) => "format" in field));
	for (const object of objects.values()) if (!sources.has(object.sourceId)) throw bad$2("对象类型引用的本地记录来源不存在。");
	for (const view of views.values()) {
		const object = objects.get(view.objectType);
		if (!object) throw bad$2("视图引用的对象类型不存在。");
		assertBusinessViewV2References(view, object);
	}
	for (const widget of widgets.values()) {
		if (hasRichFields && widget.query !== void 0) throw bad$2("富字段配置暂不支持 SQL 组件。");
		if (widget.viewRef && !views.has(widget.viewRef)) throw bad$2("组件引用的视图不存在。");
		if (widget.drilldown) {
			const object = objects.get(widget.drilldown.objectType);
			if (!object) throw bad$2("组件下钻的对象类型不存在。");
			if (widget.drilldown.match) {
				const field = object.fields.find((item) => item.name === widget.drilldown.match.field);
				if (!field || "format" in field) throw bad$2("组件下钻字段不存在或尚不支持富字段。");
			}
		}
	}
	for (const item of candidate.definitions) if (item.kind === "dashboard") {
		for (const widget of item.definition.widgets) if (!widgets.has(widget)) throw bad$2("看板引用的组件不存在。");
	}
	for (const page of candidate.pages) if (page.kind === "records") {
		const object = objects.get(page.objectType);
		if (!object || page.fields.some((name) => !object.fields.some((field) => field.name === name))) throw bad$2("记录页引用的对象类型或字段不存在。");
	}
}
/** 与 v1 类型分开，旧生产调用继续严格拒收 v2。 */
function readBusinessConfigurationCandidateV2(value) {
	if (!isRecord(value) || value.format !== "teloa.business-configuration/v2" || !Array.isArray(value.definitions)) throw unknownFormat();
	const objects = /* @__PURE__ */ new Map();
	const views = /* @__PURE__ */ new Map();
	const validationDefinitions = value.definitions.map((item, index) => {
		if (isRecord(item) && item.kind === "view") {
			const definition = readBusinessViewDefinitionVersioned(item.definition);
			businessDefinitionCanonicalBody(definition);
			views.set(index, definition);
			return {
				...item,
				definition: definition.format === "teloa.business-view/v2" ? businessViewV2LegacyShape(definition) : definition
			};
		}
		if (!isRecord(item) || item.kind !== "object-type") return item;
		const definition = readBusinessObjectTypeDefinitionV2(item.definition);
		businessDefinitionCanonicalBody(definition);
		objects.set(index, definition);
		return {
			...item,
			definition: businessObjectTypeV2LegacyShape(definition)
		};
	});
	const legacy = readBusinessConfigurationCandidate({
		...value,
		format: businessConfigurationFormat,
		definitions: validationDefinitions
	});
	const definitions = legacy.definitions.map((item, index) => objects.has(index) ? {
		kind: "object-type",
		definition: objects.get(index)
	} : views.has(index) ? {
		kind: "view",
		definition: views.get(index)
	} : item);
	const candidate = {
		...legacy,
		format: businessConfigurationFormatV2,
		definitions
	};
	if (new TextEncoder().encode(industryUpdateCanonical(candidate)).byteLength > businessConfigurationLimits.canonicalBytes) throw bad$2("配置规范 JSON 超过 2 MiB。");
	checkReferences(candidate);
	return candidate;
}

//#endregion
//#region packages/contract/src/business-dashboard-resource.ts
const businessDashboardResourceFormat = "teloa.business-dashboard-resource/v1";
const bad$1 = (message) => new WorkError("teloa/invalid-input", message);
function readBusinessDashboardResource(value) {
	if (!isRecord(value) || Object.keys(value).length !== 4 || ![
		"format",
		"id",
		"version",
		"configuration"
	].every((key) => Object.hasOwn(value, key)) || value.format !== "teloa.business-dashboard-resource/v1") throw bad$1("业务看板资源格式不正确或包含未知字段。");
	if (typeof value.id !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,119}$/.test(value.id)) throw bad$1("业务看板资源标识不合法。");
	if (typeof value.version !== "string" || value.version.length > 80 || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value.version)) throw bad$1("业务看板资源版本必须是固定的三段版本号。");
	const configuration = readBusinessConfigurationCandidateV2(value.configuration);
	if (!configuration.pages.some((page) => page.kind === "dashboard")) throw bad$1("业务看板资源必须包含可预览的看板页面。");
	if (configuration.definitions.some((row) => row.kind === "source-mapping")) throw bad$1("业务看板资源不携带已有同步绑定；请在目标业务另行准备。");
	if (configuration.definitions.some((row) => row.kind === "object-type" && row.definition.defaultAction !== void 0)) throw bad$1("业务看板资源不携带已有默认动作；请在目标业务另行配置。");
	return {
		format: businessDashboardResourceFormat,
		id: value.id,
		version: value.version,
		configuration
	};
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
	"business-action",
	"business-configuration"
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
	if (!isIndustryPackageFormat(row.format)) throw bad("只支持 teloa.business-package/v2、v3 或 v4 行业模板。");
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
			...row.format !== "teloa.business-package/v2" ? ["modelDependencies"] : []
		]), resourceId = id(value.id), title = requiredText(value.title, "资源名称", 120);
		if (!kinds.includes(value.kind) || !semver(value.version) || typeof value.required !== "boolean") throw bad("行业资源类型、版本或 required 无效。");
		assertIndustryConfigurationResourceFormat(row.format, value.kind);
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
	for (const entry of entrypoints) if (!["skill", "work-template"].includes(byId.get(entry)?.kind ?? "")) throw bad("业务入口必须引用存在的技能或工作模板。");
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
//#region packages/harness-dsh/src/managed-package-lock.ts
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
	dashboard: "dashboards",
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
/** 一次校验的全部问题；message 为各问题 `English / 中文` 按行拼接，旧调用方直接打印仍可读。 */
var MarketValidationError = class extends Error {
	constructor(problems) {
		super(problems.map((item) => message(item.en, item.zh)).join("\n"));
		this.name = "MarketValidationError";
		this.problems = problems;
	}
};
/**
* 全部稳定 rule 标识（自动审核按它决策，DEVELOPMENT.md「市场仓校验器」逐条列出）。另有契约读取器错误的 rule 取 WorkError.code（`teloa/` 前缀），
* 不带该前缀时为 catalog.contract；validator.error 为意外异常（如文件不可读）。新增或改名须同步本表与文档，测试核对每处 fail/problem 均已登记。
*/
const MARKET_VALIDATION_RULES = Object.freeze([
	"catalog.type-directory",
	"catalog.entry-file",
	"catalog.json",
	"catalog.compatibility-range",
	"catalog.contract",
	"catalog.file-name",
	"catalog.wrong-directory",
	"catalog.duplicate-id",
	"catalog.provenance-only-artifact",
	"catalog.alternatives",
	"catalog.github-minimum-app",
	"catalog.alternatives-minimum-app",
	"catalog.derivative-minimum-app",
	"catalog.installs-source",
	"catalog.secret-group",
	"model.endpoint",
	"model.duplicate-ollama-name",
	"model.digest-missing",
	"artifact.hidden-file",
	"artifact.symlink",
	"artifact.irregular-file",
	"artifact.executable-bit",
	"artifact.script",
	"artifact.unsafe-path",
	"artifact.file-size",
	"artifact.directory-missing",
	"artifact.file-count",
	"artifact.total-size",
	"artifact.type-directory",
	"artifact.orphan",
	"artifact.version-directory",
	"skill.frontmatter-missing",
	"skill.frontmatter-unclosed",
	"skill.frontmatter-line",
	"skill.frontmatter-duplicate",
	"skill.frontmatter-keys",
	"skill.name-mismatch",
	"skill.description",
	"skill.body-empty",
	"skill.name-clash",
	"license.file-missing",
	"license.not-listed",
	"license.text-mismatch",
	"derivative.unchanged-mismatch",
	"derivative.case-conflict",
	"derivative.unlisted-file",
	"derivative.removed-unlisted",
	"derivative.modifications-file",
	"derivative.change-notice",
	"derivative.review-missing",
	"derivative.review-coverage",
	"connector.license-terms",
	"connector.lock-missing",
	"connector.lock-generate",
	"connector.lock-invalid",
	"solution.manifest-missing",
	"solution.manifest-invalid",
	"solution.manifest-id",
	"solution.manifest-scope",
	"solution.domain",
	"solution.industries",
	"solution.resource-missing",
	"solution.connection-file-missing",
	"solution.connection-server",
	"solution.connection-tool",
	"solution.tool-confirmation",
	"dashboard.configuration-invalid",
	"dashboard.configuration-identity",
	"dashboard.manifest-shape",
	"solution.configuration-minimum-app",
	"role.artifact-files",
	"role.json-missing",
	"role.solution-missing",
	"role.version",
	"role.scope",
	"role.from-solution-path",
	"role.source-missing",
	"role.json-mismatch",
	"role.json-invalid",
	"role.format",
	"role.definition-mismatch",
	"index.v1-industry",
	"docs.catalog-version-marker",
	"docs.out-of-date",
	"validator.error"
]);
/** 单个问题：rule 为稳定标识（契约错误取 WorkError.code），file 相对目录根，entry 为条目 id，field 为条目 JSON 字段路径；未知为 null。 */
const problem = (rule, en, zh, { file = null, entry = null, field = null } = {}) => ({
	file,
	entry,
	field,
	rule,
	en,
	zh
});
const fail = (rule, en, zh, detail) => {
	throw new MarketValidationError([problem(rule, en, zh, detail)]);
};
const reason = (error) => error instanceof Error ? error.message : String(error);
/** 契约读取器错误：rule 取 WorkError.code（如 teloa/invalid-input），文案透传契约原文。 */
const contractRule = (error) => typeof error?.code === "string" && /^teloa\//.test(error.code) ? error.code : "catalog.contract";
/** 意外异常记为 validator.error；文案不回显本机绝对路径：目录根下的路径改写为相对目录根，其余（如 Node 文件系统错误的 path/dest 在根外或不知目录根）只留文件名。 */
const unexpectedProblem = (error, root) => {
	let text = reason(error);
	if (root !== void 0) text = text.replaceAll(join(root, sep), "");
	for (const path of [error?.path, error?.dest]) if (typeof path === "string" && isAbsolute(path)) text = text.replaceAll(path, basename(path));
	return problem("validator.error", `unexpected error: ${text}`, `意外错误：${text}`);
};
/** 收集式执行：MarketValidationError 记入 problems（补默认 file/entry 定位）并返回 undefined；其他异常（如 EACCES）记为 validator.error，不丢已收集的问题。context.root 仅用于把异常文案里的路径相对化。 */
async function collect(problems, context, fn) {
	try {
		return await fn();
	} catch (error) {
		const found = error instanceof MarketValidationError ? error.problems : [unexpectedProblem(error, context.root)];
		for (const item of found) {
			item.file ??= context.file ?? null;
			item.entry ??= context.entry ?? null;
		}
		problems.push(...found);
	}
}
/** 同一 rule+file+entry 只留第一条（如条目层与工件树层都报同一许可文件缺失），再一并抛出。 */
const settle = (problems) => {
	if (!problems.length) return;
	const seen = /* @__PURE__ */ new Set();
	throw new MarketValidationError(problems.filter((item) => {
		const key = [
			item.rule,
			item.file,
			item.entry
		].join("\0");
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	}));
};
const exists = (path) => lstat(path).then(() => true, (error) => {
	if (error?.code === "ENOENT") return false;
	throw error;
});
function gitWorktree(root) {
	for (let directory = resolve(root);;) {
		const dotGit = join(directory, ".git");
		let info = null;
		try {
			info = lstatSync(dotGit);
		} catch {}
		if (info?.isDirectory()) return {
			top: directory,
			gitDir: dotGit,
			commonDir: dotGit
		};
		if (info?.isFile()) {
			const match = /^gitdir: (.+)$/m.exec(readFileSync(dotGit, "utf8"));
			if (!match) return null;
			const gitDir = resolve(directory, match[1].trim());
			let commonDir = gitDir;
			try {
				commonDir = resolve(gitDir, readFileSync(join(gitDir, "commondir"), "utf8").trim());
			} catch {}
			return {
				top: directory,
				gitDir,
				commonDir
			};
		}
		const parent = dirname(directory);
		if (parent === directory) return null;
		directory = parent;
	}
}
/** .git/index（v2–v4）里的已跟踪路径及其全部上级目录；没有 index、读不了、非 SHA-1 仓库或格式不认识返回 null。 */
function gitTracked(gitDir, commonDir) {
	let config;
	try {
		config = readFileSync(join(commonDir, "config"), "utf8");
	} catch {
		return null;
	}
	const format = /^\s*objectformat\s*=\s*(\S+)/im.exec(config)?.[1];
	if (format && format.toLowerCase() !== "sha1") return null;
	let bytes;
	try {
		bytes = readFileSync(join(gitDir, "index"));
	} catch {
		return null;
	}
	if (bytes.length < 12 || bytes.toString("latin1", 0, 4) !== "DIRC") return null;
	const version = bytes.readUInt32BE(4), count = bytes.readUInt32BE(8), tracked = /* @__PURE__ */ new Set();
	if (version < 2 || version > 4) return null;
	let at = 12, previous = "";
	for (let index = 0; index < count; index++) {
		if (at + 62 > bytes.length) return null;
		let position = at + 62;
		if (version >= 3 && bytes.readUInt16BE(at + 60) & 16384) position += 2;
		let strip = 0;
		if (version === 4) {
			let byte = bytes[position++];
			strip = byte & 127;
			while (byte & 128) {
				byte = bytes[position++];
				strip = strip + 1 << 7 | byte & 127;
			}
		}
		const end = bytes.indexOf(0, position);
		if (end < 0 || strip > previous.length) return null;
		const path = (version === 4 ? previous.slice(0, previous.length - strip) : "") + bytes.toString("utf8", position, end);
		previous = path;
		at = version === 4 ? end + 1 : at + (end - at + 8 & -8);
		const parts = path.replace(/\/$/, "").split("/");
		for (let depth = 1; depth <= parts.length; depth++) tracked.add(parts.slice(0, depth).join("/"));
	}
	while (at + 8 <= bytes.length - 20) {
		const signature = bytes.toString("latin1", at, at + 4);
		if (signature !== "sdir" && !/^[A-Z]/.test(signature)) return null;
		at += 8 + bytes.readUInt32BE(at + 4);
	}
	return tracked;
}
/** 一条忽略规则（相对 base 目录）；不支持的写法返回 undefined。 */
function gitIgnoreRule(line, base) {
	let pattern = line.replace(/\s+$/, "");
	if (!pattern || pattern.startsWith("#")) return null;
	if (pattern.includes("\\")) return void 0;
	const negate = pattern.startsWith("!");
	if (negate) pattern = pattern.slice(1);
	const directoryOnly = pattern.endsWith("/");
	if (directoryOnly) pattern = pattern.replace(/\/+$/, "");
	if (!pattern) return null;
	const anchored = pattern.includes("/");
	pattern = pattern.replace(/^\//, "");
	const source = pattern.replace(/\*\*\/|\/\*\*|\*\*|\*|\?|\[!?[^\]]*\]|[.+^${}()|\\]/g, (token) => token === "**/" ? "(?:.*/)?" : token === "/**" ? "/.*" : token === "**" ? ".*" : token === "*" ? "[^/]*" : token === "?" ? "[^/]" : token.startsWith("[") ? token.replace(/^\[!/, "[^") : "\\" + token);
	try {
		return {
			negate,
			directoryOnly,
			anchored,
			base,
			regex: new RegExp("^" + source + "$")
		};
	} catch {
		return null;
	}
}
function gitIgnoredFilter(root) {
	let worktree;
	try {
		worktree = gitWorktree(root);
	} catch {
		return null;
	}
	if (!worktree) return null;
	const tracked = gitTracked(worktree.gitDir, worktree.commonDir);
	if (!tracked) return null;
	const rootPath = relative(worktree.top, resolve(root)).split(sep).join("/");
	if (rootPath && !tracked.has(rootPath)) return null;
	const rulesByFile = /* @__PURE__ */ new Map();
	const rulesOf = (file, base) => {
		if (!rulesByFile.has(file)) {
			let text = null;
			try {
				text = readFileSync(file, "utf8");
			} catch {}
			const rules = text === null ? [] : text.split(/\r?\n/).map((line) => gitIgnoreRule(line, base)).filter((rule) => rule !== null);
			rulesByFile.set(file, rules);
		}
		return rulesByFile.get(file);
	};
	return (absolute) => {
		const path = relative(worktree.top, absolute).split(sep).join("/");
		if (!path || path.startsWith("..") || tracked.has(path)) return false;
		let isDirectory = false;
		try {
			isDirectory = lstatSync(absolute).isDirectory();
		} catch {
			return false;
		}
		const parts = path.split("/"), rules = [...rulesOf(join(worktree.commonDir, "info/exclude"), "")];
		for (let depth = 0; depth < parts.length; depth++) {
			const base = parts.slice(0, depth).join("/");
			rules.push(...rulesOf(join(worktree.top, base, ".gitignore"), base));
		}
		if (rules.includes(void 0)) return false;
		let ignored = false;
		for (const rule of rules) {
			if (rule.directoryOnly && !isDirectory) continue;
			const local = rule.base ? path.slice(rule.base.length + 1) : path;
			if (rule.anchored ? rule.regex.test(local) : rule.regex.test(parts.at(-1))) ignored = !rule.negate;
		}
		return ignored;
	};
}
/** skip 为 gitIgnoredFilter 的结果：null 时严格列出全部项。 */
const listDirectory = async (path, skip = null) => {
	try {
		return (await readdir(path)).sort().filter((name) => !skip?.(join(path, name)));
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
/** 读 catalog/<类型目录>/*.json：目录名使用受控类型目录，文件所在目录必须等于条目 kind，文件名等于条目标识。 */
async function readCatalogEntries(root) {
	const catalogDirectory = join(root, "catalog"), read = [], problems = [], skip = gitIgnoredFilter(root);
	const directories = Object.values(MARKET_KIND_DIRECTORIES).join(",");
	for (const directory of await listDirectory(catalogDirectory, skip)) {
		const kind = kindOfDirectory.get(directory), directoryPath = `catalog/${directory}`;
		if (!await collect(problems, {
			root,
			file: directoryPath
		}, async () => {
			if (!kind) fail("catalog.type-directory", `${directoryPath} is not a type directory; entries belong in catalog/{${directories}}/`, `${directoryPath} 不是类型目录；条目只能放在 catalog/{${directories}}/ 下`);
			if (!(await lstat(join(catalogDirectory, directory))).isDirectory()) fail("catalog.type-directory", `${directoryPath} must be a directory`, `${directoryPath} 必须是目录`);
			return true;
		})) continue;
		for (const name of await listDirectory(join(catalogDirectory, directory), skip)) {
			const file = `catalog/${directory}/${name}`;
			await collect(problems, {
				root,
				file
			}, async () => {
				if (!name.endsWith(".json") || name.startsWith(".")) fail("catalog.entry-file", `${file} is not an entry file; type directories hold only <id>.json`, `${file} 不是条目文件；类型目录里只放 <id>.json`);
				let raw, entry;
				try {
					raw = JSON.parse(await readFile(join(root, file), "utf8"));
				} catch (error) {
					fail("catalog.json", `${file}: ${reason(error)}`, `${file}：${reason(error)}`);
				}
				const range = raw?.compatibility?.teloa;
				if (typeof range === "string") try {
					parseTeloaRange(range);
				} catch {
					const label = typeof raw.id === "string" ? raw.id : file;
					fail("catalog.compatibility-range", `${label} has an invalid compatibility.teloa range: ${range}`, `${label} 的 compatibility.teloa 范围语法不正确：${range}`, { field: "compatibility.teloa" });
				}
				const alternatives = Array.isArray(raw?.alternatives) ? raw.alternatives : [];
				if (typeof range === "string" && (raw.kind === "connector" && Object.hasOwn(raw, "alternatives") || alternatives.some((item) => item?.recommended === true)) && !teloaRangeHasLowerBound(range, "0.2.0-alpha.7")) {
					const label = typeof raw.id === "string" ? raw.id : file;
					fail("catalog.alternatives-minimum-app", `${label}: entries with a recommended alternative or connector alternatives require a lower compatibility bound of ${marketAlternativesMinimumTeloa} or later`, `${label}：带推荐替代或连接器其他来源的资源须明确限制最低应用版本为 ${marketAlternativesMinimumTeloa} 或更高`, {
						entry: typeof raw.id === "string" ? raw.id : null,
						field: "compatibility.teloa"
					});
				}
				if (typeof range === "string" && rawUsesDerivativeFields(raw) && !teloaRangeHasLowerBound(range, "0.2.0-alpha.7")) {
					const label = typeof raw.id === "string" ? raw.id : file;
					fail("catalog.derivative-minimum-app", `${label}: entries with derivative changes, original file digests or license mappings, or an install count source require a lower compatibility bound of ${marketDerivativeMinimumTeloa} or later`, `${label}：带二次开发修改清单、原版文件摘要或许可映射、安装量来源的资源须明确限制最低应用版本为 ${marketDerivativeMinimumTeloa} 或更高`, {
						entry: typeof raw.id === "string" ? raw.id : null,
						field: "compatibility.teloa"
					});
				}
				const installsProblem = rawInstallsSourceProblem(raw);
				if (installsProblem) {
					const label = typeof raw.id === "string" ? raw.id : file;
					fail("catalog.installs-source", `${label}: ${installsProblem[0]}`, `${label}：${installsProblem[1]}`, {
						entry: typeof raw.id === "string" ? raw.id : null,
						field: "origin.installsSource"
					});
				}
				try {
					entry = readMarketCatalogEntry(raw);
				} catch (error) {
					fail(contractRule(error), `${file}: ${reason(error)}`, `${file}：${reason(error)}`);
				}
				if (entry.delivery === "upstream" && entry.upstream.kind === "github" && !teloaRangeHasLowerBound(entry.compatibility.teloa, "0.2.0-alpha.7")) fail("catalog.github-minimum-app", `${entry.id}: GitHub catalog entries require a lower compatibility bound of ${githubCatalogMinimumTeloa} or later`, `${entry.id}：GitHub 目录资源须明确限制最低应用版本为 ${githubCatalogMinimumTeloa} 或更高`, {
					entry: entry.id,
					field: "compatibility.teloa"
				});
				if (name !== entry.id + ".json") fail("catalog.file-name", `${file} must be named after the entry id: ${entry.id}.json`, `${file} 文件名必须等于条目标识 ${entry.id}.json`, {
					entry: entry.id,
					field: "id"
				});
				if (entry.kind !== kind) fail("catalog.wrong-directory", `${file} is in the wrong directory: a ${entry.kind} entry belongs at ${entryFilePath(entry)}`, `${file} 放错目录：${entry.kind} 条目应在 ${entryFilePath(entry)}`, {
					entry: entry.id,
					field: "kind"
				});
				if (entry.kind === "model" && entry.model.form === "cloud" && entry.model.cloud.provider.kind === "custom") modelEndpointHost(entry);
				if (entry.license.spdx === "NOASSERTION") {
					const artifactPath = `artifacts/skills/${entry.id}`;
					if (await exists(join(root, artifactPath))) fail("catalog.provenance-only-artifact", `${entry.id}: NOASSERTION entries must not have hosted artifacts`, `${entry.id}：NOASSERTION 仅出处资源不得包含托管工件`, {
						entry: entry.id,
						file: artifactPath,
						field: "license.spdx"
					});
				}
				read.push({
					entry,
					raw,
					file
				});
			});
		}
	}
	const seen = /* @__PURE__ */ new Map();
	for (const { entry, file } of read) if (seen.has(entry.id)) problems.push(problem("catalog.duplicate-id", `${file} duplicates the entry id of ${seen.get(entry.id)}`, `${file} 与 ${seen.get(entry.id)} 条目标识重复`, {
		file,
		entry: entry.id,
		field: "id"
	}));
	else seen.set(entry.id, file);
	if (!problems.length) await collect(problems, { root }, () => {
		try {
			validateMarketCatalogAlternatives(read.map((item) => item.entry));
		} catch (error) {
			fail("catalog.alternatives", reason(error), reason(error));
		}
	});
	settle(problems);
	return read.sort((left, right) => left.entry.id < right.entry.id ? -1 : left.entry.id > right.entry.id ? 1 : 0);
}
const isObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);
/** 原始 JSON 上的 marketEntryUsesDerivativeFields：技能条目带 derivation、安装型原版文件带 sha256 或 repositoryPath、原版条目带安装量来源。 */
function rawUsesDerivativeFields(raw) {
	if (!isObject(raw) || raw.kind !== "skill") return false;
	if (raw.delivery === "upstream") return isObject(raw.origin) && Object.hasOwn(raw.origin, "installsSource");
	const files = isObject(raw.upstream) && Array.isArray(raw.upstream.files) ? raw.upstream.files : [];
	return Object.hasOwn(raw, "derivation") || files.some((file) => isObject(file) && (Object.hasOwn(file, "sha256") || Object.hasOwn(file, "repositoryPath")));
}
/** 规格 D11：非 ClawHub 的安装量须写可复核来源；没有安装量不得写来源。返回 [en,zh] 或 null。 */
function rawInstallsSourceProblem(raw) {
	const origin = isObject(raw) && raw.kind === "skill" && isObject(raw.origin) ? raw.origin : null;
	if (!origin) return null;
	const hasSource = Object.hasOwn(origin, "installsSource");
	if (origin.installs === null && hasSource) return ["origin.installsSource is only allowed together with an install count", "没有安装量时不能写安装量来源（origin.installsSource）"];
	if (typeof origin.installs === "number" && origin.marketplace !== "clawhub" && !hasSource) return [`an install count from ${origin.marketplace} needs a verifiable public source (origin.installsSource with url and scope)`, `写了安装量就要写可复核的来源地址（origin.installsSource 的 url 与 scope）`];
	return null;
}
/** 自定义模型端点的主机名；契约只核对 https 前缀，这里解析失败即报条目错误。 */
function modelEndpointHost(entry) {
	const baseURL = entry.model.cloud.provider.baseURL;
	try {
		return new URL(baseURL).hostname;
	} catch {
		fail("model.endpoint", `${entry.id} has an unparseable model endpoint: ${baseURL}`, `${entry.id} 的模型接入地址无法解析：${baseURL}`, {
			entry: entry.id,
			field: "model.cloud.provider.baseURL"
		});
	}
}
/** 逐文件收集问题（有问题的文件跳过不入清单），末尾一并抛出；prefix 为工件目录相对目录根的路径，用于问题定位。 */
async function walk(directory, prefix, skip, base = directory, problems = []) {
	const files = [];
	for (const item of await listDirectory(directory, skip)) {
		const absolute = join(directory, item), info = await lstat(absolute), path = relative(base, absolute).split(sep).join("/");
		if (await collect(problems, { file: `${prefix}/${path}` }, async () => {
			if (item.startsWith(".")) fail("artifact.hidden-file", `${path} is a hidden file; artifacts must not contain dot files (for example .DS_Store)`, `${path} 是隐藏文件；目录工件不收录点文件（例如 .DS_Store）`);
			if (info.isSymbolicLink()) fail("artifact.symlink", `${path} is a symbolic link`, `${path} 是符号链接`);
			if (info.isDirectory()) {
				files.push(...await walk(absolute, prefix, skip, base, problems));
				return false;
			}
			if (!info.isFile()) fail("artifact.irregular-file", `${path} is not a regular file`, `${path} 不是普通文件`);
			if (info.mode & 73) fail("artifact.executable-bit", `${path} has the executable bit set`, `${path} 带可执行权限`);
			if (MARKET_CATALOG_FORBIDDEN_EXTENSIONS.test(path)) fail("artifact.script", `${path} is an executable script; artifacts must not contain scripts`, `${path} 是可执行脚本，目录工件不收录脚本`);
			if (!safe(path)) fail("artifact.unsafe-path", `${path} is not a safe path`, `${path} 路径不安全`);
			if (info.size > 2097152) fail("artifact.file-size", `${path} exceeds 2 MiB`, `${path} 超过 2 MiB`);
			return true;
		})) files.push({
			path,
			absolute
		});
	}
	if (base === directory) settle(problems);
	return files;
}
function frontmatter(text, expectedName, label, file) {
	const at = { file };
	if (!text.startsWith("---\n")) fail("skill.frontmatter-missing", `${label}: SKILL.md has no frontmatter`, `${label} 的 SKILL.md 缺少 frontmatter`, at);
	const end = text.indexOf("\n---\n", 4);
	if (end < 0) fail("skill.frontmatter-unclosed", `${label}: SKILL.md frontmatter is not closed`, `${label} 的 SKILL.md frontmatter 未闭合`, at);
	const fields = {};
	for (const line of text.slice(4, end).split("\n")) {
		const match = /^([a-z][a-z0-9_-]*): (.+)$/.exec(line);
		if (!match) fail("skill.frontmatter-line", `${label}: frontmatter allows only single-line name and description: ${line}`, `${label} 的 frontmatter 只允许单行 name 与 description：${line}`, at);
		if (Object.hasOwn(fields, match[1])) fail("skill.frontmatter-duplicate", `${label}: duplicate frontmatter field ${match[1]}`, `${label} 的 frontmatter 字段重复：${match[1]}`, at);
		fields[match[1]] = match[2].replace(/^"(.*)"$/, "$1");
	}
	const keys = Object.keys(fields).sort().join(",");
	if (keys !== "description,name") fail("skill.frontmatter-keys", `${label}: frontmatter allows only name and description, found ${keys}`, `${label} 的 frontmatter 只允许 name 与 description，实际为 ${keys}`, at);
	if (fields.name !== expectedName) fail("skill.name-mismatch", `${label}: SKILL.md name does not match the entry's skill name`, `${label} 的 SKILL.md name 与条目技能名不一致`, {
		...at,
		field: "skill.name"
	});
	if (!fields.description.trim() || fields.description.length > 1024) fail("skill.description", `${label}: description must be non-empty and at most 1024 characters`, `${label} 的 description 必须非空且不超过 1024 字`, at);
	if (!text.slice(end + 5).trim()) fail("skill.body-empty", `${label}: SKILL.md body is empty`, `${label} 的 SKILL.md 正文为空`, at);
}
function verifyLicenseFiles(entry, fileBytes) {
	const present = MARKET_LICENSE_FILES.filter((name) => fileBytes.has(name)), directory = artifactDirectoryPath(entry);
	const names = MARKET_LICENSE_FILES.join(" or "), namesZh = MARKET_LICENSE_FILES.join(" 或 ");
	if (!present.length) fail("license.file-missing", `${entry.id}: hosted artifact has no license file; ${directory}/ must contain ${names}`, `${entry.id} 的托管工件缺少许可文件：${directory}/ 根下须有 ${namesZh}`, {
		file: directory,
		field: "license.files"
	});
	const problems = [];
	for (const name of present) {
		const file = `${directory}/${name}`;
		if (!entry.license.files.includes(name)) problems.push(problem("license.not-listed", `${entry.id}: license file ${name} must be listed in the entry's license.files`, `${entry.id} 的许可文件 ${name} 须列在条目 license.files 里`, {
			file,
			field: "license.files"
		}));
		const mismatch = licenseTextProblem(entry.license.spdx, decoder.decode(fileBytes.get(name)));
		if (mismatch) problems.push(problem("license.text-mismatch", `${entry.id}: ${name} does not match the entry license ${entry.license.spdx}: ${mismatch}`, `${entry.id} 的 ${name} 与条目许可 ${entry.license.spdx} 不符：${mismatch}`, {
			file,
			field: "license.spdx"
		}));
	}
	settle(problems);
}
/** 我方修改的验证记录位置（市场仓 reviews/derivatives/<id>@<version>.json，不进目录条目）。 */
const derivativeReviewPath = (entry) => `reviews/derivatives/${entry.id}@${entry.version}.json`;
const DERIVATIVE_REVIEW_METHODS = [
	"test",
	"reproduction",
	"source-check",
	"review"
];
/** 修改声明须出现在登记文件的前 4 KiB 内。 */
const CHANGE_NOTICE_BYTES = 4096;
const validDate = (value) => {
	if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const parsed = /* @__PURE__ */ new Date(value + "T00:00:00.000Z");
	return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
/** 分三层核对，前一层有问题时不进入下一层（登记不全时修改说明与验证记录的覆盖无从谈起）；每层收集全部问题后一并抛出。
*  fileBytes：工件相对路径 → 字节。导出供单测构造大小写不敏感文件系统上造不出的工件清单。 */
async function verifyDerivative(root, entry, fileBytes) {
	const { derivation, upstream } = entry, directory = artifactDirectoryPath(entry), at = (file, field) => ({
		file,
		entry: entry.id,
		field
	});
	const originals = new Map(upstream.files.map((file) => [file.path, file]));
	const listed = /* @__PURE__ */ new Set([...derivation.unchangedFiles, ...derivation.changes.map((change) => change.path)]);
	const registration = [];
	const byFold = /* @__PURE__ */ new Map();
	for (const path of fileBytes.keys()) {
		const fold = path.normalize("NFC").toLocaleLowerCase("en-US"), other = byFold.get(fold);
		if (other === void 0) {
			byFold.set(fold, path);
			continue;
		}
		registration.push(problem("derivative.case-conflict", `${entry.id}: ${path} and ${other} differ only in letter case and overwrite each other on case-insensitive file systems`, `${entry.id} 的 ${path} 与 ${other} 只差大小写，在不区分大小写的文件系统上会互相覆盖`, at(`${directory}/${path}`, "derivation.changes")));
	}
	for (const name of derivation.unchangedFiles) {
		const bytes = fileBytes.get(name), file = `${directory}/${name}`;
		if (!bytes) registration.push(problem("derivative.unchanged-mismatch", `${entry.id}: unchanged file ${name} is missing from the artifact`, `${entry.id} 的未修改文件 ${name} 不在资源文件里`, at(file, "derivation.unchangedFiles")));
		else if (sha256(bytes) !== originals.get(name).sha256) registration.push(problem("derivative.unchanged-mismatch", `${entry.id}: ${name} is listed as unchanged but differs from the original locked digest; list the change or restore the original bytes`, `${entry.id} 的 ${name} 列为未修改，但与原版锁定摘要不一致：请登记修改或恢复原版字节`, at(file, "derivation.unchangedFiles")));
	}
	const removedPaths = new Set(derivation.changes.filter((change) => change.type === "removed").map((change) => change.path));
	for (const path of fileBytes.keys()) if (removedPaths.has(path)) registration.push(problem("derivative.unlisted-file", `${entry.id}: ${path} is listed as removed but still shipped`, `${entry.id} 的 ${path} 登记为移除但仍随附`, at(`${directory}/${path}`, "derivation.changes")));
	else if (path !== "MODIFICATIONS.md" && !listed.has(path)) registration.push(problem("derivative.unlisted-file", `${entry.id}: ${path} is neither an unchanged original file nor listed in any change`, `${entry.id} 的 ${path} 既不在未修改文件里，也没有被任何修改登记`, at(`${directory}/${path}`, "derivation.changes")));
	for (const path of originals.keys()) if (!fileBytes.has(path) && !derivation.changes.some((change) => change.type === "removed" && change.path === path)) registration.push(problem("derivative.removed-unlisted", `${entry.id}: original file ${path} is not in the artifact and has no removed change`, `${entry.id} 的原版文件 ${path} 没有随附，也没有登记 removed 修改`, at(`${directory}/${path}`, "derivation.changes")));
	settle(registration);
	const notices = [], modifications = fileBytes.get("MODIFICATIONS.md"), modificationsFile = `${directory}/MODIFICATIONS.md`;
	if (!modifications) notices.push(problem("derivative.modifications-file", `${entry.id}: derivative artifact has no root MODIFICATIONS.md`, `${entry.id} 的二次开发资源根目录缺少 MODIFICATIONS.md`, at(modificationsFile, "derivation.changes")));
	else {
		const text = modifications.toString("latin1");
		const missing = derivation.changes.map((change) => change.id).filter((id) => !new RegExp(`(?<![A-Za-z0-9-])${id}(?![0-9])`).test(text));
		if (missing.length) notices.push(problem("derivative.modifications-file", `${entry.id}: MODIFICATIONS.md does not mention change ${missing.join(", ")}`, `${entry.id} 的 MODIFICATIONS.md 缺少修改编号 ${missing.join("、")}`, at(modificationsFile, "derivation.changes")));
	}
	for (const path of new Set(derivation.changes.map((change) => change.path))) {
		const bytes = fileBytes.get(path);
		if (!bytes || path === "MODIFICATIONS.md") continue;
		if (!bytes.subarray(0, CHANGE_NOTICE_BYTES).includes("MODIFICATIONS.md")) notices.push(problem("derivative.change-notice", `${entry.id}: changed file ${path} must mention MODIFICATIONS.md within its first 4 KiB`, `${entry.id} 改过或新增的文件 ${path} 须在前 4 KiB 内写明 MODIFICATIONS.md（修改声明）`, at(`${directory}/${path}`, "derivation.changes")));
	}
	settle(notices);
	const reviewFile = derivativeReviewPath(entry);
	const invalid = (en, zh) => fail("derivative.review-missing", `${entry.id}: ${en} (${reviewFile})`, `${entry.id}：${zh}（${reviewFile}）`, at(reviewFile, "derivation"));
	const info = await lstat(join(root, reviewFile)).catch((error) => {
		if (error?.code === "ENOENT") return null;
		throw error;
	});
	if (!info) invalid("the verification record for our changes is missing", "缺少我方修改的验证记录");
	if (!info.isFile() || info.size > 2097152) invalid("the verification record must be a regular file of at most 2 MiB", "验证记录必须是不超过 2 MiB 的普通文件");
	const inside = relative(await realpath(root), await realpath(join(root, reviewFile)));
	if (!inside || inside.startsWith("..") || isAbsolute(inside)) invalid("the verification record must be inside the catalog directory (no symbolic links in its path)", "验证记录必须位于目录根之内（路径上不能有符号链接指向外部）");
	let record;
	try {
		record = JSON.parse(decoder.decode(await readFile(join(root, reviewFile))));
	} catch {
		invalid("the verification record is not valid UTF-8 JSON", "验证记录不是合法的 UTF-8 JSON");
	}
	const keys = (value) => isObject(value) ? Object.keys(value).sort().join(",") : null;
	if (keys(record) !== "changeChecks,entryId,format,reviewedAt,reviewer,version" || record.format !== "teloa.derivative-review/v1") invalid("the verification record must be teloa.derivative-review/v1 with exactly format, entryId, version, reviewedAt, reviewer and changeChecks", "验证记录须为 teloa.derivative-review/v1，且只含 format、entryId、version、reviewedAt、reviewer、changeChecks");
	if (record.entryId !== entry.id || record.version !== entry.version) invalid(`entryId and version must be ${entry.id} and ${entry.version}`, `entryId 与 version 须为 ${entry.id} 与 ${entry.version}`);
	if (!validDate(record.reviewedAt)) invalid("reviewedAt must be a valid YYYY-MM-DD date", "reviewedAt 须为有效的 YYYY-MM-DD 日期");
	if (typeof record.reviewer !== "string" || !record.reviewer.trim() || record.reviewer.length > 200) invalid("reviewer must be non-empty text of at most 200 characters", "reviewer 须为非空文字且不超过 200 字");
	if (!Array.isArray(record.changeChecks) || record.changeChecks.length > 500) invalid(`changeChecks must be a list of at most ${500} checks`, `changeChecks 须为不超过 ${500} 条的检查列表`);
	for (const check of record.changeChecks) if (keys(check) !== "changeId,evidence,method,result" || typeof check.changeId !== "string" || typeof check.result !== "string" || !DERIVATIVE_REVIEW_METHODS.includes(check.method) || typeof check.evidence !== "string" || !check.evidence.trim() || check.evidence.length > 1e3) invalid(`every check needs exactly changeId, method (${DERIVATIVE_REVIEW_METHODS.join(", ")}), result and evidence (non-empty, at most 1000 characters)`, `每条检查须恰含 changeId、method（${DERIVATIVE_REVIEW_METHODS.join("、")}）、result 与 evidence（非空，不超过 1000 字）`);
	const checksById = Map.groupBy(record.changeChecks, (check) => check.changeId), ids = new Set(derivation.changes.map((change) => change.id)), gaps = [];
	for (const change of derivation.changes) {
		const checks = checksById.get(change.id) ?? [];
		if (!checks.length) gaps.push([`${change.id} has no check`, `${change.id} 没有检查`]);
		else if (checks.length > 1) gaps.push([`${change.id} has more than one check`, `${change.id} 有多条检查`]);
		else if (checks[0].result !== "pass") gaps.push([`${change.id} did not pass (result must be pass)`, `${change.id} 未通过（result 须为 pass）`]);
		else if ((change.type === "security" || change.type === "fixed") && checks[0].method === "review") gaps.push([`${change.id} is a ${change.type} change and needs test, reproduction or source-check, not review alone`, `${change.id} 属于 ${change.type}，须用 test、reproduction 或 source-check 验证，不能只靠审阅`]);
	}
	for (const id of checksById.keys()) if (!ids.has(id)) gaps.push([`${id} is not in the change list`, `${id} 不在修改清单里`]);
	if (gaps.length) fail("derivative.review-coverage", `${entry.id}: verification record does not cover the changes: ${gaps.map((item) => item[0]).join("; ")}`, `${entry.id} 的验证记录未覆盖修改：${gaps.map((item) => item[1]).join("；")}`, at(reviewFile, "derivation.changes"));
}
/** artifacts/ 下只放托管条目：类型目录固定，<id> 必须是该类型的托管条目；历史版本目录同样须自带许可文件。 */
async function verifyArtifactTree(root, hosted, skip) {
	const byDirectory = /* @__PURE__ */ new Map();
	for (const entry of hosted) {
		const directory = MARKET_KIND_DIRECTORIES[entry.kind];
		if (!byDirectory.has(directory)) byDirectory.set(directory, /* @__PURE__ */ new Set());
		byDirectory.get(directory).add(entry.id);
	}
	const problems = [];
	for (const directory of await listDirectory(join(root, "artifacts"), skip)) {
		const ids = byDirectory.get(directory);
		if (!kindOfDirectory.has(directory) || directory === "models") {
			const directories = Object.entries(MARKET_KIND_DIRECTORIES).filter(([kind]) => kind !== "model").map(([, name]) => name).join(",");
			problems.push(problem("artifact.type-directory", `artifacts/${directory} is not a hosted type directory; artifacts belong in artifacts/{${directories}}/`, `artifacts/${directory} 不是托管类型目录；工件只能放在 artifacts/{${directories}}/ 下`, { file: `artifacts/${directory}` }));
			continue;
		}
		for (const id of await listDirectory(join(root, "artifacts", directory), skip)) await collect(problems, {
			root,
			file: `artifacts/${directory}/${id}`,
			entry: id
		}, async () => {
			if (!ids?.has(id)) fail("artifact.orphan", `artifacts/${directory}/${id} has no matching hosted ${kindOfDirectory.get(directory)} entry (upstream entries are not hosted)`, `artifacts/${directory}/${id} 没有对应的 ${kindOfDirectory.get(directory)} 托管条目（上游条目不托管副本）`);
			for (const version of await listDirectory(join(root, "artifacts", directory, id), skip)) {
				const base = join(root, "artifacts", directory, id, version), file = `artifacts/${directory}/${id}/${version}`;
				await collect(problems, {
					root,
					file,
					entry: id
				}, async () => {
					if (!(await lstat(base)).isDirectory()) fail("artifact.version-directory", `${file} must be a version directory`, `${file} 必须是版本目录`);
					if (!(await Promise.all(MARKET_LICENSE_FILES.map((name) => exists(join(base, name))))).some(Boolean)) fail("license.file-missing", `${file} has no license file (${MARKET_LICENSE_FILES.join(" or ")})`, `${file} 缺少许可文件（${MARKET_LICENSE_FILES.join(" 或 ")}）`);
				});
			}
		});
	}
	settle(problems);
}
/**
* 校验整个目录源，返回全部条目（含上游）与应用快照所需的索引、文件字节。
* generateLock(recipe,lockPath)：stdio 连接器缺随附 lock 时的生成钩子；不给则缺 lock 直接失败（--check 与市场仓校验器）。
* allowNullDigest：本机通用模型（Ollama）变体允许 digest 为 null（发布前由 scripts/核实Ollama条目摘要.mjs --write 填写）；默认拒绝。
*/
function assertConfigurationMinimumApp(entry, manifest) {
	if ((manifest.format === "teloa.business-package/v4" || manifest.resources.some((resource) => resource.kind === "business-configuration")) && !teloaRangeHasLowerBound(entry.compatibility.teloa, "0.2.0-alpha.7")) fail("solution.configuration-minimum-app", `${entry.id}: v4 packages and business configuration resources require ${marketDashboardMinimumTeloa} or later`, `${entry.id} 的 v4 包及完整业务配置资源须要求 ${marketDashboardMinimumTeloa} 或更高版本`, { field: "compatibility.teloa" });
}
async function validateMarketplace(root, { generateLock, allowNullDigest = false } = {}) {
	const read = await readCatalogEntries(root);
	const groups = /* @__PURE__ */ new Map();
	for (const { entry } of read) if (entry.kind === "skill" && entry.secretGroup !== void 0 && entry.secrets !== void 0) groups.set(entry.secretGroup, [...groups.get(entry.secretGroup) ?? [], entry]);
	for (const [first, ...rest] of groups.values()) for (const entry of rest) try {
		assertSecretGroupsConsistent([first, entry]);
	} catch (error) {
		fail("catalog.secret-group", `shared secret group declarations disagree: ${reason(error)}`, `共享密钥组声明不一致：${reason(error)}`, {
			entry: entry.id,
			file: entryFilePath(entry),
			field: "secretGroup"
		});
	}
	const hosted = read.map((item) => item.entry).filter(isHostedEntry);
	const rawById = new Map(read.map((item) => [item.entry.id, item.raw]));
	const official = read.map((item) => item.entry).filter((entry) => entry.delivery !== "upstream");
	const entries = [], files = {};
	const skillOwners = /* @__PURE__ */ new Map();
	const claimSkillName = (skillName, entryId) => {
		const owner = skillOwners.get(skillName);
		if (owner && owner !== entryId) fail("skill.name-clash", `${entryId}: skill ${skillName} has the same name as ${owner}; skill names must be unique within a host, rename it`, `${entryId} 的技能 ${skillName} 与 ${owner} 重名；同一宿主内技能名必须唯一，请改名`, {
			entry: entryId,
			field: "skill.name"
		});
		skillOwners.set(skillName, entryId);
	};
	const solutionsByPackage = new Map(official.filter((entry) => entry.kind === "solution").map((entry) => [entry.solution.packageId, entry]));
	const connectorsByServer = new Map(official.filter((entry) => entry.kind === "connector").map((entry) => [entry.connector.serverName, entry]));
	const localNames = /* @__PURE__ */ new Map(), problems = [], skip = gitIgnoredFilter(root);
	for (const entry of official) await collect(problems, {
		root,
		entry: entry.id,
		file: entryFilePath(entry)
	}, async () => {
		if (entry.kind === "model" && entry.model.form === "local-general") for (const variant of entry.model.variants) {
			const name = variant.sources[0].name;
			if (localNames.has(name)) fail("model.duplicate-ollama-name", `duplicate Ollama model name ${name} (${localNames.get(name)} and ${entry.id})`, `Ollama 模型名称重复：${name}（${localNames.get(name)} 与 ${entry.id}）`, { field: "model.variants" });
			localNames.set(name, entry.id);
			if (variant.sources[0].digest === null && !allowNullDigest) fail("model.digest-missing", `${entry.id}: ${name} has no source digest; run node scripts/核实Ollama条目摘要.mjs --write first`, `${entry.id} 的 ${name} 缺少来源摘要；先运行 node scripts/核实Ollama条目摘要.mjs --write`, { field: "model.variants" });
		}
		if (entry.kind === "model") {
			entries.push({
				...entry,
				artifact: null
			});
			return;
		}
		const artifactRoot = join(root, artifactDirectoryPath(entry));
		const stdioConnector = entry.kind === "connector" && entry.connector.recipe.transport === "stdio";
		if (entry.kind === "connector") {
			const terms = entry.license.spdx.startsWith("LicenseRef-") && entry.license.spdx.endsWith("-Terms");
			if (!stdioConnector && !terms) fail("connector.license-terms", `${entry.id} connects to a remote service (${entry.connector.recipe.transport}) and must declare LicenseRef-<Vendor>-Terms, not ${entry.license.spdx}`, `${entry.id} 连接的是远端托管服务（${entry.connector.recipe.transport}），许可须声明 LicenseRef-<厂商>-Terms，而非 ${entry.license.spdx}`, { field: "license.spdx" });
			if (stdioConnector && terms) fail("connector.license-terms", `${entry.id} installs a local npm package (${entry.connector.recipe.package}) and must declare the package's own license, not ${entry.license.spdx}`, `${entry.id} 安装本地 npm 包（${entry.connector.recipe.package}），许可须按包内 LICENSE 标注，而非 ${entry.license.spdx}`, { field: "license.spdx" });
		}
		if (stdioConnector) {
			const lockPath = join(artifactRoot, "package-lock.json");
			if (!await exists(lockPath)) {
				if (!generateLock) fail("connector.lock-missing", `${entry.id} has no bundled dependency lock package-lock.json; run pnpm build:market-catalog to generate it`, `${entry.id} 缺少随附依赖锁定 package-lock.json：运行 pnpm build:market-catalog 生成`, { file: `${artifactDirectoryPath(entry)}/package-lock.json` });
				try {
					await generateLock(entry.connector.recipe, lockPath);
				} catch (error) {
					const detail = error?.stderr?.toString().trim() || error?.message || String(error);
					fail("connector.lock-generate", `${entry.id}: failed to generate package-lock.json: ${detail}`, `${entry.id} 的 package-lock.json 生成失败：${detail}`, { file: `${artifactDirectoryPath(entry)}/package-lock.json` });
				}
			}
		}
		const artifactDirectory = artifactDirectoryPath(entry);
		let listed;
		try {
			listed = await walk(artifactRoot, artifactDirectory, skip);
		} catch (error) {
			if (error?.code === "ENOENT") fail("artifact.directory-missing", `${entry.id} has no artifact directory ${artifactDirectory}`, `${entry.id} 缺少工件目录 ${artifactDirectory}`, { file: artifactDirectory });
			throw error;
		}
		if (!listed.length || listed.length > 500) fail("artifact.file-count", `${entry.id}: artifact must contain between 1 and 500 files`, `${entry.id} 工件文件数必须在 1–500 之间`, { file: artifactDirectory });
		const artifactFiles = [];
		let total = 0;
		const fileBytes = /* @__PURE__ */ new Map();
		for (const file of listed) {
			const bytes = await readFile(file.absolute);
			total += bytes.byteLength;
			if (total > 20971520) fail("artifact.total-size", `${entry.id}: artifact exceeds 20 MiB in total`, `${entry.id} 工件总大小超过 20 MiB`, { file: artifactDirectory });
			if (entry.kind === "skill" && file.path === "SKILL.md") {
				frontmatter(decoder.decode(bytes), entry.skill.name, entry.id, `${artifactDirectory}/SKILL.md`);
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
		if (entry.kind === "skill" && entry.derivation) await verifyDerivative(root, entry, fileBytes);
		if (stdioConnector) {
			const bytes = fileBytes.get("package-lock.json");
			const lockFile = { file: `${artifactDirectory}/package-lock.json` };
			if (!bytes) fail("connector.lock-missing", `${entry.id}: package-lock.json is missing`, `${entry.id} 的 package-lock.json 缺失`, lockFile);
			try {
				readManagedPackageLock(JSON.parse(decoder.decode(bytes)), entry.connector.recipe);
			} catch (error) {
				fail("connector.lock-invalid", `${entry.id}: package-lock.json is invalid: ${reason(error)}`, `${entry.id} 的 package-lock.json 无效：${reason(error)}`, lockFile);
			}
		}
		if (entry.kind === "solution" || entry.kind === "dashboard") {
			const packageInfo = entry.kind === "solution" ? entry.solution : entry.dashboard;
			const manifestBytes = fileBytes.get("teloa.json"), manifestFile = { file: `${artifactDirectory}/teloa.json` };
			if (!manifestBytes) fail("solution.manifest-missing", `${entry.id} has no root teloa.json`, `${entry.id} 缺少根目录 teloa.json`, manifestFile);
			let manifest;
			try {
				manifest = validateManifest(JSON.parse(decoder.decode(manifestBytes)));
			} catch (error) {
				fail("solution.manifest-invalid", `${entry.id}: teloa.json is invalid: ${reason(error)}`, `${entry.id} 的 teloa.json 无效：${reason(error)}`, manifestFile);
			}
			if (manifest.id !== packageInfo.packageId) fail("solution.manifest-id", `${entry.id}: teloa.json id (${manifest.id}) does not match ${entry.kind}.packageId (${packageInfo.packageId})`, `${entry.id} 的 teloa.json id（${manifest.id}）与条目 ${entry.kind}.packageId（${packageInfo.packageId}）不一致`, { field: entry.kind + ".packageId" });
			if (manifest.scope !== packageInfo.scope) fail("solution.manifest-scope", `${entry.id}: teloa.json scope (${manifest.scope}) does not match ${entry.kind}.scope (${packageInfo.scope})`, `${entry.id} 的 teloa.json scope（${manifest.scope}）与条目 ${entry.kind}.scope（${packageInfo.scope}）不一致`, { field: entry.kind + ".scope" });
			const configurations = manifest.resources.filter((resource) => resource.kind === "business-configuration");
			assertConfigurationMinimumApp(entry, manifest);
			if (entry.kind === "dashboard" && (manifest.format !== "teloa.business-package/v4" || manifest.resources.length !== 1 || configurations.length !== 1 || configurations[0].source.kind !== "local" || !configurations[0].required || manifest.relations.length || manifest.entrypoints.length)) fail("dashboard.manifest-shape", `${entry.id}: a dashboard must provide exactly one required local business configuration in a v4 package`, `${entry.id} 的业务看板须以 v4 包提供唯一、必需的本地完整业务配置，不包含执行资源`, manifestFile);
			for (const resource of configurations) {
				if (resource.source.kind !== "local") continue;
				const definitionFile = { file: `${artifactDirectory}/${resource.source.path}` }, bytes = fileBytes.get(resource.source.path);
				if (!bytes) fail("dashboard.configuration-invalid", `${entry.id}: missing business configuration ${resource.source.path}`, `${entry.id} 缺少完整业务配置 ${resource.source.path}`, definitionFile);
				let definition;
				try {
					definition = readBusinessDashboardResource(JSON.parse(decoder.decode(bytes)));
				} catch (error) {
					fail("dashboard.configuration-invalid", `${entry.id}: invalid business configuration: ${reason(error)}`, `${entry.id} 的完整业务配置无效：${reason(error)}`, definitionFile);
				}
				if (definition.id !== resource.id || definition.version !== resource.version || definition.configuration.scope !== manifest.scope) fail("dashboard.configuration-identity", `${entry.id}: business configuration identity, version or scope differs from its manifest`, `${entry.id} 的完整业务配置身份、版本或业务范围与清单不一致`, definitionFile);
			}
			if (!isMarketIndustryRoot(manifest.domain)) fail("solution.domain", `${entry.id}: teloa.json domain (${manifest.domain}) is not a valid top-level industry key`, `${entry.id} 的 teloa.json domain（${manifest.domain}）不是合法的一级行业键。`, manifestFile);
			if (!entry.taxonomy.industries.some((ind) => {
				return (ind.includes("/") ? ind.split("/")[0] : ind) === manifest.domain;
			})) fail("solution.industries", `${entry.id}: taxonomy.industries (${JSON.stringify(entry.taxonomy.industries)}) does not match domain (${manifest.domain}); at least one industry key must start with the domain`, `${entry.id} 的 taxonomy.industries（${JSON.stringify(entry.taxonomy.industries)}）与 domain（${manifest.domain}）不一致，至少一个行业键的一级应等于 domain。`, { field: "taxonomy.industries" });
			for (const resource of manifest.resources) if (resource.required && resource.source.kind === "local" && !fileBytes.has(resource.source.path)) fail("solution.resource-missing", `${entry.id} is missing the required resource file ${resource.source.path} listed in the manifest`, `${entry.id} 缺少清单中必需的资源文件 ${resource.source.path}`, { file: `${artifactDirectory}/${resource.source.path}` });
			for (const resource of manifest.resources) {
				if (resource.kind !== "mcp" || resource.source.kind !== "local") continue;
				const definitionFile = { file: `${artifactDirectory}/${resource.source.path}` };
				if (!fileBytes.has(resource.source.path)) fail("solution.connection-file-missing", `${entry.id}: connection definition file ${resource.source.path} of ${resource.id} does not exist`, `${entry.id} 的 ${resource.id} 的连接声明文件 ${resource.source.path} 不存在`, definitionFile);
				let definition;
				try {
					definition = readIndustryMcpConnectionDefinition(JSON.parse(decoder.decode(fileBytes.get(resource.source.path))));
				} catch (error) {
					fail(contractRule(error), `${entry.id}: connection definition of ${resource.id} is invalid: ${reason(error)}`, `${entry.id} 的 ${resource.id} 的连接声明无效：${reason(error)}`, definitionFile);
				}
				const connector = connectorsByServer.get(definition.serverName);
				if (!connector) fail("solution.connection-server", `${entry.id}: connection server ${definition.serverName} of ${resource.id} is not a catalog connector`, `${entry.id} 的 ${resource.id} 的连接服务 ${definition.serverName} 不在目录连接器里`, definitionFile);
				for (const tool of definition.tools) {
					const declared = connector.connector.tools.find((item) => item.name === tool);
					if (!declared) fail("solution.connection-tool", `${entry.id}: tool ${tool} declared by ${resource.id} is not in the tool list of connector ${connector.id}`, `${entry.id} 的 ${resource.id} 声明的工具 ${tool} 不在连接器 ${connector.id} 的工具清单里`, definitionFile);
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
					if (!roles.length || !roles.every(confirmed)) fail("solution.tool-confirmation", `${entry.id}: tool ${tool} declared by ${resource.id} is not read-only; every linked role must name ${tool} (as a whole token) in its confirmationPoints`, `${entry.id} 的 ${resource.id} 声明的工具 ${tool} 不是只读工具：须在每个关联岗位的 confirmationPoints 里写明工具名 ${tool} 的确认点（须作为完整记号出现）`, definitionFile);
				}
			}
			for (const [path, bytes] of fileBytes) {
				const match = /^skills\/([^/]+)\/SKILL\.md$/.exec(path);
				if (match) {
					frontmatter(decoder.decode(bytes), match[1], entry.id + "/skills/" + match[1], `${artifactDirectory}/${path}`);
					claimSkillName(match[1], entry.id);
				}
			}
		}
		if (entry.kind === "role") {
			const roleFile = { file: `${artifactDirectory}/role.json` };
			if ([...fileBytes.keys()].some((path) => path !== "role.json" && path !== "README.md" && !MARKET_LICENSE_FILES.includes(path))) fail("role.artifact-files", `${entry.id}: artifact may contain only role.json, README.md and the license file`, `${entry.id} 的工件只允许 role.json、README.md 与许可文件`, { file: artifactDirectory });
			const roleBytes = fileBytes.get("role.json");
			if (!roleBytes) fail("role.json-missing", `${entry.id} has no role.json`, `${entry.id} 缺少 role.json`, roleFile);
			const solution = solutionsByPackage.get(entry.role.fromSolution.packageId);
			if (!solution) fail("role.solution-missing", `${entry.id}: source solution entry not found (packageId ${entry.role.fromSolution.packageId})`, `${entry.id} 找不到来源方案条目（packageId ${entry.role.fromSolution.packageId}）`, { field: "role.fromSolution.packageId" });
			if (entry.version !== solution.version || entry.role.fromSolution.version !== solution.version) fail("role.version", `${entry.id}: version (${entry.version}) must equal the source solution entry version (${solution.id}@${solution.version}); bump the role entry whenever the solution's roles/<id>.json changes`, `${entry.id} 的版本（${entry.version}）必须等于所指方案条目版本（${solution.id}@${solution.version}）：方案 roles/<id>.json 变更时 role 条目版本须同步递增`, { field: "version" });
			if (entry.role.scope !== solution.solution.scope) fail("role.scope", `${entry.id}: scope does not match the source solution (entry ${entry.role.scope}, ${solution.id} is ${solution.solution.scope})`, `${entry.id} 的 scope 与所属方案不一致（条目 ${entry.role.scope}，${solution.id} 为 ${solution.solution.scope}）`, { field: "role.scope" });
			if (entry.role.fromSolution.path !== "roles/" + entry.role.roleId + ".json") fail("role.from-solution-path", `${entry.id}: fromSolution.path must be roles/${entry.role.roleId}.json (matching roleId), found ${entry.role.fromSolution.path}`, `${entry.id} 的 fromSolution.path 必须是 roles/${entry.role.roleId}.json（与 roleId 对应），实为 ${entry.role.fromSolution.path}`, { field: "role.fromSolution.path" });
			let sourceBytes;
			try {
				sourceBytes = await readFile(join(root, artifactDirectoryPath(solution), entry.role.fromSolution.path));
			} catch {
				fail("role.source-missing", `${entry.id}: source solution has no ${entry.role.fromSolution.path}`, `${entry.id} 的来源方案缺少 ${entry.role.fromSolution.path}`, {
					file: `${artifactDirectoryPath(solution)}/${entry.role.fromSolution.path}`,
					field: "role.fromSolution.path"
				});
			}
			if (!Buffer.from(roleBytes).equals(sourceBytes)) fail("role.json-mismatch", `${entry.id}: role.json differs byte-for-byte from ${solution.id}@${solution.version}/${entry.role.fromSolution.path}`, `${entry.id} 的 role.json 与方案 ${solution.id}@${solution.version}/${entry.role.fromSolution.path} 字节不一致`, roleFile);
			let parsed;
			try {
				parsed = JSON.parse(decoder.decode(roleBytes));
			} catch {
				fail("role.json-invalid", `${entry.id}: role.json is not valid JSON`, `${entry.id} 的 role.json 不是合法 JSON`, roleFile);
			}
			if (parsed?.format !== "teloa.role/v1") fail("role.format", `${entry.id}: role.json must be teloa.role/v1`, `${entry.id} 的 role.json 必须是 teloa.role/v1`, roleFile);
			const { format: _format, ...definition } = parsed;
			if (canonical(definition) !== canonical(rawById.get(entry.id).role.definition)) fail("role.definition-mismatch", `${entry.id}: definition does not match role.json`, `${entry.id} 的 definition 与 role.json 不一致`, { field: "role.definition" });
		}
		entries.push({
			...entry,
			artifact: {
				files: artifactFiles,
				treeHash: marketCatalogTreeHash(artifactFiles, sha256)
			}
		});
	});
	await collect(problems, { root }, () => verifyArtifactTree(root, hosted, skip));
	settle(problems);
	entries.sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
	const catalogVersion = (await readFile(join(root, "catalog-version.txt"), "utf8")).trim();
	const index = {
		format: "teloa.market-catalog/v1",
		catalogVersion,
		entries: projectAlternatives(entries)
	};
	readMarketCatalogIndex(index, sha256);
	return {
		all: read.map((item) => item.entry),
		catalogVersion,
		index,
		files
	};
}
/** 源目录已整体验证；快照/版本索引仅保留本次收录的关联目标，不改变源目录。 */
function projectAlternatives(entries) {
	const ids = new Set(entries.map((entry) => entry.id));
	return entries.map((entry) => "alternatives" in entry ? {
		...entry,
		alternatives: entry.alternatives.filter((item) => ids.has(item.entryId))
	} : entry);
}
/** v1 条目投影：行业键降级、删除新字段，保持冻结读取器可读。 */
function v1Entry(entry) {
	const industries = [...new Set(entry.taxonomy.industries.map((key) => MARKET_INDEX_V1_INDUSTRIES.includes(key) ? key : marketIndustryParent(key)))];
	if (industries.some((key) => !MARKET_INDEX_V1_INDUSTRIES.includes(key))) fail("index.v1-industry", `${entry.id}: industry key cannot be mapped to the frozen v1 vocabulary`, `${entry.id} 的行业键无法映射到 v1 冻结词表`, {
		entry: entry.id,
		file: entryFilePath(entry),
		field: "taxonomy.industries"
	});
	const result = {
		...entry,
		taxonomy: {
			...entry.taxonomy,
			industries
		}
	};
	if (entry.kind === "connector") delete result.alternatives;
	else if ("alternatives" in entry) result.alternatives = entry.alternatives.map(({ recommended, ...item }) => item);
	return result;
}
/** 读取目录源，同一批条目组装两份索引：v1 冻结只收三类，且按契约谓词 marketEntryNeedsV2 排除旧读取器整份拒收的条目
*  （声明密钥、目录扩展字段或二次开发相关新字段的条目、OAuth 连接器——旧版读取器只认 {kind, reason}，supported 字段会使其整份拒收；旧版应用也无法发起授权）；
*  GitHub 上游目录添加、仅新版应用可读的 v4 方案同样仅进入 v2。v2 收全部。两份都不收无上游来源的 Teloa 内置技能
*  （只随发行快照提供；契约读取器同样拒收）。字节固定（无时间戳），重复生成一致。
*  条目结构沿用契约读取器；工件字节级校验由 validateMarketplace 负责，这里核对托管工件目录和方案清单格式。 */
async function buildMarketIndexes(root) {
	const all = (await readCatalogEntries(root)).map((item) => item.entry);
	const v4SolutionIds = /* @__PURE__ */ new Set();
	for (const entry of all.filter(isHostedEntry)) {
		try {
			await access(join(root, artifactDirectoryPath(entry)));
		} catch {
			fail("artifact.directory-missing", `${entry.id} has no artifact directory ${artifactDirectoryPath(entry)}`, `${entry.id} 缺少工件目录 ${artifactDirectoryPath(entry)}`, {
				entry: entry.id,
				file: artifactDirectoryPath(entry)
			});
		}
		if (entry.kind === "solution") {
			const file = join(artifactDirectoryPath(entry), "teloa.json");
			let manifest;
			try {
				manifest = validateManifest(JSON.parse(await readFile(join(root, file), "utf8")));
			} catch (error) {
				fail("solution.manifest-invalid", `${entry.id}: teloa.json is invalid: ${reason(error)}`, `${entry.id} 的 teloa.json 无效：${reason(error)}`, { file });
			}
			assertConfigurationMinimumApp(entry, manifest);
			if (manifest.format === "teloa.business-package/v4") v4SolutionIds.add(entry.id);
		}
	}
	const entries = projectAlternatives(all.filter((entry) => !(entry.kind === "skill" && entry.delivery !== "upstream" && entry.upstream === null)));
	const catalogVersion = (await readFile(join(root, "catalog-version.txt"), "utf8")).trim();
	const v1Index = readMarketIndex({
		format: "teloa.market-index/v1",
		catalogVersion,
		entries: projectAlternatives(entries.filter((entry) => MARKET_INDEX_V1_KINDS.includes(entry.kind) && !marketEntryNeedsV2(entry) && !v4SolutionIds.has(entry.id) && !(entry.delivery === "upstream" && entry.upstream.kind === "github"))).map(v1Entry)
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
	return entry.kind === "skill" ? entry.skill.title : entry.kind === "solution" ? entry.solution.title : entry.kind === "dashboard" ? entry.dashboard.title : entry.kind === "connector" ? entry.connector.title : entry.kind === "role" ? entry.role.title : entry.model.title;
}
const upstreamLabel = (upstream) => upstream.kind === "clawhub" ? `ClawHub ${upstream.owner}/${upstream.slug}@${upstream.version}` : `GitHub ${upstream.repository.owner}/${upstream.repository.repo}`;
const upstreamLocation = (upstream) => upstream.kind === "clawhub" ? `ClawHub ${upstream.owner}/${upstream.slug} version ${upstream.version}` : `https://github.com/${upstream.repository.owner}/${upstream.repository.repo}/tree/${upstream.commit}/${upstream.path}`;
const cell = (value) => String(value).replaceAll(/[|\[\]\\]/g, (match) => "\\" + match).replaceAll("\n", " ");
const SECTIONS = [
	["solution", "Solutions · 方案"],
	["dashboard", "Business dashboards · 业务看板"],
	["role", "AI employees · AI 员工"],
	["skill", "Skills · 技能"],
	["connector", "Connectors · 连接器"],
	["model", "Models · 模型"]
];
/** INDEX.md：按类型分节的全条目表（名称、ID、来源、许可、兼容状态、版本、条目文件链接）。 */
function renderIndexMarkdown(all, catalogVersion) {
	const source = (entry) => entry.delivery === "upstream" ? `Upstream · ${upstreamLabel(entry.upstream)}` : entry.kind === "skill" && entry.derivation ? `Teloa · derived from ${upstreamLabel(entry.upstream)}` : entry.kind === "skill" && entry.upstream ? `Teloa · from ${upstreamLabel(entry.upstream)}` : "Teloa";
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
		lines.push(`${entry.id}@${entry.version}  ${artifactDirectoryPath(entry)}/`, `  Attribution: ${attribution}`, ...entry.kind === "skill" && entry.derivation ? ["  Derived work; changes listed in MODIFICATIONS.md"] : [], `  License: ${entry.license.spdx} (${entry.license.files.join(", ")})`, "");
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
const CATALOG_VERSION_MARKED_FILES = ["README.md", "README.zh-CN.md"];
const CATALOG_VERSION_MARKER = /<!-- catalog-version -->[^<]*<!-- \/catalog-version -->/g;
/** 把文档里全部版本标记块替换为当前目录版本；没有标记则报错（防止文档漏掉后静默过期）。 */
function withCatalogVersion(path, text, catalogVersion) {
	if (!CATALOG_VERSION_MARKER.test(text)) fail("docs.catalog-version-marker", `${path} has no <!-- catalog-version --> marker`, `${path} 缺少 <!-- catalog-version --> 标记`, { file: path });
	return text.replace(CATALOG_VERSION_MARKER, `<!-- catalog-version -->${catalogVersion}<!-- /catalog-version -->`);
}

//#endregion
//#region scripts/市场仓校验器入口.mjs
const FORMATS = [
	"text",
	"json",
	"github"
];
const USAGE = "Usage: node tools/validate.mjs [--write | --pr] [--root <dir>] [--format text|json|github]";
const args = process.argv.slice(2);
let write = false;
let pr = false;
let rootArgument;
let format = "text";
for (let at = 0; at < args.length; at++) {
	const arg = args[at];
	if (arg === "--write") write = true;
	else if (arg === "--pr") pr = true;
	else if (arg === "--root" && at + 1 < args.length) rootArgument = args[++at];
	else if (arg === "--format" && at + 1 < args.length && FORMATS.includes(args[at + 1])) format = args[++at];
	else {
		console.error(`Unknown argument ${JSON.stringify(arg)} / 未知参数. ${USAGE}`);
		process.exit(2);
	}
}
if (write && pr) {
	console.error(`--write and --pr cannot be combined / --write 与 --pr 不能同时使用. ${USAGE}`);
	process.exit(2);
}
const root = rootArgument === void 0 ? resolve(dirname(fileURLToPath(import.meta.url)), "..") : resolve(rootArgument);
const escapeData = (value) => String(value).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
const escapeProperty = (value) => escapeData(value).replaceAll(":", "%3A").replaceAll(",", "%2C");
const visible = (value) => String(value).replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, (char) => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0")).replaceAll("##[", "#\\u0023[");
const annotation = (item) => `::error ${item.file === null ? "" : `file=${escapeProperty(item.file)},`}title=${escapeProperty(item.rule)}::${escapeData(message(item.en, item.zh))}`;
const toProblems = (error) => error instanceof MarketValidationError ? error.problems : [unexpectedProblem(error, root)];
const problems = [];
let entries = null;
const catalogVersion = (await readFile(join(root, "catalog-version.txt"), "utf8").catch(() => null))?.trim() ?? null;
try {
	const validated = await validateMarketplace(root);
	entries = validated.all.length;
	await buildMarketIndexes(root);
	const expected = Object.entries(generatedMarketplaceFiles(validated.all, validated.catalogVersion));
	for (const path of CATALOG_VERSION_MARKED_FILES) {
		const current = await readFile(join(root, path), "utf8").catch(() => null);
		if (current === null) continue;
		try {
			expected.push([path, withCatalogVersion(path, current, validated.catalogVersion)]);
		} catch (error) {
			problems.push(...toProblems(error));
		}
	}
	for (const [path, content] of expected) {
		if (await readFile(join(root, path), "utf8").catch(() => null) === content) continue;
		if (pr) continue;
		if (write) await writeFile(join(root, path), content);
		else problems.push(problem("docs.out-of-date", `${path} out of date; run node tools/validate.mjs --write`, `${path} 与 catalog/ 不一致，请运行 node tools/validate.mjs --write`, { file: path }));
	}
} catch (error) {
	problems.push(...toProblems(error));
}
const ok = problems.length === 0;
const passed = visible(`Marketplace catalog OK / 目录校验通过: ${entries} entries, catalog version ${catalogVersion}${write ? "; INDEX.md, NOTICE and README catalog version up to date" : ""}${pr ? " (pull request mode: generated files not checked)" : ""}.`);
if (format === "json") console.log(JSON.stringify({
	ok,
	catalogVersion,
	entries,
	problems
}).replaceAll("##[", "#\\u0023["));
else if (format === "github") {
	for (const item of problems) console.log(annotation(item));
	if (ok) console.log(passed);
	else console.error(`Marketplace validation failed / 目录校验失败: ${problems.length} problem(s)`);
} else if (ok) console.log(passed);
else console.error(problems.map((item) => "Marketplace validation failed / 目录校验失败: " + visible(message(item.en, item.zh))).join("\n"));
process.exit(ok ? 0 : 1);

//#endregion
export {  };