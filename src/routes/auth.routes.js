import { Router } from 'express';
import { requireBody } from '#middlewares/validate.js';
import { register, login, refresh, logout } from '#controllers/auth.controller.js';

const router = Router();

router.post('/register', requireBody(['email', 'password']), register);
router.post('/login', requireBody(['email', 'password']), login);
router.post('/refresh', requireBody(['refreshToken']), refresh);
router.post('/logout', requireBody(['refreshToken']), logout);

export default router;