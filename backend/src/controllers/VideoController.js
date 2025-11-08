const pool = require('../config/db');
const { logger } = require('../middleware/logging');

class VideoController {
  // Get all videos with filtering and pagination
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

      let query = 'SELECT * FROM videos WHERE 1=1';
      const values = [];
      let paramCount = 0;

      if (search) {
        query += ` AND (title ILIKE $${++paramCount} OR description ILIKE $${++paramCount})`;
        values.push(`%${search}%`, `%${search}%`);
      }

      // Validate sortBy to prevent SQL injection
      const allowedSortFields = ['created_at', 'updated_at', 'title'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';

      query += ` ORDER BY ${sortField} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
      query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      values.push(parseInt(limit), offset);

      const result = await pool.query(query, values);

      // Get total count
      const countQuery = query.replace(/SELECT \* FROM videos/, 'SELECT COUNT(*) FROM videos')
        .replace(/ORDER BY.*LIMIT.*OFFSET.*/, '');
      const countResult = await pool.query(countQuery, values.slice(0, -2));
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          videos: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching videos', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch videos',
        message: error.message
      });
    }
  }

  // Get video by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query('SELECT * FROM videos WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Video not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Error fetching video', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch video',
        message: error.message
      });
    }
  }

  // Create new video
  static async create(req, res) {
    try {
      const { title, youtubeUrl, description } = req.body;

      // Extract YouTube video ID and generate thumbnail
      const youtubeId = VideoController.extractYouTubeId(youtubeUrl);
      if (!youtubeId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid YouTube URL'
        });
      }

      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

      const query = `
        INSERT INTO videos (title, youtube_url, thumbnail_url, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const values = [title, youtubeUrl, thumbnailUrl, description];
      const result = await pool.query(query, values);

      logger.info('Video created', { videoId: result.rows[0].id });

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Video created successfully'
      });
    } catch (error) {
      logger.error('Error creating video', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to create video',
        message: error.message
      });
    }
  }

  // Update video
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title, youtubeUrl, description } = req.body;

      // Extract YouTube video ID and generate thumbnail if URL changed
      let thumbnailUrl = null;
      if (youtubeUrl) {
        const youtubeId = VideoController.extractYouTubeId(youtubeUrl);
        if (!youtubeId) {
          return res.status(400).json({
            success: false,
            error: 'Invalid YouTube URL'
          });
        }
        thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      }

      const query = `
        UPDATE videos
        SET title = $1, youtube_url = $2, thumbnail_url = $3, description = $4
        WHERE id = $5
        RETURNING *
      `;

      const values = [title, youtubeUrl, thumbnailUrl, description, id];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Video not found'
        });
      }

      logger.info('Video updated', { videoId: id });

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Video updated successfully'
      });
    } catch (error) {
      logger.error('Error updating video', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to update video',
        message: error.message
      });
    }
  }

  // Delete video
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query('DELETE FROM videos WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Video not found'
        });
      }

      logger.info('Video deleted', { videoId: id });

      res.json({
        success: true,
        message: 'Video deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting video', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to delete video',
        message: error.message
      });
    }
  }

  // Get video statistics
  static async getStats(req, res) {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent
        FROM videos
      `);

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Error fetching video stats', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch video statistics',
        message: error.message
      });
    }
  }

  // Helper method to extract YouTube ID
  static extractYouTubeId(url) {
    try {
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}

module.exports = VideoController;
