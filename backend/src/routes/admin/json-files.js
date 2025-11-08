const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');
const {
  validateJsonFile,
  validateUUID,
  validatePagination,
  handleValidationErrors
} = require('../../middleware/validation');
const JsonFileController = require('../../controllers/JsonFileController');

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

// GET /api/admin/json-files - Get all JSON files with filtering and pagination
router.get('/',
  validatePagination,
  handleValidationErrors,
  JsonFileController.getAll
);

// GET /api/admin/json-files/stats - Get JSON file statistics
router.get('/stats', JsonFileController.getStats);

// GET /api/admin/json-files/:id - Get single JSON file
router.get('/:id',
  validateUUID,
  handleValidationErrors,
  JsonFileController.getById
);

// POST /api/admin/json-files - Upload new JSON file
router.post('/',
  validateJsonFile,
  handleValidationErrors,
  auditMiddleware('create', 'json_file', (req) => req.body.id),
  JsonFileController.create
);

// PUT /api/admin/json-files/:id - Update JSON file
router.put('/:id',
  validateUUID,
  validateJsonFile,
  handleValidationErrors,
  auditMiddleware('update', 'json_file', (req) => req.params.id),
  JsonFileController.update
);

// DELETE /api/admin/json-files/:id - Delete JSON file
router.delete('/:id',
  validateUUID,
  handleValidationErrors,
  auditMiddleware('delete', 'json_file', (req) => req.params.id),
  JsonFileController.delete
);

// GET /api/admin/json-files/:id/download - Download JSON file
router.get('/:id/download',
  validateUUID,
  handleValidationErrors,
  JsonFileController.download
);

module.exports = router;
