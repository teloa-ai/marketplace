<!-- 合成样例，非真实数据 -->

# PR 评审意见草案（合成样例期望产出）

PR：feat(billing): 支持在订单上使用优惠券  编号：#142
基准 → 目标：a1b2c3d → e4f5a6b
评审范围：3 个文件，与描述一致，差异完整  来源：pr-142.md、pr-142.diff
评审规范：未提供（按四个维度通用核对点评审，风格问题一律归建议）
未核实假设：`db.get`、`orders.load` 与鉴权中间件的实现未在差异中出现，相关判断以提问形式给出

---

## 改动地图

| 文件 | 类型 | +/- | 与描述对应的目的 |
|---|---|---|---|
| src/billing/discount.ts | 新增 | +20 / -0 | 折扣计算函数 `applyCoupon` |
| src/billing/routes.ts | 修改 | +12 / -0 | 新增 `POST /orders/:id/coupon` 接口并引入 `applyCoupon` |
| tests/discount.test.ts | 新增 | +9 / -0 | 百分比券单元测试 |

## 描述与差异不一致

- 无

## 阻断项

| # | 文件:行 | 维度 | 问题 | 依据 | 修复方向（如有依据） |
|---|---|---|---|---|---|
| 1 | src/billing/discount.ts:17 | 正确性 | 固定金额券直接相减，`coupon.value` 大于 `order.total` 时 `total` 为负数，返回错误金额 | 差异 L17 `order.total = order.total - coupon.value`，无下限判断 | 需与业务规则确认后处理：置 0 或拒绝使用该券；两种都需补测试 |
| 2 | src/billing/routes.ts:18-19 | 安全 | 用户输入 `req.body.code` 直接拼接进 SQL 字符串，可注入 | 差异 L17-19 `"SELECT ... WHERE code = '" + code + "'"`，`code` 来自 L17 `req.body.code` 未校验 | 改为参数化查询（占位符 + 参数数组），并校验 `code` 为字符串 |
| 3 | tests/discount.test.ts:1-9 | 测试 | 固定金额券分支无测试；该分支含阻断项 #1，属于金额计算关键路径 | 差异中唯一用例 L4-8 只覆盖 `kind: 'percent'`；已提供文件中未见 `kind: 'fixed'` 用例 | 补固定金额券正常值与超额值两个用例 |

## 建议项

| # | 文件:行 | 维度 | 问题 | 依据 |
|---|---|---|---|---|
| 1 | src/billing/discount.ts:13 | 可维护性 | `console.log` 调试残留，且把整个 `coupon` 对象（含券码）写入标准输出 | 差异 L13 |
| 2 | src/billing/discount.ts:15,17 | 可维护性 | 直接修改传入的 `order` 并返回同一引用，调用方持有的对象被改动；建议返回新对象或在函数名中体现会修改入参 | 差异 L15、L17 对 `order.total` 赋值，L19 `return order` |

## 提问

| # | 文件:行 | 需要作者说明 |
|---|---|---|
| 1 | src/billing/routes.ts:16 | 该路由是否受鉴权中间件保护？差异与已提供文件中未见；相邻的 `GET /orders/:id` 也未见 |
| 2 | src/billing/discount.ts:15 | `total` 与 `value` 的单位（分或元）是什么？百分比券 `value` 是否可能大于 100？`coupons` 表约束未提供 |
| 3 | src/billing/routes.ts:22 | `orders.load` 找不到订单时返回 `null` 还是抛错？L22-23 未判空即传入 `applyCoupon` |

## 测试覆盖

| 新增或改动的行为 | 对应测试 | 结论 |
|---|---|---|
| 百分比券折扣计算 | tests/discount.test.ts:4-8 | 已覆盖正常值 |
| 固定金额券折扣计算 | 无 | 已提供文件中未见测试（见阻断项 #3） |
| `POST /orders/:id/coupon` 接口（404、正常返回） | 无 | 已提供文件中未见测试 |

## 结论

建议请求变更 — 依据：3 个阻断项（负数金额、SQL 拼接、关键路径无测试）。
提示负责人：本 PR 改动订单金额计算（属支付范围），固定金额券分支无测试，按技能「何时停下找人」需负责人亲自确认后再推进。
本草案需负责人确认后再在 PR 上发表；不代替批准或合并。
