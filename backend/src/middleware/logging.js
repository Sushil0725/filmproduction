const fs = require('fs');
const path = require('path');
const config = require('../config');

class Logger {
  constructor() {
    this.logDir = path.join(config.dataDir, 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
  }

  writeToFile(filename, message) {
    const logFile = path.join(this.logDir, filename);
    fs.appendFileSync(logFile, message);
  }

  info(message, meta = {}) {
    const formatted = this.formatMessage('info', message, meta);
    console.log(formatted.trim());
    this.writeToFile('app.log', formatted);
  }

  warn(message, meta = {}) {
    const formatted = this.formatMessage('warn', message, meta);
    console.warn(formatted.trim());
    this.writeToFile('app.log', formatted);
    this.writeToFile('warnings.log', formatted);
  }

  error(message, meta = {}) {
    const formatted = this.formatMessage('error', message, meta);
    console.error(formatted.trim());
    this.writeToFile('app.log', formatted);
    this.writeToFile('errors.log', formatted);
  }

  debug(message, meta = {}) {
    if (config.env === 'development') {
      const formatted = this.formatMessage('debug', message, meta);
      console.debug(formatted.trim());
      this.writeToFile('debug.log', formatted);
    }
  }

  // Request logging middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Log request
      this.info('Request started', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id
      });

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        const duration = Date.now() - start;
        
        logger.info('Request completed', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
          userId: req.user?.id
        });

        // Log errors
        if (res.statusCode >= 400) {
          logger.error('Request failed', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userId: req.user?.id
          });
        }

        originalEnd.call(this, chunk, encoding);
      };

      next();
    };
  }

  // Error logging middleware
  errorLogger() {
    return (err, req, res, next) => {
      this.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userId: req.user?.id
      });

      // Don't expose error details in production
      const errorResponse = {
        success: false,
        error: config.env === 'production' ? 'Internal server error' : err.message
      };

      if (config.env === 'development') {
        errorResponse.stack = err.stack;
      }

      res.status(err.status || 500).json(errorResponse);
    };
  }

  // Security event logging
  securityEvent(event, details = {}) {
    this.warn('Security event', {
      event,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  // Performance logging
  performance(operation, duration, meta = {}) {
    this.info('Performance metric', {
      operation,
      duration: `${duration}ms`,
      ...meta
    });
  }

  // Database operation logging
  dbOperation(operation, table, duration, meta = {}) {
    this.debug('Database operation', {
      operation,
      table,
      duration: `${duration}ms`,
      ...meta
    });
  }

  // Clean up old log files (run this periodically)
  cleanupLogs(daysToKeep = 30) {
    try {
      const files = fs.readdirSync(this.logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          this.info('Cleaned up old log file', { file });
        }
      });
    } catch (error) {
      this.error('Failed to cleanup logs', { error: error.message });
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Express middleware for request/response logging
const requestLoggingMiddleware = logger.requestLogger();
const errorLoggingMiddleware = logger.errorLogger();

module.exports = {
  logger,
  requestLoggingMiddleware,
  errorLoggingMiddleware
};
