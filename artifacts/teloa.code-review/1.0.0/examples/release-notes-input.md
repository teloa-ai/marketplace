<!-- 合成样例，非真实数据 -->

# 发布说明输入材料（合成样例）

**任务：** 为 v1.4.0 整理发布说明草案，不发版
**版本区间：** v1.3.2 → v1.4.0
**读者：** 集成方（自行部署与调用 API 的团队）
**发布说明模板：** 未提供
**已知问题清单：** 未提供

---

## 文件 1：已合并 PR 列表（merged-prs-v1.4.0.md，按合并时间）

| PR | 标题 | 描述节选 | 关联 |
|---|---|---|---|
| #201 | feat(api): 新增导出订单为 CSV 的接口 | 新增 `GET /orders/export?format=csv`，按查询条件导出 | closes #180 |
| #204 | fix(auth): 修复刷新令牌在时钟偏差下提前失效 | 校验时允许 60 秒偏差 | closes #199 |
| #207 | chore(ci): 升级 CI 镜像到 Node 22 | 仅 CI 配置 | — |
| #209 | feat(config)!: 配置项 `DB_URL` 更名为 `DATABASE_URL` | BREAKING CHANGE：启动时只设置 `DB_URL` 将报错退出；迁移步骤见 docs/migration-1.4.md | — |
| #211 | fix: 修复若干问题 | （无描述） | — |
| #212 | security(deps): 升级 xml-lite-parser 修复原型污染 | 升级到 4.4.1；影响使用 XML 导入的部署，建议升级后重启 | GHSA-占位 |
| #214 | refactor(test): 重组测试目录 | 只移动测试文件 | — |
| #215 | feat(cli): 新增 `--dry-run` 参数 | 预演导入而不写库 | — |
| #217 | revert: Revert "feat(cli): 新增 `--dry-run` 参数" (#215) | 预演模式下仍会写入审计表，先回退 | — |
| #218 | docs: 标记 `legacy-export` 命令为弃用 | 将在 v2.0 移除，改用 `export --format csv` | — |
| #219 | style: prettier 全量格式化 | 无行为变化 | — |

## 文件 2：迁移文档节选（docs/migration-1.4.md）

> 自 1.4 起，环境变量 `DB_URL` 更名为 `DATABASE_URL`。启动时若只设置了 `DB_URL`，服务会打印错误并退出。
> 升级步骤：
> 1. 在部署配置中把 `DB_URL` 重命名为 `DATABASE_URL`，值不变。
> 2. 重新部署并确认启动日志中出现「config loaded」。
