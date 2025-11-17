const pool = require('../config/db');

async function createMediaTable() {
  try {
    // Check if table exists
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'media'
      );
    `);

    if (checkTable.rows[0].exists) {
      // Check if id column is SERIAL/auto-increment
      const checkColumn = await pool.query(`
        SELECT column_default 
        FROM information_schema.columns 
        WHERE table_name = 'media' 
        AND column_name = 'id';
      `);

      // If id column doesn't have a default (SERIAL sequence), fix it
      if (!checkColumn.rows[0]?.column_default || !checkColumn.rows[0].column_default.includes('nextval')) {
        console.log('⚠️ Media table exists but id column is not auto-increment. Fixing...');
        
        // Check if table has any data
        const countResult = await pool.query('SELECT COUNT(*) FROM media');
        const rowCount = parseInt(countResult.rows[0].count);
        
        if (rowCount > 0) {
          console.log(`⚠️ Table has ${rowCount} rows. Creating sequence and fixing id column...`);
          
          // Create sequence
          await pool.query(`
            CREATE SEQUENCE IF NOT EXISTS media_id_seq;
          `);
          
          // Set the sequence to start from max(id) + 1
          await pool.query(`
            SELECT setval('media_id_seq', COALESCE((SELECT MAX(id) FROM media), 0) + 1, false);
          `);
          
          // Alter the id column to use the sequence
          await pool.query(`
            ALTER TABLE media 
            ALTER COLUMN id SET DEFAULT nextval('media_id_seq'),
            ALTER COLUMN id SET NOT NULL;
          `);
          
          // Make sure the sequence is owned by the column
          await pool.query(`
            ALTER SEQUENCE media_id_seq OWNED BY media.id;
          `);
        } else {
          // No data, safe to drop and recreate
          await pool.query(`DROP TABLE IF EXISTS media CASCADE;`);
          
          await pool.query(`
            CREATE TABLE media (
              id SERIAL PRIMARY KEY,
              filename VARCHAR(255) NOT NULL,
              filetype VARCHAR(50) NOT NULL,
              fileurl VARCHAR(500) NOT NULL,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
        }
        
        console.log('✅ Media table fixed with proper auto-increment id');
      } else {
        console.log('✅ Media table already exists with correct structure');
      }
      return;
    }

    // Create media table
    await pool.query(`
      CREATE TABLE media (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        filetype VARCHAR(50) NOT NULL,
        fileurl VARCHAR(500) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('✅ Media table created successfully');
  } catch (error) {
    console.error('❌ Error creating media table:', error);
    throw error;
  }
}

if (require.main === module) {
  createMediaTable()
    .then(() => {
      console.log('Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

module.exports = { createMediaTable };

