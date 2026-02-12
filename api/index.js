const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { pool, testConnection } = require('../server/db/database');
const bookmarksRouter = require('../server/routes/bookmarks')(pool);
const collectionsRouter = require('../server/routes/collections')(pool);

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/collections', collectionsRouter);

app.get('/api', (req, res) => {
  res.json({ message: 'Koby API 服务器运行中' });
});

module.exports = app;
