const express = require('express');
const router = express.Router();
const { parseBookmarksHtml } = require('../utils/bookmarkParser');
const { generateId } = require('../utils/id');
const { autoTag } = require('../utils/autoTagger');
const { isSafeUrl, isSafeUrlProtocol } = require('../utils/urlSafety');

module.exports = (pool) => {
  async function ensureCollectionOwnedByUser(collectionId, userId) {
    const [rows] = await pool.query(
      'SELECT id FROM collections WHERE id = ? AND user_id = ?',
      [collectionId, userId]
    );
    return rows.length > 0;
  }

  // 获取URL元数据（标题、描述、favicon）
  router.get('/fetch-meta', async (req, res) => {
    try {
      const { url } = req.query;
      if (!url) return res.status(400).json({ error: true, code: 'BOOKMARK_URL_REQUIRED', message: 'URL is required' });
      if (!(await isSafeUrl(url))) return res.status(400).json({ error: true, code: 'BOOKMARK_URL_INVALID', message: 'Invalid URL' });

      const { getUrlMeta } = require('../utils/favicon');
      const meta = await getUrlMeta(url);
      const suggestedTags = autoTag(url, meta.title, meta.description);
      res.json({ ...meta, suggestedTags });
    } catch (error) {
      console.error('获取URL元数据失败:', error);
      res.status(500).json({ error: true, code: 'BOOKMARK_FETCH_META_FAILED', message: '获取URL元数据失败' });
    }
  });

  // 搜索书签
  router.get('/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || !q.trim()) return res.json([]);
      const keyword = `%${q.trim()}%`;
      const [rows] = await pool.query(
        'SELECT * FROM bookmarks WHERE user_id = ? AND (title LIKE ? OR url LIKE ? OR description LIKE ?) ORDER BY is_pinned DESC, created_at DESC LIMIT 20',
        [req.userId, keyword, keyword, keyword]
      );
      res.json(rows);
    } catch (error) {
      console.error('搜索书签失败:', error);
      res.status(500).json({ error: true, code: 'BOOKMARK_SEARCH_FAILED', message: '搜索书签失败' });
    }
  });

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
      res.status(500).json({ error: true, code: 'BOOKMARK_LIST_FAILED', message: '获取书签失败' });
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
      res.status(500).json({ error: true, code: 'BOOKMARK_COLLECTION_LIST_FAILED', message: '获取收藏夹书签失败' });
    }
  });

  // 添加书签
  router.post('/', async (req, res) => {
    try {
      const { title, url, description, collection_id, favicon, tags, is_pinned } = req.body;

      if (!title || !url || !collection_id) {
        return res.status(400).json({ error: true, code: 'BOOKMARK_FIELDS_REQUIRED', message: '标题、URL和收藏夹ID是必填项' });
      }

      if (!isSafeUrlProtocol(url)) {
        return res.status(400).json({ error: true, code: 'BOOKMARK_URL_PROTOCOL_INVALID', message: 'URL 必须以 http:// 或 https:// 开头' });
      }

      const hasCollectionAccess = await ensureCollectionOwnedByUser(collection_id, req.userId);
      if (!hasCollectionAccess) {
        return res.status(403).json({ error: true, code: 'BOOKMARK_COLLECTION_FORBIDDEN', message: '无权访问该收藏夹' });
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
      res.status(500).json({ error: true, code: 'BOOKMARK_ADD_FAILED', message: '添加书签失败' });
    }
  });

  // 更新书签
  router.put('/:id', async (req, res) => {
    try {
      const bookmarkId = req.params.id;
      const { title, url, description, collection_id, favicon, tags, is_pinned } = req.body;

      if (!title || !url || !collection_id) {
        return res.status(400).json({ error: true, code: 'BOOKMARK_FIELDS_REQUIRED', message: '标题、URL和收藏夹ID是必填项' });
      }

      if (!isSafeUrlProtocol(url)) {
        return res.status(400).json({ error: true, code: 'BOOKMARK_URL_PROTOCOL_INVALID', message: 'URL 必须以 http:// 或 https:// 开头' });
      }

      const hasCollectionAccess = await ensureCollectionOwnedByUser(collection_id, req.userId);
      if (!hasCollectionAccess) {
        return res.status(403).json({ error: true, code: 'BOOKMARK_COLLECTION_FORBIDDEN', message: '无权访问该收藏夹' });
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
        return res.status(404).json({ error: true, code: 'BOOKMARK_NOT_FOUND', message: '书签不存在' });
      }

      res.json(updatedBookmark[0]);
    } catch (error) {
      console.error('更新书签失败:', error);
      res.status(500).json({ error: true, code: 'BOOKMARK_UPDATE_FAILED', message: '更新书签失败' });
    }
  });

  // 删除书签
  router.delete('/:id', async (req, res) => {
    try {
      const bookmarkId = req.params.id;
      const [result] = await pool.query('DELETE FROM bookmarks WHERE id = ? AND user_id = ?', [bookmarkId, req.userId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: true, code: 'BOOKMARK_NOT_FOUND', message: '书签不存在' });
      }

      res.json({ success: true, message: '书签删除成功' });
    } catch (error) {
      console.error('删除书签失败:', error);
      res.status(500).json({ error: true, code: 'BOOKMARK_DELETE_FAILED', message: '删除书签失败' });
    }
  });

  // 解析HTML书签
  router.post('/parse-html', async (req, res) => {
    try {
      const { htmlContent } = req.body;

      if (!htmlContent) {
        return res.status(400).json({ error: true, code: 'BOOKMARK_HTML_EMPTY', message: 'HTML内容不能为空' });
      }

      const parsedData = parseBookmarksHtml(htmlContent);
      res.json(parsedData);
    } catch (error) {
      console.error('解析HTML书签失败:', error);
      res.status(500).json({ error: true, code: 'BOOKMARK_PARSE_FAILED', message: '解析HTML书签失败' });
    }
  });

  return router;
};
