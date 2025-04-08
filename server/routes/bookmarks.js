const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // 获取所有书签
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM bookmarks ORDER BY created_at DESC');
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
      const [rows] = await pool.query('SELECT * FROM bookmarks WHERE collection_id = ? ORDER BY created_at DESC', [collection_id]);
      res.json(rows);
    } catch (error) {
      console.error('获取收藏夹书签失败:', error);
      res.status(500).json({ error: true, message: '获取收藏夹书签失败' });
    }
  });

  // 添加书签
  router.post('/', async (req, res) => {
    try {
      const { title, url, description, collection_id, favicon } = req.body;
      
      if (!title || !url || !collection_id) {
        return res.status(400).json({ error: true, message: '标题、URL和收藏夹ID是必填项' });
      }

      // 如果没有提供favicon，尝试自动获取
      let faviconUrl = favicon;
      if (!favicon) {
        try {
          const { getFaviconUrl } = require('../utils/favicon');
          faviconUrl = await getFaviconUrl(url);
        } catch (error) {
          console.error('自动获取favicon失败:', error);
          // 获取失败不影响书签添加
        }
      }

      const [result] = await pool.query(
        'INSERT INTO bookmarks (title, url, description, collection_id, favicon) VALUES (?, ?, ?, ?, ?)',
        [title, url, description, collection_id, faviconUrl]
      );

      const [newBookmark] = await pool.query('SELECT * FROM bookmarks WHERE id = ?', [result.insertId]);
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
      const { title, url, description, collection_id, favicon } = req.body;

      if (!title || !url || !collection_id) {
        return res.status(400).json({ error: true, message: '标题、URL和收藏夹ID是必填项' });
      }

      // 如果没有提供favicon，尝试自动获取
      let faviconUrl = favicon;
      if (!favicon) {
        try {
          const { getFaviconUrl } = require('../utils/favicon');
          faviconUrl = await getFaviconUrl(url);
        } catch (error) {
          console.error('自动获取favicon失败:', error);
          // 获取失败不影响书签更新
        }
      }

      await pool.query(
        'UPDATE bookmarks SET title = ?, url = ?, description = ?, collection_id = ?, favicon = ? WHERE id = ?',
        [title, url, description, collection_id, faviconUrl, bookmarkId]
      );

      const [updatedBookmark] = await pool.query('SELECT * FROM bookmarks WHERE id = ?', [bookmarkId]);
      
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
      const [result] = await pool.query('DELETE FROM bookmarks WHERE id = ?', [bookmarkId]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: true, message: '书签不存在' });
      }
      
      res.json({ success: true, message: '书签删除成功' });
    } catch (error) {
      console.error('删除书签失败:', error);
      res.status(500).json({ error: true, message: '删除书签失败' });
    }
  });

  return router;
};