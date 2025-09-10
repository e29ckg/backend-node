import { Router } from 'express';
import { requireAuth, requireRole } from '#middlewares/auth.js';
import { me, listUsers } from '#controllers/user.controller.js';

const router = Router();

router.get('/me', requireAuth, me);
router.get('/', requireAuth, requireRole('admin'), listUsers);

export default router;