const jwt = require('jsonwebtoken');

// =============================================================================
// AUTHENTICATION MIDDLEWARE
// =============================================================================

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access token required',
            message: 'Authorization header with Bearer token is required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token expired',
                    message: 'Your session has expired. Please login again.'
                });
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({
                    success: false,
                    error: 'Invalid token',
                    message: 'The provided token is invalid'
                });
            }
            return res.status(403).json({
                success: false,
                error: 'Token verification failed',
                message: 'Failed to authenticate token'
            });
        }

        req.user = user;
        next();
    });
};

module.exports = { authenticateToken, auth: authenticateToken };
