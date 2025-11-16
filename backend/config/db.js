const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Explicitly test connection
pool.connect()
  .then(() => {
    console.log('✅ PostgreSQL Connected Successfully');
  })
  .catch((err) => {
    console.error('❌ PostgreSQL Connection Failed:', err.message);
  });

module.exports = pool;
