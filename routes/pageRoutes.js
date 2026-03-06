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
router.get('/crypto/:id/edit', cryptoController.showEditPage);
router.post('/crypto/:id/edit', cryptoController.updateCrypto); 
router.post('/crypto/:id/delete', cryptoController.deleteCrypto);

router.get('/about',   pageController.aboutPage);
router.get('/contact', pageController.contactPage);

router.get('/admin', requireAdmin, adminController.adminHome);
router.get('/admin/users', requireAdmin, adminController.usersPage);
router.get('/admin/cryptos', requireAdmin, adminController.cryptosPage);
router.post('/admin/users/:userId/grant-admin', requireAdmin, adminController.grantAdmin);
router.post('/admin/users/:userId/revoke-admin', requireAdmin, adminController.revokeAdmin);
router.post('/admin/cryptos/:cryptoId/approve', requireAdmin, adminController.approveCrypto);
router.post('/admin/cryptos/:cryptoId/reject', requireAdmin, adminController.rejectCrypto);

router.post('/logout', authController.logoutRedirect);

module.exports = router;

