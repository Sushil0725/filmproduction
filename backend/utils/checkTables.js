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

  // 1. Columns
  const columnsResult = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = $1;
  `, [table_name]);

  columnsResult.rows.forEach(col => {
    console.log(`  - ${col.column_name} (${col.data_type}) [nullable: ${col.is_nullable}]`);
  });

  // 2. Primary Keys
  const pkResult = await client.query(`
    SELECT kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY';
  `, [table_name]);

  if (pkResult.rows.length > 0) {
    console.log(`  🔑 Primary Key: ${pkResult.rows.map(r => r.column_name).join(", ")}`);
  } else {
    console.log(`  🔑 Primary Key: None`);
  }

  // 3. Foreign Keys
  const fkResult = await client.query(`
    SELECT
      kcu.column_name AS fk_column,
      ccu.table_name AS referenced_table,
      ccu.column_name AS referenced_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name = $1 AND tc.constraint_type = 'FOREIGN KEY';
  `, [table_name]);

  if (fkResult.rows.length > 0) {
    console.log("  🔗 Foreign Keys:");
    fkResult.rows.forEach(fk => {
      console.log(`     - ${fk.fk_column} → ${fk.referenced_table}(${fk.referenced_column})`);
    });
  } else {
    console.log("  🔗 Foreign Keys: None");
  }
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
