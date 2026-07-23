
const express           = require('express');
const router            = express.Router();
const authController    = require('../controllers/authController');
const loginRateLimit    = require('../middleware/loginRateLimit');
const registerRateLimit = require('../middleware/registerRateLimit');

router.post('/register', registerRateLimit, authController.register);
router.post('/login',    loginRateLimit,    authController.login);
router.post('/logout',   authController.logout);

module.exports = router;
