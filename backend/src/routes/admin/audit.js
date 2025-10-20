const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { validatePagination, handleValidationErrors } = require('../../middleware/validation');
const { AuditLogger } = require('../../middleware/audit');

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

// GET /api/admin/audit - Get audit logs
router.get('/', 
  validatePagination,
  handleValidationErrors,
  AuditLogger.getLogs
);

module.exports = router;
