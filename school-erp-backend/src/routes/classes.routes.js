const router = require('express').Router();
const classController = require('../controllers/class.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'), classController.getAllClasses);
router.post('/', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), classController.createClass);
router.put('/:id', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), classController.updateClass);
router.delete('/:id', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), classController.deleteClass);

module.exports = router;
