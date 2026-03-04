const router = require('express').Router();
const admissionController = require('../controllers/admission.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(auth);

router.post('/apply', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'STUDENT', 'PARENT'), admissionController.apply);
router.get('/', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'), admissionController.list);
router.patch('/:id/review', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'), admissionController.review);

module.exports = router;
