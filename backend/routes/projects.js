const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getProjects, getProjectStats, getProject, createProject, updateProject, deleteProject } = require('../controllers/ProjectController');

router.use(verifyToken);

router.get('/', getProjects);
router.get('/stats', getProjectStats);
router.get('/:id', getProject);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
