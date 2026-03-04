const router = require('express').Router();
const attendanceController = require('../controllers/attendance.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(auth);

router.get('/report', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'), attendanceController.getAttendanceReport);
router.post('/mark', auth, authorizeRoles('TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL'), attendanceController.markAttendance);
router.post('/sync', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), attendanceController.syncBiometricLogs);

module.exports = router;
