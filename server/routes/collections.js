const express = require('express');
const router = express.Router();
const { generateId } = require('../utils/id');

const MAX_COLLECTIONS_PER_USER = 20;

module.exports = (pool) => {
  // 获取所有收藏夹（当前用户）
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM collections WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC',
        [req.userId]
      );
      res.json(rows);
    } catch (error) {
      console.error('获取收藏夹失败:', error);
      res.status(500).json({ error: true, code: 'COLLECTION_LIST_FAILED', message: '获取收藏夹失败' });
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
        return res.status(404).json({ error: true, code: 'COLLECTION_NOT_FOUND', message: '收藏夹不存在' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('获取收藏夹失败:', error);
      res.status(500).json({ error: true, code: 'COLLECTION_FETCH_FAILED', message: '获取收藏夹失败' });
    }
  });

  // 添加收藏夹
  router.post('/', async (req, res) => {
    try {
      const { name, icon, color, parent_id } = req.body;

      if (!name) {
        return res.status(400).json({ error: true, code: 'COLLECTION_NAME_REQUIRED', message: '收藏夹名称是必填项' });
      }

      // 数量限制检查
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM collections WHERE user_id = ?',
        [req.userId]
      );
      if (countResult[0].total >= MAX_COLLECTIONS_PER_USER) {
        return res.status(403).json({ error: true, code: 'COLLECTION_LIMIT_REACHED', message: `收藏夹数量已达上限（${MAX_COLLECTIONS_PER_USER}）` });
      }

      // 验证父收藏夹归属
      if (parent_id) {
        const [parent] = await pool.query(
          'SELECT id FROM collections WHERE id = ? AND user_id = ?',
          [parent_id, req.userId]
        );
        if (parent.length === 0) {
          return res.status(400).json({ error: true, code: 'COLLECTION_PARENT_NOT_FOUND', message: '父收藏夹不存在' });
        }
        // 检查深度限制
        const parentDepth = await getAncestorDepth(pool, parent_id, req.userId);
        if (parentDepth + 1 > MAX_DEPTH) {
          return res.status(400).json({ error: true, code: 'COLLECTION_MAX_DEPTH', message: '收藏夹层级不能超过三层' });
        }
      }

      // 自动计算 sort_order
      const parentVal = parent_id || null;
      let sortQuery, sortParams;
      if (parentVal === null) {
        sortQuery = 'SELECT COALESCE(MAX(sort_order), -1) as max_sort FROM collections WHERE user_id = ? AND parent_id IS NULL';
        sortParams = [req.userId];
      } else {
        sortQuery = 'SELECT COALESCE(MAX(sort_order), -1) as max_sort FROM collections WHERE user_id = ? AND parent_id = ?';
        sortParams = [req.userId, parentVal];
      }
      const [maxSort] = await pool.query(sortQuery, sortParams);
      const sortOrder = maxSort[0].max_sort + 1;

      const collectionId = generateId();
      await pool.query(
        'INSERT INTO collections (id, name, icon, color, parent_id, sort_order, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [collectionId, name, icon || '📁', color || '#3B82F6', parent_id || null, sortOrder, req.userId]
      );

      const [newCollection] = await pool.query('SELECT * FROM collections WHERE id = ?', [collectionId]);
      res.status(201).json(newCollection[0]);
    } catch (error) {
      console.error('添加收藏夹失败:', error);
      res.status(500).json({ error: true, code: 'COLLECTION_ADD_FAILED', message: '添加收藏夹失败' });
    }
  });

  // 检测循环嵌套
  async function wouldCreateCycle(pool, collectionId, newParentId, userId) {
    if (!newParentId) return false;
    if (collectionId === newParentId) return true;
    let currentId = newParentId;
    const visited = new Set();
    while (currentId) {
      if (visited.has(currentId)) return true;
      visited.add(currentId);
      if (currentId === collectionId) return true;
      const [rows] = await pool.query(
        'SELECT parent_id FROM collections WHERE id = ? AND user_id = ?',
        [currentId, userId]
      );
      currentId = rows.length > 0 ? rows[0].parent_id : null;
    }
    return false;
  }

  // 计算节点深度（根=0）
  async function getAncestorDepth(pool, collectionId, userId) {
    let depth = 0;
    let currentId = collectionId;
    while (currentId) {
      const [rows] = await pool.query(
        'SELECT parent_id FROM collections WHERE id = ? AND user_id = ?',
        [currentId, userId]
      );
      if (rows.length === 0 || !rows[0].parent_id) break;
      currentId = rows[0].parent_id;
      depth++;
    }
    return depth;
  }

  // 计算子树最大深度（相对于当前节点）
  async function getMaxSubtreeDepth(pool, collectionId, userId) {
    let maxDepth = 0;
    async function traverse(id, depth) {
      const [children] = await pool.query(
        'SELECT id FROM collections WHERE parent_id = ? AND user_id = ?',
        [id, userId]
      );
      for (const child of children) {
        if (depth + 1 > maxDepth) maxDepth = depth + 1;
        await traverse(child.id, depth + 1);
      }
    }
    await traverse(collectionId, 0);
    return maxDepth;
  }

  const MAX_DEPTH = 2; // 最多三层（depth 0, 1, 2）

  // 更新收藏夹
  router.put('/:id', async (req, res) => {
    try {
      const collection_id = req.params.id;
      const { name, icon, color, parent_id } = req.body;

      if (!name) {
        return res.status(400).json({ error: true, code: 'COLLECTION_NAME_REQUIRED', message: '收藏夹名称是必填项' });
      }

      // 验证父收藏夹
      if (parent_id) {
        const [parent] = await pool.query(
          'SELECT id FROM collections WHERE id = ? AND user_id = ?',
          [parent_id, req.userId]
        );
        if (parent.length === 0) {
          return res.status(400).json({ error: true, code: 'COLLECTION_PARENT_NOT_FOUND', message: '父收藏夹不存在' });
        }
      }

      // 防止循环嵌套
      if (await wouldCreateCycle(pool, collection_id, parent_id, req.userId)) {
        return res.status(400).json({ error: true, code: 'COLLECTION_CYCLE_DETECTED', message: '不能将收藏夹移动到自身或其子收藏夹下' });
      }

      // 检查深度限制：父节点深度 + 1（自身）+ 子树深度 不能超过 MAX_DEPTH
      if (parent_id) {
        const parentDepth = await getAncestorDepth(pool, parent_id, req.userId);
        const subtreeDepth = await getMaxSubtreeDepth(pool, collection_id, req.userId);
        if (parentDepth + 1 + subtreeDepth > MAX_DEPTH) {
          return res.status(400).json({ error: true, code: 'COLLECTION_DEPTH_EXCEEDED', message: '移动后收藏夹层级将超过三层限制' });
        }
      }

      await pool.query(
        'UPDATE collections SET name = ?, icon = ?, color = ?, parent_id = ? WHERE id = ? AND user_id = ?',
        [name, icon, color, parent_id || null, collection_id, req.userId]
      );

      const [updatedCollection] = await pool.query('SELECT * FROM collections WHERE id = ? AND user_id = ?', [collection_id, req.userId]);

      if (updatedCollection.length === 0) {
        return res.status(404).json({ error: true, code: 'COLLECTION_NOT_FOUND', message: '收藏夹不存在' });
      }

      res.json(updatedCollection[0]);
    } catch (error) {
      console.error('更新收藏夹失败:', error);
      res.status(500).json({ error: true, code: 'COLLECTION_UPDATE_FAILED', message: '更新收藏夹失败' });
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
        return res.status(400).json({ error: true, code: 'COLLECTION_LAST_DELETE', message: '不能删除最后一个收藏夹' });
      }

      // 获取被删除收藏夹的 parent_id
      const [target] = await pool.query(
        'SELECT parent_id FROM collections WHERE id = ? AND user_id = ?',
        [collection_id, req.userId]
      );
      if (target.length === 0) {
        return res.status(404).json({ error: true, code: 'COLLECTION_NOT_FOUND', message: '收藏夹不存在' });
      }
      const parentId = target[0].parent_id;

      // 找到用户的第一个收藏夹作为默认目标（排除自身）
      const defaultCollection = allCollections.find(c => c.id !== collection_id);

      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // 将子收藏夹提升到被删除节点的父级
        await connection.query(
          'UPDATE collections SET parent_id = ? WHERE parent_id = ? AND user_id = ?',
          [parentId, collection_id, req.userId]
        );

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
          return res.status(404).json({ error: true, code: 'COLLECTION_NOT_FOUND', message: '收藏夹不存在' });
        }

        await connection.commit();
        connection.release();
        res.json({ success: true, message: '收藏夹删除成功，子收藏夹已提升，相关书签已移至默认收藏夹' });
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('删除收藏夹失败:', error);
      res.status(500).json({ error: true, code: 'COLLECTION_DELETE_FAILED', message: '删除收藏夹失败' });
    }
  });

  return router;
};
