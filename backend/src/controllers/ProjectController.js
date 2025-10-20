const Project = require('../models/Project');
const { validationResult } = require('express-validator');

class ProjectController {
  // Get all projects with filtering and pagination
  static async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        category,
        featured,
        search,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      const options = {
        status,
        category,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        limit: parseInt(limit),
        offset
      };

      const projects = await Project.findAll(options);
      
      // Apply search filter if provided
      let filteredProjects = projects;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProjects = projects.filter(project => 
          project.title.toLowerCase().includes(searchLower) ||
          project.subtitle?.toLowerCase().includes(searchLower) ||
          project.description?.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      filteredProjects.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

      const stats = await Project.getStats();

      res.json({
        success: true,
        data: {
          projects: filteredProjects,
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
      console.error('Error fetching projects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch projects',
        message: error.message
      });
    }
  }

  // Get single project by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const project = await Project.findById(id);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project',
        message: error.message
      });
    }
  }

  // Create new project
  static async create(req, res) {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const projectData = req.body;
      const project = await Project.create(projectData);

      // Log the creation
      console.log(`Project created: ${project.id} by user: ${req.user.id}`);

      res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully'
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create project',
        message: error.message
      });
    }
  }

  // Update project
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

      const { id } = req.params;
      const project = await Project.findById(id);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      const updateData = req.body;
      await project.update(updateData);

      res.json({
        success: true,
        data: project,
        message: 'Project updated successfully'
      });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update project',
        message: error.message
      });
    }
  }

  // Delete project
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const project = await Project.findById(id);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      await project.delete();

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete project',
        message: error.message
      });
    }
  }

  // Bulk operations
  static async bulkUpdate(req, res) {
    try {
      const { ids, updates } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid IDs provided'
        });
      }

      const results = [];
      for (const id of ids) {
        try {
          const project = await Project.findById(id);
          if (project) {
            await project.update(updates);
            results.push({ id, success: true });
          } else {
            results.push({ id, success: false, error: 'Project not found' });
          }
        } catch (error) {
          results.push({ id, success: false, error: error.message });
        }
      }

      res.json({
        success: true,
        data: results,
        message: 'Bulk update completed'
      });
    } catch (error) {
      console.error('Error in bulk update:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform bulk update',
        message: error.message
      });
    }
  }

  // Get project statistics
  static async getStats(req, res) {
    try {
      const stats = await Project.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching project stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project statistics',
        message: error.message
      });
    }
  }
}

module.exports = ProjectController;
