const Content = require('../models/Content');
const { validationResult } = require('express-validator');

class ContentController {
  // Get all content with filtering
  static async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        type,
        search
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      const options = {
        type,
        limit: parseInt(limit),
        offset
      };

      const content = await Content.findAll(options);
      
      // Apply search filter if provided
      let filteredContent = content;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredContent = content.filter(item => 
          item.key.toLowerCase().includes(searchLower) ||
          JSON.stringify(item.value).toLowerCase().includes(searchLower)
        );
      }

      const stats = await Content.getStats();

      res.json({
        success: true,
        data: {
          content: filteredContent,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: stats.total,
            pages: Math.ceil(stats.total / parseInt(limit))
          },
          stats
        }
      });
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch content',
        message: error.message
      });
    }
  }

  // Get content by key
  static async getByKey(req, res) {
    try {
      const { key } = req.params;
      const content = await Content.findByKey(key);

      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'Content not found'
        });
      }

      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch content',
        message: error.message
      });
    }
  }

  // Create or update content (upsert)
  static async upsert(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { key, type, value, metadata } = req.body;
      const content = await Content.upsert({ key, type, value, metadata });

      console.log(`Content upserted: ${content.key} by user: ${req.user.id}`);

      res.json({
        success: true,
        data: content,
        message: 'Content saved successfully'
      });
    } catch (error) {
      console.error('Error upserting content:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save content',
        message: error.message
      });
    }
  }

  // Update content
  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { key } = req.params;
      const content = await Content.findByKey(key);

      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'Content not found'
        });
      }

      const updateData = req.body;
      await content.update(updateData);

      res.json({
        success: true,
        data: content,
        message: 'Content updated successfully'
      });
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update content',
        message: error.message
      });
    }
  }

  // Delete content
  static async delete(req, res) {
    try {
      const { key } = req.params;
      const content = await Content.findByKey(key);

      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'Content not found'
        });
      }

      await content.delete();

      res.json({
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete content',
        message: error.message
      });
    }
  }

  // Bulk operations
  static async bulkUpsert(req, res) {
    try {
      const { contentItems } = req.body;

      if (!Array.isArray(contentItems) || contentItems.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid content items provided'
        });
      }

      const results = [];
      for (const item of contentItems) {
        try {
          const content = await Content.upsert(item);
          results.push({ key: content.key, success: true, data: content });
        } catch (error) {
          results.push({ key: item.key, success: false, error: error.message });
        }
      }

      res.json({
        success: true,
        data: results,
        message: 'Bulk upsert completed'
      });
    } catch (error) {
      console.error('Error in bulk upsert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform bulk upsert',
        message: error.message
      });
    }
  }

  // Get content statistics
  static async getStats(req, res) {
    try {
      const stats = await Content.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching content stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch content statistics',
        message: error.message
      });
    }
  }
}

module.exports = ContentController;
