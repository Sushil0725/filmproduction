const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { createUploader } = require('../utils/uploadConfig');
const {
  getMediaFiles,
  uploadMultipleFiles,
  deleteMediaFile,
  getMediaFile
} = require('../controllers/MediaController');

// All routes require authentication
router.use(verifyToken);

/**
 * GET /api/admin/uploads
 * Get list of media files with pagination
 * Query params: category, page, limit, search
 */
router.get('/', getMediaFiles);

/**
 * GET /api/admin/uploads/:id
 * Get single media file
 */
router.get('/:id', getMediaFile);

/**
 * POST /api/admin/uploads/multiple
 * Upload multiple files
 * FormData: files[], category, filename (optional)
 */
router.post('/multiple', (req, res, next) => {
  const category = req.body.category || 'images';
  const maxSize = category === 'videos' ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for videos, 10MB for others
  
  const upload = createUploader(category, maxSize);
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'File upload error'
      });
    }
    next();
  });
}, uploadMultipleFiles);

/**
 * DELETE /api/admin/uploads/:id
 * Delete a media file
 */
router.delete('/:id', deleteMediaFile);

module.exports = router;


