---
name: teloa-dashboard-designer
description: 用户想把业务数据做成看板时使用（例如「给我做个告警趋势看板」）：读字段、试跑只读 SQL、生成组件与看板定义草案，交给本人在业务页预览确认。
---

# 看板设计

把用户对业务数据的描述变成可确认的看板定义。你只生成**草案**；草案不会生效，必须由本人在「业务 → 看板 → 待确认」预览并确认。

## 流程

1. **读字段**：调用 `teloa_business_definitions_directory`（参数 `scope`）读取本业务范围的对象类型、字段与现有视图。之后写的每个表名、列名都必须来自这里的结果。
2. **试跑 SQL**：对每个打算放进看板的查询，先调用 `teloa_business_sql_trial`（参数 `scope`、`sql`）试跑，看列名、类型和样例行是否符合预期。返回里有 `error.reason` 时，按原因修改后再试，直到通过。试跑最多返回 50 行，不保存任何东西。
3. **生成组件草案**：每个组件调用一次 `teloa_business_definitions_draft`，`kind:'widget'`，`definition` 为组件定义（见下文）。`definition.domain` 必须等于 `scope`。
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
- 时间窗口写法示例：`where created_at >= now() - interval '7 days'`；按天分组：`date_trunc('day', created_at)`。`now()` 在一次刷新里固定为刷新时刻。看板带整页时间范围时，接入范围的组件不要再这样写死窗口（见下文「整页时间范围」）。
- 执行边界：单条 SQL ≤ 8192 字节，语句超时 5 秒，结果最多 10000 行、单行 1 MiB、合计 8 MiB，超限即失败而不是截断；请先聚合再返回。每个业务范围同时最多 5 条查询在跑，这是单个宿主进程内的限制，多个宿主共用一个库时各自计数。

示例（告警按天趋势，不接整页范围时自己写窗口）：

```sql
select date_trunc('day', created_at) as day, severity, count(*) as total
from soc_alert
where created_at >= now() - interval '7 days'
group by 1, 2
order by 1
```

## 组件定义

共同字段：`format:'teloa.business-widget/v1'`、`id`（字母数字与 `-`）、`version`（如 `1.0.0`）、`domain`（等于 `scope`）、`title`、`kind`。
`kind` 共七种；除 `view-ref` 外都必须带 `query`（试跑通过的 SQL），各自的形状要求如下：

- `chart`：必须带 `chart:{engine:'vega-lite',spec:{…}}`，其余种类不得带。
- `metric`：必须带 `metric:{valueColumn,previousColumn?,unit?}`；查询通常只返回一行。
- `table`：可带 `table:{columns:[…]}`（1–64 个去重列名），缺省显示全部列。
- `list`：同 `table`，可带 `table:{columns:[…]}`。
- `board`：必须带 `board:{statusColumn,titleColumn,idColumn,statuses:[…]}`，`statuses` 为 1–12 个去重取值。
- `pipeline`：必须带 `pipeline:{stageColumn,countColumn,durationColumn?,stages:[…]}`，`stages` 为 1–12 个去重取值。
- `view-ref`：必须带 `viewRef`（现有视图 id），不得带 `query`。

可选：
- `thresholds`（≤ 4 条，`{field,op:'gte'|'lte',value,tone:'good'|'warn'|'bad'}`）。
- `timeFilter`：让组件跟着看板的整页时间范围走，见下文「整页时间范围」。
- `drilldown`：点组件跳到对象清单或单个对象，见下文「点击下钻」。

配置里的列名必须是查询结果里的列名（大小写敏感，与 `as` 别名逐字一致）。

## 图表规范允许键

`chart.spec` 是 Vega-Lite 的一个子集。数据由平台注入，颜色由平台主题决定，定义里都不能写。

- 顶层只允许：`mark` `encoding` `transform` `width` `height` `title`
- `mark` 种类：`bar` `line` `arc` `area` `point`；对象形态只允许键 `type` `point` `interpolate` `tooltip` `innerRadius`
- 编码通道：`x` `y` `color` `theta` `size` `tooltip`；每个通道只允许键 `field` `type` `timeUnit` `aggregate` `title` `sort` `scale` `axis`
  - `type`：`quantitative` `ordinal` `nominal` `temporal`
  - `scale` 只允许 `type`；`axis` 只允许 `format`（32 字以内的 d3 数值格式，如 `,.0f`）
- `transform` 只允许 `aggregate` `timeUnit` `fold` `window` `stack` 这几类，项内键只允许 `aggregate` `groupby` `timeUnit` `field` `as` `fold` `window` `stack` `sort` `offset`
- 任何位置都不得出现：`data` `url` `values` `datasets` `params` `selection` `calculate` `filter` `expr` `signal` `layer` `repeat` `facet` `concat` `hconcat` `vconcat` `config` `condition` `bin` 等键，也不得出现形如函数的字符串

**时间轴不写 `axis.format`**：`type:'temporal'` 的轴由平台按用户的界面语言和数据粒度自动排日期、定刻度，写了也会被覆盖；想按天、按月显示，就写 `timeUnit`（如 `yearmonthdate`、`yearmonth`）。数值轴的 `axis.format` 照常生效。

