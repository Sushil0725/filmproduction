const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { auditMiddleware } = require('../../middleware/audit');
const {
  validateTodo,
  validateUUID,
  validatePagination,
  handleValidationErrors
} = require('../../middleware/validation');
const TodoController = require('../../controllers/TodoController');

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

// GET /api/admin/todos - Get all todos with filtering and pagination
router.get('/',
  validatePagination,
  handleValidationErrors,
  TodoController.getAll
);

// GET /api/admin/todos/stats - Get todo statistics
router.get('/stats', TodoController.getStats);

// GET /api/admin/todos/:id - Get single todo
router.get('/:id',
  validateUUID,
  handleValidationErrors,
  TodoController.getById
);

// POST /api/admin/todos - Create new todo
router.post('/',
  validateTodo,
  handleValidationErrors,
  auditMiddleware('create', 'todo', (req) => req.body.id),
  TodoController.create
);

// PUT /api/admin/todos/:id - Update todo
router.put('/:id',
  validateUUID,
  validateTodo,
  handleValidationErrors,
  auditMiddleware('update', 'todo', (req) => req.params.id),
  TodoController.update
);

// DELETE /api/admin/todos/:id - Delete todo
router.delete('/:id',
  validateUUID,
  handleValidationErrors,
  auditMiddleware('delete', 'todo', (req) => req.params.id),
  TodoController.delete
);

module.exports = router;
