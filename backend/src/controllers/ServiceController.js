const Service = require('../models/Service');
const { validationResult } = require('express-validator');

class ServiceController {
  // Get all services with filtering and pagination
  static async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        category,
        search,
        sortBy = 'order_index',
        sortOrder = 'asc'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      const options = {
        status,
        category,
        limit: parseInt(limit),
        offset
      };

      const services = await Service.findAll(options);
      
      // Apply search filter if provided
      let filteredServices = services;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredServices = services.filter(service => 
          service.title.toLowerCase().includes(searchLower) ||
          service.description?.toLowerCase().includes(searchLower) ||
          service.category?.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      filteredServices.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

      const stats = await Service.getStats();

      res.json({
        success: true,
        data: {
          services: filteredServices,
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
      console.error('Error fetching services:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch services',
        message: error.message
      });
    }
  }

  // Get single service by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const service = await Service.findById(id);

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      res.json({
        success: true,
        data: service
      });
    } catch (error) {
      console.error('Error fetching service:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch service',
        message: error.message
      });
    }
  }

  // Create new service
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const serviceData = req.body;
      const service = await Service.create(serviceData);

      console.log(`Service created: ${service.id} by user: ${req.user.id}`);

      res.status(201).json({
        success: true,
        data: service,
        message: 'Service created successfully'
      });
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create service',
        message: error.message
      });
    }
  }

  // Update service
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
      const service = await Service.findById(id);

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      const updateData = req.body;
      await service.update(updateData);

      res.json({
        success: true,
        data: service,
        message: 'Service updated successfully'
      });
    } catch (error) {
      console.error('Error updating service:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update service',
        message: error.message
      });
    }
  }

  // Delete service
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const service = await Service.findById(id);

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      await service.delete();

      res.json({
        success: true,
        message: 'Service deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete service',
        message: error.message
      });
    }
  }

  // Reorder services
  static async reorder(req, res) {
    try {
      const { serviceIds } = req.body;

      if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid service IDs provided'
        });
      }

      await Service.reorder(serviceIds);

      res.json({
        success: true,
        message: 'Services reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering services:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reorder services',
        message: error.message
      });
    }
  }

  // Get service statistics
  static async getStats(req, res) {
    try {
      const stats = await Service.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching service stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch service statistics',
        message: error.message
      });
    }
  }
}

module.exports = ServiceController;
