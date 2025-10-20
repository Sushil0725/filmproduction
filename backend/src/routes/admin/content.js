const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');
const { 
  validateContent, 
  validatePagination, 
  handleValidationErrors 
} = require('../../middleware/validation');
const ContentController = require('../../controllers/ContentController');

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

// GET /api/admin/content - Get all content with filtering
router.get('/', 
  validatePagination,
  handleValidationErrors,
  ContentController.getAll
);

// GET /api/admin/content/stats - Get content statistics
router.get('/stats', ContentController.getStats);

// GET /api/admin/content/:key - Get content by key
router.get('/:key', ContentController.getByKey);

// POST /api/admin/content - Create or update content (upsert)
router.post('/',
  validateContent,
  handleValidationErrors,
  auditMiddleware('upsert', 'content', (req) => req.body.key),
  ContentController.upsert
);

// PUT /api/admin/content/:key - Update content
router.put('/:key',
  validateContent,
  handleValidationErrors,
  auditMiddleware('update', 'content', (req) => req.params.key),
  ContentController.update
);

// DELETE /api/admin/content/:key - Delete content
router.delete('/:key',
  auditMiddleware('delete', 'content', (req) => req.params.key),
  ContentController.delete
);

// POST /api/admin/content/bulk-upsert - Bulk upsert content
router.post('/bulk-upsert',
  auditMiddleware('bulk_upsert', 'content'),
  ContentController.bulkUpsert
);

module.exports = router;