优先在 SQL 里算好，再让图表只做展示。

## 整页时间范围

看板可以在页头放一个时间范围切换（`filters.timeRange`），读者在「近 24 小时 / 近 7 天 / 近 30 天 / 近 90 天 / 全部」之间切换，接入的组件跟着换数据。

- 看板写 `filters:{timeRange:{options,default}}`（`filters` 里只有 `timeRange` 一项）：`options` 是 1–5 个不重复的取值，只能从 `24h`、`7d`、`30d`、`90d`、`all` 里选，按写的顺序显示；`default` 必须在 `options` 里，是打开看板时的默认范围。
- 组件写 `timeFilter:{table,column}` 表示接入：`table` 是 SQL 里读的逻辑表名（`-` 已写成 `_`），`column` 必须是这个对象类型的日期时间（`datetime`）字段，或系统列 `_observed_at` / `_synced_at`。平台会在这张表上只留下 `column` 落在所选范围里的对象，SQL 必须读这张表。
- **接入的组件不要再在 SQL 里写死时间窗口**（如 `where created_at >= now() - interval '7 days'`），否则切到 30 天也只剩 7 天。
- 带上期对比的指标（`metric.previousColumn`）不能接入：上期的数据在所选范围之外，会被截成 0。`view-ref` 也不能接入。这类组件照旧在 SQL 里自己写窗口。
- 一个组件只能按一张表的一列取范围；要让多张表各取各的窗口时，不要接入，在 SQL 里自己写。
- 看板写了 `filters`，至少要有一个组件接入；没接入的组件在页面上标「不随时间范围变化」。
- 定时刷新只算默认范围；读者切到别的范围时，平台按需补算一次。

示例（接入范围的趋势图，SQL 里不写窗口，时间轴不写 `axis.format`）：

```json
{"format":"teloa.business-widget/v1","id":"alert-trend","version":"1.1.0","domain":"SOC","title":"告警趋势","kind":"chart",
 "query":"select date_trunc('day', created_at) as day, count(*) as total from soc_alert group by 1 order by 1",
 "timeFilter":{"table":"soc_alert","column":"created_at"},
 "chart":{"engine":"vega-lite","spec":{"mark":"line","encoding":{"x":{"field":"day","type":"temporal","timeUnit":"yearmonthdate","title":"日期"},"y":{"field":"total","type":"quantitative","title":"告警数","axis":{"format":",.0f"}}}}}}
```

## 点击下钻

组件写 `drilldown` 后，读者点图形、表格行或卡片就能打开对应的业务对象。三种写法：

- 只写 `objectType`：点击打开这个对象类型的对象清单（不筛选）。
- `idColumn`：点某一行，打开这一行该列取值对应的单个对象。这一列要选出对象标识 `_id`。
- `match:{column,field}`：点某一行，打开对象清单，只看字段 `field` 等于这一行 `column` 取值的对象（例如点「高」这根柱子，只看严重度为高的告警）。

规则：
- `idColumn` 和 `match` 只能写一个；`view-ref` 不能写 `drilldown`；`metric` 只能只写 `objectType`。
- `pipeline` 不能写 `idColumn`；写 `match` 时 `column` 必须是 `stageColumn`。
- `chart` 用到的 `idColumn` 或 `match.column` 必须出现在图表编码的字段里，否则点击时拿不到这一列。折线图、面积图下钻时平台会在每个数据点上加圆点，读者点圆点跳转。
- 目标对象类型必须在本业务范围里、并且有清单视图（`list` 视图），否则预览会提示对不上。
- `match.field` 只能是文本（`text`）、枚举（`enum`）、引用（`reference`）或布尔（`boolean`）字段；日期时间、数字、时长字段不做下钻（按天汇总后的一个点和对象的精确时刻不会相等，清单永远是空的）。
- 每个带下钻的组件标题旁都会有「查看对象」按钮，打开不筛选的清单。

示例（按严重度的柱状图，点柱子看这一档的告警；同时接入整页范围）：

```json
{"format":"teloa.business-widget/v1","id":"alert-by-severity","version":"1.1.0","domain":"SOC","title":"告警按严重度","kind":"chart",
 "query":"select severity, count(*) as total from soc_alert group by 1",
 "timeFilter":{"table":"soc_alert","column":"created_at"},
 "drilldown":{"objectType":"soc-alert","match":{"column":"severity","field":"severity"}},
 "chart":{"engine":"vega-lite","spec":{"mark":"bar","encoding":{"x":{"field":"severity","type":"nominal","title":"严重度"},"y":{"field":"total","type":"quantitative","title":"告警数"}}}}}
```

示例（未关闭告警表格，点一行打开那条告警）：

```json
{"format":"teloa.business-widget/v1","id":"open-alerts","version":"1.1.0","domain":"SOC","title":"未关闭告警","kind":"table",
 "query":"select _id, host, severity, created_at from soc_alert where status <> 'closed' order by created_at desc",
 "table":{"columns":["_id","host","severity","created_at"]},
 "drilldown":{"objectType":"soc-alert","idColumn":"_id"}}
```

