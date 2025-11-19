const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadSingleReturnUrl } = require('../controllers/MediaController');

router.use(verifyToken);

router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message || 'File upload error' });
    }
    next();
  });
}, uploadSingleReturnUrl);

module.exports = router;
