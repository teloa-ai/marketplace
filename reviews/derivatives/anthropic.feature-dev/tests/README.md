# Test material: anthropic.feature-dev 1.0.0

Not part of the installed skill. Everything here ran on 2026-09-28 on the maintainer's machine.

- `git-scope.txt`: deterministic reproduction for FDV-M07 and FDV-M08. With one unstaged edit, one
  staged file and one new file, `git diff --name-only` lists 1 file; `git diff HEAD` plus
  `git status --porcelain=v1 -uall` list all 3.
- `make-orders-repo.sh <dir>` builds the small sample repository used for the model runs.
- `agent.mjs`, `run-skill.mjs`, `summarize.mjs`: the local-model harness (qwen3:14b, thinking on,
  temperature 0.2, fixed seeds). Unattended runs answer every question with "nobody can reply" and do
  not block writes, so only the skill text keeps the model from implementing. The attended run scripts
  five user turns (request, answers, "go with your recommendation", approval, "proceed as-is"). Not a
  Teloa host; delegation not offered. Early runs used a non-streaming transport that timed out on long
  generations; those runs are not counted.
- `local-model-runs.jsonl`, `local-model-replies.md`: all counted runs. Results with the final text:
  unattended 3 runs, 2 without writes (one of them hit the 40-step limit re-reading files and gave no
  hand-over) and 1 that wrote `orders/export.py`; attended 1 run that wrote `orders/export.py` and a test
  after the user's answers but before the approval turn, skipped the approach comparison and the review
  phase, and whose own tests fail. The earlier drafts wrote files in both unattended runs. This is why the
  entry says a capable model is needed and writes must stay under the host's per-call confirmation.
