const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // 获取所有收藏夹
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM collections ORDER BY created_at ASC');
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
      const [rows] = await pool.query('SELECT * FROM collections WHERE id = ?', [collection_id]);
      
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

      const [result] = await pool.query(
        'INSERT INTO collections (name, icon, color) VALUES (?, ?, ?)',
        [name, icon || '📁', color || '#3B82F6']
      );

      const [newCollection] = await pool.query('SELECT * FROM collections WHERE id = ?', [result.insertId]);
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
        'UPDATE collections SET name = ?, icon = ?, color = ? WHERE id = ?',
        [name, icon, color, collection_id]
      );

      const [updatedCollection] = await pool.query('SELECT * FROM collections WHERE id = ?', [collection_id]);
      
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
      
      // 检查是否为默认收藏夹（ID为1），不允许删除
      if (collection_id == 1) {
        return res.status(400).json({ error: true, message: '不能删除默认收藏夹' });
      }
      
      // 开始事务
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // 将该收藏夹下的书签移动到默认收藏夹
        await connection.query('UPDATE bookmarks SET collection_id = 1 WHERE collection_id = ?', [collection_id]);
        
        // 删除收藏夹
        const [result] = await connection.query('DELETE FROM collections WHERE id = ?', [collection_id]);
        
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