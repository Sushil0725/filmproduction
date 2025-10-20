const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');
const { 
  validateService, 
  validateUUID, 
  validatePagination, 
  handleValidationErrors 
} = require('../../middleware/validation');
const ServiceController = require('../../controllers/ServiceController');

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

// GET /api/admin/services - Get all services with filtering and pagination
router.get('/', 
  validatePagination,
  handleValidationErrors,
  ServiceController.getAll
);

// GET /api/admin/services/stats - Get service statistics
router.get('/stats', ServiceController.getStats);

// GET /api/admin/services/:id - Get single service
router.get('/:id',
  validateUUID,
  handleValidationErrors,
  ServiceController.getById
);

// POST /api/admin/services - Create new service
router.post('/',
  validateService,
  handleValidationErrors,
  auditMiddleware('create', 'service', (req) => req.body.id),
  ServiceController.create
);

// PUT /api/admin/services/:id - Update service
router.put('/:id',
  validateUUID,
  validateService,
  handleValidationErrors,
  auditMiddleware('update', 'service', (req) => req.params.id),
  ServiceController.update
);

// DELETE /api/admin/services/:id - Delete service
router.delete('/:id',
  validateUUID,
  handleValidationErrors,
  auditMiddleware('delete', 'service', (req) => req.params.id),
  ServiceController.delete
);

// POST /api/admin/services/reorder - Reorder services
router.post('/reorder',
  auditMiddleware('reorder', 'service'),
  ServiceController.reorder
);

module.exports = router;
