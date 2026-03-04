const router = require('express').Router();
const staffController = require('../controllers/staff.controller');
const { auth, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(auth);

router.get('/', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'), staffController.getAllStaff);
router.post('/', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), staffController.createStaff);

module.exports = router;
