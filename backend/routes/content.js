const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getPublicJson,
  getPublicText,
  putAdminJson,
  putAdminText,
  getAdminList
} = require('../controllers/ContentController');
const { getPublicProjects } = require('../controllers/ProjectController');

// Public content
router.get('/public/json/:key', getPublicJson);
router.get('/public/text/:key', getPublicText);
router.get('/public/projects', getPublicProjects);

// Admin content management
router.get('/admin/list', verifyToken, getAdminList);
router.put('/admin/json/:key', verifyToken, putAdminJson);
router.put('/admin/text/:key', verifyToken, putAdminText);

module.exports = router;
