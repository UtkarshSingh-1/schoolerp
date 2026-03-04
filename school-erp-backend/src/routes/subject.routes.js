const router = require('express').Router();
const subjectController = require('../controllers/subject.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'), subjectController.getAllSubjects);
router.post('/', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), subjectController.createSubject);
router.delete('/:id', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), subjectController.deleteSubject);

module.exports = router;
