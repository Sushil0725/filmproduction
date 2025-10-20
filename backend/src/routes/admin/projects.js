const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');
const { 
  validateProject, 
  validateUUID, 
  validatePagination, 
  handleValidationErrors 
} = require('../../middleware/validation');
const ProjectController = require('../../controllers/ProjectController');

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

// GET /api/admin/projects - Get all projects with filtering and pagination
router.get('/', 
  validatePagination,
  handleValidationErrors,
  ProjectController.getAll
);

// GET /api/admin/projects/stats - Get project statistics
router.get('/stats', ProjectController.getStats);

// GET /api/admin/projects/:id - Get single project
router.get('/:id',
  validateUUID,
  handleValidationErrors,
  ProjectController.getById
);

// POST /api/admin/projects - Create new project
router.post('/',
  validateProject,
  handleValidationErrors,
  auditMiddleware('create', 'project', (req) => req.body.id),
  ProjectController.create
);

// PUT /api/admin/projects/:id - Update project
router.put('/:id',
  validateUUID,
  validateProject,
  handleValidationErrors,
  auditMiddleware('update', 'project', (req) => req.params.id),
  ProjectController.update
);

// DELETE /api/admin/projects/:id - Delete project
router.delete('/:id',
  validateUUID,
  handleValidationErrors,
  auditMiddleware('delete', 'project', (req) => req.params.id),
  ProjectController.delete
);

// POST /api/admin/projects/bulk-update - Bulk update projects
router.post('/bulk-update',
  auditMiddleware('bulk_update', 'project'),
  ProjectController.bulkUpdate
);

module.exports = router;
