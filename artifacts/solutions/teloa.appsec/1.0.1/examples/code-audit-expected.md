**合成样例，非真实数据。以下为对上方输入样例的期望审计报告，用于验收比对。**

# 代码审计报告

## 审计摘要

- **代码版本**：提交 `a1b2c3d`（虚构）
- **审计范围**：`src/routes/`、`src/middleware/`（后者在本次提供材料中为空）
- **语言/框架**：Node.js / Express 4.x
- **发现统计**：严重 2 / 高 1 / 中 0 / 低 1；已确认 3 / 疑似 0 / 需运行验证 1
- **未覆盖范围**：`src/middleware/` 目录（提供材料中无文件）；依赖安全未扫描（无 SCA 报告）

---

## 发现清单

### CA-001：SQL 注入（已确认 — 严重）

| 字段 | 内容 |
|---|---|
| 文件路径与行号 | `src/routes/users.js`，行 27 |
| 入口点 | `GET /search?q=<用户输入>` |
| 调用链 | `req.query.q` → 字符串拼接 → `db.query(sql)` → PostgreSQL |
| 可达性 | 无需认证的 GET 接口，任何互联网用户可触达 |
| 利用条件 | `q` 参数可插入任意 SQL 片段；LIKE 语句已使用 `%…%` 包裹，引号注入可绕过 |
| 影响 | C：高（可读取 users 表全量数据）；I：高（可执行 UPDATE/DROP 等 DDL/DML）；A：高（可触发删表） |
| CWE | CWE-89（SQL Injection，MITRE CWE，访问日 2026-09-25） |
| ASVS 参考 | V5.3.4（参数化查询，ASVS 5.0.0 自编摘要） |
| 修复建议 | 将字符串拼接替换为参数化查询：`db.query('SELECT id, name, email FROM users WHERE name LIKE $1', ['%' + keyword + '%'])` |
| 验证方法 | 用包含单引号的 `q` 值请求（如 `q=a'`）测试，应返回正常结果而非错误；确认 SQL 日志中参数已独立传递 |

---

### CA-002：IDOR（水平越权）— 已确认 — 严重

| 字段 | 内容 |
|---|---|
| 文件路径与行号 | `src/routes/users.js`，行 36 |
| 入口点 | `GET /:id` 路由，`:id` 为用户可控路径参数 |
| 调用链 | `req.params.id` → SQL 拼接 → 返回任意用户完整记录 |
| 可达性 | 需要认证（推断；认证中间件未在本次材料中确认）|
| 利用条件 | 已认证用户只需遍历整数 ID 即可读取任意其他用户数据；无资源所属检查 |
| 影响 | C：高（任意用户个人数据泄露）；I：低；A：低 |
| CWE | CWE-639（Authorization Bypass Through User-Controlled Key，MITRE CWE，访问日 2026-09-25） |
| ASVS 参考 | V4.2.1（间接对象引用验证，ASVS 5.0.0 自编摘要） |
| 修复建议 | 在查询中添加 `AND owner_id = $2` 条件，将当前认证用户 ID 作为第二个参数传入；或使用 UUID 替代自增整数 ID |
| 验证方法 | 使用用户 A 的令牌请求用户 B 的 ID，应返回 403 而非用户 B 的数据 |

> **注**：认证中间件是否已加载到此路由，在本次材料中未确认；若未加载，可达性应为无需认证，风险进一步升高。

---

### CA-003：路径遍历（已确认 — 高）

| 字段 | 内容 |
|---|---|
| 文件路径与行号 | `src/routes/upload.js`，行 19–20 |
| 入口点 | `POST /upload`，`req.body.filename` |
| 调用链 | `req.body.filename` → `path.join('/var/app/uploads', filename)` → `fs.writeFileSync` |
| 可达性 | POST 接口；认证状态未在材料中确认 |
| 利用条件 | `path.join` 不阻止 `../` 序列；攻击者可将 `filename` 设为 `../../etc/cron.d/shell` 等路径，写入应用进程可写的任意位置 |
| 影响 | I：严重（可覆盖系统文件或写入 Web 可执行路径）；C：高（间接可能读取敏感文件）；A：高（覆盖关键文件可导致服务中断） |
| CWE | CWE-22（Path Traversal，MITRE CWE，访问日 2026-09-25） |
| ASVS 参考 | V12.3.1（文件路径规范化，ASVS 5.0.0 自编摘要） |
| 修复建议 | 使用 `path.resolve` 计算最终路径后，检查是否以 `/var/app/uploads/` 为前缀；拒绝不满足条件的请求 |
| 验证方法 | 提交 `filename=../../tmp/test.txt`，应返回 400；提交合法文件名应成功写入指定目录 |

---

### CA-004：硬编码凭据（需运行验证 — 低）

| 字段 | 内容 |
|---|---|
| 文件路径与行号 | `src/config.js`，行 5（数据库密码）和行 8（JWT 密钥） |
| 入口点 | 配置文件，在应用启动时加载 |
| 调用链 | `config.db.password` → 数据库连接；`config.jwtSecret` → JWT 签名/验证 |
| 可达性 | 攻击者需要代码仓库读取权限或进程内存访问；若配置文件不在 `.gitignore` 中将暴露于代码历史 |
| 利用条件 | 凭据以明文形式存储；若代码仓库泄露，攻击者可直连数据库或伪造任意 JWT |
| 影响 | C：高（数据库和会话完全受控）；I：高；A：高 |
| CWE | CWE-798（Use of Hard-coded Credentials，MITRE CWE，访问日 2026-09-25） |
| 修复建议 | 迁移至环境变量（`process.env.DB_PASSWORD`）或密钥管理服务；从 Git 历史中清除此文件（`git-filter-repo`） |
| 验证方法 | 需运行验证：需确认此文件是否已提交至代码仓库历史；静态分析仅能确认代码中存在明文值 |

---

## 错误信息泄露（CA-005，低 — 已确认）

| 字段 | 内容 |
|---|---|
| 文件路径与行号 | `src/routes/users.js`，行 31–32 |
| 入口点 | `GET /search` 异常处理 |
| 利用条件 | 任何触发 DB 错误的请求 |
| 影响 | C：低（可能暴露数据库表结构、SQL 语法或内部路径）；I：低；A：低 |
| CWE | CWE-209（Generation of Error Message Containing Sensitive Information，访问日 2026-09-25） |
| 修复建议 | 生产环境记录完整错误到日志，向客户端返回通用错误消息（`{ "error": "Internal server error" }`） |

---

## 未覆盖范围

- `src/middleware/`：提供材料中未包含此目录文件
- 依赖安全（SCA）：未提供 `package-lock.json` 或 SCA 扫描报告，无法评估第三方依赖漏洞
- 认证中间件加载配置：路由级别的认证中间件未在本次材料中确认，CA-002 和 CA-003 的可达性可能与实际不同
