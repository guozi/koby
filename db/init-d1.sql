-- Koby D1 Schema (SQLite)
PRAGMA foreign_keys = ON;

-- 收藏夹表
CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT '#3B82F6',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 书签表
CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  favicon TEXT DEFAULT NULL,
  collection_id INTEGER NOT NULL,
  tags TEXT DEFAULT NULL,
  is_pinned INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

-- 默认收藏夹
INSERT OR IGNORE INTO collections (id, name, icon, color) VALUES
(1, '默认收藏夹', '📁', '#3B82F6'),
(2, '工作', '💼', '#10B981'),
(3, '学习', '📚', '#F59E0B');
