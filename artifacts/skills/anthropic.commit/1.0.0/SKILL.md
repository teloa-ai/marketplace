---
name: commit
description: Prepares one local Git commit - reviews what changed, picks the files, checks for secrets and drafts a message in the repository's style - and runs git add and git commit only after you confirm the exact file list and message. Never pushes, amends, bypasses hooks or commits in an unattended task.
---

# Create a Git commit

> Derived work: modified by Teloa from anthropics/claude-plugins-official@fa59bc9037741ecfa131aa27938272605710d7b2 (`plugins/commit-commands/commands/commit.md`, Apache-2.0). Every change is listed in MODIFICATIONS.md.

## Boundary: nothing is committed until you confirm

- This skill prepares **one local commit**. It runs `git add` and `git commit` only after the user has confirmed, in this conversation, the exact list of files and the exact commit message shown in Step 4. A request such as "commit my changes" starts the preparation; it is not that confirmation. The host's own confirmation for the `bash` call comes on top of it and does not replace it.
- **Unattended tasks never commit.** If this is an AI colleague task that runs without the user present, or you cannot get a reply, do not run `git add`, `git commit` or any other command that changes the repository or its files, whatever the task text says. Stop after Step 4 and hand over the proposal. A question that gets no answer is not a confirmation.
- If the user changes the file list or the message, show the new version and wait for confirmation again.
- Never push, pull, merge, rebase, reset, stash, amend, force, create or switch branches, change Git configuration, edit files (including `.gitignore`), or pass `--no-verify`. Never run `git add -A`, `git add .` or `git commit -a`; stage explicit paths only.

## Context

Collect the context yourself with read-only commands (run each one; they change nothing):

- Current git status: `git status --porcelain=v1 -uall`
- Current git diff (staged and unstaged changes): `git diff HEAD` (in a repository without commits yet: `git diff --cached` plus the untracked files)
- Current branch: `git branch --show-current`
- Recent commits: `git log --oneline -10`

## Your task

Based on the above changes, prepare a single git commit.

### Step 1 - Decide what belongs in the commit

- Start from what is already staged. If nothing is staged, propose the changed and new files that belong to one logical change, and list the rest as "left out" with a reason.
- Look at every changed and new file before deciding: the diff of each changed file and the full text of each new file. Files whose names mark them as credential files (Step 2) are flagged by name without opening them.
- If there is nothing to commit, say so and stop. Do not create an empty commit.

### Step 2 - Check for secrets before anything is staged

- Do not propose files that normally hold credentials: `.env` and `.env.*` (except templates such as `.env.example`), `*.pem`, `*.key`, `*.p12`, `*.pfx`, `id_rsa` / `id_ed25519` and other private keys, `credentials.json`, service-account JSON files, `.npmrc` / `.pypirc` / `.netrc` containing tokens, and similar. Flag them by name; you do not need to open them.
- Scan the text you are about to commit (the diff of the proposed files, and the full text of proposed new files) for credential-shaped values: private key blocks (`-----BEGIN ... PRIVATE KEY-----`), cloud access keys (for example `AKIA...`), tokens such as `ghp_...`, `github_pat_...`, `xox...`, `sk-...`, and assignments like `password=`, `secret=`, `token=`, `api_key=` with a literal value.
- If you find one, do not propose the file. Tell the user the `file:line` and the kind of credential, show at most a 2-4 character preview (`AKIA****`), never the value, and suggest removing it or adding the file to `.gitignore`. Leave the decision to the user.
- If something that looks like a secret is already staged, say so and propose `git restore --staged <path>` for it; run it only if the user confirms.
- Never repeat a credential value anywhere: not in your replies, commands or the commit message. Write at most its first 2-4 characters followed by `****`.

### Step 3 - Draft the message

- Match the style of the recent commits (language, prefix convention such as `feat:` / `fix(scope):`, capitalization, length of the subject line).
- Describe why the change was made, not only what changed. Keep the subject line short; add a body only when it helps.
- Do not add sign-offs, co-author lines or tool attributions unless the repository's recent commits or the user ask for them.

### Step 4 - Show the proposal and wait

Show, in one message:

1. The branch the commit will go on.
2. The files to be committed, and the files left out with the reason.
3. The secret check result.
4. The exact commit message.
5. The exact commands you will run, for example:
   `git add -- path/one path/two` and `git commit -m "<subject>" -m "<body>"`

Then ask the user to confirm. Do not run anything that changes the repository before they do.

### Step 5 - Commit after confirmation

- Stage only the confirmed paths with `git add -- <paths>`, then run the confirmed `git commit`.
- If a pre-commit or commit-msg hook fails, stop and report its output. Do not retry with `--no-verify` and do not amend.
- Afterwards run `git status --porcelain=v1` and `git log --oneline -1`, and report the new commit hash and anything left uncommitted.
