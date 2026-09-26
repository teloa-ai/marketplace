---
name: grounded-citations
description: Ground answers and documents in cited, verifiable sources. Every claim from an outside source gets an inline numbered citation and a Sources list; numbers and URLs come from retrieval, never from memory.
---

> Adapted for Teloa from NousResearch/hermes-agent@130b8f2c5dbc skills/research/grounded-citations (MIT). Changes: see the Teloa catalog entry `hermes.grounded-citations`.

# Grounded Citations

Every claim taken from an outside source gets an inline numbered citation and a
`Sources:` list, Perplexity-style. A source ledger maps `url → [n]` so the
numbers and URLs come from retrieval, never from memory — the model only
ever emits small integers assigned from the retrieved URLs.

For high-stakes work the same ledger doubles as a fact-checking chain: verbatim
quotes are attached to each source (rejected unless they literally appear in
the fetched page text), claims from model knowledge are flagged `[unverified]`,
and verification fails any draft whose cited sources carry no evidence.

This skill covers answers in chat, written documents (markdown, PDF, docx,
slides), and research reports. It does not cover academic BibTeX pipelines —
for conference papers use a dedicated citations skill.

## When to Use

Use whenever an answer or artifact rests on information you fetched rather than
knew:

- Research, comparisons, news summaries, "what is the current state of X"
- Any deliverable you write to disk that quotes, paraphrases, or reports
  outside facts — reports, briefs, docs, decks, wiki pages
- Fact-finding where the user will want to check your work
- Multi-source synthesis where conflicting sources must be attributed

Skip inline citations when the retrieval is incidental to another task — a
quick syntax/version lookup mid-coding, casual conversation, creative writing.
Mention a URL only if the user would plausibly want the link.

## Prerequisites

None beyond the standard toolset. Retrieval comes from whatever is configured:
`web_search`, `web_extract`, `browser_navigate`, or `terminal` (curl, CLIs).
The model maintains the source ledger in its working context — no external
script or file path is required.

## Ledger Format

Maintain an in-context ledger as a markdown table or numbered list:

```
[1] https://example.com/a — "Title A"
[2] https://example.com/b — "Title B"
```

`add` is idempotent: the same URL always returns the same id within a task, so
ids stay stable across many search/extract rounds. Never reassign ids once
assigned. When rendering the Sources block at the end, copy from the ledger
exactly — never retype or reconstruct URLs from memory.

## Quick Reference

| Action | How |
|---|---|
| Fresh ledger for a new task | State: "Starting source ledger." then list ids as you go |
| Register a source, get its id | Assign the next integer and record url + title |
| Register several at once | Assign consecutive integers in order |
| Attach verbatim evidence | After fetching the page, copy the exact supporting sentence to the id's record |
| Show ledger | Print current ledger table |
| Render the Sources block | Copy all cited ids from the ledger into a `## Sources` section |
| Rewrite draft's Sources block | Replace the existing Sources section with the ledger's cited entries |
| Check a draft's citations | Verify every `[n]` in the draft exists in the ledger and the Sources block matches |

## Procedure

① **Reset the ledger** at the start of a task that will produce a grounded
answer or document. Skip the reset when continuing work whose ids are already
in a draft — reusing the ledger keeps the numbering stable.

② **Register every source at retrieval time.** After each `web_search` /
`web_extract` / `browser_navigate` / fetch, record the URL with the next
available id. Do this *before* writing prose. Registering later, from memory,
is the failure mode this skill exists to prevent.

③ **Write cite-while-drafting.** Place the bracketed id(s) immediately after
each sentence the source supports:

```
Ice floats because it is less dense than liquid water.[1][2]
```

- No space before the bracket; each id in its own brackets.
- Max 3 ids per sentence. Cite per sentence, not one dump at the end.
- Only ids from the ledger. Never invent an id or a URL.
- Claims from your own knowledge get no citation.
- Conflicting sources: present both readings, each with its own id.
- Quote exact figures, dates, and names as the source states them; flag gaps
  explicitly ("no source found for X") instead of smoothing them over.

