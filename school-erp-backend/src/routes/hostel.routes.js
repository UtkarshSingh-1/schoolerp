const router = require('express').Router();
const hostelController = require('../controllers/hostel.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(auth);

router.get('/rooms', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'STAFF', 'STUDENT', 'PARENT'), hostelController.getHostelList);
router.get('/allotment/:studentId', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'STAFF', 'STUDENT', 'PARENT'), hostelController.getHostelDetails);
router.post('/allot', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'STAFF'), hostelController.allotRoom);
router.get('/student/:studentId', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'STAFF', 'PARENT', 'STUDENT'), hostelController.getHostelDetails);

module.exports = router;
