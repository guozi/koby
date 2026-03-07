const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('缺少 JWT_SECRET 环境变量，服务无法启动');
  process.exit(1);
}

const { pool } = require('../server/db/database');
const { authMiddleware } = require('../server/middleware/auth');
const authRouter = require('../server/routes/auth')(pool);
const bookmarksRouter = require('../server/routes/bookmarks')(pool);
const collectionsRouter = require('../server/routes/collections')(pool);

const app = express();
app.set('trust proxy', 1);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.startsWith('chrome-extension://')) return callback(null, true);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    if (origin === clientUrl) return callback(null, true);
    callback(null, false);
  },
  credentials: true
}));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: true, message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/bookmarks', authMiddleware, bookmarksRouter);
app.use('/api/collections', authMiddleware, collectionsRouter);

app.get('/api', (req, res) => {
  res.json({ message: 'Koby API 服务器运行中' });
});

module.exports = app;
