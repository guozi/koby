require('dotenv').config();

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_D1_DATABASE_ID = process.env.CF_D1_DATABASE_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const D1_API_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_D1_DATABASE_ID}/query`;

async function d1Fetch(sql, params = []) {
  const res = await fetch(D1_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  });

  const data = await res.json();
  if (!data.success) {
    const msg = data.errors?.[0]?.message || JSON.stringify(data.errors);
    throw new Error(`D1 query failed: ${msg}`);
  }
  return data.result[0];
}

// 后处理：将 SQLite 的 0/1 转回 boolean，tags 字符串转回数组
function postProcessRows(rows) {
  return rows.map(row => {
    const out = { ...row };
    if ('is_pinned' in out) out.is_pinned = Boolean(out.is_pinned);
    if ('tags' in out && typeof out.tags === 'string') {
      try { out.tags = JSON.parse(out.tags); } catch { /* keep as string */ }
    }
    return out;
  });
}

// 预处理参数：boolean → 0/1
function preProcessParams(params) {
  return params.map(p => {
    if (p === true) return 1;
    if (p === false) return 0;
    return p;
  });
}

// 模拟 mysql2/promise 的 pool.query(sql, params) → [rows, fields]
const pool = {
  async query(sql, params = []) {
    // 启用外键约束
    await d1Fetch('PRAGMA foreign_keys = ON');

    const result = await d1Fetch(sql, preProcessParams(params));
    const verb = sql.trim().split(/\s/)[0].toUpperCase();

    if (verb === 'SELECT' || verb === 'PRAGMA') {
      return [postProcessRows(result.results || []), []];
    }

    // INSERT / UPDATE / DELETE
    const meta = result.meta || {};
    return [{
      insertId: meta.last_row_id,
      affectedRows: meta.changes,
    }, []];
  },

  // 模拟 getConnection()，用于 collections 删除的"事务"
  async getConnection() {
    return {
      async query(sql, params = []) {
        return pool.query(sql, params);
      },
      async beginTransaction() { /* D1 REST API 不支持跨请求事务，noop */ },
      async commit() {},
      async rollback() {},
      release() {},
    };
  },
};

async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('D1 数据库连接成功');
    return true;
  } catch (error) {
    console.error('D1 数据库连接失败:', error.message);
    return false;
  }
}

module.exports = { pool, testConnection };
