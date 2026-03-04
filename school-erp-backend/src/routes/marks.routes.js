const router = require('express').Router();
const marksController = require('../controllers/marks.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.post('/upsert', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'), marksController.upsertMarks);
router.get('/student/:studentId', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'), marksController.getMarks);

module.exports = router;
