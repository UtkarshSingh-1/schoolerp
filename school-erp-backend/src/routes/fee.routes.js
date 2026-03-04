const router = require('express').Router();

const feeController = require('../controllers/fee.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/structure/:class', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'STUDENT', 'PARENT'), feeController.getFeeStructure);
router.get('/ledger/:studentId', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'STUDENT', 'PARENT'), feeController.getFeeLedger);
router.post('/pay', auth, authorizeRoles('SCHOOL_ADMIN', 'ACCOUNTANT', 'STUDENT', 'PARENT'), feeController.payFee);

module.exports = router;
