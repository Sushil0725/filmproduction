const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAuth } = require('../../middleware/auth');
const { validateFileUpload, handleValidationErrors } = require('../../middleware/validation');
const { auditMiddleware } = require('../../middleware/audit');
const config = require('../../config');

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category || 'other';
    const uploadDir = path.join(config.dataDir, 'uploads', category);
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const safeBase = base.replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    cb(null, `${safeBase}_${timestamp}_${random}${ext.toLowerCase()}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5 // Maximum 5 files per request
  },
  fileFilter: (req, file, cb) => {
    // Define allowed file types
    const allowedTypes = {
      'images': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      'documents': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'videos': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
      'audio': ['audio/mp3', 'audio/wav', 'audio/m4a'],
      'other': ['application/octet-stream']
    };

    const category = req.body.category || 'other';
    const allowedMimes = allowedTypes[category] || allowedTypes.other;

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed for category ${category}`), false);
    }
  }
});

// POST /api/admin/uploads - Upload single file
router.post('/single',
  validateFileUpload,
  handleValidationErrors,
  upload.single('file'),
  auditMiddleware('upload', 'file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const fileUrl = `/uploads/${req.body.category || 'other'}/${req.file.filename}`;
      
      // Log file upload to database
      const pool = require('../../config/db');
      const query = `
        INSERT INTO file_uploads (filename, original_name, file_path, file_size, mime_type, category, alt_text, uploaded_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const values = [
        req.file.filename,
        req.file.originalname,
        req.file.path,
        req.file.size,
        req.file.mimetype,
        req.body.category || 'other',
        req.body.alt_text || null,
        req.user.id
      ];

      const result = await pool.query(query, values);
      const uploadedFile = result.rows[0];

      res.json({
        success: true,
        data: {
          id: uploadedFile.id,
          filename: req.file.filename,
          originalName: req.file.originalname,
          url: fileUrl,
          size: req.file.size,
          mimeType: req.file.mimetype,
          category: req.body.category || 'other',
          altText: req.body.alt_text || null
        },
        message: 'File uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload file',
        message: error.message
      });
    }
  }
);

// POST /api/admin/uploads/multiple - Upload multiple files
router.post('/multiple',
  validateFileUpload,
  handleValidationErrors,
  upload.array('files', 5),
  auditMiddleware('bulk_upload', 'file'),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded'
        });
      }

      const uploadedFiles = [];
      const pool = require('../../config/db');

      for (const file of req.files) {
        const fileUrl = `/uploads/${req.body.category || 'other'}/${file.filename}`;
        
        const query = `
          INSERT INTO file_uploads (filename, original_name, file_path, file_size, mime_type, category, alt_text, uploaded_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;
        
        const values = [
          file.filename,
          file.originalname,
          file.path,
          file.size,
          file.mimetype,
          req.body.category || 'other',
          req.body.alt_text || null,
          req.user.id
        ];

        const result = await pool.query(query, values);
        const uploadedFile = result.rows[0];

        uploadedFiles.push({
          id: uploadedFile.id,
          filename: file.filename,
          originalName: file.originalname,
          url: fileUrl,
          size: file.size,
          mimeType: file.mimetype,
          category: req.body.category || 'other',
          altText: req.body.alt_text || null
        });
      }

      res.json({
        success: true,
        data: uploadedFiles,
        message: `${uploadedFiles.length} files uploaded successfully`
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload files',
        message: error.message
      });
    }
  }
);

// GET /api/admin/uploads - List uploaded files
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      mimeType,
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const pool = require('../../config/db');
    
    let query = `
      SELECT fu.*, au.username as uploaded_by_username
      FROM file_uploads fu
      LEFT JOIN admin_users au ON fu.uploaded_by = au.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 0;

    if (category) {
      query += ` AND fu.category = $${++paramCount}`;
      values.push(category);
    }

    if (mimeType) {
      query += ` AND fu.mime_type = $${++paramCount}`;
      values.push(mimeType);
    }

    if (search) {
      query += ` AND (fu.original_name ILIKE $${++paramCount} OR fu.alt_text ILIKE $${++paramCount})`;
      values.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY fu.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);
    
    // Get total count
    const countQuery = query.replace(/SELECT fu\.\*, au\.username as uploaded_by_username FROM file_uploads fu LEFT JOIN admin_users au ON fu\.uploaded_by = au\.id/, 'SELECT COUNT(*) FROM file_uploads fu')
      .replace(/ORDER BY fu\.created_at DESC LIMIT \$\d+ OFFSET \$\d+/, '');
    
    const countResult = await pool.query(countQuery, values.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        files: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch files',
      message: error.message
    });
  }
});

// DELETE /api/admin/uploads/:id - Delete uploaded file
router.delete('/:id',
  auditMiddleware('delete', 'file', (req) => req.params.id),
  async (req, res) => {
    try {
      const { id } = req.params;
      const pool = require('../../config/db');
      
      // Get file info first
      const fileQuery = 'SELECT * FROM file_uploads WHERE id = $1';
      const fileResult = await pool.query(fileQuery, [id]);
      
      if (fileResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }

      const file = fileResult.rows[0];
      
      // Delete file from filesystem
      try {
        if (fs.existsSync(file.file_path)) {
          fs.unlinkSync(file.file_path);
        }
      } catch (fsError) {
        console.error('Error deleting file from filesystem:', fsError);
        // Continue with database deletion even if file deletion fails
      }

      // Delete from database
      await pool.query('DELETE FROM file_uploads WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete file',
        message: error.message
      });
    }
  }
);

module.exports = router;
