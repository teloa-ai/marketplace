// Minimal tool-calling loop against a local Ollama model, used to exercise skills on scratch repositories.
// Usage: node agent.mjs <scenario.json>
// The scenario names the system prompt parts, the workspace, the user turns and the bash policy.
import fs from 'node:fs'
import path from 'node:path'
import {execFileSync} from 'node:child_process'

const scenario = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const ws = scenario.workspace
const model = scenario.model ?? 'qwen3:14b'
const log = []
const out = scenario.out
const started = Date.now()

const READ_ONLY = [/^git (status|diff|log|show|branch|rev-parse|check-ignore|ls-files|grep|config --get)\b/, /^(ls|find|wc|grep|cat|head|tail|readlink|pwd|file|sort|uniq|awk|sed -n|scc|cloc)\b/]
function isReadOnly(cmd) {
  // Every segment of a chain (&&, ||, ;, |) must be a known read-only command; no redirection, substitution or backticks.
  if (/[`<>]|\$\(/.test(cmd.replace(/2>\/dev\/null|2>&1/g, ''))) return false
  const segments = cmd.split(/&&|\|\||;|\|/).map(s => s.trim()).filter(Boolean)
  return segments.length > 0 && segments.every(s => READ_ONLY.some(r => r.test(s)) && !/ -(exec|execdir|delete|ok)\b/.test(s))
}
function inside(p) {
  const abs = path.resolve(ws, p)
  if (!(abs + '/').startsWith(path.resolve(ws) + '/') && !(scenario.readRoots ?? []).some(r => (abs + '/').startsWith(path.resolve(r) + '/'))) throw Error('path outside workspace: ' + p)
  return abs
}
let userConfirmed = false
const events = []
const tools = {
  read: ({path: p, offset = 0, limit = 400}) => {
    if (!(limit > 0)) limit = 400
    if (!(offset >= 0)) offset = 0
    const lines = fs.readFileSync(inside(p), 'utf8').split('\n')
    return lines.slice(offset, offset + limit).map((l, i) => `${offset + i + 1}\t${l}`).join('\n')
  },
  glob: ({pattern}) => fs.globSync(pattern, {cwd: ws}).filter(f => !f.startsWith('.git/')).slice(0, 200).join('\n') || '(no matches)',
  grep: ({pattern, path: p = '.'}) => { try { return execFileSync('grep', ['-rnE', pattern, inside(p)], {encoding: 'utf8'}).split(ws + '/').join('').slice(0, 20000) } catch (e) { return e.status === 1 ? '(no matches)' : String(e.stderr) } },
  bash: ({command}) => {
    const ro = isReadOnly(command)
    const ev = {command, readOnly: ro, beforeUserConfirmation: !userConfirmed}
    events.push(ev)
    if (!ro) {
      const policy = scenario.bashWritePolicy ?? 'deny'
      if (policy === 'deny' || (policy === 'after-confirmation' && !userConfirmed)) { ev.executed = false; return 'Host: the user did not approve this command, so it did not run.' }
    }
    ev.executed = true
    try { return execFileSync('bash', ['-lc', command], {cwd: ws, encoding: 'utf8', timeout: 60000}).slice(0, 20000) } catch (e) { return `exit ${e.status}\n${e.stdout ?? ''}${e.stderr ?? ''}`.slice(0, 20000) }
  },
  write: ({path: p, content}) => {
    const ev = {write: p, beforeUserConfirmation: !userConfirmed}; events.push(ev)
    const policy = scenario.fileWritePolicy ?? 'allow'
    if (policy === 'deny') { ev.executed = false; return 'Host: file writes were not approved. Nothing was written.' }
    const abs = inside(p); fs.mkdirSync(path.dirname(abs), {recursive: true}); fs.writeFileSync(abs, content); ev.executed = true; return 'written'
  },
  edit: ({path: p, old_string, new_string}) => {
    const ev = {edit: p, beforeUserConfirmation: !userConfirmed}; events.push(ev)
    const policy = scenario.fileWritePolicy ?? 'allow'
    if (policy === 'deny') { ev.executed = false; return 'Host: file edits were not approved. Nothing changed.' }
    const abs = inside(p); const t = fs.readFileSync(abs, 'utf8'); if (!t.includes(old_string)) return 'old_string not found'
    fs.writeFileSync(abs, t.replace(old_string, new_string)); ev.executed = true; return 'edited'
  },
  ask_user_question: ({question}) => { events.push({ask: question}); return scenario.askAnswer ?? 'No answer: this is an unattended task and nobody can reply.' },
}
const toolDefs = [
  ['read', 'Read a text file (path relative to the workspace, or absolute path to the skill folder).', {path: {type: 'string'}, offset: {type: 'integer'}, limit: {type: 'integer'}}, ['path']],
  ['glob', 'List files matching a bash glob relative to the workspace (** allowed).', {pattern: {type: 'string'}}, ['pattern']],
  ['grep', 'Search files recursively with an extended regex.', {pattern: {type: 'string'}, path: {type: 'string'}}, ['pattern']],
  ['bash', 'Run a shell command in the workspace. Commands that change the workspace need host approval.', {command: {type: 'string'}}, ['command']],
  ['write', 'Create or overwrite a file in the workspace (needs host approval).', {path: {type: 'string'}, content: {type: 'string'}}, ['path', 'content']],
  ['edit', 'Replace a string in a workspace file (needs host approval).', {path: {type: 'string'}, old_string: {type: 'string'}, new_string: {type: 'string'}}, ['path', 'old_string', 'new_string']],
  ['ask_user_question', 'Ask the user a question and wait for the answer.', {question: {type: 'string'}}, ['question']],
].filter(([n]) => (scenario.tools ?? Object.keys(tools)).includes(n)).map(([name, description, properties, required]) => ({type: 'function', function: {name, description, parameters: {type: 'object', properties, required}}}))

const messages = [{role: 'system', content: scenario.system.map(p => p.file ? fs.readFileSync(p.file, 'utf8') : p.text).join('\n\n')}]
async function chat() {
  // Streamed so that response headers arrive at once; long generations would otherwise hit fetch's 300 s header timeout.
  const res = await fetch('http://127.0.0.1:11434/api/chat', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({model, messages, tools: toolDefs, stream: true, think: scenario.think ?? true, options: {num_ctx: scenario.numCtx ?? 32768, num_predict: scenario.numPredict ?? 8192, temperature: scenario.temperature ?? 0.2, seed: scenario.seed ?? 7}})})
  if (!res.ok) throw Error('ollama ' + res.status + ' ' + await res.text())
  const msg = {role: 'assistant', content: '', thinking: ''}, calls = []
  let buf = ''
  const dec = new TextDecoder()
  for await (const chunk of res.body) {
    buf += dec.decode(chunk, {stream: true})
    let i
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1)
      if (!line) continue
      const part = JSON.parse(line)
      if (part.error) throw Error('ollama: ' + part.error)
      if (part.message?.content) msg.content += part.message.content
      if (part.message?.thinking) msg.thinking += part.message.thinking
      if (part.message?.tool_calls) calls.push(...part.message.tool_calls)
    }
  }
  if (calls.length) msg.tool_calls = calls
  return msg
}
for (const turn of scenario.userTurns) {
  if (turn.confirms) userConfirmed = true
  messages.push({role: 'user', content: turn.text}); log.push({user: turn.text})
  for (let step = 0; step < (scenario.maxSteps ?? 30); step++) {
    const msg = await chat()
    messages.push(msg)
    if (msg.tool_calls?.length) {
      for (const call of msg.tool_calls) {
        const {name, arguments: args} = call.function
        let result
        try { result = tools[name] ? String(tools[name](args)) : 'unknown tool' } catch (e) { result = 'error: ' + e.message }
        log.push({tool: name, args, result: result.slice(0, 1500)})
        messages.push({role: 'tool', content: result, tool_name: name})
      }
      continue
    }
    log.push({assistant: msg.content})
    break
  }
}
const report = {scenario: scenario.name, model, think: scenario.think ?? true, seed: scenario.seed ?? 7, seconds: Math.round((Date.now() - started) / 1000), events, log}
fs.writeFileSync(out, JSON.stringify(report, null, 1))
console.log(JSON.stringify({scenario: scenario.name, seconds: report.seconds, events}, null, 1))
