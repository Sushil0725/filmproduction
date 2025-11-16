const bcrypt = require('bcryptjs');

/**
 * Hash a password using bcrypt
 * @param {string} plainPassword - The plain text password to hash
 * @param {number} saltRounds - Number of salt rounds (default: 10)
 * @returns {Promise<string>} - The hashed password
 */
async function hashPassword(plainPassword, saltRounds = 10) {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);
  return hashedPassword;
}

/**
 * Compare a plain password with a hashed password
 * @param {string} plainPassword - The plain text password
 * @param {string} hashedPassword - The bcrypt hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
async function comparePassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) {
    return false;
  }
  
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Check if a string is a bcrypt hash
 * @param {string} str - String to check
 * @returns {boolean} - True if string is a bcrypt hash
 */
function isBcryptHash(str) {
  if (!str || typeof str !== 'string') {
    return false;
  }
  return str.startsWith('$2a$') || str.startsWith('$2b$') || str.startsWith('$2y$');
}

module.exports = {
  hashPassword,
  comparePassword,
  isBcryptHash
};

