const pool = require('../config/db');
const path = require('path');
const fs = require('fs');
const config = require('../config');

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Upload media files and store in database
 */
async function uploadMedia(req, res) {
  try {
    // Normalize single file uploads to array
    if (req.file && !req.files) {
      req.files = [req.file];
    }
    // Check if this is a YouTube URL upload
    if (req.body.youtubeUrl) {
      const youtubeUrl = req.body.youtubeUrl.trim();
      const title = req.body.title || 'YouTube Video';
      
      // Extract YouTube video ID
      const videoId = extractYouTubeId(youtubeUrl);
      if (!videoId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid YouTube URL. Please provide a valid YouTube video URL.'
        });
      }

      // Create embed URL
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

      // Insert YouTube video into database
      const result = await pool.query(
        `INSERT INTO media (filename, filetype, fileurl, updated_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING *`,
        [title, 'video', watchUrl]
      );

      return res.status(201).json({
        success: true,
        message: 'YouTube video added successfully',
        data: {
          files: [{
            id: result.rows[0].id,
            filename: result.rows[0].filename,
            filetype: result.rows[0].filetype,
            fileurl: result.rows[0].fileurl,
            embedUrl: embedUrl,
            updated_at: result.rows[0].updated_at
          }]
        }
      });
    }

    // Handle file uploads
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      // Determine file type from mimetype
      let fileType = 'other';
      if (file.mimetype.startsWith('image/')) {
        fileType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        fileType = 'video';
      }

      // Create file URL (relative to uploads folder)
      // Videos go to /uploads/videos, images to /uploads/images
      const folder = fileType === 'video' ? 'videos' : 'images';
      const fileUrl = `/uploads/${folder}/${file.filename}`;

      // Insert into database
      const result = await pool.query(
        `INSERT INTO media (filename, filetype, fileurl, updated_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING *`,
        [file.filename, fileType, fileUrl]
      );

      uploadedFiles.push({
        id: result.rows[0].id,
        filename: result.rows[0].filename,
        filetype: result.rows[0].filetype,
        fileurl: result.rows[0].fileurl,
        updated_at: result.rows[0].updated_at
      });
    }

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: {
        files: uploadedFiles
      }
    });
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload media',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Get all media files with pagination
 */
async function getAllMedia(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const filetype = req.query.filetype || ''; // 'image' or 'video'

    let query = 'SELECT * FROM media';
    let params = [];
    let paramCount = 0;
    const conditions = [];

    // Add filetype filter if provided
    if (filetype && (filetype === 'image' || filetype === 'video')) {
      paramCount++;
      conditions.push(`filetype = $${paramCount}`);
      params.push(filetype);
    }

    // Add search filter if provided
    if (search) {
      paramCount++;
      conditions.push(`filename ILIKE $${paramCount}`);
      params.push(`%${search}%`);
    }

    // Combine conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM media';
    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(' AND ')}`;
    }
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add ordering and pagination
    paramCount++;
    query += ` ORDER BY updated_at DESC LIMIT $${paramCount}`;
    params.push(limit);
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        media: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all media error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch media'
    });
  }
}

/**
 * Get single media by ID
 */
async function getMediaById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM media WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }

    res.json({
      success: true,
      data: {
        media: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Get media by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch media'
    });
  }
}

/**
 * Delete media file and database record
 */
async function deleteMedia(req, res) {
  try {
    const { id } = req.params;

    // Get media record first
    const result = await pool.query(
      'SELECT * FROM media WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }

    const media = result.rows[0];

    // Delete file from filesystem (only if it's not a YouTube URL)
    if (media.fileurl && !media.fileurl.includes('youtube.com') && !media.fileurl.includes('youtu.be')) {
      // Determine folder based on filetype
      const folder = media.filetype === 'video' ? 'videos' : 'images';
      const filePath = path.join(config.dataDir, 'uploads', folder, media.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from database
    await pool.query('DELETE FROM media WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete media'
    });
  }
}

/**
 * Upload a single file and return a simplified response with { url }
 * Supports either multipart single file (field name: "file") or JSON body with youtubeUrl
 */
async function uploadSingleReturnUrl(req, res) {
  try {
    // If JSON YouTube URL
    if (req.body && req.body.youtubeUrl) {
      const youtubeUrl = req.body.youtubeUrl.trim();
      const title = req.body.title || 'YouTube Video';
      const videoId = extractYouTubeId(youtubeUrl);
      if (!videoId) {
        return res.status(400).json({ success: false, error: 'Invalid YouTube URL' });
      }
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const result = await pool.query(
        `INSERT INTO media (filename, filetype, fileurl, updated_at)
         VALUES ($1, $2, $3, NOW()) RETURNING *`,
        [title, 'video', watchUrl]
      );
      return res.status(201).json({ success: true, url: result.rows[0].fileurl });
    }

    // Normalize single file
    if (req.file && !req.files) {
      req.files = [req.file];
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const file = req.files[0];
    let fileType = 'other';
    if (file.mimetype.startsWith('image/')) fileType = 'image';
    else if (file.mimetype.startsWith('video/')) fileType = 'video';
    const folder = fileType === 'video' ? 'videos' : 'images';
    const fileUrl = `/uploads/${folder}/${file.filename}`;
    const result = await pool.query(
      `INSERT INTO media (filename, filetype, fileurl, updated_at)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [file.filename, fileType, fileUrl]
    );
    return res.status(201).json({ success: true, url: result.rows[0].fileurl });
  } catch (error) {
    console.error('uploadSingleReturnUrl error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload' });
  }
}

module.exports = {
  uploadMedia,
  getAllMedia,
  getMediaById,
  deleteMedia,
  uploadSingleReturnUrl
};
