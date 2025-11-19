const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { securityHeaders, sanitizeInput, apiLimiter } = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media');
const contentRoutes = require('./routes/content');
const servicesRoutes = require('./routes/services');
const projectsRoutes = require('./routes/projects');
const videosRoutes = require('./routes/videos');
const todosRoutes = require('./routes/todos');
const uploadRoute = require('./routes/upload');

// Initialize Express app
const app = express();

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);

// CORS configuration
const corsOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

if (config.corsOrigin === '*') {
  // For development: allow all origins
  corsOptions.origin = (origin, callback) => {
    callback(null, true);
  };
} else {
  corsOptions.origin = config.corsOrigin.split(',').map(origin => origin.trim());
}

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Logging middleware
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Static file serving for uploads
app.use('/uploads', express.static(path.join(config.dataDir, 'uploads')));

// API rate limiting (applied to all /api routes)
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/media', mediaRoutes);
app.use('/api', contentRoutes); // /public/* and /admin/json|text|list
app.use('/api/admin/services', servicesRoutes);
app.use('/api/admin/projects', projectsRoutes);
app.use('/api/admin/videos', videosRoutes);
app.use('/api/admin/todos', todosRoutes);
app.use('/api/admin/upload', uploadRoute);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Don't leak error details in production
  const message = config.env === 'development' 
    ? err.message 
    : 'Internal server error';

  res.status(err.status || 500).json({
    success: false,
    error: message,
    ...(config.env === 'development' && { stack: err.stack })
  });
});

// Initialize media table on startup
const { createMediaTable } = require('./utils/createMediaTable');
createMediaTable().catch(err => {
  console.error('⚠️ Warning: Could not initialize media table:', err.message);
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.env}`);
  console.log(`🔐 JWT expires in: ${config.jwtExpiresIn}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
