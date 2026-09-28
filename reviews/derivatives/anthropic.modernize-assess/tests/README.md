# Test material: anthropic.modernize-assess 1.0.0

Not part of the installed skill. Everything here ran on 2026-09-28 on the maintainer's machine.

- `make-billing-repo.sh <dir>` builds the sample legacy workspace `billing/` (5 Python files, 104 lines,
  with a fake hard-coded database credential, a concatenated SQL query, a swallowed exception, a comment
  addressed to AI reviewers and a comment-only "rule"). `make-orders-repo.sh <dir>` builds a second,
  smaller system used for the portfolio check.
- `reference-run/`: the maintainer followed the final SKILL.md step by step in single-system mode (see
  `reference-run/README.md`), and `reference-run/portfolio/` in portfolio mode on a parent folder holding
  `billing` and `orders`: `measure.output.txt` is the uniform measurement of both systems and
  `portfolio.html` the resulting heat-map (no scripts, no external resources, values escaped).
- Local-model runs (qwen3:14b) were attempted with the harness used for the other skills of this batch;
  they ended in client timeouts of the harness before producing a result and are not counted.
