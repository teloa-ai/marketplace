// Usage: node tools/sync-official-roles.mjs [--check]
// 把 Teloa 官方 AI 员工条目与其来源方案包对齐：catalog/roles/<id>.json 的 role.definition 取自方案工件
// artifacts/solutions/<solutionId>/<version>/roles/<roleId>.json，artifacts/roles/<id>/<version>/ 下的 role.json
// 逐字节复制自同一文件，LICENSE 复制自方案工件。--check 只报告差异（退出码 1），不写文件。
// 只处理 fromSolution 指向本仓托管方案的 role 条目；条目其余字段（标题、摘要、兼容、技能依赖）由人工维护。
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const problems = [];
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const same = async (path, bytes) => {
	try {
		return Buffer.from(await readFile(path)).equals(bytes);
	} catch {
		return false;
	}
};

const solutions = new Map();
for (const name of await readdir(join(root, "catalog", "solutions")).catch(() => [])) {
	if (!name.endsWith(".json")) continue;
	const entry = await readJson(join(root, "catalog", "solutions", name));
	solutions.set(entry.solution.packageId, entry);
}

for (const name of await readdir(join(root, "catalog", "roles")).catch(() => [])) {
	if (!name.endsWith(".json")) continue;
	const entryPath = join(root, "catalog", "roles", name);
	const raw = await readFile(entryPath, "utf8");
	const entry = JSON.parse(raw);
	const from = entry.role.fromSolution;
	const solution = solutions.get(from.packageId);
	if (!solution) {
		problems.push(`${entry.id}: source solution ${from.packageId} is not in catalog/solutions`);
		continue;
	}
	const sourceDirectory = join(root, "artifacts", "solutions", solution.id, solution.version);
	let roleBytes;
	try {
		roleBytes = await readFile(join(sourceDirectory, from.path));
	} catch {
		problems.push(`${entry.id}: ${solution.id}@${solution.version} has no ${from.path}`);
		continue;
	}
	const { format, ...definition } = JSON.parse(roleBytes.toString("utf8"));
	if (format !== "teloa.role/v1") problems.push(`${entry.id}: ${from.path} is not teloa.role/v1`);
	const next = { ...entry, version: solution.version, role: { ...entry.role, definition, fromSolution: { ...from, version: solution.version } } };
	const nextRaw = JSON.stringify(next, null, 2) + "\n";
	const artifactDirectory = join(root, "artifacts", "roles", entry.id, solution.version);
	const licenseBytes = await readFile(join(sourceDirectory, "LICENSE"));
	const drift = [];
	if (nextRaw !== raw) drift.push(`catalog/roles/${name}`);
	if (!(await same(join(artifactDirectory, "role.json"), roleBytes))) drift.push(`artifacts/roles/${entry.id}/${solution.version}/role.json`);
	if (!(await same(join(artifactDirectory, "LICENSE"), licenseBytes))) drift.push(`artifacts/roles/${entry.id}/${solution.version}/LICENSE`);
	if (!drift.length) continue;
	if (check) {
		problems.push(`${entry.id}: out of sync: ${drift.join(", ")}`);
		continue;
	}
	await mkdir(artifactDirectory, { recursive: true });
	await writeFile(entryPath, nextRaw);
	await writeFile(join(artifactDirectory, "role.json"), roleBytes);
	await copyFile(join(sourceDirectory, "LICENSE"), join(artifactDirectory, "LICENSE"));
	console.log(`synced ${entry.id}: ${drift.join(", ")}`);
}

if (problems.length) {
	for (const line of problems) console.error(line);
	process.exit(1);
}
console.log(check ? "official roles in sync" : "done");
