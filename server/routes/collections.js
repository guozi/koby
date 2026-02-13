const express = require('express');
const router = express.Router();
const { generateId } = require('../utils/id');

module.exports = (pool) => {
  // 获取所有收藏夹（当前用户）
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM collections WHERE user_id = ? ORDER BY created_at ASC',
        [req.userId]
      );
      res.json(rows);
    } catch (error) {
      console.error('获取收藏夹失败:', error);
      res.status(500).json({ error: true, message: '获取收藏夹失败' });
    }
  });

  // 获取单个收藏夹
  router.get('/:id', async (req, res) => {
    try {
      const collection_id = req.params.id;
      const [rows] = await pool.query(
        'SELECT * FROM collections WHERE id = ? AND user_id = ?',
        [collection_id, req.userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: true, message: '收藏夹不存在' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('获取收藏夹失败:', error);
      res.status(500).json({ error: true, message: '获取收藏夹失败' });
    }
  });

  // 添加收藏夹
  router.post('/', async (req, res) => {
    try {
      const { name, icon, color } = req.body;

      if (!name) {
        return res.status(400).json({ error: true, message: '收藏夹名称是必填项' });
      }

      const collectionId = generateId();
      await pool.query(
        'INSERT INTO collections (id, name, icon, color, user_id) VALUES (?, ?, ?, ?, ?)',
        [collectionId, name, icon || '📁', color || '#3B82F6', req.userId]
      );

      const [newCollection] = await pool.query('SELECT * FROM collections WHERE id = ?', [collectionId]);
      res.status(201).json(newCollection[0]);
    } catch (error) {
      console.error('添加收藏夹失败:', error);
      res.status(500).json({ error: true, message: '添加收藏夹失败' });
    }
  });

  // 更新收藏夹
  router.put('/:id', async (req, res) => {
    try {
      const collection_id = req.params.id;
      const { name, icon, color } = req.body;

      if (!name) {
        return res.status(400).json({ error: true, message: '收藏夹名称是必填项' });
      }

      await pool.query(
        'UPDATE collections SET name = ?, icon = ?, color = ? WHERE id = ? AND user_id = ?',
        [name, icon, color, collection_id, req.userId]
      );

      const [updatedCollection] = await pool.query('SELECT * FROM collections WHERE id = ? AND user_id = ?', [collection_id, req.userId]);

      if (updatedCollection.length === 0) {
        return res.status(404).json({ error: true, message: '收藏夹不存在' });
      }

      res.json(updatedCollection[0]);
    } catch (error) {
      console.error('更新收藏夹失败:', error);
      res.status(500).json({ error: true, message: '更新收藏夹失败' });
    }
  });

  // 删除收藏夹
  router.delete('/:id', async (req, res) => {
    try {
      const collection_id = req.params.id;

      // 检查是否为用户最后一个收藏夹
      const [allCollections] = await pool.query(
        'SELECT id FROM collections WHERE user_id = ?',
        [req.userId]
      );
      if (allCollections.length <= 1) {
        return res.status(400).json({ error: true, message: '不能删除最后一个收藏夹' });
      }

      // 找到用户的第一个收藏夹作为默认目标
      const defaultCollection = allCollections.find(c => c.id !== collection_id);

      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // 将该收藏夹下的书签移动到默认收藏夹
        await connection.query(
          'UPDATE bookmarks SET collection_id = ? WHERE collection_id = ? AND user_id = ?',
          [defaultCollection.id, collection_id, req.userId]
        );

        // 删除收藏夹
        const [result] = await connection.query(
          'DELETE FROM collections WHERE id = ? AND user_id = ?',
          [collection_id, req.userId]
        );

        if (result.affectedRows === 0) {
          await connection.rollback();
          connection.release();
          return res.status(404).json({ error: true, message: '收藏夹不存在' });
        }

        await connection.commit();
        connection.release();
        res.json({ success: true, message: '收藏夹删除成功，相关书签已移至默认收藏夹' });
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('删除收藏夹失败:', error);
      res.status(500).json({ error: true, message: '删除收藏夹失败' });
    }
  });

  return router;
};
