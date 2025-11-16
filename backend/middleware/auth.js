const jwt = require('jsonwebtoken');
const config = require('../config');
const pool = require('../config/db');

/**
 * Middleware to verify JWT token and attach user to request
 * Expects Authorization header: "Bearer <token>"
 */
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Authorization header must be: Bearer <token>'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Fetch admin user from database
    const result = await pool.query(
      'SELECT id, name, email, role FROM admin WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token - user not found'
      });
    }

    // Attach user to request object
    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
}

/**
 * Optional middleware - verifies token but doesn't fail if missing
 * Useful for endpoints that work with or without auth
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const result = await pool.query(
          'SELECT id, name, email, role FROM admin WHERE id = $1',
          [decoded.id]
        );
        if (result.rows.length > 0) {
          req.user = result.rows[0];
        }
      } catch (error) {
        // Silently fail for optional auth
      }
    }
    next();
  } catch (error) {
    next();
  }
}

module.exports = {
  verifyToken,
  optionalAuth
};

