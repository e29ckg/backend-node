import pool from '#db/pool.js';

export const me = async (req, res) => {
  try {
    const userId = req.user.sub;
    const [rows] = await pool.execute(
      'SELECT id, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    return res.json(rows[0]);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
};

export const listUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, role, created_at FROM users ORDER BY id DESC'
    );
    return res.json(rows);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
};