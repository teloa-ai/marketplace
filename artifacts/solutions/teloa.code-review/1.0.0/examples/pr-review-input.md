<!-- 合成样例，非真实数据 -->

# PR 评审输入材料（合成样例）

**任务：** 对 PR #142 生成评审意见草案，不在 PR 上发表
**评审规范：** 未提供
**读者：** 负责人（合入前自查）

---

## 文件 1：PR 描述（pr-142.md）

- 标题：feat(billing): 支持在订单上使用优惠券
- 基准 → 目标：a1b2c3d → e4f5a6b
- 目的：新增 `POST /orders/:id/coupon` 接口，按优惠券类型（百分比 / 固定金额）计算折扣并返回更新后的订单
- 改动范围：3 个文件（新增 discount.ts 与其测试，修改 routes.ts）
- 测试方式：新增 `tests/discount.test.ts`，覆盖百分比券

## 文件 2：差异（pr-142.diff，完整）

```diff
diff --git a/src/billing/discount.ts b/src/billing/discount.ts
new file mode 100644
--- /dev/null
+++ b/src/billing/discount.ts
@@ -0,0 +1,20 @@
+export type Coupon = {
+  code: string
+  kind: 'percent' | 'fixed'
+  value: number
+}
+
+export type Order = {
+  id: string
+  total: number
+}
+
+export function applyCoupon(order: Order, coupon: Coupon): Order {
+  console.log('applying coupon', coupon)
+  if (coupon.kind === 'percent') {
+    order.total = Math.round(order.total * (1 - coupon.value / 100))
+  } else {
+    order.total = order.total - coupon.value
+  }
+  return order
+}
diff --git a/src/billing/routes.ts b/src/billing/routes.ts
--- a/src/billing/routes.ts
+++ b/src/billing/routes.ts
@@ -1,5 +1,6 @@
 import { Router } from 'express'
 import { db } from '../db'
 import { orders } from './orders'
+import { applyCoupon } from './discount'
 
 const router = Router()
@@ -12,4 +13,15 @@ router.get('/orders/:id', async (req, res) => {
   res.json(order)
 })
 
+router.post('/orders/:id/coupon', async (req, res) => {
+  const code = req.body.code
+  const row = await db.get(
+    "SELECT code, kind, value FROM coupons WHERE code = '" + code + "'"
+  )
+  if (!row) return res.status(404).json({ error: 'coupon not found' })
+  const order = await orders.load(req.params.id)
+  const updated = applyCoupon(order, row)
+  res.json(updated)
+})
+
 export default router
diff --git a/tests/discount.test.ts b/tests/discount.test.ts
new file mode 100644
--- /dev/null
+++ b/tests/discount.test.ts
@@ -0,0 +1,9 @@
+import { applyCoupon } from '../src/billing/discount'
+
+describe('applyCoupon', () => {
+  it('applies a percent coupon', () => {
+    const order = { id: 'o-1', total: 200 }
+    const updated = applyCoupon(order, { code: 'TEN', kind: 'percent', value: 10 })
+    expect(updated.total).toBe(180)
+  })
+})
```
