const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Authentication middleware to protect routes
 * Verifies the JWT token from the Authorization header and attaches the user to the request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object 
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header and remove 'Bearer ' prefix
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Return 401 if no token provided
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify the JWT token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID from decoded token
    const user = await User.findById(decoded.userId);

    // Return 401 if user not found in database
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user object to request for use in subsequent middleware/routes
    req.user = user;
    next();
  } catch (error) {
    // Return 401 if token is invalid or expired
    res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Middleware to check if the authenticated user has admin role
 * Should be used after the authenticate middleware to ensure req.user exists
 * Returns 403 Forbidden if user is not an admin
 * 
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
exports.isAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};