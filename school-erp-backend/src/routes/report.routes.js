const router = require('express').Router();
const reportController = require('../controllers/report.controller');

const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/report-card/:studentId', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'), reportController.getReportCard);

module.exports = router;
