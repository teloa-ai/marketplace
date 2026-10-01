# SOC告警总览 · SOC alert overview

完整业务配置资源：`soc-alert-overview@1.0.0`，业务范围 `SOC`。

- 一种告警对象，含编号、标题、状态、严重度、发生时间、证据、资产、负责人和更新时间九个普通字段。
- 四个只读视图及四个 view-ref 组件：未完成告警、状态分布、严重度分布、近30天趋势。
- 告警记录与总览两页；页面名称可在配置草案中调整。看板每10分钟重新计算本地记录，不连接或同步外部系统。
- 先选择目标业务与来源，核对对象/字段/页面映射，生成草案、预览并由本人采用。
- 没有真实记录、密钥、同步绑定、默认动作或员工授权；外部连接、同步与业务动作另行配置。
- 尚未完成真实模型端到端验收；不要将元数据 `needs-configuration` 解释为已验证。

## English

A complete configuration for `soc-alert-overview@1.0.0` in scope `SOC`: one alert object with nine ordinary fields, four read-only views, four view-ref widgets, one dashboard, and records and overview pages. The ten-minute refresh recomputes local records and does not connect to or synchronize an external system.

Choose the target business and source, review object, field and page mappings, create a draft, preview it and adopt it personally. Page names can be edited in the draft. No records, keys, synchronization bindings, default actions or employee permissions are included. Configure external connections, synchronization and business actions separately. Real-model end-to-end acceptance has not been completed.
