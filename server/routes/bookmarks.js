const express = require('express');
const router = express.Router();
const { parseBookmarksHtml } = require('../utils/bookmarkParser');
const { generateId } = require('../utils/id');

function isSafeUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch { return false; }
}

module.exports = (pool) => {
  async function ensureCollectionOwnedByUser(collectionId, userId) {
    const [rows] = await pool.query(
      'SELECT id FROM collections WHERE id = ? AND user_id = ?',
      [collectionId, userId]
    );
    return rows.length > 0;
  }

  // 获取所有书签（当前用户）
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM bookmarks WHERE user_id = ? ORDER BY is_pinned DESC, created_at DESC',
        [req.userId]
      );
      res.json(rows);
    } catch (error) {
      console.error('获取书签失败:', error);
      res.status(500).json({ error: true, message: '获取书签失败' });
    }
  });

  // 获取特定收藏夹下的书签
  router.get('/collection/:id', async (req, res) => {
    try {
      const collection_id = req.params.id;
      const [rows] = await pool.query(
        'SELECT * FROM bookmarks WHERE collection_id = ? AND user_id = ? ORDER BY is_pinned DESC, created_at DESC',
        [collection_id, req.userId]
      );
      res.json(rows);
    } catch (error) {
      console.error('获取收藏夹书签失败:', error);
      res.status(500).json({ error: true, message: '获取收藏夹书签失败' });
    }
  });

  // 添加书签
  router.post('/', async (req, res) => {
    try {
      const { title, url, description, collection_id, favicon, tags, is_pinned } = req.body;

      if (!title || !url || !collection_id) {
        return res.status(400).json({ error: true, message: '标题、URL和收藏夹ID是必填项' });
      }

      if (!isSafeUrl(url)) {
        return res.status(400).json({ error: true, message: 'URL 必须以 http:// 或 https:// 开头' });
      }

      const hasCollectionAccess = await ensureCollectionOwnedByUser(collection_id, req.userId);
      if (!hasCollectionAccess) {
        return res.status(403).json({ error: true, message: '无权访问该收藏夹' });
      }

      // 如果没有提供favicon，尝试自动获取
      let faviconUrl = favicon;
      if (!favicon) {
        try {
          const { getFaviconUrl } = require('../utils/favicon');
          faviconUrl = await getFaviconUrl(url);
        } catch (error) {
          console.error('自动获取favicon失败:', error);
        }
      }

      const bookmarkId = generateId();
      const [result] = await pool.query(
        'INSERT INTO bookmarks (id, title, url, description, collection_id, favicon, tags, is_pinned, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [bookmarkId, title, url, description, collection_id, faviconUrl, tags ? JSON.stringify(tags) : null, is_pinned || false, req.userId]
      );

      const [newBookmark] = await pool.query('SELECT * FROM bookmarks WHERE id = ?', [bookmarkId]);
      res.status(201).json(newBookmark[0]);
    } catch (error) {
      console.error('添加书签失败:', error);
      res.status(500).json({ error: true, message: '添加书签失败' });
    }
  });

  // 更新书签
  router.put('/:id', async (req, res) => {
    try {
      const bookmarkId = req.params.id;
      const { title, url, description, collection_id, favicon, tags, is_pinned } = req.body;

      if (!title || !url || !collection_id) {
        return res.status(400).json({ error: true, message: '标题、URL和收藏夹ID是必填项' });
      }

      if (!isSafeUrl(url)) {
        return res.status(400).json({ error: true, message: 'URL 必须以 http:// 或 https:// 开头' });
      }

      const hasCollectionAccess = await ensureCollectionOwnedByUser(collection_id, req.userId);
      if (!hasCollectionAccess) {
        return res.status(403).json({ error: true, message: '无权访问该收藏夹' });
      }

      // 如果没有提供favicon，尝试自动获取
      let faviconUrl = favicon;
      if (!favicon) {
        try {
          const { getFaviconUrl } = require('../utils/favicon');
          faviconUrl = await getFaviconUrl(url);
        } catch (error) {
          console.error('自动获取favicon失败:', error);
        }
      }

      await pool.query(
        'UPDATE bookmarks SET title = ?, url = ?, description = ?, collection_id = ?, favicon = ?, tags = ?, is_pinned = ? WHERE id = ? AND user_id = ?',
        [title, url, description, collection_id, faviconUrl, tags ? JSON.stringify(tags) : null, is_pinned, bookmarkId, req.userId]
      );

      const [updatedBookmark] = await pool.query('SELECT * FROM bookmarks WHERE id = ? AND user_id = ?', [bookmarkId, req.userId]);

      if (updatedBookmark.length === 0) {
        return res.status(404).json({ error: true, message: '书签不存在' });
      }

      res.json(updatedBookmark[0]);
    } catch (error) {
      console.error('更新书签失败:', error);
      res.status(500).json({ error: true, message: '更新书签失败' });
    }
  });

  // 删除书签
  router.delete('/:id', async (req, res) => {
    try {
      const bookmarkId = req.params.id;
      const [result] = await pool.query('DELETE FROM bookmarks WHERE id = ? AND user_id = ?', [bookmarkId, req.userId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: true, message: '书签不存在' });
      }

      res.json({ success: true, message: '书签删除成功' });
    } catch (error) {
      console.error('删除书签失败:', error);
      res.status(500).json({ error: true, message: '删除书签失败' });
    }
  });

  // 解析HTML书签
  router.post('/parse-html', async (req, res) => {
    try {
      const { htmlContent } = req.body;

      if (!htmlContent) {
        return res.status(400).json({ error: true, message: 'HTML内容不能为空' });
      }

      const parsedData = parseBookmarksHtml(htmlContent);
      res.json(parsedData);
    } catch (error) {
      console.error('解析HTML书签失败:', error);
      res.status(500).json({ error: true, message: '解析HTML书签失败: ' + error.message });
    }
  });

  return router;
};
