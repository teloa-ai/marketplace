// Runs one derived-skill scenario on a fresh scratch workspace. Usage: node run-skill.mjs <name> <seed>
import {execFileSync} from 'node:child_process'
import fs from 'node:fs'
const T = '/tmp/cmd2skill/tests', [name, seedArg] = process.argv.slice(2), S = Number(seedArg ?? 1)
const SK = id => `/tmp/cmd2skill/skills/${id}`
const PRE = "You are a Teloa AI colleague working in the user's workspace (the current directory). Use the tools to act. Paths are relative to the workspace."
const skillText = id => `The skill below was invoked. Its folder is ${SK(id)}; read the files it mentions (for example ${SK(id)}/agents/...) with the read tool using that absolute path. Delegation to subtasks is not available in this session, so run every pass yourself.\n\n` + fs.readFileSync(`${SK(id)}/SKILL.md`, 'utf8')
const orders = (dir, mode) => execFileSync(`${T}/make-orders-repo.sh`, mode ? [dir, mode] : [dir])
const billing = dir => execFileSync('bash', ['-c', `git clone -q ${T}/fixtures/billing-ws ${dir} && cd ${dir} && git config user.name Sample && git config user.email sample@example.invalid`])
const specs = {
  'review-pr': {id: 'anthropic.review-pr', build: d => orders(d, 'review'), tools: ['read', 'glob', 'grep', 'bash'], bashWritePolicy: 'allow', fileWritePolicy: 'allow',
    turns: [{text: 'Review my changes.'}]},
  'feature-dev-unattended': {id: 'anthropic.feature-dev', build: d => orders(d), tools: ['read', 'glob', 'grep', 'bash', 'write', 'edit', 'ask_user_question'], bashWritePolicy: 'allow', fileWritePolicy: 'allow', unattended: true,
    turns: [{text: 'Task: add a function that exports a list of orders to CSV text.'}]},
  'feature-dev-attended': {id: 'anthropic.feature-dev', build: d => orders(d), tools: ['read', 'glob', 'grep', 'bash', 'write', 'edit'], bashWritePolicy: 'after-confirmation', fileWritePolicy: 'allow',
    turns: [{text: 'Add a CSV export for orders: a function that turns a list of orders into CSV text.'},
      {text: 'Answers: columns are id and total_cents, in that order, with a header row; use the csv module; an empty list returns only the header; put it in orders/export.py with a test in tests/. I have no other constraints.'},
      {text: 'Go with your recommended approach.'},
      {text: 'Approved. Implement it now.', confirms: true},
      {text: 'Proceed as-is.'}]},
  'modernize-assess': {id: 'anthropic.modernize-assess', build: billing, tools: ['read', 'glob', 'grep', 'bash', 'write', 'edit'], bashWritePolicy: 'allow', fileWritePolicy: 'allow',
    turns: [{text: 'Assess the legacy system in ./billing. Call it billing.'}]},
  'modernize-extract-rules': {id: 'anthropic.modernize-extract-rules', build: billing, tools: ['read', 'glob', 'grep', 'bash', 'write', 'edit'], bashWritePolicy: 'allow', fileWritePolicy: 'allow',
    turns: [{text: 'Extract the business rules from the legacy code in ./billing. Call the system billing.'}]},
}
const sp = specs[name]; if (!sp) throw Error('unknown ' + name)
const dir = `${T}/runs/${name}-s${S}`
if (fs.existsSync(dir)) throw Error('exists: ' + dir)
sp.build(dir)
const sys = [{text: PRE + (sp.unattended ? ' This is an AI colleague task that runs unattended: the user is not present and cannot reply or approve anything.' : '')}, {text: skillText(sp.id)}]
const sc = {name: `${name}-seed${S}`, workspace: dir, readRoots: [SK(sp.id)], out: `${dir}.out.json`, seed: S, tools: sp.tools, bashWritePolicy: sp.bashWritePolicy, fileWritePolicy: sp.fileWritePolicy, system: sys, userTurns: sp.turns, maxSteps: 40}
fs.writeFileSync(`${dir}.scenario.json`, JSON.stringify(sc, null, 1))
execFileSync('node', ['/tmp/cmd2skill/harness/agent.mjs', `${dir}.scenario.json`], {stdio: 'inherit'})
fs.writeFileSync(`${dir}.result.txt`, execFileSync('bash', ['-c', 'git status --porcelain=v1 -uall; echo; git log --oneline -3; echo; git diff HEAD --stat'], {cwd: dir, encoding: 'utf8'}))
