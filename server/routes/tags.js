const express = require('express');
const router = express.Router();
const { generateId } = require('../utils/id');

const MAX_TAGS_PER_USER = 50;
const MAX_TAGS_PER_BOOKMARK = 10;

module.exports = (pool) => {
  // GET /api/tags — all tags for current user with bookmark count
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT t.id, t.name, t.color, t.created_at,
                COUNT(bt.bookmark_id) AS bookmark_count
         FROM tags t
         LEFT JOIN bookmark_tags bt ON bt.tag_id = t.id
         WHERE t.user_id = ?
         GROUP BY t.id
         ORDER BY bookmark_count DESC, t.name ASC`,
        [req.userId]
      );
      res.json(rows);
    } catch (error) {
      console.error('获取标签失败:', error);
      res.status(500).json({ error: true, code: 'TAG_LIST_FAILED', message: '获取标签失败' });
    }
  });

  // POST /api/tags — create tag
  router.post('/', async (req, res) => {
    try {
      const { name, color } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: true, code: 'TAG_NAME_REQUIRED', message: '标签名称不能为空' });
      }

      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM tags WHERE user_id = ?',
        [req.userId]
      );
      if (countResult[0].total >= MAX_TAGS_PER_USER) {
        return res.status(403).json({ error: true, code: 'TAG_LIMIT_REACHED', message: `标签数量已达上限（${MAX_TAGS_PER_USER}）` });
      }

      const [existing] = await pool.query(
        'SELECT id FROM tags WHERE name = ? AND user_id = ?',
        [name.trim(), req.userId]
      );
      if (existing.length > 0) {
        return res.status(409).json({ error: true, code: 'TAG_ALREADY_EXISTS', message: '标签已存在' });
      }

      const tagId = generateId();
      await pool.query(
        'INSERT INTO tags (id, name, color, user_id) VALUES (?, ?, ?, ?)',
        [tagId, name.trim(), color || '#6B7280', req.userId]
      );

      const [newTag] = await pool.query(
        `SELECT t.id, t.name, t.color, t.created_at, 0 AS bookmark_count
         FROM tags t WHERE t.id = ?`,
        [tagId]
      );
      res.status(201).json(newTag[0]);
    } catch (error) {
      console.error('创建标签失败:', error);
      res.status(500).json({ error: true, code: 'TAG_CREATE_FAILED', message: '创建标签失败' });
    }
  });

  // PUT /api/tags/:id — rename / change color
  router.put('/:id', async (req, res) => {
    try {
      const { name, color } = req.body;
      const tagId = req.params.id;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: true, code: 'TAG_NAME_REQUIRED', message: '标签名称不能为空' });
      }

      // Check name uniqueness (exclude self)
      const [dup] = await pool.query(
        'SELECT id FROM tags WHERE name = ? AND user_id = ? AND id != ?',
        [name.trim(), req.userId, tagId]
      );
      if (dup.length > 0) {
        return res.status(409).json({ error: true, code: 'TAG_ALREADY_EXISTS', message: '标签名已存在' });
      }

      const [result] = await pool.query(
        'UPDATE tags SET name = ?, color = ? WHERE id = ? AND user_id = ?',
        [name.trim(), color || '#6B7280', tagId, req.userId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: true, code: 'TAG_NOT_FOUND', message: '标签不存在' });
      }

      const [updated] = await pool.query(
        `SELECT t.id, t.name, t.color, t.created_at,
                COUNT(bt.bookmark_id) AS bookmark_count
         FROM tags t
         LEFT JOIN bookmark_tags bt ON bt.tag_id = t.id
         WHERE t.id = ?
         GROUP BY t.id`,
        [tagId]
      );
      res.json(updated[0]);
    } catch (error) {
      console.error('更新标签失败:', error);
      res.status(500).json({ error: true, code: 'TAG_UPDATE_FAILED', message: '更新标签失败' });
    }
  });

  // DELETE /api/tags/:id
  router.delete('/:id', async (req, res) => {
    try {
      const tagId = req.params.id;
      const [result] = await pool.query(
        'DELETE FROM tags WHERE id = ? AND user_id = ?',
        [tagId, req.userId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: true, code: 'TAG_NOT_FOUND', message: '标签不存在' });
      }
      // bookmark_tags rows cascade-deleted
      res.json({ success: true });
    } catch (error) {
      console.error('删除标签失败:', error);
      res.status(500).json({ error: true, code: 'TAG_DELETE_FAILED', message: '删除标签失败' });
    }
  });

  // POST /api/tags/merge — merge sourceId into targetId
  router.post('/merge', async (req, res) => {
    try {
      const { sourceId, targetId } = req.body;
      if (!sourceId || !targetId || sourceId === targetId) {
        return res.status(400).json({ error: true, code: 'TAG_MERGE_INVALID', message: '参数无效' });
      }

      // Verify ownership
      const [tags] = await pool.query(
        'SELECT id FROM tags WHERE id IN (?, ?) AND user_id = ?',
        [sourceId, targetId, req.userId]
      );
      if (tags.length < 2) {
        return res.status(404).json({ error: true, code: 'TAG_NOT_FOUND', message: '标签不存在' });
      }

      // Move links from source to target (ignore duplicates)
      const [sourceLinks] = await pool.query(
        'SELECT bookmark_id FROM bookmark_tags WHERE tag_id = ?',
        [sourceId]
      );
      for (const link of sourceLinks) {
        try {
          await pool.query(
            'INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)',
            [link.bookmark_id, targetId]
          );
        } catch { /* duplicate, skip */ }
      }

      // Delete source tag (cascade deletes its bookmark_tags)
      await pool.query('DELETE FROM tags WHERE id = ?', [sourceId]);

      // Return updated target
      const [updated] = await pool.query(
        `SELECT t.id, t.name, t.color, t.created_at,
                COUNT(bt.bookmark_id) AS bookmark_count
         FROM tags t
         LEFT JOIN bookmark_tags bt ON bt.tag_id = t.id
         WHERE t.id = ?
         GROUP BY t.id`,
        [targetId]
      );
      res.json(updated[0]);
    } catch (error) {
      console.error('合并标签失败:', error);
      res.status(500).json({ error: true, code: 'TAG_MERGE_FAILED', message: '合并标签失败' });
    }
  });

  // GET /api/tags/:id/bookmarks — bookmarks under a tag
  router.get('/:id/bookmarks', async (req, res) => {
    try {
      const tagId = req.params.id;

      // Verify tag ownership
      const [tag] = await pool.query(
        'SELECT id FROM tags WHERE id = ? AND user_id = ?',
        [tagId, req.userId]
      );
      if (tag.length === 0) {
        return res.status(404).json({ error: true, code: 'TAG_NOT_FOUND', message: '标签不存在' });
      }

      const [rows] = await pool.query(
        `SELECT b.* FROM bookmarks b
         INNER JOIN bookmark_tags bt ON bt.bookmark_id = b.id
         WHERE bt.tag_id = ? AND b.user_id = ?
         ORDER BY b.is_pinned DESC, b.created_at DESC`,
        [tagId, req.userId]
      );

      // Batch-fetch tags for all bookmarks in one query
      if (rows.length > 0) {
        const ids = rows.map(bm => bm.id);
        const placeholders = ids.map(() => '?').join(',');
        const [allTags] = await pool.query(
          `SELECT bt.bookmark_id, t.id, t.name, t.color FROM tags t
           INNER JOIN bookmark_tags bt ON bt.tag_id = t.id
           WHERE bt.bookmark_id IN (${placeholders})`,
          ids
        );
        const tagMap = new Map();
        for (const row of allTags) {
          if (!tagMap.has(row.bookmark_id)) tagMap.set(row.bookmark_id, []);
          tagMap.get(row.bookmark_id).push({ id: row.id, name: row.name, color: row.color });
        }
        for (const bm of rows) {
          bm.tags = tagMap.get(bm.id) || [];
        }
      } else {
        rows.forEach(bm => bm.tags = []);
      }

      res.json(rows);
    } catch (error) {
      console.error('获取标签下书签失败:', error);
      res.status(500).json({ error: true, code: 'TAG_BOOKMARKS_FAILED', message: '获取标签下书签失败' });
    }
  });

  return router;
};
