const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/metrics', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'TEACHER'), dashboardController.getAdminMetrics);

module.exports = router;
