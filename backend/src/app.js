const path = require('path');
const express = require('express');
const cors = require('cors');
const config = require('./config');
const { ensureDataDirs } = require('./utils/ensureDirs');
const { 
  securityHeaders, 
  sanitizeInput, 
  requestSizeLimiter,
  authLimiter,
  apiLimiter,
  adminLimiter
} = require('./middleware/security');
const { requestLoggingMiddleware, errorLoggingMiddleware } = require('./middleware/logging');

const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

// Ensure storage directories exist
ensureDataDirs(config.dataDir);

const app = express();

// Security headers
app.use(securityHeaders);

// CORS
app.use(cors({ 
  origin: config.corsOrigin === '*' ? true : config.corsOrigin,
  credentials: true
}));

// Request logging
app.use(requestLoggingMiddleware);

// Body parsers with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request size limiter
app.use(requestSizeLimiter('10mb'));

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/admin/uploads', require('./middleware/security').uploadLimiter);
app.use('/api/admin', adminLimiter);
app.use('/api', apiLimiter);

// Serve uploads statically
app.use('/uploads', express.static(path.join(config.dataDir, 'uploads')));

// Health check
app.get('/healthz', (req, res) => res.json({ 
  ok: true, 
  env: config.env,
  timestamp: new Date().toISOString()
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware (must be last)
app.use(errorLoggingMiddleware);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

module.exports = { app };
