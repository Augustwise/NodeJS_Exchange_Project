
import express          from 'express';
import * as pageController   from '../controllers/pageController.js';
import * as authController   from '../controllers/authController.js';
import * as cryptoController from '../controllers/cryptoController.js';
import * as adminController  from '../controllers/adminController.js';
import requireAdmin     from '../middleware/requireAdmin.js';
import { verifyCsrf }   from '../middleware/csrf.js';

const router = express.Router();

router.get('/',        pageController.home);
router.get('/login',   pageController.loginPage);
router.get('/register',pageController.registerPage);
router.get('/account', pageController.accountPage);

router.get('/crypt', cryptoController.showCryptPage);
router.get('/create', pageController.addCrypto);      
router.post('/create', verifyCsrf, cryptoController.createCrypto)
router.get('/crypto/:id/edit', cryptoController.showEditPage);
router.post('/crypto/:id/edit', verifyCsrf, cryptoController.updateCrypto); 
router.post('/crypto/:id/delete', verifyCsrf, cryptoController.deleteCrypto);

router.get('/about',   pageController.aboutPage);
router.get('/contact', pageController.contactPage);

router.get('/admin', requireAdmin, adminController.adminHome);
router.get('/admin/users', requireAdmin, adminController.usersPage);
router.get('/admin/cryptos', requireAdmin, adminController.cryptosPage);
router.post('/admin/users/:userId/grant-admin', requireAdmin, verifyCsrf, adminController.grantAdmin);
router.post('/admin/users/:userId/revoke-admin', requireAdmin, verifyCsrf, adminController.revokeAdmin);
router.post('/admin/cryptos/:cryptoId/approve', requireAdmin, verifyCsrf, adminController.approveCrypto);
router.post('/admin/cryptos/:cryptoId/reject', requireAdmin, verifyCsrf, adminController.rejectCrypto);

router.post('/logout', verifyCsrf, authController.logoutRedirect);

export default router;
