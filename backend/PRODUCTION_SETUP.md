# FilmPro Backend - Production Setup Guide

## Overview

This guide will help you set up the FilmPro backend for production deployment with all security, monitoring, and backup features enabled.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- 2GB+ RAM
- 10GB+ disk space
- SSL certificate (for production)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
# Environment
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/filmpro

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=2h

# Admin User (change these!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_EMAIL=admin@yourdomain.com

# CORS (set to your frontend domain)
CORS_ORIGIN=https://yourdomain.com

# Data Directory (absolute path)
DATA_DIR=/var/lib/filmpro/data

# Optional: IP Whitelist (comma-separated)
# ALLOWED_IPS=192.168.1.100,10.0.0.50
```

### 3. Database Setup

#### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE filmpro;
CREATE USER filmpro_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE filmpro TO filmpro_user;
\q
```

#### Run Migrations
```bash
npm run migrate
```

This will create all necessary tables, indexes, and default data.

### 4. Start the Application

```bash
# Development
npm run dev

# Production
npm start
```

## Production Deployment

### Using PM2 (Recommended)

1. Install PM2:
```bash
npm install -g pm2
```

2. Create PM2 ecosystem file (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'filmpro-backend',
    script: 'App.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

3. Start with PM2:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Using Docker

1. Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN addgroup -g 1001 -S nodejs
RUN adduser -S filmpro -u 1001

USER filmpro

EXPOSE 4000

CMD ["npm", "start"]
```

2. Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://filmpro:password@db:5432/filmpro
    volumes:
      - ./data:/var/lib/filmpro/data
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=filmpro
      - POSTGRES_USER=filmpro
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

3. Deploy:
```bash
docker-compose up -d
```

## Security Configuration

### 1. Firewall Setup

```bash
# Allow only necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443  # HTTPS
ufw allow 4000 # API (if not behind reverse proxy)
ufw enable
```

### 2. Reverse Proxy (Nginx)

Create `/etc/nginx/sites-available/filmpro`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        proxy_pass http://localhost:4000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

## Monitoring and Logging

### 1. Log Rotation

Create `/etc/logrotate.d/filmpro`:
```
/var/lib/filmpro/data/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 filmpro filmpro
    postrotate
        pm2 reload filmpro-backend
    endscript
}
```

### 2. System Monitoring

Install monitoring tools:
```bash
# Install htop for system monitoring
sudo apt install htop

# Install PostgreSQL monitoring
sudo apt install postgresql-contrib
```

### 3. Health Checks

Set up automated health checks:
```bash
# Create health check script
cat > /usr/local/bin/filmpro-health.sh << 'EOF'
#!/bin/bash
curl -f http://localhost:4000/healthz || exit 1
EOF

chmod +x /usr/local/bin/filmpro-health.sh

# Add to crontab for monitoring
echo "*/5 * * * * /usr/local/bin/filmpro-health.sh" | crontab -
```

## Backup Strategy

### 1. Automated Backups

Create backup script (`/usr/local/bin/filmpro-backup.sh`):
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/filmpro"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump $DATABASE_URL > $BACKUP_DIR/db_$DATE.sql

# File backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz -C /var/lib/filmpro/data .

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

Make it executable and add to crontab:
```bash
chmod +x /usr/local/bin/filmpro-backup.sh
echo "0 2 * * * /usr/local/bin/filmpro-backup.sh" | crontab -
```

### 2. Database Maintenance

```bash
# Weekly database maintenance
echo "0 3 * * 0 psql $DATABASE_URL -c 'VACUUM ANALYZE;'" | crontab -
```

## Performance Optimization

### 1. PostgreSQL Tuning

Edit `/etc/postgresql/15/main/postgresql.conf`:
```conf
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB

# Connection settings
max_connections = 100

# Logging
log_statement = 'all'
log_min_duration_statement = 1000
```

### 2. Node.js Optimization

```bash
# Increase file descriptor limits
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check firewall settings

2. **Permission Denied**
   - Check file permissions on data directory
   - Ensure user has proper access

3. **Rate Limiting**
   - Check if IP is whitelisted
   - Verify rate limit settings

### Log Locations

- Application logs: `/var/lib/filmpro/data/logs/`
- PM2 logs: `pm2 logs filmpro-backend`
- Nginx logs: `/var/log/nginx/`
- PostgreSQL logs: `/var/log/postgresql/`

### Performance Monitoring

```bash
# Check system resources
htop

# Check database connections
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"

# Check application status
pm2 status
pm2 monit
```

## Security Checklist

- [ ] Change default admin password
- [ ] Set strong JWT secret
- [ ] Configure CORS properly
- [ ] Set up SSL/TLS
- [ ] Configure firewall
- [ ] Set up IP whitelist (if needed)
- [ ] Enable log monitoring
- [ ] Set up automated backups
- [ ] Regular security updates

## Support

For issues or questions:
1. Check the logs first
2. Review this documentation
3. Check the API documentation
4. Contact the development team

## Maintenance Schedule

- **Daily**: Monitor logs and system health
- **Weekly**: Review backup integrity
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and rotate secrets
