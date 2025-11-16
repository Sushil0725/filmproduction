const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkTables() {
  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL");

    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    if (tablesResult.rows.length === 0) {
      console.log("⚠️ No tables found in the public schema.");
      return;
    }

    for (const { table_name } of tablesResult.rows) {
      console.log(`\n📘 Table: ${table_name}`);

      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1;
      `, [table_name]);

      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) [nullable: ${col.is_nullable}]`);
      });
    }
  } catch (err) {
    console.error("❌ Error fetching tables:", err);
  } finally {
    await client.end();
    console.log("\n🔒 Connection closed.");
  }
}

if (require.main === module) {
  checkTables();
}

module.exports = { checkTables };
