const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const config = require('../config');

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(config.rootDir, 'uploads');

async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

// Initialize uploads directory
ensureUploadsDir();

// Memory storage for image optimization
const memoryStorage = multer.memoryStorage();

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} - Unique filename with timestamp
 */
function generateFilename(originalName) {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  return `${sanitizedName}_${timestamp}_${random}${ext}`;
}

/**
 * Create multer storage configuration
 * @param {string} category - Category folder (images, videos, documents)
 * @returns {multer.StorageEngine} - Multer storage engine
 */
function createStorage(category = 'images') {
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      const categoryDir = path.join(UPLOADS_DIR, category);
      try {
        await fs.mkdir(categoryDir, { recursive: true });
        cb(null, categoryDir);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const uniqueFilename = generateFilename(file.originalname);
      cb(null, uniqueFilename);
    }
  });
}

/**
 * File filter for allowed file types
 */
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimes = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    documents: ['application/pdf', 'application/json', 'text/plain']
  };

  const category = req.body.category || 'images';
  const allowed = allowedMimes[category] || allowedMimes.images;

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types for ${category}: ${allowed.join(', ')}`), false);
  }
};

/**
 * Create multer instance for file uploads
 * Uses memory storage for images (to enable optimization) and disk storage for others
 * @param {string} category - Category folder
 * @param {number} maxSize - Max file size in bytes (default: 10MB)
 * @returns {multer.Multer} - Multer instance
 */
function createUploader(category = 'images', maxSize = 10 * 1024 * 1024) {
  // Use memory storage for images to enable optimization before saving
  // Use disk storage for videos and documents
  const storage = category === 'images' ? memoryStorage : createStorage(category);
  
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
      files: 10 // Max 10 files per request
    }
  });
}

module.exports = {
  UPLOADS_DIR,
  generateFilename,
  createUploader,
  ensureUploadsDir
};