④ **Append the Sources block** by copying the cited ids from the ledger so the
id → URL mapping comes from the ledger, not memory. For non-markdown targets
follow `references/citation-formats.md` for placement (footnotes in docx,
endnotes in PDF/LaTeX, a Sources slide in decks, per-page source lists in wiki
output).

⑤ **Verify before delivering.** Check that every `[n]` in the draft exists in
the ledger and the Sources block lists exactly the cited ids with the ledger's
URLs. Fix any mismatch.

⑥ **Chat answers** follow the same steps with the draft in your reply: register
sources, cite inline, end with the rendered `Sources:` list. For a short answer
you may inline only the cited entries.

## Multi-Platform Sweeps

"What are people saying about X" / "research X across the web" is not one
search. Fan out across source types, collect in parallel, then synthesise
with every claim attributed to the platform it came from:

| Source type | Route | What it adds |
|---|---|---|
| Open web | `web_search` → `web_extract` | official docs, articles, announcements |
| Community discussion | Reddit search/thread tools if available | real user experience, complaints, workarounds |
| Blogs / releases / changelogs | RSS/feed tools if available | dated primary posts, version history |
| Video | Video tools if available | walkthroughs, demos, talks |
| Code | `terminal` with `gh search repos` / `gh search issues` | implementations, open bugs |

Register every URL from every route in the ledger as it arrives (step ②). Keep
opinion and measurement apart: a Reddit thread is evidence that users *report*
something, not that it is true; pair it with a primary source or label it as
sentiment. Report per-platform coverage gaps ("Reddit search returned nothing
newer than March") rather than silently narrowing to what worked.

## Fact-Checking Mode

For work where the reader must be able to check the chain — medical, legal,
financial, safety, disputed claims, or when the user asks for fact-checking —
upgrade from citations to evidence:

① **Attach a verbatim quote per source.** After extracting a page, record the
exact sentence(s) that carry each claim in the ledger entry:

```
[1] https://example.com/a — "Title A"
    Evidence: "Ice is about 9% less dense than liquid water."
```

The evidence must be the verbatim text from the fetched page, not a paraphrase
or misremembered figure.

② **Flag model-knowledge claims with `[unverified]`.** A load-bearing claim
you could not source gets an explicit marker instead of a citation:

```
The refactor likely predates the 2.0 release.[unverified]
```

`[unverified]` marks the rare claim that genuinely cannot be sourced; if most
sentences carry it, the task needed more retrieval, not more markers.

③ **Cross-check disputed facts against a second independent source.** When two
sources disagree, cite both readings with their own ids and quotes, and say
which you weight and why.

④ **Verify with the evidence gate.** Confirm that every cited source has an
attached verbatim quote before delivering. Render each source's quotes beneath
its URL so the deliverable shows claim → source → exact supporting text.

## Pitfalls

- **Registering after writing.** The ledger must be populated from tool output,
  not reconstructed from the draft — that reintroduces the hallucinated-URL
  risk the numbering removes.
- **Renumbering mid-task.** Never reassign ids in a draft. Run a fresh ledger
  only between tasks.
- **Retyping URLs into the Sources block.** Always copy from the ledger.
- **Citing a search snippet as if you read the page.** A search description
  supports only what it literally says. Cite the extracted page when the claim
  needs the body — extract it first.
- **Over-citing.** Three ids on a sentence is the ceiling.
- **Parallel subagents.** Each subagent should maintain a shared ledger state or
  use unique id ranges if outputs will be merged.
- **Paraphrasing into evidence.** Find the actual sentence; don't reword until
  something resembles a match.
- **Using `[unverified]` as an escape hatch.** A deliverable dominated by
  `[unverified]` markers needed more retrieval, not more markers.

## Verification

Before delivering any grounded answer or document:

- [ ] Every `[n]` in the draft exists in the current ledger.
- [ ] The Sources block lists exactly the cited ids with the ledger's URLs.
- [ ] No id or URL was invented from memory.
- [ ] Uncited registered sources are noted (usually means a claim lost its
  attribution during editing — add the citation or remove the entry).
