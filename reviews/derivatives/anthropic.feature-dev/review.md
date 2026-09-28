# Review summary: anthropic.feature-dev 1.0.0

Public summary of the Teloa review; it keeps conclusions and sources only.

## Original files read

Pinned source `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2`, every file fetched by Git blob and checked against the tree (SHA-1 of the blob recomputed).

| File | Git blob | Bytes | SHA-256 | Read |
| --- | --- | --- | --- | --- |
| `plugins/feature-dev/commands/feature-dev.md` | `8bdeda3430e43afddbee79830db0f6ea9dfbf36a` | 5097 | `652e5d6264fd253fcb70c2f84de986a88d77109a02410aacd90230a6ab4bf557` | in full |
| `plugins/feature-dev/agents/code-explorer.md` | `e0f667ef65f7204399110214defd46ce062a1a51` | 2115 | `3b277703de7458988ec3b8021c716f79f642e174950ed332629310f68322029a` | in full |
| `plugins/feature-dev/agents/code-architect.md` | `fcb78bfd11004048fa287ac52c55eb5c17855549` | 2259 | `c50fb08d59a4bbd19660860626a049e44cf1a2b0c1cf782e6c7a99ba7e71b0c3` | in full |
| `plugins/feature-dev/agents/code-reviewer.md` | `7fb589cbd7140152fae41720e391290ba202e57e` | 2994 | `a7df173bf77a00da5584c6401a1061524fdbe477b6fef5dd496d4c7a9113c78c` | in full |
| `plugins/feature-dev/LICENSE` | `d645695673349e3947e8e5ae42332d0ac3164cd7` | 11358 | `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30` | in full (Apache-2.0, identical to the repository root LICENSE) |
| `plugins/feature-dev/README.md` | `eb1b6e7eeaec45f030303026dae07efd0ca0a05b` | 11697 | `8dca1b27e026cab4b8bb8118709935b08fc27d2911efd9e1061b9836b534fbc1` | read for context (agent, tool and scope claims), not shipped |
| `plugins/feature-dev/.claude-plugin/plugin.json` | `22f1bea8604d1b6324230da2280726664309088f` | 262 | `66e5b7724eae5bc5b24f18fafe4c425ba3763c543218ba1c68dcc22c589a99d9` | in full, not shipped |

The command depends on exactly these three agent definitions (named in Phases 2, 4 and 6). No scripts, hooks or other references. No NOTICE file upstream.

## Findings on the original

1. Review scope: `code-reviewer` defaults to `git diff` (unstaged edits only). Files created in Phase 5 are untracked and staged changes are excluded, so new feature code can go unreviewed. Reproduced in a scratch repository (`tests/git-scope.txt`).
2. The agents' tool lists are Claude Code names (`KillShell`, `BashOutput`, `NotebookRead`, `LS`) plus `WebFetch`/`WebSearch`, and model tiers (`sonnet`). `code-reviewer` has no Bash yet is asked to review `git diff`.
3. No rule for runs where nobody can answer or approve, and nothing against instructions planted in the repository, although the workflow reads the whole repository and writes code.
4. `CLAUDE.md` is assumed to hold the project rules.

## Decision

Listed as a derived skill. Hard-constraint check: Apache-2.0 allows modification, no proprietary content, no terms forbid it, no unremovable security risk. Not a duplicate: the Code review & release solution reviews uploaded diffs and never writes code; this skill is a guided implementation workflow. The three agents ship as read-only role files under `agents/`; the host's one-off delegation is used when granted, otherwise the passes run in turn.

## Limits of this verification

Model runs used a local qwen3:14b through the harness in `tests/`, not a Teloa host, and were run and judged by the same maintainer who wrote the changes; there was no independent second review.
