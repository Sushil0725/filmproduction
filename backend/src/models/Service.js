const pool = require('../config/db');

class Service {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.image_url = data.image_url;
    this.category = data.category;
    this.features = data.features;
    this.pricing = data.pricing;
    this.status = data.status;
    this.order_index = data.order_index;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(serviceData) {
    const { 
      title, 
      description, 
      image_url, 
      category, 
      features = [], 
      pricing = null, 
      status = 'active',
      order_index = 0 
    } = serviceData;
    
    const query = `
      INSERT INTO services (title, description, image_url, category, features, pricing, status, order_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [title, description, image_url, category, JSON.stringify(features), pricing, status, order_index];
    
    try {
      const result = await pool.query(query, values);
      return new Service(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create service: ${error.message}`);
    }
  }

  static async findAll(options = {}) {
    const { status, category, limit = 50, offset = 0 } = options;
    
    let query = 'SELECT * FROM services WHERE 1=1';
    const values = [];
    let paramCount = 0;

    if (status) {
      query += ` AND status = $${++paramCount}`;
      values.push(status);
    }

    if (category) {
      query += ` AND category = $${++paramCount}`;
      values.push(category);
    }

    query += ` ORDER BY order_index ASC, created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    values.push(limit, offset);

    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => {
        const service = new Service(row);
        service.features = typeof service.features === 'string' ? JSON.parse(service.features) : service.features;
        return service;
      });
    } catch (error) {
      throw new Error(`Failed to fetch services: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM services WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      const service = new Service(result.rows[0]);
      service.features = typeof service.features === 'string' ? JSON.parse(service.features) : service.features;
      return service;
    } catch (error) {
      throw new Error(`Failed to fetch service: ${error.message}`);
    }
  }

  async update(updateData) {
    const allowedFields = ['title', 'description', 'image_url', 'category', 'features', 'pricing', 'status', 'order_index'];
    const updates = [];
    const values = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'features') {
          updates.push(`${key} = $${++paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          updates.push(`${key} = $${++paramCount}`);
          values.push(value);
        }
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(this.id);
    const query = `
      UPDATE services 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${++paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      Object.assign(this, result.rows[0]);
      this.features = typeof this.features === 'string' ? JSON.parse(this.features) : this.features;
      return this;
    } catch (error) {
      throw new Error(`Failed to update service: ${error.message}`);
    }
  }

  async delete() {
    const query = 'DELETE FROM services WHERE id = $1';
    
    try {
      await pool.query(query, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete service: ${error.message}`);
    }
  }

  static async reorder(serviceIds) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (let i = 0; i < serviceIds.length; i++) {
        await client.query(
          'UPDATE services SET order_index = $1 WHERE id = $2',
          [i, serviceIds[i]]
        );
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Failed to reorder services: ${error.message}`);
    } finally {
      client.release();
    }
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived
      FROM services
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to get service stats: ${error.message}`);
    }
  }
}

module.exports = Service;
