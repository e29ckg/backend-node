import bcrypt from 'bcrypt';
import pool from '#db/pool.js';
import {
  signAccess,
  signRefresh,
  verifyRefresh,
  storeRefresh,
  rotateRefresh,
  isRefreshValid,
  revokeAllRefresh
} from '#services/token.service.js';

export const register = async (req, res) => {
  const { email, password, role } = req.body; // role optional
  try {
    const password_hash = await bcrypt.hash(password, 12);

    // 1. สร้าง user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, password_hash, role === 'admin' ? 'admin' : 'user']
    );

    const userId = result.insertId; // ดึง id ของ user ที่เพิ่งสร้าง

    // 2. สร้างโปรไฟล์ว่าง
    await pool.execute(
      'INSERT INTO profiles (user_id, avatar_url, bio) VALUES (?, NULL, NULL)',
      [userId]
    );

    return res.status(201).json({ message: 'Registered and profile created' });
  } catch (e) {
    const dup = e && e.code === 'ER_DUP_ENTRY';
    return res.status(dup ? 409 : 500).json({ error: dup ? 'Email already exists' : 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.execute(
      'SELECT id, password_hash, role FROM users WHERE email = ?',
      [email]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = signAccess({ sub: user.id, role: user.role });
    const refreshToken = signRefresh({ sub: user.id });

    await storeRefresh(user.id, refreshToken);
    return res.json({ accessToken, refreshToken });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const payload = verifyRefresh(refreshToken);
    const userId = payload.sub;

    const valid = await isRefreshValid(userId, refreshToken);
    if (!valid) return res.status(401).json({ error: 'Invalid refresh token' });

    // Load role for new access token
    const [rows] = await pool.execute('SELECT role FROM users WHERE id = ?', [userId]);
    if (!rows.length) return res.status(401).json({ error: 'User not found' });
    const role = rows[0].role;

    const newAccess = signAccess({ sub: userId, role });
    const newRefresh = signRefresh({ sub: userId });

    await rotateRefresh(userId, refreshToken, newRefresh);
    return res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const { sub } = verifyRefresh(refreshToken);
    await revokeAllRefresh(sub); // หรือปรับเป็น revoke เฉพาะตัวที่ส่งมาก็ได้
    return res.json({ message: 'Logged out' });
  } catch {
    return res.status(400).json({ error: 'Invalid refresh token' });
  }
};