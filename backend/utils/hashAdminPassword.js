/**
 * Utility script to hash admin passwords
 * Usage: node utils/hashAdminPassword.js <admin_id> <new_password>
 * Or: node utils/hashAdminPassword.js (will prompt for input)
 */

const { hashPassword } = require('./passwordUtils');
const pool = require('../config/db');
require('dotenv').config();

async function hashAdminPassword(adminId, newPassword) {
  try {
    // Check if admin exists
    const checkResult = await pool.query('SELECT id, name, email FROM admin WHERE id = $1', [adminId]);
    
    if (checkResult.rows.length === 0) {
      console.error(`❌ Admin with ID "${adminId}" not found`);
      process.exit(1);
    }

    const admin = checkResult.rows[0];
    console.log(`📝 Found admin: ${admin.name || admin.email} (ID: ${admin.id})`);

    // Hash the password
    console.log('🔐 Hashing password...');
    const hashedPassword = await hashPassword(newPassword);

    // Update the password in database
    await pool.query('UPDATE admin SET password = $1 WHERE id = $2', [hashedPassword, adminId]);

    console.log('✅ Password hashed and updated successfully!');
    console.log(`🔑 Admin ID: ${adminId}`);
    console.log(`📧 Email: ${admin.email || 'N/A'}`);
    console.log(`👤 Name: ${admin.name || 'N/A'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// If run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 2) {
    const [adminId, password] = args;
    hashAdminPassword(adminId, password);
  } else {
    console.log('Usage: node utils/hashAdminPassword.js <admin_id> <new_password>');
    console.log('Example: node utils/hashAdminPassword.js admin123 mySecurePassword');
    process.exit(1);
  }
}

module.exports = { hashAdminPassword };

