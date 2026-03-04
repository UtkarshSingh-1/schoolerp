const router = require('express').Router();
const examController = require('../controllers/exam.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(auth);
router.get('/', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'), examController.getAllExams);
router.post('/', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), examController.createExam);
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'), examController.getExamDetails);
router.post('/:id/evaluate', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'), examController.evaluateExams);
router.get('/:id/results', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'), examController.getExamResults);

module.exports = router;
