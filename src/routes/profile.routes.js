import { Router } from 'express';
import { requireAuth } from '#middlewares/auth.js';
import { upload } from '#middlewares/upload.js';
import { getProfile, updateProfile, uploadAvatar,uploadAvatarAndBio } from '#controllers/profile.controller.js';

const router = Router();

router.get('/me', requireAuth, getProfile);
router.put('/me', requireAuth, updateProfile);
// router.post('/me/avatar', requireAuth, upload.single('avatar'), uploadAvatar);
// router.post('/me/avatar-bio', requireAuth, upload.single('avatar'), uploadAvatarAndBio);
router.post(
  '/me/avatar',
  requireAuth,
  (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Max 5 MB allowed.' });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  uploadAvatar
);
router.post(
  '/me/avatar-bio',
  requireAuth,
  (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Max 5 MB allowed.' });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  uploadAvatarAndBio
);

export default router;