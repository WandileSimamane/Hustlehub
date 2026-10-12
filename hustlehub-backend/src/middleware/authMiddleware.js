const jwt = require('jsonwebtoken');

//Verifies the Bearer JWT and attaches the user to the request
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    //Reject requests with a missing or malformed Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    //Verify the token and reject if it is invalid or expired
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the payload (id, role) to the request object
        next(); // Pass control to the next middleware or route handler
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};