// middleware/validationMiddleware.js
const validateAuth = (req, res, next) => {
    const { email, password } = req.body;

    // Check for missing or empty fields
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Validation error: Email and password are required."
        });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Validation error: Invalid email format."
        });
    }

    // Password length check
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Validation error: Password must be at least 6 characters long."
        });
    }

    next();
};

module.exports = { validateAuth };