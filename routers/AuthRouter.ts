import express from 'express';
import { AuthController } from '../controllers';

// @TODO add reset password controller & route.

const router = express.Router();

router.get('/auth', AuthController.auth);
router.post('/auth/register', AuthController.register);
router.get('/auth/logout', AuthController.logout);
router.post('/auth/login', AuthController.login);

export default router;
