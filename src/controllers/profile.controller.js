import pool from '#db/pool.js';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, u.email, u.role
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE u.id = ?`,
      [req.user.sub]
    );
    if (!rows.length) return res.status(404).json({ error: 'Profile not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  const { first_name, last_name, phone, avatar_url, bio } = req.body;
  try {
    await pool.execute(
      `UPDATE profiles
       SET first_name = ?, last_name = ?, phone = ?, avatar_url = COALESCE(?, avatar_url), bio = COALESCE(?, bio), updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [first_name, last_name, phone, avatar_url, bio, req.user.sub]
    );
    res.json({ message: 'Profile updated' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteOldAvatarFiles = (oldUrl) => {
  if (!oldUrl) return;
  try {
    const fileName = path.basename(oldUrl); // ดึงชื่อไฟล์จาก URL
    const baseDir = path.resolve('uploads/avatars');
    const dirs = ['original', 'thumb_100', 'thumb_300'];

    dirs.forEach(dir => {
      const filePath = path.join(baseDir, dir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (err) {
    console.error('Error deleting old avatar:', err);
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const baseDir = path.resolve('uploads/avatars');
    const dirs = ['original', 'thumb_100', 'thumb_300'];
    dirs.forEach(dir => {
      const fullPath = path.join(baseDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });

    // 1. ดึง avatar เก่า
    const [rows] = await pool.execute(
      'SELECT avatar_url FROM profiles WHERE user_id = ?',
      [req.user.sub]
    );
    if (rows.length && rows[0].avatar_url) {
      deleteOldAvatarFiles(rows[0].avatar_url);
    }

    const fileBaseName = `avatar-${req.user.sub}-${Date.now()}.webp`;

    // 2. เก็บ original
    await sharp(req.file.path)
      .toFormat('webp')
      .toFile(path.join(baseDir, 'original', fileBaseName));

    // 3. thumb 100x100
    await sharp(req.file.path)
      .resize(100, 100, { fit: 'cover' })
      .toFormat('webp')
      .toFile(path.join(baseDir, 'thumb_100', fileBaseName));

    // 4. thumb 300x300
    await sharp(req.file.path)
      .resize(300, 300, { fit: 'cover' })
      .toFormat('webp')
      .toFile(path.join(baseDir, 'thumb_300', fileBaseName));

    // ลบไฟล์ temp
    fs.unlinkSync(req.file.path);

    const avatarUrl = `/uploads/avatars/thumb_300/${fileBaseName}`;

    // 5. อัปเดต DB
    await pool.execute(
      `INSERT INTO profiles (user_id, avatar_url)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE avatar_url = VALUES(avatar_url), updated_at = CURRENT_TIMESTAMP`,
      [req.user.sub, avatarUrl]
    );

    res.json({
      message: 'Avatar uploaded, resized, and old files deleted',
      sizes: {
        original: `/uploads/avatars/original/${fileBaseName}`,
        thumb_100: `/uploads/avatars/thumb_100/${fileBaseName}`,
        thumb_300: `/uploads/avatars/thumb_300/${fileBaseName}`
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const uploadAvatarAndBio = async (req, res) => {
  try {
    const { first_name, last_name, phone, bio } = req.body;
    let avatarUrl = null;

    // ถ้ามีไฟล์ avatar
    if (req.file) {
      const baseDir = path.resolve('uploads/avatars');
      const dirs = ['original', 'thumb_100', 'thumb_300'];
      dirs.forEach(dir => {
        const fullPath = path.join(baseDir, dir);
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
      });

      // ลบไฟล์เก่า
      const [rows] = await pool.execute(
        'SELECT avatar_url FROM profiles WHERE user_id = ?',
        [req.user.sub]
      );
      if (rows.length && rows[0].avatar_url) {
        deleteOldAvatarFiles(rows[0].avatar_url);
      }

      const fileBaseName = `avatar-${req.user.sub}-${Date.now()}.webp`;

      // original
      await sharp(req.file.path)
        .toFormat('webp')
        .toFile(path.join(baseDir, 'original', fileBaseName));

      // thumb 100
      await sharp(req.file.path)
        .resize(100, 100, { fit: 'cover' })
        .toFormat('webp')
        .toFile(path.join(baseDir, 'thumb_100', fileBaseName));

      // thumb 300
      await sharp(req.file.path)
        .resize(300, 300, { fit: 'cover' })
        .toFormat('webp')
        .toFile(path.join(baseDir, 'thumb_300', fileBaseName));

      // ลบ temp
      fs.unlinkSync(req.file.path);

      avatarUrl = `/uploads/avatars/thumb_300/${fileBaseName}`;
    }

    // อัปเดต DB (avatarUrl จะอัปเดตเฉพาะถ้ามีไฟล์ใหม่)
    await pool.execute(
      `UPDATE profiles
       SET first_name = COALESCE(?, first_name),
           last_name = COALESCE(?, last_name),
           phone = COALESCE(?, phone),
           bio = COALESCE(?, bio),
           avatar_url = COALESCE(?, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [first_name, last_name, phone, bio, avatarUrl, req.user.sub]
    );

    res.json({
      message: 'Profile updated',
      updated: {
        first_name,
        last_name,
        phone,
        bio,
        avatar_url: avatarUrl
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

