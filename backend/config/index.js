const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

require('./db');

const ROOT_DIR = path.resolve(__dirname, '..'); // backend/src -> backend
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT_DIR, 'datas');

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || null,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  dataDir: DATA_DIR,
  rootDir: ROOT_DIR,
};
