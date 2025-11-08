const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Import new admin routes
const projectsRouter = require('./admin/projects');
const servicesRouter = require('./admin/services');
const contentRouter = require('./admin/content');
const uploadsRouter = require('./admin/uploads');
const videosRouter = require('./admin/videos');
const jsonFilesRouter = require('./admin/json-files');
const todosRouter = require('./admin/todos');
const auditRouter = require('./admin/audit');
const backupRouter = require('./admin/backup');

// Apply authentication to all routes
router.use(requireAuth);

// Mount admin routes
router.use('/projects', projectsRouter);
router.use('/services', servicesRouter);
router.use('/content', contentRouter);
router.use('/uploads', uploadsRouter);
router.use('/videos', videosRouter);
router.use('/json-files', jsonFilesRouter);
router.use('/todos', todosRouter);
router.use('/audit', auditRouter);
router.use('/backup', backupRouter);

// Legacy routes for backward compatibility
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { writeText, writeJSON, listBasenames, sanitizeName } = require('../utils/fileStore');
const config = require('../config');

// Multer storage for legacy uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(config.dataDir, 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const safeBase = sanitizeName(base) || 'file';
    const stamp = Date.now();
    cb(null, `${safeBase}-${stamp}${ext.toLowerCase()}`);
  },
});

const upload = multer({ storage });

// Legacy routes (deprecated - use new API endpoints)
router.put('/text/:name', express.text({ type: ['text/*', 'text/plain'], limit: '1mb' }), async (req, res) => {
  const name = req.params.name;
  const body = req.body;
  const content = typeof body === 'string' && body.length ? body : (body && body.content) || '';
  try {
    const p = await writeText(config.dataDir, name, content);
    res.json({ ok: true, path: p, name });
  } catch (e) {
    res.status(500).json({ error: 'Failed to write text' });
  }
});

router.put('/json/:name', async (req, res) => {
  const name = req.params.name;
  const obj = req.body && typeof req.body === 'object' ? req.body : {};
  try {
    const p = await writeJSON(config.dataDir, name, obj);
    res.json({ ok: true, path: p, name });
  } catch (e) {
    res.status(500).json({ error: 'Failed to write json' });
  }
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ ok: true, filename: req.file.filename, url: fileUrl });
});

router.get('/list', async (req, res) => {
  const [texts, jsons] = await Promise.all([
    listBasenames(config.dataDir, 'text', 'txt'),
    listBasenames(config.dataDir, 'json', 'json'),
  ]);
  try {
    const uploadsDir = path.join(config.dataDir, 'uploads');
    const files = await fs.promises.readdir(uploadsDir);
    const uploads = files.map((f) => ({ filename: f, url: `/uploads/${f}` }));
    res.json({ text: texts, json: jsons, uploads });
  } catch {
    res.json({ text: texts, json: jsons, uploads: [] });
  }
});

module.exports = router;
