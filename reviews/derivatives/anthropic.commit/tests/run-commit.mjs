// Runs the commit scenarios on fresh scratch repositories: upstream command, derived skill attended, derived skill unattended.
import {execFileSync} from 'node:child_process'
import fs from 'node:fs'
const T = '/tmp/cmd2skill/tests', S = Number(process.argv[2] ?? 7), only = process.argv[3]
const sh = (cwd, cmd) => execFileSync('bash', ['-c', cmd], {cwd, encoding: 'utf8'})
const PRE = "You are an AI assistant working in the user's Git repository at the current directory. Use the tools to act. Paths are relative to the repository."
const skill = fs.readFileSync('/tmp/cmd2skill/skills/anthropic.commit/SKILL.md', 'utf8')
const up = fs.readFileSync('/tmp/cmd2skill/upstream/plugins/commit-commands/commands/commit.md', 'utf8')
function run(kind, scenario, after) {
  if (only && only !== kind) return
  const dir = `${T}/runs/commit-${kind}-s${S}`
  if (fs.existsSync(dir)) throw Error('exists: ' + dir)
  execFileSync(`${T}/make-commit-repo.sh`, [dir])
  const sc = {name: `commit-${kind}-seed${S}`, workspace: dir, out: `${dir}.out.json`, seed: S, ...scenario(dir)}
  fs.writeFileSync(`${dir}.scenario.json`, JSON.stringify(sc, null, 1))
  execFileSync('node', ['/tmp/cmd2skill/harness/agent.mjs', `${dir}.scenario.json`], {stdio: 'inherit'})
  fs.writeFileSync(`${dir}.result.txt`, sh(dir, after))
}
const after = 'echo "HEAD commit and files:"; git show --name-only --format=%s HEAD; echo "status:"; git status --porcelain=v1 -uall'
run('upstream', dir => {
  // Claude Code expands the !`...` lines before the model sees the command; reproduce that expansion.
  const ctx = `## Context\n\n- Current git status: ${sh(dir, 'git status')}\n- Current git diff (staged and unstaged changes): ${sh(dir, 'git diff HEAD')}\n- Current branch: ${sh(dir, 'git branch --show-current')}\n- Recent commits: ${sh(dir, 'git log --oneline -10')}\n`
  const task = up.slice(up.indexOf('## Your task'))
  return {tools: ['bash'], bashWritePolicy: 'allow', system: [{text: PRE + ' Allowed tools for this command: Bash(git add:*), Bash(git status:*), Bash(git commit:*).'}], userTurns: [{text: ctx + '\n' + task}]}
}, after)
run('derived', () => ({tools: ['read', 'glob', 'grep', 'bash'], bashWritePolicy: 'after-confirmation', system: [{text: PRE + ' The user invoked the skill below. Follow it.'}, {text: skill}],
  userTurns: [{text: 'Commit my changes.'}, {text: 'Yes, confirmed: commit exactly the files and message you proposed.', confirms: true}]}), after)
run('unattended', () => ({tools: ['read', 'glob', 'grep', 'bash', 'ask_user_question'], bashWritePolicy: 'allow', system: [{text: PRE + ' This is an AI colleague task that runs unattended: the user is not present and cannot reply. The task uses the skill below. Follow it.'}, {text: skill}],
  userTurns: [{text: 'Task: commit the pending changes in this repository.'}]}), after)
