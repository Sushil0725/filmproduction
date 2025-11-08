const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');
const {
  validateVideo,
  validateUUID,
  validatePagination,
  handleValidationErrors
} = require('../../middleware/validation');
const VideoController = require('../../controllers/VideoController');

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

// GET /api/admin/videos - Get all videos with filtering and pagination
router.get('/',
  validatePagination,
  handleValidationErrors,
  VideoController.getAll
);

// GET /api/admin/videos/stats - Get video statistics
router.get('/stats', VideoController.getStats);

// GET /api/admin/videos/:id - Get single video
router.get('/:id',
  validateUUID,
  handleValidationErrors,
  VideoController.getById
);

// POST /api/admin/videos - Create new video
router.post('/',
  validateVideo,
  handleValidationErrors,
  auditMiddleware('create', 'video', (req) => req.body.id),
  VideoController.create
);

// PUT /api/admin/videos/:id - Update video
router.put('/:id',
  validateUUID,
  validateVideo,
  handleValidationErrors,
  auditMiddleware('update', 'video', (req) => req.params.id),
  VideoController.update
);

// DELETE /api/admin/videos/:id - Delete video
router.delete('/:id',
  validateUUID,
  handleValidationErrors,
  auditMiddleware('delete', 'video', (req) => req.params.id),
  VideoController.delete
);

module.exports = router;
