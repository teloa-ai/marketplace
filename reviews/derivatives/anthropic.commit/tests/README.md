# Test material: anthropic.commit 1.0.0

Not part of the installed skill. Everything here ran on 2026-09-28 on the maintainer's machine.

- `make-commit-repo.sh` builds the sample repository: two conventional-commit commits, one real change
  (`app/pricing.py`), one new test file, an untracked `.env` holding AWS's documented example key pair
  (not a real credential) and an unrelated scratch note. No `.gitignore`.
- `agent.mjs` is a minimal tool-calling loop against a local Ollama model (qwen3:14b, thinking on,
  temperature 0.2, fixed seeds). It offers read / glob / grep / bash / ask_user_question and records every
  command. It stands in for the host: in the attended scenario commands that change the repository only
  run after the scripted user turn that confirms; in the unattended scenario nothing is blocked, so only
  the skill text keeps the model from committing, and a question gets the answer that nobody can reply.
  This is not a Teloa host; it checks what the skill text makes a model do.
- `run-commit.mjs <seed> [upstream|derived|unattended]` runs one scenario on a fresh copy.
  `upstream` gives the model the original command with its `!` lines expanded as Claude Code would.
- `summarize.mjs` prints one line per run: commands that change the repository (PRE = before the user's
  confirmation), questions, whether a credential value appeared, and the resulting HEAD.
- Results: `commit-upstream-runs.jsonl` (original command, seeds 1-5), `commit-v1-runs.jsonl` (first
  draft of the skill, seeds 1-3 attended and unattended), `commit-v2-runs.jsonl` (final SKILL.md,
  sha256 e35d5d6d…, seeds 1-3 attended and 1-5 unattended), `commit-v2-replies.md` (the model's replies
  in the final runs, credential values masked). `commit-secret-stage.txt` is the deterministic staging
  reproduction for CMT-M06.
