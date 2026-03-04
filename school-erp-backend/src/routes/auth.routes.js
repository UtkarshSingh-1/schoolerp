const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { auth } = require('../middlewares/auth.middleware');

router.post('/login', authController.login);
router.post('/change-password', auth, authController.changePassword);
router.post('/complete-onboarding', auth, authController.completeOnboarding);

module.exports = router;
