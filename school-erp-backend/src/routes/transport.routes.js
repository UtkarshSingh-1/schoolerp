const router = require('express').Router();
const transportController = require('../controllers/transport.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(auth);

router.post('/allot', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'STAFF'), transportController.allotTransport);
router.get('/routes', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'STAFF', 'STUDENT', 'PARENT'), transportController.getRoutes);
router.get('/allotment/:studentId', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'STAFF', 'STUDENT', 'PARENT'), transportController.getTransportDetails);
router.get('/vehicles', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'STAFF'), transportController.getVehicles);
router.get('/student/:studentId', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'STAFF', 'PARENT', 'STUDENT'), transportController.getTransportDetails);

module.exports = router;
