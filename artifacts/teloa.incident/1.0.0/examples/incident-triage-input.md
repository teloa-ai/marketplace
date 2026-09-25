<!-- 合成样例，非真实数据。所有姓名、公司、服务名与对话均为虚构。 -->

# 事件分级与初判输入材料（合成样例）

**服务：** order-api（下单接口），生产环境，区域 cn-east-1
**任务：** 初判是否构成事件并建议等级；如判定与近期部署相关，为建议的回滚起草变更说明与回滚步骤草案（不执行）
**时区说明：** 以下所有时间均为 +08:00

---

## 文件 1：组织分级规则（severity-policy.md，节选）

| 等级 | 条件（满足任一） |
|---|---|
| P1 | 核心交易链路（下单、支付）不可用，或错误率 >5% 持续 >10 分钟；资金或数据错误 |
| P2 | 核心交易链路错误率 2–5%；非核心功能不可用 |
| P3 | 非核心功能降级；单个客户受影响 |
| P4 | 无用户影响 |

## 文件 2：告警（alert-0924.txt）

```
[FIRING] OrderAPI5xxRateHigh
time: 2026-09-24 14:32:10 +08:00
service: order-api  env: prod  region: cn-east-1
value: 5xx_rate_5m = 8.4%   threshold: > 2% for 5m
```

## 文件 3：部署与变更记录（deploys-0924.csv）

| 时间 | 组件 | 类型 | 版本 / 内容 | 引用 |
|---|---|---|---|---|
| 2026-09-22 11:05:40 | order-api | 部署 | v2.30.2（commit 7d1e0b4） | pipeline #4796 |
| 2026-09-24 09:10:00 | payment-gateway | 配置 | 超时从 3s 调为 5s | CHG-2310 |
| 2026-09-24 14:20:05 | order-api | 部署 | v2.31.0（commit a3f9c2e） | pipeline #4821 |

## 文件 4：order-api 日志摘录（order-api-log-0924.txt）

```
2026-09-24 14:21:17 +08:00 ERROR [req-8c1f] java.lang.NullPointerException at com.shop.order.PromotionService.applyCoupon(PromotionService.java:142)
2026-09-24 14:21:19 +08:00 ERROR [req-8c27] java.lang.NullPointerException at com.shop.order.PromotionService.applyCoupon(PromotionService.java:142)
...（同类堆栈重复）
2026-09-24 14:30:00 +08:00 WARN  error_count_5m=312 path=/v1/orders status=500
```

## 文件 5：值班群消息（oncall-chat-0924.md）

- 14:35 韩笑（值班）：下单接口报 500，日志里全是 PromotionService.applyCoupon 的 NullPointerException
- 14:38 周敏（客服）：已收到 3 个客户反馈下单失败，都是用了优惠券的
- 14:40 韩笑：v2.31.0 加了优惠券叠加逻辑，怀疑跟这个有关
- 14:41 梁晨（负责人）：先出个初判，如果要回滚把说明写出来我来批
