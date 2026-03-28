import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header (Bearer token)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Extract token from "Bearer <token>"
        token = req.headers.authorization.split(' ')[1];
    }
    // Optionally check for token in cookies
    // else if (req.cookies.token) {
    //   token = req.cookies.token;
    // }

    // Make sure token exists
    if (!token) {
        res.status(401);
        throw new Error('Not authorized to access this route');
    }

    try {
        // Verify token - decodes the JWT and returns the payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database and attach to request object
        // We exclude the password field for security
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            res.status(401);
            throw new Error('User no longer exists');
        }

        next();
    } catch (err) {
        res.status(401);
        next(new Error(`Failed to authenticate token: ${err.message}`));
    }
};

/**
 * Authorize routes - Role-based access control middleware
 * 
 * This middleware checks if the authenticated user has one of the required roles.
 * It should be used AFTER the protect middleware.
 * 
 * @param {...string} roles - Roles that are allowed to access the route
 * @returns {Function} Middleware function
 * 
 * @example
 * // Only admins can access
 * router.delete('/:id', protect, authorize('admin'), deleteBootcamp);
 * 
 * // Publishers or admins can access
 * router.post('/', protect, authorize('publisher', 'admin'), createBootcamp);
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        // Check if user's role is in the allowed roles array
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'User role not authorized to access this route' });
        }
        return next();
    };
};
