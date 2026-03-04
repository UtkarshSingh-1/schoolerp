const router = require('express').Router();
const questionController = require('../controllers/question.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(auth);

router.get('/', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'), questionController.getAllQuestions);
router.post('/', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'), questionController.createQuestion);
router.delete('/:id', auth, authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'), questionController.deleteQuestion);

module.exports = router;
