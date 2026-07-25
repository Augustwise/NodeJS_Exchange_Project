
import express           from 'express';
import * as authController    from '../controllers/authController.js';
import loginRateLimit    from '../middleware/loginRateLimit.js';
import registerRateLimit from '../middleware/registerRateLimit.js';

const router = express.Router();

router.post('/register', registerRateLimit, authController.register);
router.post('/login',    loginRateLimit,    authController.login);
router.post('/logout',   authController.logout);

export default router;
