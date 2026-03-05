const router = require('express').Router();

const feeController = require('../controllers/fee.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/settings', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'STUDENT', 'PARENT'), feeController.getFeeSettings);
router.post('/settings', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'), feeController.upsertFeeSetting);
router.get('/student/:studentId', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'STUDENT', 'PARENT'), feeController.getStudentFees);
router.get('/my', auth, authorizeRoles('STUDENT', 'PARENT'), feeController.getMyFees);
router.get('/transactions', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'), feeController.listTransactions);
router.post('/pay', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'STUDENT', 'PARENT'), feeController.payFee);
router.get('/invoice/:transactionId', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'STUDENT', 'PARENT'), feeController.getInvoice);

// Backward compatibility endpoints
router.get('/structure/:class', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'STUDENT', 'PARENT'), feeController.getFeeStructure);
router.get('/ledger/:studentId', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'STUDENT', 'PARENT'), feeController.getFeeLedger);

module.exports = router;
