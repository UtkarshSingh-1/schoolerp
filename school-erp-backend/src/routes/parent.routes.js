const router = require('express').Router();
const parentController = require('../controllers/parent.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/children', authorizeRoles('PARENT', 'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), parentController.getChildren);
router.get('/payments', authorizeRoles('PARENT', 'SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'), parentController.getPaymentHistory);

module.exports = router;
