const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// 导入数据库连接
const { pool, testConnection } = require('./server/db/database');

// 导入路由
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

// 路由
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/collections', collectionsRouter);

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