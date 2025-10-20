const pool = require('../config/db');

class Project {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.subtitle = data.subtitle;
    this.description = data.description;
    this.image_url = data.image_url;
    this.category = data.category;
    this.year = data.year;
    this.status = data.status;
    this.featured = data.featured;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(projectData) {
    const { title, subtitle, description, image_url, category, year, status = 'active', featured = false } = projectData;
    
    const query = `
      INSERT INTO projects (title, subtitle, description, image_url, category, year, status, featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [title, subtitle, description, image_url, category, year, status, featured];
    
    try {
      const result = await pool.query(query, values);
      return new Project(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  static async findAll(options = {}) {
    const { status, category, featured, limit = 50, offset = 0 } = options;
    
    let query = 'SELECT * FROM projects WHERE 1=1';
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

    if (featured !== undefined) {
      query += ` AND featured = $${++paramCount}`;
      values.push(featured);
    }

    query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    values.push(limit, offset);

    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => new Project(row));
    } catch (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM projects WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return new Project(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to fetch project: ${error.message}`);
    }
  }

  async update(updateData) {
    const allowedFields = ['title', 'subtitle', 'description', 'image_url', 'category', 'year', 'status', 'featured'];
    const updates = [];
    const values = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${++paramCount}`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(this.id);
    const query = `
      UPDATE projects 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${++paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      Object.assign(this, result.rows[0]);
      return this;
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  async delete() {
    const query = 'DELETE FROM projects WHERE id = $1';
    
    try {
      await pool.query(query, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived,
        COUNT(CASE WHEN featured = true THEN 1 END) as featured
      FROM projects
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to get project stats: ${error.message}`);
    }
  }
}

module.exports = Project;
