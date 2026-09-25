---
name: teloa-dashboard-designer
description: 用户想把业务数据做成看板时使用（例如「给我做个告警趋势看板」）：读字段、试跑只读 SQL、生成组件与看板声明草案，交给本人在业务页预览确认。
---

# 看板设计

把用户对业务数据的描述变成可确认的看板声明。你只生成**草案**；草案不会生效，必须由本人在「业务 → 看板 → 待确认」预览并确认。

## 流程

1. **读字段**：调用 `teloa_business_definitions_directory`（参数 `scope`）读取本业务范围的对象类型、字段与现有视图。之后写的每个表名、列名都必须来自这里的结果。
2. **试跑 SQL**：对每个打算放进看板的查询，先调用 `teloa_business_sql_trial`（参数 `scope`、`sql`）试跑，看列名、类型和样例行是否符合预期。返回里有 `error.reason` 时，按原因修改后再试，直到通过。试跑最多返回 50 行，不保存任何东西。
3. **生成组件草案**：每个组件调用一次 `teloa_business_definitions_draft`，`kind:'widget'`，`definition` 为组件声明（见下文）。`definition.domain` 必须等于 `scope`。
4. **生成看板草案**：所有组件都存成草案后，再调用 `teloa_business_definitions_draft`，`kind:'dashboard'`，把组件放进 12 列网格。
5. **告知用户确认**：告诉用户到「业务 → 看板 → 待确认」预览并确认，先确认各组件、再确认看板（看板引用的组件未生效时无法确认）；确认前看板不会出现、也不会刷新。

每次保存草案都会弹出确认，用户拒绝时不要换个方式绕过，先问清原因。

如果对象类型还没有数据，可以先用 `kind:'source-mapping'` 生成数据源映射草案（来源只能是 `business-data-port`、`mcp-tool` 的只读工具或 `role-result`），同样等本人确认。

读取一张已生效看板的最近结果用 `teloa_business_dashboard_read`（参数 `scope`、`dashboardId`），它不触发刷新。

## 不得编造字段

- 表名、列名只能来自 `teloa_business_definitions_directory` 的结果，不得编造字段，也不要按常识猜测字段名。
- 目录里没有用户想要的字段时，直接告诉用户缺什么，建议先补对象类型字段或数据源映射，不要用别的字段顶替。
- 试跑没通过的 SQL 不要写进组件草案。

## 表名与列名

- **表名 `-`→`_`**：逻辑表名就是对象类型 id，SQL 里把 id 中的 `-` 写成 `_`。例如对象类型 `soc-alert` 在 SQL 里写 `soc_alert`。
- 列名就是字段的 `name`。字段名含 `-` 时用双引号引用（如 `"first-seen"`），并用 `as` 起一个小写字母、数字、下划线组成的别名。
- 每张表另有六个系统列：`_id`、`_version`、`_source`、`_synced_at`、`_observed_at`、`_deleted_at`。表里只有当前版本、未删除的对象。
- 自己起的名字（CTE 名、表别名、输出列别名、窗口名）只能用小写字母、数字和下划线，不以数字开头，最长 63 个字符。

## 七种字段类型与取值

平台已按字段类型把取值转换好，SQL 里直接用列名即可，不需要自己写 cast：

| 字段类型 | SQL 里的类型 |
|---|---|
| `text` | text |
| `enum` | text |
| `reference` | text |
| `number` | numeric |
| `duration` | numeric（秒数） |
| `datetime` | timestamptz |
| `boolean` | boolean |

无法转换的原值为 null。确实需要显式转换时，只允许转成 `numeric`、`integer`、`bigint`、`text`、`timestamptz`、`date`、`interval`、`boolean`。

## SQL 白名单要点

- 只能写**一条** `select`（可带 `with` CTE、`union`），不允许递归 CTE、`distinct on`、`lateral`、带模式名的表、列或函数，不允许 `$1` 这类参数占位符（范围与本人由平台注入）。
- 连接只用 `join … on`，`on` 里必须有「左表.列 = 右表.列」的等值条件；不允许逗号连接、`cross join`、`natural`、`using`。
- 运算符只有算术、比较与 `||`；可用 `like`、`ilike`、`between`、`in`、`is null`、`case`、`coalesce`、`nullif`。
- 允许的函数：
  - 聚合：`count` `sum` `avg` `min` `max` `stddev` `stddev_samp` `stddev_pop` `percentile_cont` `percentile_disc`（后两者必须带 `within group (order by …)`）
  - 时间：`now` `date_trunc` `extract` `date_part` `to_char` `make_interval` `age`
  - 文本：`concat` `length` `substring` `lower` `upper` `trim` `split_part` `left` `right`
  - 数值：`abs` `round` `ceil` `floor` `greatest` `least` `power` `sqrt`
  - 窗口：`row_number` `lag` `lead` `rank`
  - 其余函数一律拒绝（包括 `random`、`pg_` 开头的函数）。
- 时间窗口写法示例：`where created_at >= now() - interval '7 days'`；按天分组：`date_trunc('day', created_at)`。`now()` 在一次刷新里固定为刷新时刻。
- 执行边界：单条 SQL ≤ 8192 字节，语句超时 5 秒，结果最多 10000 行、单行 1 MiB、合计 8 MiB，超限即失败而不是截断；请先聚合再返回。每个业务范围同时最多 5 条查询在跑，这是单个宿主进程内的限制，多个宿主共用一个库时各自计数。

