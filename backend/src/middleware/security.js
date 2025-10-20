const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Enhanced rate limiting for different endpoints
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message || 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
      res.status(429).json({
        success: false,
        error: message || 'Too many requests, please try again later',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Rate limits for different operations
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many login attempts, please try again in 15 minutes'
);

const uploadLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  20, // 20 uploads per hour
  'Upload limit exceeded, please try again later'
);

const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per 15 minutes
  'API rate limit exceeded, please slow down'
);

const adminLimiter = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  200, // 200 requests per 5 minutes
  'Admin API rate limit exceeded'
);

// Enhanced security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = sanitizeValue(value);
        }
      }
      return sanitized;
    }
    return sanitizeValue(obj);
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// IP whitelist middleware (optional)
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next(); // No whitelist configured
    }

    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.includes(clientIP)) {
      next();
    } else {
      console.warn(`Blocked request from non-whitelisted IP: ${clientIP}`);
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
  };
};

// Request size limiter
const requestSizeLimiter = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxSizeBytes = parseInt(maxSize) * 1024 * 1024; // Convert MB to bytes

    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        success: false,
        error: `Request too large. Maximum size allowed: ${maxSize}`
      });
    }

    next();
  };
};

// Admin role middleware
const requireAdminRole = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin role required'
    });
  }

  next();
};

// Editor or Admin role middleware
const requireEditorRole = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (!['admin', 'editor'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Editor or Admin role required'
    });
  }

  next();
};

module.exports = {
  authLimiter,
  uploadLimiter,
  apiLimiter,
  adminLimiter,
  securityHeaders,
  sanitizeInput,
  ipWhitelist,
  requestSizeLimiter,
  requireAdminRole,
  requireEditorRole
};
