//Middleware factory that allows only users whose role is in the allowed list
exports.authorizeRoles = (...allowedRoles) => (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: your role is not allowed to perform this action.'
        });
    }
    next();
};
