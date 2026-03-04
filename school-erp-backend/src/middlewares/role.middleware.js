module.exports = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Role IDs: 1 (Admin), 2 (Teacher), 3 (Accountant), etc.
        const hasRole = Array.isArray(requiredRoles)
            ? requiredRoles.includes(req.user.role)
            : req.user.role === requiredRoles;

        if (!hasRole) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};
