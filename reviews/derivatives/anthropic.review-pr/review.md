# Review summary: anthropic.review-pr 1.0.0

Public summary of the Teloa review; it keeps conclusions and sources only.

## Original files read

Pinned source `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2`, every file fetched by Git blob and checked against the tree (SHA-1 of the blob recomputed).

| File | Git blob | Bytes | SHA-256 | Read |
| --- | --- | --- | --- | --- |
| `plugins/pr-review-toolkit/commands/review-pr.md` | `021234cf7ac8c49964552b50650428727ea891a7` | 4997 | `5e70c17293a044e1bf9d092c80b5da8b4fd5802ebb07dc53993dec4ba7ce2fc4` | in full |
| `plugins/pr-review-toolkit/agents/code-reviewer.md` | `834b70c21f1f1bd4d01b8025bc830bf00887f2e7` | 3635 | `019395c3ce457460115cc703e2f4a86fed4bbe560dc58355051c4d877155d366` | in full |
| `plugins/pr-review-toolkit/agents/comment-analyzer.md` | `41ab074f50953c1f0fed5cf1972c9d2f36a97b31` | 4925 | `4a9c1f2eb8234a4b9231983e75739663d512e1aed242388964a165a719b84698` | in full |
| `plugins/pr-review-toolkit/agents/pr-test-analyzer.md` | `05b342b9175af85c5d7404bac67f5c62da375aa2` | 4560 | `fcb1cde9ba7b21694b508766a8d6a79bc91bed9982f828f816210059934f46b4` | in full |
| `plugins/pr-review-toolkit/agents/silent-failure-hunter.md` | `b8a8dfa41e18ef6ac801ae64be38b2508aa04f44` | 7807 | `fa9b0daec5a267e7e66435cc48b3328301fc9f70c3af259fe248881327a1babc` | in full |
| `plugins/pr-review-toolkit/agents/type-design-analyzer.md` | `9c17fec6b276cbe42f80b5e96e21e016b59c8e06` | 4999 | `c1cf67843d3c4fd27ddf6b24aa92521414b16c01610e7f7e87212c7b8681198d` | in full |
| `plugins/pr-review-toolkit/agents/code-simplifier.md` | `89a01c0b972f99fb33515de5f1e9ef1613dd9381` | 5292 | `976ddb22b84bc5a714216531a75db5e73169554add6b953442beeedb49b56891` | in full (not shipped) |
| `plugins/pr-review-toolkit/LICENSE` | `d645695673349e3947e8e5ae42332d0ac3164cd7` | 11358 | `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30` | in full (Apache-2.0, identical to the repository root LICENSE) |
| `plugins/pr-review-toolkit/README.md` | `e91cb7bed28ced8b6a48952abe430fba6deeae6d` | 7528 | `364cb1d46aa64a01016e4ef5f41dfea5bd5e3cf530459409a376feba93dd2b49` | read for context (agent, tool and scope claims), not shipped |
| `plugins/pr-review-toolkit/.claude-plugin/plugin.json` | `e81d7aa31085520620c26a086b8b1668abbb29a0` | 266 | `7aa64c91a9316ef3641df115414c07c7caee8f48368815dc2950483598321865` | in full, not shipped |

The command depends on these six agent definitions. No scripts or hooks. No NOTICE file upstream.

## Findings on the original

1. Review scope: step 3 runs `git diff --name-only` and `code-reviewer` defaults to `git diff`; both miss staged changes and new files, although the documented workflow stages everything before reviewing. Reproduced on the sample repository: the swallowed exception is in a staged file and the new type in an untracked file, and `git diff --name-only` lists neither (`tests/git-scope-orders.txt`).
2. `silent-failure-hunter` states one specific codebase's conventions as facts about the reviewed project: `logForDebugging`, `logError` (Sentry), `logEvent` (Statsig), error IDs from `constants/errorIds.ts`. The plugin README says the agents are maintained as "Project agents: `.claude/agents/` in claude-cli-internal", which is where these conventions come from. On other projects this demands files and functions that do not exist.
3. `code-simplifier` edits code "autonomously and proactively ... without requiring explicit requests" and hard-codes one project's style rules (ES modules, `function` keyword, React Props types) as general standards.
4. The five review agents have no tool list, so in Claude Code they inherit every tool including file writes, although several say they only advise.
5. The five passes use five different scales, and nothing maps them to the Critical / Important / Suggestion summary.
6. `gh pr view` is called unconditionally (network and a signed-in account needed).

## Decision

Listed as a derived skill, read-only. Hard-constraint check: Apache-2.0 allows modification, no proprietary content, no terms forbid it. The `simplify` aspect is merged into the existing `hermes.simplify-code` entry instead of shipping a second, autonomous simplifier (`code-simplifier.md` removed). Distinguished from the Code review & release solution (`teloa.code-review`, one checklist pass over an uploaded diff) by its title and scope: it reads the local workspace and Git directly and runs five specialist passes.

## Limits of this verification

Model runs used a local qwen3:14b through the harness in `tests/`, not a Teloa host, and were run and judged by the same maintainer who wrote the changes; there was no independent second review.
