const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { ensureDataDirs } = require('./utils/ensureDirs');
const { initTables } = require('./models/init');

const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

// Ensure storage directories exist
ensureDataDirs(config.dataDir);

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin }));

// Logging
app.use(morgan('dev'));

// Body parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate-limit login to mitigate brute force
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/auth/login', authLimiter);

// Serve uploads statically
app.use('/uploads', express.static(path.join(config.dataDir, 'uploads')));

// Health check
app.get('/healthz', (req, res) => res.json({ ok: true, env: config.env }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

initTables().catch((e) => {
  console.error('Failed to initialize database tables:', e.message);
});

module.exports = { app };