## 看板定义

```json
{"format":"teloa.business-dashboard/v1","id":"alert-overview","version":"1.1.0","domain":"SOC","title":"告警概览",
 "widgets":["alert-trend","alert-by-severity","open-alerts"],
 "layout":[{"widget":"alert-trend","x":0,"y":0,"w":8,"h":4},{"widget":"alert-by-severity","x":8,"y":0,"w":4,"h":4},{"widget":"open-alerts","x":0,"y":4,"w":12,"h":4}],
 "filters":{"timeRange":{"options":["7d","30d","90d"],"default":"7d"}},
 "refresh":{"kind":"every","seconds":600},"acknowledgeShortInterval":false}
```

- `widgets`：1–12 个去重的组件 id；确认看板时这些组件必须都已生效。
- `layout`：12 列网格，每个组件恰好放一次，`0≤x<12`、`1≤w≤12`、`x+w≤12`、`1≤h≤12`、`y≥0`，不得重叠。
- `refresh`：`{kind:'every',seconds}`、`{kind:'hourly',minute}`、`{kind:'daily',time:'09:00',timezone}` 或 `{kind:'cron',expression,timezone}`，时区只能是 `Asia/Shanghai`、`Asia/Singapore`、`UTC`。一般用 600 秒或更长；短于 60 秒必须把顶层 `acknowledgeShortInterval` 设为 `true`，短于 600 秒时要提醒用户这会更频繁地占用外部额度与本机资源。
- `filters`：可选，整页时间范围，写法见上文。不需要切换范围时不写，时间条件直接写进各组件的 SQL。

## MCP 工具来源分页

数据源映射的来源是 `mcp-tool` 时，默认只调用一次工具、取一页。工具支持翻页时，在 `source` 里写 `pagination`（`{cursorArgument,nextCursorPath}`），平台会一页页拉完：

- `cursorArgument`：工具接收「下一页位置」的参数名，例如 `page_token`。不得与 `arguments` 里已有的参数重名；映射写了 `incrementalCursor` 时也不得叫 `cursor`（平台用参数 `cursor` 传上次同步到的位置）。
- `nextCursorPath`：在工具返回结果里取「下一页位置」的路径，只支持 `$`、`.name`、`['name']`、`[n]`，不带 `[*]`。取到非空文字或整数就接着拉下一页；取不到、为 null 或空文字就结束；取到别的东西会报错、这次不写入。
- 每页条数不能超过映射的 `pageSize`（1–100，默认 50），超过会报错；请把工具的每页条数参数设成同样的值。一次同步最多翻 1000 页。
- 预览里的「试拉」只拉第 1 页。

示例：

```json
{"format":"teloa.business-source-mapping/v1","id":"crm-deal-sync","version":"1.0.0","domain":"sales","title":"CRM 商机同步",
 "objectType":"crm-deal",
 "source":{"kind":"mcp-tool","serverName":"crm","tool":"list_deals","arguments":{"limit":50},"itemsPath":"$.deals[*]","pagination":{"cursorArgument":"page_token","nextCursorPath":"$.next_page_token"}},
 "mapping":[{"path":"$.id","field":"deal-id"},{"path":"$.stage","field":"stage"},{"path":"$.name","field":"title"},{"path":"$.updated_at","field":"observedAt"}],
 "primaryKey":["deal-id"],
 "deletionSemantics":"compare",
 "schedule":{"kind":"every","seconds":3600},"acknowledgeShortInterval":false,
 "pageSize":50}
```

## 预览没通过时

- 预览里出现「草案与已有定义对不上」（界面原句是「这份草案与本业务已有的定义对不上：……」）时，冒号后面就是原因，例如时间范围用的列不是日期时间字段、看板写了时间范围却没有组件接入、下钻的对象类型没有清单视图、`match` 用了不能下钻的字段。按原因改草案再存，不要换个写法绕过。
- 出现「这次操作没有通过检查：……」时，同样按冒号后的原因改。

## 说明给用户听

- 用业务语言说明每个组件看的是什么、按什么周期刷新、能不能切时间范围、点了会打开什么，不要把 SQL 或定义原文贴给用户，除非用户要看。
- 看板只有本人可见。

## 已知限制

- 业务范围（`scope`，也就是组件和看板里的 `domain`）是 1–64 位字母、数字、下划线或连字符组成的键，例如 `SOC`、`quality-mgmt`；中文名是范围的显示名，不能当 `scope` 用。不合规的范围在草案时就会被拒收。
- 时间范围只有上面五个预设，不能自定义起止日期；范围只设下限，时间晚于现在的对象也会计入。
- `now()` 是这次刷新的时刻，不是用户打开看板的时刻：看板显示的是「更新于」那一刻算出的结果，时间窗口按那一刻计算。
- `match` 下钻只筛选对象清单，分析视图仍看全部；清单受清单视图自带的条件和行数上限约束。
- SQL 试跑最多返回 50 行；返回里 `truncated` 为 `true` 时说明实际结果更多，`totalRows` 是截断前的行数。
