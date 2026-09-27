**合成样例，非真实数据。所有代码、名称、端点均为虚构，仅用于演示审计输出格式。**

# 代码审计输入样例

## 审计请求

**代码快照**：提交 `a1b2c3d`（虚构提交哈希）  
**语言/框架**：Node.js / Express 4.x  
**审计范围**：`src/routes/` 和 `src/middleware/` 目录  
**威胁边界**：所有 HTTP 请求参数来自不可信的互联网用户；数据库为内部 PostgreSQL

## 被审计代码片段

### 片段 1：用户搜索路由（`src/routes/users.js`，行 23–45）

```javascript
// src/routes/users.js（合成样例）
const express = require('express');
const db = require('../db');
const router = express.Router();

// 用户搜索接口，返回匹配用户列表
router.get('/search', async (req, res) => {
  const keyword = req.query.q;
  // 直接拼接 SQL 查询
  const sql = `SELECT id, name, email FROM users WHERE name LIKE '%${keyword}%'`;
  try {
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    // 错误信息直接返回给客户端
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// 获取用户详情
router.get('/:id', async (req, res) => {
  const userId = req.params.id;
  // 未验证 userId 是否属于当前登录用户
  const result = await db.query(`SELECT * FROM users WHERE id = ${userId}`);
  res.json(result.rows[0]);
});

module.exports = router;
```

### 片段 2：文件上传处理（`src/routes/upload.js`，行 10–35）

```javascript
// src/routes/upload.js（合成样例）
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// 文件上传接口
router.post('/upload', (req, res) => {
  const filename = req.body.filename;
  const content = req.body.content;
  // 使用用户提供的文件名，未做路径规范化
  const filepath = path.join('/var/app/uploads', filename);
  fs.writeFileSync(filepath, content);
  res.json({ saved: filepath });
});

module.exports = router;
```

### 片段 3：配置文件（`src/config.js`，行 1–10）

```javascript
// src/config.js（合成样例）
module.exports = {
  db: {
    host: 'localhost',
    password: '<PLACEHOLDER_DB_PASSWORD>',  // 硬编码密码（合成样例占位）
    database: 'appdb'
  },
  jwtSecret: '<PLACEHOLDER_JWT_SECRET>'  // 硬编码 JWT 密钥（合成样例占位）
};
```

## 可选补充
- 无已有 SAST 扫描输出
- 无资产分级说明
