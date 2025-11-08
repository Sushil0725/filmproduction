const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requireAdminRole } = require('../../middleware/security');
const { auditMiddleware } = require('../../middleware/audit');
const BackupManager = require('../../utils/backup');
const { logger } = require('../../middleware/logging');

const router = express.Router();
const backupManager = new BackupManager();

// Apply authentication and admin role to all routes
router.use(requireAuth);
router.use(requireAdminRole);

// GET /api/admin/backup - Get backup status and list
router.get('/', async (req, res) => {
  try {
    const backups = backupManager.listBackups();
    const health = await backupManager.healthCheck();
    
    res.json({
      success: true,
      data: {
        backups,
        health
      }
    });
  } catch (error) {
    logger.error('Failed to get backup status', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get backup status',
      message: error.message
    });
  }
});

// POST /api/admin/backup/database - Create database backup
router.post('/database',
  auditMiddleware('backup', 'database'),
  async (req, res) => {
    try {
      const backupFile = await backupManager.backupDatabase();
      
      logger.info('Database backup created', { 
        file: backupFile,
        userId: req.user.id 
      });
      
      res.json({
        success: true,
        data: { backupFile },
        message: 'Database backup created successfully'
      });
    } catch (error) {
      logger.error('Database backup failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to create database backup',
        message: error.message
      });
    }
  }
);

// POST /api/admin/backup/files - Create file system backup
router.post('/files',
  auditMiddleware('backup', 'files'),
  async (req, res) => {
    try {
      const backupFile = await backupManager.backupFiles();
      
      logger.info('File system backup created', { 
        file: backupFile,
        userId: req.user.id 
      });
      
      res.json({
        success: true,
        data: { backupFile },
        message: 'File system backup created successfully'
      });
    } catch (error) {
      logger.error('File system backup failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to create file system backup',
        message: error.message
      });
    }
  }
);

// POST /api/admin/backup/full - Create full system backup
router.post('/full',
  auditMiddleware('backup', 'full'),
  async (req, res) => {
    try {
      const backup = await backupManager.fullBackup();
      
      logger.info('Full system backup created', { 
        manifest: backup.manifest,
        userId: req.user.id 
      });
      
      res.json({
        success: true,
        data: backup,
        message: 'Full system backup created successfully'
      });
    } catch (error) {
      logger.error('Full system backup failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to create full system backup',
        message: error.message
      });
    }
  }
);

// POST /api/admin/backup/restore/database - Restore database from backup
router.post('/restore/database',
  auditMiddleware('restore', 'database'),
  async (req, res) => {
    try {
      const { backupFile } = req.body;
      
      if (!backupFile) {
        return res.status(400).json({
          success: false,
          error: 'Backup file path is required'
        });
      }
      
      await backupManager.restoreDatabase(backupFile);
      
      logger.info('Database restored', { 
        backupFile,
        userId: req.user.id 
      });
      
      res.json({
        success: true,
        message: 'Database restored successfully'
      });
    } catch (error) {
      logger.error('Database restore failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to restore database',
        message: error.message
      });
    }
  }
);

// POST /api/admin/backup/restore/files - Restore files from backup
router.post('/restore/files',
  auditMiddleware('restore', 'files'),
  async (req, res) => {
    try {
      const { backupFile } = req.body;
      
      if (!backupFile) {
        return res.status(400).json({
          success: false,
          error: 'Backup file path is required'
        });
      }
      
      await backupManager.restoreFiles(backupFile);
      
      logger.info('File system restored', { 
        backupFile,
        userId: req.user.id 
      });
      
      res.json({
        success: true,
        message: 'File system restored successfully'
      });
    } catch (error) {
      logger.error('File system restore failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to restore file system',
        message: error.message
      });
    }
  }
);

// DELETE /api/admin/backup/cleanup - Clean up old backups
router.delete('/cleanup',
  auditMiddleware('cleanup', 'backups'),
  async (req, res) => {
    try {
      const { daysToKeep = 30 } = req.body;
      
      backupManager.cleanupBackups(daysToKeep);
      
      logger.info('Backup cleanup completed', { 
        daysToKeep,
        userId: req.user.id 
      });
      
      res.json({
        success: true,
        message: 'Backup cleanup completed successfully'
      });
    } catch (error) {
      logger.error('Backup cleanup failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to cleanup backups',
        message: error.message
      });
    }
  }
);

module.exports = router;
