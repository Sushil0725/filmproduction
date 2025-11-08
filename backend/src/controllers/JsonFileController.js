const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { logger } = require('../middleware/logging');
const config = require('../config');

class JsonFileController {
  // Get all JSON files with filtering and pagination
  static async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = 'SELECT * FROM json_files WHERE 1=1';
      const values = [];
      let paramCount = 0;

      if (search) {
        query += ` AND (filename ILIKE $${++paramCount} OR content ILIKE $${++paramCount})`;
        values.push(`%${search}%`, `%${search}%`);
      }

      // Validate sortBy to prevent SQL injection
      const allowedSortFields = ['created_at', 'updated_at', 'filename', 'file_size'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';

      query += ` ORDER BY ${sortField} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
      query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      values.push(parseInt(limit), offset);

      const result = await pool.query(query, values);

      // Get total count
      const countQuery = query.replace(/SELECT \* FROM json_files/, 'SELECT COUNT(*) FROM json_files')
        .replace(/ORDER BY.*LIMIT.*OFFSET.*/, '');
      const countResult = await pool.query(countQuery, values.slice(0, -2));
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          files: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching JSON files', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch JSON files',
        message: error.message
      });
    }
  }

  // Get JSON file by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query('SELECT * FROM json_files WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'JSON file not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Error fetching JSON file', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch JSON file',
        message: error.message
      });
    }
  }

  // Create new JSON file
  static async create(req, res) {
    try {
      const { filename, content } = req.body;

      // Validate JSON content
      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON content'
        });
      }

      // Check if file already exists
      const existingResult = await pool.query('SELECT id FROM json_files WHERE filename = $1', [filename]);
      if (existingResult.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'File with this name already exists'
        });
      }

      // Save to filesystem
      const filePath = path.join(config.dataDir, 'json', `${filename}.json`);
      await fs.promises.writeFile(filePath, JSON.stringify(parsedContent, null, 2), 'utf8');

      // Get file size
      const stats = await fs.promises.stat(filePath);
      const fileSize = stats.size;

      // Save to database
      const query = `
        INSERT INTO json_files (filename, file_path, file_size, content)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const values = [filename, filePath, fileSize, content];
      const result = await pool.query(query, values);

      logger.info('JSON file created', { fileId: result.rows[0].id });

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'JSON file created successfully'
      });
    } catch (error) {
      logger.error('Error creating JSON file', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to create JSON file',
        message: error.message
      });
    }
  }

  // Update JSON file
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { filename, content } = req.body;

      // Validate JSON content
      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON content'
        });
      }

      // Check if file exists
      const existingResult = await pool.query('SELECT * FROM json_files WHERE id = $1', [id]);
      if (existingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'JSON file not found'
        });
      }

      const existingFile = existingResult.rows[0];

      // If filename changed, check for conflicts and rename file
      if (filename !== existingFile.filename) {
        const nameCheckResult = await pool.query('SELECT id FROM json_files WHERE filename = $1 AND id != $2', [filename, id]);
        if (nameCheckResult.rows.length > 0) {
          return res.status(409).json({
            success: false,
            error: 'File with this name already exists'
          });
        }

        // Rename file on filesystem
        const oldPath = existingFile.file_path;
        const newPath = path.join(config.dataDir, 'json', `${filename}.json`);

        if (fs.existsSync(oldPath)) {
          await fs.promises.rename(oldPath, newPath);
        }
      }

      // Get file size
      const filePath = path.join(config.dataDir, 'json', `${filename}.json`);
      const stats = await fs.promises.stat(filePath);
      const fileSize = stats.size;

      // Update database
      const query = `
        UPDATE json_files
        SET filename = $1, file_path = $2, file_size = $3, content = $4
        WHERE id = $5
        RETURNING *
      `;

      const values = [filename, filePath, fileSize, content, id];
      const result = await pool.query(query, values);

      logger.info('JSON file updated', { fileId: id });

      res.json({
        success: true,
        data: result.rows[0],
        message: 'JSON file updated successfully'
      });
    } catch (error) {
      logger.error('Error updating JSON file', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to update JSON file',
        message: error.message
      });
    }
  }

  // Delete JSON file
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Get file info
      const result = await pool.query('SELECT * FROM json_files WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'JSON file not found'
        });
      }

      const file = result.rows[0];

      // Delete from filesystem
      if (fs.existsSync(file.file_path)) {
        await fs.promises.unlink(file.file_path);
      }

      // Delete from database
      await pool.query('DELETE FROM json_files WHERE id = $1', [id]);

      logger.info('JSON file deleted', { fileId: id });

      res.json({
        success: true,
        message: 'JSON file deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting JSON file', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to delete JSON file',
        message: error.message
      });
    }
  }

  // Download JSON file
  static async download(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query('SELECT * FROM json_files WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'JSON file not found'
        });
      }

      const file = result.rows[0];

      // Read file content
      const content = await fs.promises.readFile(file.file_path, 'utf8');

      // Send as download
      res.setHeader('Content-Disposition', `attachment; filename="${file.filename}.json"`);
      res.setHeader('Content-Type', 'application/json');
      res.send(content);
    } catch (error) {
      logger.error('Error downloading JSON file', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to download JSON file',
        message: error.message
      });
    }
  }

  // Get JSON file statistics
  static async getStats(req, res) {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*) as total,
          SUM(file_size) as total_size,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent
        FROM json_files
      `);

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Error fetching JSON file stats', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch JSON file statistics',
        message: error.message
      });
    }
  }
}

module.exports = JsonFileController;
