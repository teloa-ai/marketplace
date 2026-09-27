#!/usr/bin/env node
// Run by .github/workflows/generate.yml on main, before `node tools/validate.mjs --write`.
// If catalog/ or artifacts/ changed since the last generated-files commit, bump catalog-version.txt
// (YYYY.M.D.N, Asia/Shanghai date) and prepend a CHANGELOG.md section listing the entries added,
// changed or removed. Otherwise leave both files untouched.
// 由 generate.yml 在 main 上调用：自上次生成以来 catalog/ 或 artifacts/ 有变化时，递增目录版本并在
// CHANGELOG.md 顶部加一节（新增 / 变更 / 移除的条目）；没有变化则不动。
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const isAncestor = (commit) => {
	try {
		execFileSync("git", ["merge-base", "--is-ancestor", commit, "HEAD"]);
		return true;
	} catch {
		return false;
	}
};

// The main commit the last generated files were built from is recorded in the tree, not in commit metadata:
// every generated CHANGELOG.md section carries <!-- Catalog-Source: <sha> -->, and the first one is the latest.
// That survives merge-commit, squash and rebase merges of the generated-files pull request whatever author,
// committer or message GitHub gives the result, and submissions cannot edit CHANGELOG.md (scope check).
// Without a marker (history before this workflow), fall back to the last commit that changed catalog-version.txt.
const recorded = /<!-- Catalog-Source: ([0-9a-f]{40}) -->/.exec(readFileSync("CHANGELOG.md", "utf8"))?.[1];
const source = recorded && isAncestor(recorded) ? recorded : git("log", "-1", "--format=%H", "--", "catalog-version.txt");
const changedPaths = git("diff", "--name-only", "--no-renames", source, "HEAD", "--", "catalog", "artifacts").split("\n").filter(Boolean);
if (!changedPaths.length) {
	console.log(`catalog/ and artifacts/ unchanged since ${source}; catalog version stays.`);
	process.exit(0);
}

const ids = new Map();
for (const path of changedPaths) {
	const match = /^catalog\/([^/]+)\/([^/]+)\.json$/.exec(path) ?? /^artifacts\/([^/]+)\/([^/]+)\//.exec(path);
	if (match) ids.set(match[2], match[1]);
}
const entryAt = (commit, type, id) => {
	const path = `catalog/${type}/${id}.json`;
	if (commit === null) return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
	try {
		return JSON.parse(git("show", `${commit}:${path}`));
	} catch {
		return null;
	}
};
const titleOf = (entry) => {
	const title = entry[entry.kind]?.title;
	return title ? ` — ${title.en} · ${title["zh-CN"]}` : "";
};
const added = [], changed = [], removed = [];
for (const [id, type] of [...ids].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
	const before = entryAt(source, type, id), after = entryAt(null, type, id);
	if (after && !before) added.push(`- \`${id}\` ${after.version}${titleOf(after)}`);
	else if (!after && before) removed.push(`- \`${id}\` ${before.version}${titleOf(before)}`);
	else if (after) changed.push(`- \`${id}\` ${before.version === after.version ? after.version : `${before.version} → ${after.version}`}${titleOf(after)}`);
}

const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Shanghai", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(new Date()).map((part) => [part.type, part.value]));
const today = `${parts.year}.${Number(parts.month)}.${Number(parts.day)}`;
const current = readFileSync("catalog-version.txt", "utf8").trim();
const match = /^(\d{4}\.\d{1,2}\.\d{1,2})\.(\d+)$/.exec(current);
if (!match) throw new Error(`catalog-version.txt ${JSON.stringify(current)} is not YYYY.M.D.N / 目录版本格式不是 YYYY.M.D.N`);
const version = match[1] === today ? `${today}.${Number(match[2]) + 1}` : `${today}.1`;
writeFileSync("catalog-version.txt", version + "\n");

const date = `${parts.year}-${parts.month.padStart(2, "0")}-${parts.day.padStart(2, "0")}`;
const section = [`## [${version}] - ${date}`, "", `<!-- Catalog-Source: ${git("rev-parse", "HEAD")} -->`, `_Generated after merge from the catalog changes since \`${source.slice(0, 7)}\`; details are in the merged pull requests. / 合并后按 \`${source.slice(0, 7)}\` 以来的目录变更自动生成，详情见对应 PR。_`, ""];
for (const [heading, lines] of [["Added", added], ["Changed", changed], ["Removed", removed]]) if (lines.length) section.push(`### ${heading}`, "", ...lines, "");
const changelog = readFileSync("CHANGELOG.md", "utf8");
const at = changelog.indexOf("\n## ");
writeFileSync("CHANGELOG.md", at < 0 ? `${changelog.trimEnd()}\n\n${section.join("\n")}` : `${changelog.slice(0, at + 1)}${section.join("\n")}\n${changelog.slice(at + 1)}`);
console.log(`Catalog version ${current} → ${version}: ${added.length} added, ${changed.length} changed, ${removed.length} removed since ${source}.`);
