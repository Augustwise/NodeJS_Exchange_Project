// routes/pageRoutes.js — URL definitions for all HTML pages.

const express          = require('express');
const router           = express.Router();
const pageController   = require('../controllers/pageController');
const authController   = require('../controllers/authController');

router.get('/',        pageController.home);
router.get('/login',   pageController.loginPage);
router.get('/register',pageController.registerPage);
router.get('/account', pageController.accountPage);
router.get('/crypt',   pageController.cryptPage);
router.get('/about',   pageController.aboutPage);
router.get('/contact', pageController.contactPage);

router.post('/logout', authController.logoutRedirect);

module.exports = router;
