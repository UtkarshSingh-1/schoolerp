const router = require('express').Router();

const studentController = require('../controllers/student.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(auth);

router.get('/', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'STAFF'), studentController.getAllStudents);
router.post('/', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'STUDENT', 'PARENT'), studentController.createStudent);
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'STAFF'), studentController.updateStudent);
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF', 'ACCOUNTANT'), studentController.getStudentProfile);

module.exports = router;
