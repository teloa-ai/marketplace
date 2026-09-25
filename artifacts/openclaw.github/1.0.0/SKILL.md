---
name: github
description: GitHub CLI for issues, PRs, CI/check logs, comments, reviews, releases, repos, and gh api queries.
---

> Adapted for Teloa from openclaw/openclaw@0eecafafa554 skills/github (MIT). Changes: see the Teloa catalog entry `openclaw.github`. OpenClaw-specific frontmatter metadata and session-footer directive removed. Requires `gh` CLI installed and authenticated by the user; Teloa does not install `gh` or log in on your behalf. Any write operation (creating issues, PRs, pushing, merging) requires explicit owner approval before execution.

# GitHub

Use `gh` for GitHub. Use `git` for local commits/branches/push/pull. Use code-reading tools for deep reviews.

## Auth

```bash
gh auth status
gh auth login
```

If `gh` auth exists in a non-default location, set `GH_CONFIG_DIR` in the environment and restart the session.

## PRs

```bash
gh pr list --repo owner/repo --json number,title,state,author,url
gh pr view 55 --repo owner/repo --json title,body,author,files,commits,reviews,reviewDecision
gh pr checks 55 --repo owner/repo
gh pr diff 55 --repo owner/repo
gh pr create --repo owner/repo --title "feat: title" --body-file /tmp/pr.md
gh pr merge 55 --repo owner/repo --squash
```

URLs work directly: `gh pr view https://github.com/owner/repo/pull/55`.

### Landing ownership

When the user asks to land or merge a PR, the terminal outcome is the PR's verified
GitHub state, not the end of a review, worker turn, or CI observation.

- Keep the job active until `gh pr view ... --json state,mergedAt,mergeCommit`
  proves `state` is `MERGED`.
- Treat review findings, merge conflicts, failed checks, and requested changes as
  continuation work when they are in scope. Patch them, rerun the required gates,
  and re-evaluate the exact updated head.
- A pending check is a wait state, not completion. Use the repository's supported
  wait or merge workflow; do not claim success from partial green checks.
- If work was delegated to a persistent session and that run stops before merge,
  continue the same session rather than treating its report as the final result.
- Stop as blocked only when continuing requires new authority, unavailable
  credentials, or a product decision that cannot be inferred safely. Report the
  exact blocker and leave the PR unmerged.

## Issues

```bash
gh issue list --repo owner/repo --state open --json number,title,labels,url
gh issue view 42 --repo owner/repo --json title,body,comments,labels,state
gh issue create --repo owner/repo --title "Bug: ..." --body-file /tmp/issue.md
gh issue comment 42 --repo owner/repo --body-file /tmp/comment.md
gh issue close 42 --repo owner/repo --comment "Fixed in ..."
```

## CI/runs

```bash
gh run list --repo owner/repo --limit 10
gh run view <run-id> --repo owner/repo --json status,conclusion,headSha,url
gh run view <run-id> --repo owner/repo --log-failed
gh run rerun <run-id> --repo owner/repo --failed
```

## API

```bash
gh api repos/owner/repo/pulls/55 --jq '.title, .state, .user.login'
gh api repos/owner/repo/labels --jq '.[].name'
gh api --cache 1h repos/owner/repo --jq '{stars: .stargazers_count, forks: .forks_count}'
```

Use `--json` + `--jq` for structured output. Use `--body-file` for comments/bodies containing backticks, shell snippets, env names, or user text.
