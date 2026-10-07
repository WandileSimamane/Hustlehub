// src/middleware/rbacMiddleware.js
// Must run AFTER verifyToken, because it reads req.user.role from the verified JWT.
exports.authorizeRoles = (...allowedRoles) => (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: your role is not allowed to perform this action.'
        });
    }
    next();
};
