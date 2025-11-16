const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const config = require('../config');

/**
 * Admin login
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Find admin by username (could be email or username field)
    // Check both email and a potential username field
    const result = await pool.query(
      `SELECT id, name, email, password, role 
       FROM admin 
       WHERE email = $1 OR LOWER(name) = LOWER($1) 
       LIMIT 1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const admin = result.rows[0];

    // Check password
    // Support both hashed and plain text passwords (for migration)
    let passwordValid = false;
    
    if (!admin.password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
      // Bcrypt hash
      passwordValid = await bcrypt.compare(password, admin.password);
    } else {
      // Plain text (for existing data - should be migrated)
      passwordValid = password === admin.password;
    }

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role || 'admin'
      },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiresIn
      }
    );

    // Return token and user info (without password)
    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role || 'admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Get current authenticated admin
 * GET /api/auth/me
 */
async function getMe(req, res) {
  try {
    // User is already attached by verifyToken middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        error: 'Not authenticated'
      });
    }

    res.json({
      success: true,
      authenticated: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role || 'admin'
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      authenticated: false,
      error: 'Internal server error'
    });
  }
}

module.exports = {
  login,
  getMe
};

