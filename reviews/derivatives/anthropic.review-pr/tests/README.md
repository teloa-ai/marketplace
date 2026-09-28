# Test material: anthropic.review-pr 1.0.0

Not part of the installed skill. Everything here ran on 2026-09-28 on the maintainer's machine.

- `make-orders-repo.sh <dir> review` builds the sample repository: a tiny order service with an
  `AGENTS.md` (never swallow exceptions; money in integer cents), then leaves one staged change
  (`orders/service.py`: an `except Exception: return None` in `load_order`, and an `apply_coupon` whose
  comment says dollars while it returns cents and which mutates the coupon), one unstaged test edit and
  one new untracked file (`orders/coupon.py`: a docstring invariant 0-100 that nothing enforces).
- `git-scope-orders.txt`: what the original scope commands see on that repository versus the new ones.
- `agent.mjs` is a minimal tool-calling loop against a local Ollama model (qwen3:14b, thinking on,
  temperature 0.2, fixed seeds) with read / glob / grep / bash; every command and write is recorded.
  Nothing is blocked in this scenario, so only the skill text keeps the model read-only. Delegation is
  not offered, so the passes run in turn. Not a Teloa host. (The transport was switched from a single
  response to streaming after these runs, to avoid a client timeout on long generations; tool
  behaviour is unchanged.)
- `run-skill.mjs review-pr <seed>` runs the scenario; `summarize.mjs` prints one line per run.
- Results: `review-pr-runs.jsonl` and `review-pr-replies.md` (seeds 1 and 2, final SKILL.md sha256
  c5bf60a7…).

Planted issues and what the two runs reported: swallowed exception (run 2), comment says dollars but
the function returns cents (runs 1 and 2; run 2 proposed changing the code rather than the comment),
unenforced 0-100 invariant on `Coupon` (runs 1 and 2), mutation of the caller's coupon (neither). Run 1
also suggested floating-point division for money, against the project's cents rule. Both runs tried to
read a role file that does not exist (`agents/summary*.md`). The findings of a small local model need a
person's check; this material shows the scope and read-only behaviour, not review quality.
