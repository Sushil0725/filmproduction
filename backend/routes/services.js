const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getServices, getServiceStats } = require('../controllers/ServiceController');

router.use(verifyToken);

router.get('/', getServices);
router.get('/stats', getServiceStats);

module.exports = router;
