// routes/pageRoutes.js — URL definitions for all HTML pages.

const express          = require('express');
const router           = express.Router();
const pageController   = require('../controllers/pageController');
const authController   = require('../controllers/authController');
const cryptoController = require('../controllers/cryptoController');
const adminController  = require('../controllers/adminController');
const requireAdmin     = require('../middleware/requireAdmin');

router.get('/',        pageController.home);
router.get('/login',   pageController.loginPage);
router.get('/register',pageController.registerPage);
router.get('/account', pageController.accountPage);

router.get('/crypt', cryptoController.showCryptPage);
router.get('/create', pageController.addCrypto);      
router.post('/create', cryptoController.createCrypto)

router.get('/about',   pageController.aboutPage);
router.get('/contact', pageController.contactPage);

router.get('/admin', requireAdmin, adminController.adminHome);
router.get('/admin/users', requireAdmin, adminController.usersPage);
router.post('/admin/users/:userId/grant-admin', requireAdmin, adminController.grantAdmin);
router.post('/admin/users/:userId/revoke-admin', requireAdmin, adminController.revokeAdmin);

router.post('/logout', authController.logoutRedirect);

module.exports = router;
