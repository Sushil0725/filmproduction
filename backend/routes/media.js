const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth');
const {
  uploadMedia,
  getAllMedia,
  getMediaById,
  deleteMedia
} = require('../controllers/MediaController');

// All routes require authentication
router.use(verifyToken);

// Upload media files (multiple files) or YouTube URL with error handling
router.post('/', (req, res, next) => {
  // If YouTube URL is provided, skip multer
  if (req.body.youtubeUrl) {
    return next();
  }
  
  // Otherwise, handle file uploads
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({
        success: false,
        error: err.message || 'File upload error'
      });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files were uploaded'
      });
    }
    next();
  });
}, uploadMedia);

// Get all media with pagination and search
router.get('/', getAllMedia);

// Get single media by ID
router.get('/:id', getMediaById);

// Delete media
router.delete('/:id', deleteMedia);

module.exports = router;
