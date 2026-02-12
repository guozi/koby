const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('缺少 JWT_SECRET 环境变量，服务器已停止启动');
  process.exit(1);
}

// 导入数据库连接
const { pool, testConnection } = require('./server/db/database');

// 导入中间件
const { authMiddleware } = require('./server/middleware/auth');

// 导入路由
const authRouter = require('./server/routes/auth')(pool);
const bookmarksRouter = require('./server/routes/bookmarks')(pool);
const collectionsRouter = require('./server/routes/collections')(pool);

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// 认证路由限流：每 IP 15 分钟最多 20 次
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: true, message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 路由
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/bookmarks', authMiddleware, bookmarksRouter);
app.use('/api/collections', authMiddleware, collectionsRouter);

// 根路由
app.get('/', (req, res) => {
  res.json({ message: 'Koby API 服务器运行中' });
});

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('无法连接到数据库，服务器启动失败');
      process.exit(1);
    }

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();
