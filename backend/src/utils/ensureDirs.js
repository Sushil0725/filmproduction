const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function ensureDataDirs(dataDir) {
  ensureDir(dataDir);
  ensureDir(path.join(dataDir, 'uploads'));
  ensureDir(path.join(dataDir, 'text'));
  ensureDir(path.join(dataDir, 'json'));
}

module.exports = { ensureDataDirs };
