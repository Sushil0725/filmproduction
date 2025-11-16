const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/AuthController');
const { validateLogin } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

/**
 * POST /api/auth/login
 * Admin login endpoint
 * Body: { username, password }
 * Returns: { success, token, user }
 */
router.post('/login', authLimiter, validateLogin, login);

/**
 * GET /api/auth/me
 * Get current authenticated admin
 * Headers: Authorization: Bearer <token>
 * Returns: { success, authenticated, user }
 */
router.get('/me', verifyToken, getMe);

module.exports = router;

