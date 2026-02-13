const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { authMiddleware, signToken } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const MAX_NAME_LEN = 50;
const MAX_EMAIL_LEN = 254;
const MAX_PASSWORD_LEN = 128;
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 秒冷却

// 注册接口：每 IP 15 分钟最多 5 次
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: true, message: '注册请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 重发验证：每 IP 15 分钟最多 3 次
const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: true, message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 忘记密码：每 IP 15 分钟最多 5 次
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: true, message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = (pool) => {
  // 注册
  router.post('/register', registerLimiter, async (req, res) => {
    try {
      const { password, name } = req.body;
      let { email } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: true, message: '邮箱、密码和昵称为必填项' });
      }

      email = email.trim().toLowerCase();
      const trimmedName = name.trim();

      if (!isValidEmail(email) || email.length > MAX_EMAIL_LEN) {
        return res.status(400).json({ error: true, message: '邮箱格式不正确' });
      }
      if (trimmedName.length === 0 || trimmedName.length > MAX_NAME_LEN) {
        return res.status(400).json({ error: true, message: `昵称不能为空且不超过 ${MAX_NAME_LEN} 个字符` });
      }
      if (password.length < 6 || password.length > MAX_PASSWORD_LEN) {
        return res.status(400).json({ error: true, message: '密码长度 6-128 位' });
      }

      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ error: true, message: '该邮箱已注册' });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const verification_token = crypto.randomBytes(32).toString('hex');
      const verification_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await pool.query(
        'INSERT INTO users (email, password_hash, name, verification_token, verification_expires_at) VALUES (?, ?, ?, ?, ?)',
        [email, password_hash, trimmedName, verification_token, verification_expires_at]
      );

      sendVerificationEmail(email, escapeHtml(trimmedName), verification_token).catch(err => {
        console.error('发送验证邮件失败:', err);
      });

      res.status(201).json({ message: '注册成功，请查收验证邮件' });
    } catch (error) {
      console.error('注册失败:', error);
      res.status(500).json({ error: true, message: '注册失败' });
    }
  });

  // 登录
  router.post('/login', async (req, res) => {
    try {
      const { password } = req.body;
      let { email } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: true, message: '邮箱和密码为必填项' });
      }

      email = email.trim().toLowerCase();

      const [users] = await pool.query(
        'SELECT id, email, name, password_hash, is_verified FROM users WHERE email = ?',
        [email]
      );
      if (users.length === 0) {
        return res.status(401).json({ error: true, message: '邮箱或密码错误' });
      }

      const user = users[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: true, message: '邮箱或密码错误' });
      }

      if (!user.is_verified) {
        return res.status(403).json({ error: true, message: '请先验证邮箱', needVerification: true });
      }

      const token = signToken(user.id);
      res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (error) {
      console.error('登录失败:', error);
      res.status(500).json({ error: true, message: '登录失败' });
    }
  });

  // 验证邮箱（原子操作防竞态）
  router.post('/verify-email', async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: true, message: '缺少验证 token' });
      }

      // 先查用户
      const [users] = await pool.query(
        'SELECT id, email, name, is_verified FROM users WHERE verification_token = ? AND verification_expires_at > ?',
        [token, new Date().toISOString()]
      );

      if (users.length === 0) {
        return res.status(400).json({ error: true, message: '验证链接无效或已过期' });
      }

      const user = users[0];

      if (user.is_verified) {
        return res.status(400).json({ error: true, message: '邮箱已验证，请直接登录' });
      }

      // 原子更新：加 is_verified = 0 条件，只有第一个请求能成功
      const [updateResult] = await pool.query(
        'UPDATE users SET is_verified = 1, verification_token = NULL, verification_expires_at = NULL WHERE id = ? AND is_verified = 0',
        [user.id]
      );

      if (updateResult.affectedRows === 0) {
        return res.status(400).json({ error: true, message: '邮箱已验证，请直接登录' });
      }

      // 创建默认收藏夹
      await pool.query(
        "INSERT INTO collections (name, icon, color, user_id) VALUES ('默认收藏夹', '📁', '#3B82F6', ?)",
        [user.id]
      );

      const jwtToken = signToken(user.id);
      res.json({
        message: '邮箱验证成功',
        token: jwtToken,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (error) {
      console.error('验证邮箱失败:', error);
      res.status(500).json({ error: true, message: '验证邮箱失败' });
    }
  });

  // 获取当前用户信息
  router.get('/me', authMiddleware, async (req, res) => {
    try {
      const [users] = await pool.query('SELECT id, email, name, created_at FROM users WHERE id = ?', [req.userId]);
      if (users.length === 0) {
        return res.status(404).json({ error: true, message: '用户不存在' });
      }
      res.json(users[0]);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(500).json({ error: true, message: '获取用户信息失败' });
    }
  });

  // 重新发送验证邮件
  router.post('/resend-verification', resendLimiter, async (req, res) => {
    try {
      let { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: true, message: '邮箱为必填项' });
      }

      email = email.trim().toLowerCase();

      const [users] = await pool.query(
        'SELECT id, name, is_verified, verification_expires_at FROM users WHERE email = ?',
        [email]
      );
      if (users.length === 0) {
        return res.json({ message: '如果该邮箱已注册，验证邮件已发送' });
      }

      const user = users[0];
      if (user.is_verified) {
        return res.json({ message: '邮箱已验证，请直接登录' });
      }

      // 冷却时间检查：上次发送不足 60 秒则拒绝
      if (user.verification_expires_at) {
        const expiresAt = new Date(user.verification_expires_at).getTime();
        const sentAt = expiresAt - 24 * 60 * 60 * 1000;
        if (Date.now() - sentAt < RESEND_COOLDOWN_MS) {
          return res.status(429).json({ error: true, message: '请等待 60 秒后再重新发送' });
        }
      }

      const verification_token = crypto.randomBytes(32).toString('hex');
      const verification_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await pool.query(
        'UPDATE users SET verification_token = ?, verification_expires_at = ? WHERE id = ?',
        [verification_token, verification_expires_at, user.id]
      );

      sendVerificationEmail(email, escapeHtml(user.name), verification_token).catch(err => {
        console.error('发送验证邮件失败:', err);
      });

      res.json({ message: '验证邮件已发送，请查收' });
    } catch (error) {
      console.error('重发验证邮件失败:', error);
      res.status(500).json({ error: true, message: '发送失败' });
    }
  });

  // 忘记密码
  router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
    try {
      let { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: true, message: '邮箱为必填项' });
      }

      email = email.trim().toLowerCase();
      const genericMsg = '如果该邮箱已注册，重置邮件已发送';

      const [users] = await pool.query(
        'SELECT id, name, is_verified FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0 || !users[0].is_verified) {
        return res.json({ message: genericMsg });
      }

      const user = users[0];
      const reset_token = crypto.randomBytes(32).toString('hex');
      const reset_expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      await pool.query(
        'UPDATE users SET reset_token = ?, reset_expires_at = ? WHERE id = ?',
        [reset_token, reset_expires_at, user.id]
      );

      sendPasswordResetEmail(email, escapeHtml(user.name), reset_token).catch(err => {
        console.error('发送重置邮件失败:', err);
      });

      res.json({ message: genericMsg });
    } catch (error) {
      console.error('忘记密码失败:', error);
      res.status(500).json({ error: true, message: '请求失败' });
    }
  });

  // 重置密码
  router.post('/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: true, message: '缺少必要参数' });
      }

      if (newPassword.length < 6 || newPassword.length > MAX_PASSWORD_LEN) {
        return res.status(400).json({ error: true, message: '密码长度 6-128 位' });
      }

      const [users] = await pool.query(
        'SELECT id FROM users WHERE reset_token = ? AND reset_expires_at > ?',
        [token, new Date().toISOString()]
      );

      if (users.length === 0) {
        return res.status(400).json({ error: true, message: '重置链接无效或已过期' });
      }

      const password_hash = await bcrypt.hash(newPassword, 10);

      await pool.query(
        'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires_at = NULL WHERE id = ?',
        [password_hash, users[0].id]
      );

      res.json({ message: '密码重置成功，请使用新密码登录' });
    } catch (error) {
      console.error('重置密码失败:', error);
      res.status(500).json({ error: true, message: '重置密码失败' });
    }
  });

  return router;
};
