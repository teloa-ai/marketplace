<!-- One pull request adds one entry or one new version of an entry. See CONTRIBUTING.md. -->
<!-- 一个 PR 只投一个条目或一个条目的新版本，见 CONTRIBUTING.md。 -->

## Entry · 条目

- ID and version · ID 与版本:
- Type · 类型: solution / role / skill / connector / model
- Delivery · 交付方式: hosted (`artifacts/`) / upstream (metadata only) / reference

## Source · 来源

- Upstream repository and full commit, or ClawHub owner/slug@version · 上游仓库与完整提交，或 ClawHub 作者/名称@版本:
- Author · 作者:

## License · 许可

- SPDX identifier · SPDX 标识:
- License file in the artifact directory · 工件目录里的许可文件: `LICENSE` / `LICENSE.txt` / not hosted
- Redistribution is allowed · 允许再分发: yes / no (then submit as an upstream entry · 否则以上游条目提交)

## Modifications · 修改记录

<!-- What changed relative to upstream, also listed in the entry's `modifications`. Write "none" if unchanged. -->
<!-- 相对上游改了什么（同时写进条目 modifications）；原样收录写「无」。 -->

## Compatibility self-assessment · 兼容状态自评

- Proposed status · 建议状态: verified / needs-configuration / content-only / unsupported
- Teloa and DSH versions tested · 测试所用 Teloa 与 DSH 版本:
- How you tested · 测试方法:
- Tools, network access and runtimes required · 依赖的工具、是否联网、运行时:
- How the entry will be upgraded · 以后如何升级:

## Checklist · 自查

- [ ] Every commit is signed off (`git commit -s`, DCO) · 每个提交都已签署
- [ ] `node tools/validate.mjs --write` passes · 校验通过
- [ ] Only `catalog/`, `artifacts/` and `reviews/` changed; `INDEX.md`, `NOTICE`, `catalog-version.txt` and `CHANGELOG.md` are generated after merge · 只改这三个目录，生成文件由合并后工作流生成
- [ ] No scripts, executables, symlinks, secrets or private download links · 不含脚本、可执行文件、符号链接、密钥或私有下载地址
