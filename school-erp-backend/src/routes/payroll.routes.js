const router = require('express').Router();

const payrollController = require('../controllers/payroll.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/history/:staffId', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'STAFF'), payrollController.getPayrollHistory);
router.post('/generate', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT'), payrollController.generateMonthlyPayroll);

module.exports = router;