示例（告警按天趋势）：

```sql
select date_trunc('day', created_at) as day, severity, count(*) as total
from soc_alert
where created_at >= now() - interval '7 days'
group by 1, 2
order by 1
```

## 组件声明

共同字段：`format:'teloa.business-widget/v1'`、`id`（字母数字与 `-`）、`version`（如 `1.0.0`）、`domain`（等于 `scope`）、`title`、`kind`。
`kind` 共七种；除 `view-ref` 外都必须带 `query`（试跑通过的 SQL），各自的形状要求如下：

- `chart`：必须带 `chart:{engine:'vega-lite',spec:{…}}`，其余种类不得带。
- `metric`：必须带 `metric:{valueColumn,previousColumn?,unit?}`；查询通常只返回一行。
- `table`：可带 `table:{columns:[…]}`（1–64 个去重列名），缺省显示全部列。
- `list`：同 `table`，可带 `table:{columns:[…]}`。
- `board`：必须带 `board:{statusColumn,titleColumn,idColumn,statuses:[…]}`，`statuses` 为 1–12 个去重取值。
- `pipeline`：必须带 `pipeline:{stageColumn,countColumn,durationColumn?,stages:[…]}`，`stages` 为 1–12 个去重取值。
- `view-ref`：必须带 `viewRef`（现有视图 id），不得带 `query`。

可选：`thresholds`（≤ 4 条，`{field,op:'gte'|'lte',value,tone:'good'|'warn'|'bad'}`）、`drilldown`（`{kind:'objects',objectType}` 或 `{kind:'tasks'}`）。
配置里的列名必须是查询结果里的列名（大小写敏感，与 `as` 别名逐字一致）。

## 图表规范允许键

`chart.spec` 是 Vega-Lite 的一个子集。数据由平台注入，颜色由平台主题决定，声明里都不能写。

- 顶层只允许：`mark` `encoding` `transform` `width` `height` `title`
- `mark` 种类：`bar` `line` `arc` `area` `point`；对象形态只允许键 `type` `point` `interpolate` `tooltip` `innerRadius`
- 编码通道：`x` `y` `color` `theta` `size` `tooltip`；每个通道只允许键 `field` `type` `timeUnit` `aggregate` `title` `sort` `scale` `axis`
  - `type`：`quantitative` `ordinal` `nominal` `temporal`
  - `scale` 只允许 `type`；`axis` 只允许 `format`（32 字以内的 d3 数值或时间格式）
- `transform` 只允许 `aggregate` `timeUnit` `fold` `window` `stack` 这几类，项内键只允许 `aggregate` `groupby` `timeUnit` `field` `as` `fold` `window` `stack` `sort` `offset`
- 任何位置都不得出现：`data` `url` `values` `datasets` `params` `selection` `calculate` `filter` `expr` `signal` `layer` `repeat` `facet` `concat` `hconcat` `vconcat` `config` `condition` `bin` 等键，也不得出现形如函数的字符串

优先在 SQL 里算好，再让图表只做展示。

示例：

```json
{"format":"teloa.business-widget/v1","id":"alert-trend","version":"1.0.0","domain":"SOC","title":"近 7 天告警趋势","kind":"chart",
 "query":"select date_trunc('day', created_at) as day, count(*) as total from soc_alert where created_at >= now() - interval '7 days' group by 1 order by 1",
 "chart":{"engine":"vega-lite","spec":{"mark":"line","encoding":{"x":{"field":"day","type":"temporal"},"y":{"field":"total","type":"quantitative"}}}}}
```

## 看板声明

```json
{"format":"teloa.business-dashboard/v1","id":"alert-overview","version":"1.0.0","domain":"SOC","title":"告警概览",
 "widgets":["alert-count","alert-trend"],
 "layout":[{"widget":"alert-count","x":0,"y":0,"w":4,"h":2},{"widget":"alert-trend","x":4,"y":0,"w":8,"h":4}],
 "refresh":{"kind":"every","seconds":600},"acknowledgeShortInterval":false}
```

- `widgets`：1–12 个去重的组件 id；确认看板时这些组件必须都已生效。
- `layout`：12 列网格，每个组件恰好放一次，`0≤x<12`、`1≤w≤12`、`x+w≤12`、`1≤h≤12`、`y≥0`，不得重叠。
- `refresh`：`{kind:'every',seconds}`、`{kind:'hourly',minute}`、`{kind:'daily',time:'09:00',timezone}` 或 `{kind:'cron',expression,timezone}`，时区只能是 `Asia/Shanghai`、`Asia/Singapore`、`UTC`。一般用 600 秒或更长；短于 60 秒必须把顶层 `acknowledgeShortInterval` 设为 `true`，短于 600 秒时要提醒用户这会更频繁地占用外部额度与本机资源。
- 可选 `filters:{timeRange:{relative}}`，`relative` 取 `last-24h` `last-7d` `last-30d` `next-7d` `next-30d` `overdue`。

## 说明给用户听

- 用业务语言说明每个组件看的是什么、按什么周期刷新，不要把 SQL 或声明原文贴给用户，除非用户要看。
- 一期看板只有本人可见。
