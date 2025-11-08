const pool = require('../config/db');
const { logger } = require('../middleware/logging');

class TodoController {
  // Get all todos with filtering and pagination
  static async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        search,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = 'SELECT * FROM todos WHERE 1=1';
      const values = [];
      let paramCount = 0;

      if (status) {
        query += ` AND status = $${++paramCount}`;
        values.push(status);
      }

      if (priority) {
        query += ` AND priority = $${++paramCount}`;
        values.push(priority);
      }

      if (search) {
        query += ` AND (title ILIKE $${++paramCount} OR description ILIKE $${++paramCount})`;
        values.push(`%${search}%`, `%${search}%`);
      }

      // Validate sortBy to prevent SQL injection
      const allowedSortFields = ['created_at', 'updated_at', 'title', 'due_date', 'priority', 'status'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';

      query += ` ORDER BY ${sortField} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
      query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      values.push(parseInt(limit), offset);

      const result = await pool.query(query, values);

      // Get total count
      const countQuery = query.replace(/SELECT \* FROM todos/, 'SELECT COUNT(*) FROM todos')
        .replace(/ORDER BY.*LIMIT.*OFFSET.*/, '');
      const countResult = await pool.query(countQuery, values.slice(0, -2));
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          todos: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching todos', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch todos',
        message: error.message
      });
    }
  }

  // Get todo by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Todo not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Error fetching todo', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch todo',
        message: error.message
      });
    }
  }

  // Create new todo
  static async create(req, res) {
    try {
      const { title, description, priority, status, due_date } = req.body;

      const query = `
        INSERT INTO todos (title, description, priority, status, due_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [title, description, priority, status, due_date];
      const result = await pool.query(query, values);

      logger.info('Todo created', { todoId: result.rows[0].id });

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Todo created successfully'
      });
    } catch (error) {
      logger.error('Error creating todo', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to create todo',
        message: error.message
      });
    }
  }

  // Update todo
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, priority, status, due_date } = req.body;

      const query = `
        UPDATE todos
        SET title = $1, description = $2, priority = $3, status = $4, due_date = $5
        WHERE id = $6
        RETURNING *
      `;

      const values = [title, description, priority, status, due_date, id];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Todo not found'
        });
      }

      logger.info('Todo updated', { todoId: id });

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Todo updated successfully'
      });
    } catch (error) {
      logger.error('Error updating todo', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to update todo',
        message: error.message
      });
    }
  }

  // Delete todo
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Todo not found'
        });
      }

      logger.info('Todo deleted', { todoId: id });

      res.json({
        success: true,
        message: 'Todo deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting todo', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to delete todo',
        message: error.message
      });
    }
  }

  // Get todo statistics
  static async getStats(req, res) {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
          COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority,
          COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority
        FROM todos
      `);

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Error fetching todo stats', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch todo statistics',
        message: error.message
      });
    }
  }
}

module.exports = TodoController;
