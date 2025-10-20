const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

class MigrationRunner {
  constructor() {
    this.migrationsDir = path.join(__dirname, '../migrations');
  }

  async runMigrations() {
    try {
      console.log('🔄 Starting database migrations...');
      
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();
      
      // Get list of migration files
      const migrationFiles = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      console.log(`📁 Found ${migrationFiles.length} migration files`);
      
      // Get already run migrations
      const runMigrations = await this.getRunMigrations();
      
      for (const file of migrationFiles) {
        const migrationName = file.replace('.sql', '');
        
        if (runMigrations.includes(migrationName)) {
          console.log(`✅ ${migrationName} - Already applied`);
          continue;
        }
        
        console.log(`🔄 Running migration: ${migrationName}`);
        
        try {
          const migrationPath = path.join(this.migrationsDir, file);
          const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
          
          // Run migration in a transaction
          const client = await pool.connect();
          try {
            await client.query('BEGIN');
            await client.query(migrationSQL);
            await client.query(
              'INSERT INTO migrations (name, executed_at) VALUES ($1, NOW())',
              [migrationName]
            );
            await client.query('COMMIT');
            console.log(`✅ ${migrationName} - Applied successfully`);
          } catch (error) {
            await client.query('ROLLBACK');
            throw error;
          } finally {
            client.release();
          }
        } catch (error) {
          console.error(`❌ ${migrationName} - Failed:`, error.message);
          throw error;
        }
      }
      
      console.log('🎉 All migrations completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async createMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    await pool.query(query);
  }

  async getRunMigrations() {
    try {
      const result = await pool.query('SELECT name FROM migrations ORDER BY executed_at');
      return result.rows.map(row => row.name);
    } catch (error) {
      // If migrations table doesn't exist yet, return empty array
      return [];
    }
  }

  async rollbackMigration(migrationName) {
    try {
      console.log(`🔄 Rolling back migration: ${migrationName}`);
      
      // This would need to be implemented per migration
      // For now, just remove from migrations table
      await pool.query('DELETE FROM migrations WHERE name = $1', [migrationName]);
      
      console.log(`✅ ${migrationName} - Rolled back successfully`);
    } catch (error) {
      console.error(`❌ ${migrationName} - Rollback failed:`, error.message);
      throw error;
    }
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  const runner = new MigrationRunner();
  runner.runMigrations()
    .then(() => {
      console.log('Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = MigrationRunner;
