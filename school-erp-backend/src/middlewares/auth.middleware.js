const jwt = require('jsonwebtoken');

const ROLE_MAP = {
    1: 'SUPER_ADMIN',
    2: 'SCHOOL_ADMIN',
    3: 'PRINCIPAL',
    4: 'TEACHER',
    5: 'STUDENT',
    6: 'PARENT',
    7: 'ACCOUNTANT',
    8: 'STAFF'
};

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
        req.user = {
            ...decoded,
            roleName: typeof decoded.role === 'string' ? decoded.role : ROLE_MAP[decoded.role]
        };
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.roleName)) {
            return res.status(403).json({
                message: `Access Denied: Required role [${allowedRoles.join(', ')}]`
            });
        }
        next();
    };
};

module.exports = { auth, authorizeRoles };
