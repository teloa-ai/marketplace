# Review summary: anthropic.modernize-assess 1.0.0

Public summary of the Teloa review; it keeps conclusions and sources only.

## Original files read

Pinned source `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2`, every file fetched by Git blob and checked against the tree (SHA-1 of the blob recomputed).

| File | Git blob | Bytes | SHA-256 | Read |
| --- | --- | --- | --- | --- |
| `plugins/code-modernization/commands/modernize-assess.md` | `c787f3b35d1eb620512b713f5647f2b989086a8f` | 8886 | `4274f473d1584747d544017fec5009d3ae98848794cf042d7c9697a37c8bdd3f` | in full |
| `plugins/code-modernization/agents/legacy-analyst.md` | `ad9ed51f89931208bad6e2cc61dbff8326479e58` | 3707 | `b31ec09dfeb1ba12514979d982d26eff6adcd86e86ea3605eee33efc749acc4a` | in full |
| `plugins/code-modernization/agents/security-auditor.md` | `428bd9bcd0ce5a723c46e90f062c70b5193d4104` | 4916 | `0910739fa2df087ff5566ea1f34271f5fdd7569c16621ca14e01c1cca2c379d6` | in full |
| `plugins/code-modernization/workflows/portfolio-assess.js` | `029748b33decd78617d044d2dfa5b2badde15815` | 6516 | `a44263224ca1097fd4950b015ccacf645a041d4ab5cea1e7348db248e7cca646` | in full (not shipped) |
| `plugins/code-modernization/scripts/build_report.py` | `b690eb3fd381dd24b6edac5b041ddaf9d79eba02` | 45739 | `769bbaccf3fc324bcc83c7d355de151978dba1dd59955eebead033e7726a8fd6` | purpose, inputs and outputs, and every network or process call checked; not shipped |
| `plugins/code-modernization/commands/modernize.md` | `112f5b21da92241899ec7886e03296f9a8cd0a54` | 4362 | `fc3ba0a9a3e3b8d72fcee3ab686364fc6b8c6b97e8b2af814045070bb4c36d7c` | in full, referenced entry command, not shipped |
| `plugins/code-modernization/hooks/hooks.json` | `4e14b065a797cb4f7d276fbc65f70f98d4051070` | 1801 | `3d7344c1c0a8a3f54001cf5d48dd9158d5b6a77c00f2d2f3f9d9a402c0fa2a21` | in full, plugin-level hooks, not shipped |
| `plugins/code-modernization/scripts/telemetry.sh` | `dec614135152fb6842bf108abb79081ab3099dad` | 6031 | `59c98c30658bafd2e4701f5851566daa8fcfd951d0189de7c7a88fcdc1ed1b6c` | switch logic read (it sends whole-number usage counts through Claude Code's telemetry via python3), not shipped |
| `plugins/code-modernization/LICENSE` | `d645695673349e3947e8e5ae42332d0ac3164cd7` | 11358 | `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30` | in full (Apache-2.0, identical to the repository root LICENSE) |
| `plugins/code-modernization/assets/vendor/LICENSE-mermaid.txt` | `9c44bc0f46766791af04b19ae8f6d8d69888b8f9` | 1746 | `bcf76ea9df2a058c039327334d60778caca59da0d5aba6beb345dfd0afe370a6` | read (MIT); the vendored Mermaid bundle is not used or shipped |

Other agent definitions of the plugin (`architecture-critic`, `scaffolder`, `test-engineer`, `uplift-migrator`, `version-delta-analyst`) were fetched and read; neither command nor its workflow references them (checked by search over the command and workflow files), so they are not part of this resource.

## Findings on the original

1. Portfolio mode and the report depend on the Claude Code Workflow tool (`portfolio-assess.js`) and a Python script (`build_report.py`); the marketplace does not accept scripts. The command already has a no-Workflow fallback, but the uniform measuring rules live only in the workflow prompt.
2. `--show-secrets` writes raw credential values into `SECRETS.local.md`, and without Git the inventory goes to `~/.modernize/<system>/`, outside the workspace.
3. The model-written `portfolio.html` has no escaping requirement, although system and file names come from an untrusted tree (the Python report escapes and applies a CSP).
4. `npm audit` / `pip-audit` send the dependency list to public services without a consent step.
5. The plugin's hooks send usage counts through Claude Code telemetry; they belong to the plugin, not to this command, and are not carried over.
6. Next steps route to plugin commands that are not part of this resource.

## Decision

Listed as a derived skill. Hard-constraint check: Apache-2.0 allows modification, no proprietary content, no terms forbid it; the Workflow and scripts are replaced by the command's own fallback path, and the raw-secret option is dropped. Not a duplicate of the Code review & release solution or the security review skills: this is a pre-modernization assessment of a whole legacy system.

## Limits of this verification

Model runs used a local qwen3:14b through the harness in `tests/`, not a Teloa host, and were run and judged by the same maintainer who wrote the changes; there was no independent second review.
