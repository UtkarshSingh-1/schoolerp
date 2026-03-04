const router = require('express').Router();
const timetableController = require('../controllers/timetable.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT', 'STAFF'), timetableController.getTimetable);
router.get('/teacher/:teacherId', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'), timetableController.getTeacherSchedule);
router.post('/', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), timetableController.createSlot);

module.exports = router;
