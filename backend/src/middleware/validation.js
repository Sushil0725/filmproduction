const { body, param, query, validationResult } = require('express-validator');

// Project validation rules
const validateProject = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Subtitle must be less than 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('category')
    .optional()
    .isIn(['film', 'documentary', 'short', 'music', 'commercial', 'other'])
    .withMessage('Category must be one of: film, documentary, short, music, commercial, other'),
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
    .withMessage('Year must be a valid year'),
  body('status')
    .optional()
    .isIn(['active', 'archived', 'draft'])
    .withMessage('Status must be one of: active, archived, draft'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean value')
];

// Service validation rules
const validateService = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('category')
    .optional()
    .isIn(['production', 'post-production', 'casting', 'distribution', 'other'])
    .withMessage('Category must be one of: production, post-production, casting, distribution, other'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  body('pricing')
    .optional()
    .isObject()
    .withMessage('Pricing must be an object'),
  body('status')
    .optional()
    .isIn(['active', 'archived', 'draft'])
    .withMessage('Status must be one of: active, archived, draft'),
  body('order_index')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order index must be a non-negative integer')
];

// JSON file validation rules
const validateJsonFile = [
  body('filename')
    .trim()
    .isLength({ min: 1, max: 255 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Filename is required and must contain only alphanumeric characters, underscores, and hyphens'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .custom((value) => {
      try {
        JSON.parse(value);
        return true;
      } catch (error) {
        throw new Error('Content must be valid JSON');
      }
    })
];

// UUID parameter validation
const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format')
];

// Query parameter validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['created_at', 'updated_at', 'title', 'order_index'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// File upload validation
const validateFileUpload = [
  body('category')
    .optional()
    .isIn(['images', 'documents', 'videos', 'audio', 'other'])
    .withMessage('Category must be one of: images, documents, videos, audio, other'),
  body('alt_text')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Alt text must be less than 500 characters')
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

module.exports = {
  validateProject,
  validateService,
  validateJsonFile,
  validateUUID,
  validatePagination,
  validateFileUpload,
  handleValidationErrors
};
