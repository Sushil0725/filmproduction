const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const config = require('../config');
const { logger } = require('../middleware/logging');

const execAsync = promisify(exec);

class BackupManager {
  constructor() {
    this.backupDir = path.join(config.dataDir, 'backups');
    this.ensureBackupDirectory();
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Database backup
  async backupDatabase() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `db_backup_${timestamp}.sql`);
      
      logger.info('Starting database backup', { backupFile });
      
      const command = `pg_dump "${process.env.DATABASE_URL}" > "${backupFile}"`;
      await execAsync(command);
      
      const stats = fs.statSync(backupFile);
      logger.info('Database backup completed', {
        file: backupFile,
        size: `${(stats.size / 1024 / 1024).toFixed(2)}MB`
      });
      
      return backupFile;
    } catch (error) {
      logger.error('Database backup failed', { error: error.message });
      throw error;
    }
  }

  // File system backup
  async backupFiles() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `files_backup_${timestamp}.tar.gz`);
      
      logger.info('Starting file system backup', { backupFile });
      
      const command = `tar -czf "${backupFile}" -C "${config.dataDir}" .`;
      await execAsync(command);
      
      const stats = fs.statSync(backupFile);
      logger.info('File system backup completed', {
        file: backupFile,
        size: `${(stats.size / 1024 / 1024).toFixed(2)}MB`
      });
      
      return backupFile;
    } catch (error) {
      logger.error('File system backup failed', { error: error.message });
      throw error;
    }
  }

  // Full system backup
  async fullBackup() {
    try {
      logger.info('Starting full system backup');
      
      const [dbBackup, filesBackup] = await Promise.all([
        this.backupDatabase(),
        this.backupFiles()
      ]);
      
      // Create backup manifest
      const manifest = {
        timestamp: new Date().toISOString(),
        database: path.basename(dbBackup),
        files: path.basename(filesBackup),
        version: require('../../package.json').version
      };
      
      const manifestFile = path.join(this.backupDir, `manifest_${manifest.timestamp.replace(/[:.]/g, '-')}.json`);
      fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
      
      logger.info('Full system backup completed', { manifest: manifestFile });
      
      return {
        manifest,
        database: dbBackup,
        files: filesBackup
      };
    } catch (error) {
      logger.error('Full system backup failed', { error: error.message });
      throw error;
    }
  }

  // Restore from backup
  async restoreDatabase(backupFile) {
    try {
      if (!fs.existsSync(backupFile)) {
        throw new Error('Backup file not found');
      }
      
      logger.info('Starting database restore', { backupFile });
      
      const command = `psql "${process.env.DATABASE_URL}" < "${backupFile}"`;
      await execAsync(command);
      
      logger.info('Database restore completed');
    } catch (error) {
      logger.error('Database restore failed', { error: error.message });
      throw error;
    }
  }

  async restoreFiles(backupFile) {
    try {
      if (!fs.existsSync(backupFile)) {
        throw new Error('Backup file not found');
      }
      
      logger.info('Starting file system restore', { backupFile });
      
      // Create temporary directory for extraction
      const tempDir = path.join(this.backupDir, 'temp_restore');
      fs.mkdirSync(tempDir, { recursive: true });
      
      try {
        // Extract backup
        const extractCommand = `tar -xzf "${backupFile}" -C "${tempDir}"`;
        await execAsync(extractCommand);
        
        // Copy files to data directory
        const copyCommand = `cp -r "${tempDir}"/* "${config.dataDir}"/`;
        await execAsync(copyCommand);
        
        logger.info('File system restore completed');
      } finally {
        // Clean up temporary directory
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (error) {
      logger.error('File system restore failed', { error: error.message });
      throw error;
    }
  }

  // List available backups
  listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backups = files
        .filter(file => file.endsWith('.sql') || file.endsWith('.tar.gz'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
        .sort((a, b) => b.created - a.created);
      
      return backups;
    } catch (error) {
      logger.error('Failed to list backups', { error: error.message });
      return [];
    }
  }

  // Clean up old backups
  cleanupBackups(daysToKeep = 30) {
    try {
      const files = fs.readdirSync(this.backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      let cleanedCount = 0;
      let freedSpace = 0;
      
      files.forEach(file => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          freedSpace += stats.size;
          fs.unlinkSync(filePath);
          cleanedCount++;
          logger.info('Cleaned up old backup', { file });
        }
      });
      
      logger.info('Backup cleanup completed', {
        filesRemoved: cleanedCount,
        spaceFreed: `${(freedSpace / 1024 / 1024).toFixed(2)}MB`
      });
    } catch (error) {
      logger.error('Backup cleanup failed', { error: error.message });
    }
  }

  // Health check
  async healthCheck() {
    try {
      const backups = this.listBackups();
      const recentBackups = backups.filter(backup => {
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        return backup.created > dayAgo;
      });
      
      return {
        status: 'healthy',
        totalBackups: backups.length,
        recentBackups: recentBackups.length,
        lastBackup: backups[0]?.created || null,
        diskSpace: await this.getDiskSpace()
      };
    } catch (error) {
      logger.error('Backup health check failed', { error: error.message });
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async getDiskSpace() {
    try {
      const { stdout } = await execAsync(`df -h "${this.backupDir}"`);
      const lines = stdout.trim().split('\n');
      const data = lines[1].split(/\s+/);
      return {
        total: data[1],
        used: data[2],
        available: data[3],
        percentage: data[4]
      };
    } catch (error) {
      logger.error('Failed to get disk space', { error: error.message });
      return null;
    }
  }
}

module.exports = BackupManager;
