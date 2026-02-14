-- Koby D1 Schema (SQLite)
PRAGMA foreign_keys = ON;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  is_verified INTEGER NOT NULL DEFAULT 0,
  verification_token TEXT,
  verification_expires_at TEXT,
  reset_token TEXT,
  reset_expires_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 收藏夹表
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT '#3B82F6',
  parent_id TEXT DEFAULT NULL,
  sort_order INTEGER DEFAULT 0,
  user_id TEXT REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES collections(id) ON DELETE SET NULL
);

-- 书签表
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  favicon TEXT DEFAULT NULL,
  collection_id TEXT NOT NULL,
  tags TEXT DEFAULT NULL,
  is_pinned INTEGER DEFAULT 0,
  user_id TEXT REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);
