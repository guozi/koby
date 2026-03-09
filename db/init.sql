-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS koby CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE koby;

-- 创建收藏夹表
CREATE TABLE IF NOT EXISTS collections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) DEFAULT '📁',
  color VARCHAR(20) DEFAULT '#3B82F6',
  parent_id INT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES collections(id) ON DELETE SET NULL
);

-- 创建书签表
CREATE TABLE IF NOT EXISTS bookmarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  description TEXT,
  favicon VARCHAR(2048) DEFAULT NULL,
  collection_id INT NOT NULL,
  tags JSON DEFAULT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
  id VARCHAR(21) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#6B7280',
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_tag_name_user (name, user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 书签-标签关联表
CREATE TABLE IF NOT EXISTS bookmark_tags (
  bookmark_id INT NOT NULL,
  tag_id VARCHAR(21) NOT NULL,
  PRIMARY KEY (bookmark_id, tag_id),
  FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 插入默认收藏夹
INSERT INTO collections (name, icon, color) VALUES
('默认收藏夹', '📁', '#3B82F6'),
('工作', '💼', '#10B981'),
('学习', '📚', '#F59E0B')
ON DUPLICATE KEY UPDATE name=name;