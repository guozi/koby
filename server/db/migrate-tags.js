/**
 * Migration script: move JSON tags from bookmarks.tags to tags + bookmark_tags tables.
 * Idempotent — safe to run multiple times.
 *
 * Usage: node server/db/migrate-tags.js
 */
const { pool, rawQuery } = require('./database');
const { generateId } = require('../utils/id');

async function migrate() {
  console.log('Creating tags and bookmark_tags tables if not exist...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6B7280',
      user_id TEXT NOT NULL REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(name, user_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookmark_tags (
      bookmark_id TEXT NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (bookmark_id, tag_id)
    )
  `);

  console.log('Tables ready. Scanning bookmarks with JSON tags...');

  // Use rawQuery to bypass postProcessRows which strips the legacy tags field
  const [bookmarks] = await rawQuery(
    'SELECT id, user_id, tags FROM bookmarks WHERE tags IS NOT NULL AND tags != ?',
    ['null']
  );

  console.log(`Found ${bookmarks.length} bookmarks with tags field.`);

  let tagCount = 0;
  let linkCount = 0;

  for (const bm of bookmarks) {
    let tags = bm.tags;
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch { continue; }
    }
    if (!Array.isArray(tags)) continue;

    for (const tagName of tags) {
      const name = tagName.trim();
      if (!name) continue;

      // Find or create the tag
      const [existing] = await pool.query(
        'SELECT id FROM tags WHERE name = ? AND user_id = ?',
        [name, bm.user_id]
      );

      let tagId;
      if (existing.length > 0) {
        tagId = existing[0].id;
      } else {
        tagId = generateId();
        try {
          await pool.query(
            'INSERT INTO tags (id, name, user_id) VALUES (?, ?, ?)',
            [tagId, name, bm.user_id]
          );
          tagCount++;
        } catch {
          // Unique constraint race — re-fetch
          const [retry] = await pool.query(
            'SELECT id FROM tags WHERE name = ? AND user_id = ?',
            [name, bm.user_id]
          );
          tagId = retry[0]?.id;
          if (!tagId) continue;
        }
      }

      // Link bookmark ↔ tag (INSERT OR IGNORE for idempotency)
      try {
        await pool.query(
          'INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)',
          [bm.id, tagId]
        );
        linkCount++;
      } catch { /* already exists */ }
    }
  }

  console.log(`Migration complete: ${tagCount} tags created, ${linkCount} links inserted.`);
}

migrate()
  .then(() => process.exit(0))
  .catch(err => { console.error('Migration failed:', err); process.exit(1); });
