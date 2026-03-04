const router = require('express').Router();
const requestController = require('../controllers/request.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(auth);

router.get('/', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'STAFF'), requestController.getAllRequests);
router.post('/', authorizeRoles('STUDENT'), requestController.createRequest);
router.patch('/:id/status', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'STAFF'), requestController.updateRequestStatus);
router.get('/student/:studentId', authorizeRoles('STUDENT'), requestController.getStudentRequests);

module.exports = router;
