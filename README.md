# Teloa Official Marketplace

English · [简体中文](README.zh-CN.md)

This repository is the catalog behind the Teloa official marketplace: solutions, AI teammates, skills, connectors and model references that Teloa has reviewed, whose licenses are clear and whose versions are pinned. It is the single source of truth for the marketplace. Submissions, reviews and merges happen here.

Browse and search online: **https://market.teloa.ai** · Full entry list: [INDEX.md](INDEX.md)

## How this repository relates to market.teloa.ai and to Teloa

- **market.teloa.ai** is a static site generated from this repository. Each entry page links back to its catalog file here, to its hosted files under `artifacts/`, and, for upstream entries, to the pinned upstream source.
- The site also serves a signed online index (`index.json` and `v2/index.json`, each with an Ed25519 `.sig`). The Teloa app only adopts an index whose signature and structure verify; otherwise it keeps the snapshot bundled with the release.
- Every Teloa release pins a catalog snapshot taken from a specific commit of this repository. Updating the catalog never changes a version you already installed.
- Validation rules are maintained in the Teloa source repository ([teloa-ai/teloa](https://github.com/teloa-ai/teloa)) and bundled into [`tools/validate.mjs`](tools/validate.mjs). Do not edit that file by hand.

**Publication status:** first published from the `marketplace/` directory of the Teloa source repository, with its history, at catalog version 2026.9.27.1, ahead of the marketplace's general availability. From then on this repository is the single source of truth, and the source repository only pins snapshots taken from it. Entry pages on market.teloa.ai link here; the in-app online index is opt-in during this phase.

## Layout

| Path | Content |
| --- | --- |
| `catalog/<type>/<id>.json` | One file per entry, format `teloa.market-catalog-entry/v1`. `<type>` is one of `solutions`, `roles`, `skills`, `connectors`, `models` and must match the entry's `kind`. Upstream skills live in `catalog/skills/` too and are marked `delivery: upstream`. |
| `artifacts/<type>/<id>/<version>/` | Files that Teloa hosts and installs, for `solutions`, `roles`, `skills` and `connectors`. Every version directory ships its own `LICENSE` or `LICENSE.txt`. Upstream entries and model references have no artifacts. |
| `reviews/<type>/` | Review and verification records, for example connector recipe checks. |
| `INDEX.md`, `NOTICE` | Generated from `catalog/` by `node tools/validate.mjs --write`. Do not edit by hand. |
| `catalog-version.txt` | Catalog version, bumped on every change. |
| `tools/validate.mjs` | Single-file validator generated from the Teloa source repository. |

Entry IDs follow `ecosystem.resource`, for example `openai.skill-creator`. IDs and file names never change once published.

## What an entry records

- **Identity and type**: `id`, `kind`, `version`, and the installed name (for skills, `skill.name`).
- **Taxonomy**: controlled vocabulary of functions and industries, shared with the app and the website filters.
- **Upstream**: for content taken from elsewhere, the repository, full 40-character commit, directory and the Git blob digest of every file; ClawHub entries pin owner, slug, version and per-file SHA-256.
- **Modifications**: what changed relative to upstream, in Chinese and English; empty when taken unchanged.
- **License**: an SPDX identifier and the license files inside the artifact.
- **Compatibility**, one of four values:
  - `verified`: verified on the stated Teloa and DSH versions.
  - `needs-configuration`: needs setup first, such as connecting an account.
  - `content-only`: content adapted only; results depend on your materials and authorized tools.
  - `unsupported`: listed for information, not installable.
- **Requirements**: tools, network access, runtimes.
- **Review**: review date and reviewer.

"Official" means the Teloa catalog reviewed and listed this version. It is not an endorsement by the upstream author and not a security certification.

## Adding an entry in Teloa

1. Open **Marketplace** in the Teloa workbench and search by name, purpose or entry ID. You can also tell any teammate in a conversation, for example "search the marketplace and add `teloa.soc`"; Teloa shows a confirmation card before anything is added.
2. Click **Add**. Teloa verifies every file against the entry's pinned digests. Upstream entries are fetched file by file from their pinned source and verified the same way.
3. Built-in entries (`delivery: builtin`) need no adding. Model references are configured under **Settings · Models**; the local speech model is prepared from the model category of the marketplace.

Entries marked `unsupported` cannot be added. Each entry page on market.teloa.ai has a one-click "Use in Teloa" instruction you can paste into a conversation.

## Licensing

- Catalog metadata, documentation and Teloa-authored artifacts are licensed under the [Apache License 2.0](LICENSE).
- Third-party artifacts hosted under `artifacts/` keep their own license. Each version directory carries that license file, and the entry's `license.spdx` must match it.
- Upstream entries are metadata only. This repository does not store copies of their files, which stay under their own licenses at the pinned source.
- `LicenseRef-*-Terms` identifiers on connectors name the terms of a remote service, not a license for content in this repository.
- [NOTICE](NOTICE) lists attribution and license for every hosted artifact and upstream entry.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Commits are signed off under the Developer Certificate of Origin (`git commit -s`); there is no CLA. Run `node tools/validate.mjs` before opening a pull request.

## Security

To report a malicious or unsafe resource, follow [SECURITY.md](SECURITY.md). Do not open a public issue for security problems.

## Changes

See [CHANGELOG.md](CHANGELOG.md).
