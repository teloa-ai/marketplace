# Review summary: anthropic.modernize-extract-rules 1.0.0

Public summary of the Teloa review; it keeps conclusions and sources only.

## Original files read

Pinned source `anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2`, every file fetched by Git blob and checked against the tree (SHA-1 of the blob recomputed).

| File | Git blob | Bytes | SHA-256 | Read |
| --- | --- | --- | --- | --- |
| `plugins/code-modernization/commands/modernize-extract-rules.md` | `4381c11ab6c4b86cf2dcd877177eb695c397bd07` | 9419 | `dfd10caadf2eeb70d2e5a15db657fe2505445aa91e6d8f54dc81b1c5bdeb3c09` | in full |
| `plugins/code-modernization/agents/business-rules-extractor.md` | `0f3e1017893408ded687472c00a4922d5d277144` | 3781 | `77edbaced0c0c66a836c5313d1709ad993424fdc98f2c005be836607a07ff32f` | in full |
| `plugins/code-modernization/agents/legacy-analyst.md` | `ad9ed51f89931208bad6e2cc61dbff8326479e58` | 3707 | `b31ec09dfeb1ba12514979d982d26eff6adcd86e86ea3605eee33efc749acc4a` | in full (used by the workflow as referee; not shipped with this skill) |
| `plugins/code-modernization/workflows/extract-rules.js` | `98fcd909b87a2e073c34ec3a7b715548c5abb38d` | 48621 | `408951e41ff645c5ee272d089455f37d15b52cb8f6d94bb370e86d7ad5cf6ca2` | in full for prompts, schemas and control flow (not shipped) |
| `plugins/code-modernization/scripts/make_shards.py` | `175d69809a024606c1488268b688480e9e1f0eb4` | 12468 | `1462f990eab2e3f27f3ad7eb153392a8fa0669ec3a3fab74d28c6c4c3a842f2b` | purpose, inputs and outputs checked; not shipped |
| `plugins/code-modernization/scripts/render_rules.py` | `fa6093321f23e265d74cf75f88ed3d501f6c608e` | 10121 | `795dbe4e0ee891e5036c0253c963cd226fc61df9655373defd3dbd2aaf34d4c2` | purpose, inputs and outputs checked; not shipped |
| `plugins/code-modernization/scripts/build_report.py` | `b690eb3fd381dd24b6edac5b041ddaf9d79eba02` | 45739 | `769bbaccf3fc324bcc83c7d355de151978dba1dd59955eebead033e7726a8fd6` | purpose, inputs and outputs, and every network or process call checked; not shipped |
| `plugins/code-modernization/LICENSE` | `d645695673349e3947e8e5ae42332d0ac3164cd7` | 11358 | `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30` | in full (Apache-2.0, identical to the repository root LICENSE) |

Other agent definitions of the plugin (`architecture-critic`, `scaffolder`, `test-engineer`, `uplift-migrator`, `version-delta-analyst`) were fetched and read; neither command nor its workflow references them (checked by search over the command and workflow files), so they are not part of this resource.

## Findings on the original

1. Method A (preferred) needs the Claude Code Workflow tool and three Python scripts; the marketplace does not accept scripts. Method B (direct subagents) is the command's own fallback.
2. The quality controls (rule granularity, per-rule citation referee, two-judge P0 panel, consolidation of duplicate rules) exist only in the workflow; Method B has one sentence on verification.
3. Size control (estimate, ask above 12 shards) exists only in Method A; Method B would read a large system in one go.
4. Next steps route to plugin commands that are not part of this resource.

## Decision

Listed as a derived skill. Hard-constraint check: Apache-2.0 allows modification, no proprietary content, no terms forbid it. Method A is removed; its granularity guidance and verification steps are written into the skill so a single session (or delegated subtasks) can apply them, and large scopes are sized and confirmed first.

## Limits of this verification

Model runs used a local qwen3:14b through the harness in `tests/`, not a Teloa host, and were run and judged by the same maintainer who wrote the changes; there was no independent second review.
