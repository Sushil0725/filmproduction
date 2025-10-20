const pool = require('../config/db');

class Content {
  constructor(data) {
    this.id = data.id;
    this.key = data.key;
    this.type = data.type;
    this.value = data.value;
    this.metadata = data.metadata;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(contentData) {
    const { key, type, value, metadata = {} } = contentData;
    
    const query = `
      INSERT INTO content (key, type, value, metadata)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [key, type, JSON.stringify(value), JSON.stringify(metadata)];
    
    try {
      const result = await pool.query(query, values);
      return new Content(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create content: ${error.message}`);
    }
  }

  static async findByKey(key) {
    const query = 'SELECT * FROM content WHERE key = $1';
    
    try {
      const result = await pool.query(query, [key]);
      if (result.rows.length === 0) {
        return null;
      }
      const content = new Content(result.rows[0]);
      content.value = typeof content.value === 'string' ? JSON.parse(content.value) : content.value;
      content.metadata = typeof content.metadata === 'string' ? JSON.parse(content.metadata) : content.metadata;
      return content;
    } catch (error) {
      throw new Error(`Failed to fetch content: ${error.message}`);
    }
  }

  static async findAll(options = {}) {
    const { type, limit = 100, offset = 0 } = options;
    
    let query = 'SELECT * FROM content WHERE 1=1';
    const values = [];
    let paramCount = 0;

    if (type) {
      query += ` AND type = $${++paramCount}`;
      values.push(type);
    }

    query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    values.push(limit, offset);

    try {
      const result = await pool.query(query, values);
      return result.rows.map(row => {
        const content = new Content(row);
        content.value = typeof content.value === 'string' ? JSON.parse(content.value) : content.value;
        content.metadata = typeof content.metadata === 'string' ? JSON.parse(content.metadata) : content.metadata;
        return content;
      });
    } catch (error) {
      throw new Error(`Failed to fetch content: ${error.message}`);
    }
  }

  async update(updateData) {
    const allowedFields = ['type', 'value', 'metadata'];
    const updates = [];
    const values = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'value' || key === 'metadata') {
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
      UPDATE content 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${++paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      Object.assign(this, result.rows[0]);
      this.value = typeof this.value === 'string' ? JSON.parse(this.value) : this.value;
      this.metadata = typeof this.metadata === 'string' ? JSON.parse(this.metadata) : this.metadata;
      return this;
    } catch (error) {
      throw new Error(`Failed to update content: ${error.message}`);
    }
  }

  async delete() {
    const query = 'DELETE FROM content WHERE id = $1';
    
    try {
      await pool.query(query, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete content: ${error.message}`);
    }
  }

  static async upsert(contentData) {
    const { key, type, value, metadata = {} } = contentData;
    
    const query = `
      INSERT INTO content (key, type, value, metadata)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (key) 
      DO UPDATE SET 
        type = EXCLUDED.type,
        value = EXCLUDED.value,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING *
    `;
    
    const values = [key, type, JSON.stringify(value), JSON.stringify(metadata)];
    
    try {
      const result = await pool.query(query, values);
      const content = new Content(result.rows[0]);
      content.value = typeof content.value === 'string' ? JSON.parse(content.value) : content.value;
      content.metadata = typeof content.metadata === 'string' ? JSON.parse(content.metadata) : content.metadata;
      return content;
    } catch (error) {
      throw new Error(`Failed to upsert content: ${error.message}`);
    }
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN type = 'text' THEN 1 END) as text_count,
        COUNT(CASE WHEN type = 'json' THEN 1 END) as json_count,
        COUNT(CASE WHEN type = 'html' THEN 1 END) as html_count
      FROM content
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to get content stats: ${error.message}`);
    }
  }
}

module.exports = Content;
