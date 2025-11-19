const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideo
} = require('../controllers/VideoController');

// All routes require authentication
router.use(verifyToken);

/**
 * GET /api/admin/videos
 * Get list of videos with pagination
 * Query params: page, limit, search
 */
router.get('/', getVideos);

/**
 * GET /api/admin/videos/:id
 * Get single video
 */
router.get('/:id', getVideo);

/**
 * POST /api/admin/videos
 * Create a new video (YouTube URL)
 * Body: { title, url or youtubeUrl, description (optional) }
 */
router.post('/', createVideo);

/**
 * PUT /api/admin/videos/:id
 * Update a video
 * Body: { title, url or youtubeUrl, description (optional) }
 */
router.put('/:id', updateVideo);

/**
 * DELETE /api/admin/videos/:id
 * Delete a video
 */
router.delete('/:id', deleteVideo);

module.exports = router;


