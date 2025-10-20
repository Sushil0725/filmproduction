const pool = require('../config/db');

class AuditLogger {
  static async log(req, action, resourceType, resourceId = null, oldValues = null, newValues = null) {
    try {
      const query = `
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      
      const values = [
        req.user?.id || null,
        action,
        resourceType,
        resourceId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
      ];

      await pool.query(query, values);
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw error to avoid breaking the main request
    }
  }

  static async getLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        action,
        resourceType,
        userId,
        startDate,
        endDate
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      let query = `
        SELECT al.*, au.username, au.email
        FROM audit_logs al
        LEFT JOIN admin_users au ON al.user_id = au.id
        WHERE 1=1
      `;
      
      const values = [];
      let paramCount = 0;

      if (action) {
        query += ` AND al.action = $${++paramCount}`;
        values.push(action);
      }

      if (resourceType) {
        query += ` AND al.resource_type = $${++paramCount}`;
        values.push(resourceType);
      }

      if (userId) {
        query += ` AND al.user_id = $${++paramCount}`;
        values.push(userId);
      }

      if (startDate) {
        query += ` AND al.created_at >= $${++paramCount}`;
        values.push(startDate);
      }

      if (endDate) {
        query += ` AND al.created_at <= $${++paramCount}`;
        values.push(endDate);
      }

      query += ` ORDER BY al.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      values.push(parseInt(limit), offset);

      const result = await pool.query(query, values);
      
      // Get total count for pagination
      const countQuery = query.replace(/SELECT al\.\*, au\.username, au\.email FROM audit_logs al LEFT JOIN admin_users au ON al\.user_id = au\.id/, 'SELECT COUNT(*) FROM audit_logs al')
        .replace(/ORDER BY al\.created_at DESC LIMIT \$\d+ OFFSET \$\d+/, '');
      
      const countResult = await pool.query(countQuery, values.slice(0, -2));
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          logs: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audit logs',
        message: error.message
      });
    }
  }
}

// Middleware to automatically log certain actions
const auditMiddleware = (action, resourceType, getResourceId = null) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;
    const originalStatus = res.status;

    let oldValues = null;
    let newValues = null;
    let resourceId = null;

    // Capture old values for updates
    if (action === 'update' && req.params.id) {
      try {
        // This would need to be implemented per resource type
        // For now, we'll capture the request body as new values
        newValues = req.body;
        resourceId = req.params.id;
      } catch (error) {
        console.error('Error capturing old values:', error);
      }
    }

    // Override res.json to capture response
    res.json = function(data) {
      // Log the action
      if (data.success) {
        AuditLogger.log(req, action, resourceType, resourceId || getResourceId?.(req), oldValues, newValues);
      }
      
      // Call original method
      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = {
  AuditLogger,
  auditMiddleware
};
