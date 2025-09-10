import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '#config/index.js';
import pool from '#db/pool.js';

export const signAccess = (payload) =>
  jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiresIn });

export const signRefresh = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });

export const verifyRefresh = (token) =>
  jwt.verify(token, config.jwt.refreshSecret);

export const storeRefresh = async (userId, refreshToken) => {
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  await pool.execute(
    'INSERT INTO refresh_tokens (user_id, token_hash) VALUES (?, ?)',
    [userId, tokenHash]
  );
};

export const isRefreshValid = async (userId, token) => {
  const [rows] = await pool.execute(
    'SELECT token_hash FROM refresh_tokens WHERE user_id = ? AND revoked = 0 ORDER BY id DESC LIMIT 20',
    [userId]
  );
  for (const r of rows) {
    if (await bcrypt.compare(token, r.token_hash)) return true;
  }
  return false;
};

export const rotateRefresh = async (userId, oldRefresh, newRefresh) => {
  const [rows] = await pool.execute(
    'SELECT id, token_hash FROM refresh_tokens WHERE user_id = ? AND revoked = 0 ORDER BY id DESC LIMIT 20',
    [userId]
  );
  for (const row of rows) {
    const ok = await bcrypt.compare(oldRefresh, row.token_hash);
    if (ok) {
      await pool.execute('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?', [row.id]);
      break;
    }
  }
  await storeRefresh(userId, newRefresh);
};

export const revokeAllRefresh = async (userId) => {
  await pool.execute('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?', [userId]);
};