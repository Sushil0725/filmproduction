const express = require('express');
const { readText, readJSON } = require('../utils/fileStore');
const config = require('../config');
const projectsCtrl = require('../controllers/projects');
const servicesCtrl = require('../controllers/services');

const router = express.Router();

router.get('/text/:name', async (req, res) => {
  const name = req.params.name;
  try {
    const content = await readText(config.dataDir, name);
    res.type('text/plain').send(content);
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

router.get('/json/:name', async (req, res) => {
  const name = req.params.name;
  try {
    const obj = await readJSON(config.dataDir, name);
    res.json(obj);
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

router.get('/projects', projectsCtrl.listPublic);
router.get('/projects/:id', projectsCtrl.getPublicById);
router.get('/services', servicesCtrl.listPublic);

module.exports = router;
