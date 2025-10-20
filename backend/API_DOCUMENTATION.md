# FilmPro Backend API Documentation

## Overview

This is a production-level backend API for the FilmPro content management system. It provides comprehensive CRUD operations for managing projects, services, content, and file uploads with advanced security, logging, and backup capabilities.

## Base URL
```
http://localhost:4000/api
```

## Authentication

All admin endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication

#### POST /auth/login
Login to get JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "username": "admin",
      "role": "admin"
    }
  }
}
```

### Projects Management

#### GET /admin/projects
Get all projects with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `status` (string): Filter by status (active, archived, draft)
- `category` (string): Filter by category (film, documentary, short, music, commercial, other)
- `featured` (boolean): Filter by featured status
- `search` (string): Search in title, subtitle, description
- `sortBy` (string): Sort field (created_at, updated_at, title)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    },
    "stats": {
      "total": 50,
      "active": 45,
      "archived": 5,
      "featured": 10
    }
  }
}
```

#### GET /admin/projects/:id
Get single project by ID.

#### POST /admin/projects
Create new project.

**Request:**
```json
{
  "title": "Project Title",
  "subtitle": "Project Subtitle",
  "description": "Project description",
  "image_url": "https://example.com/image.jpg",
  "category": "film",
  "year": 2024,
  "status": "active",
  "featured": false
}
```

#### PUT /admin/projects/:id
Update project.

#### DELETE /admin/projects/:id
Delete project.

#### POST /admin/projects/bulk-update
Bulk update multiple projects.

**Request:**
```json
{
  "ids": ["id1", "id2", "id3"],
  "updates": {
    "status": "archived"
  }
}
```

#### GET /admin/projects/stats
Get project statistics.

### Services Management

#### GET /admin/services
Get all services with filtering and pagination.

**Query Parameters:** Same as projects

#### GET /admin/services/:id
Get single service by ID.

#### POST /admin/services
Create new service.

**Request:**
```json
{
  "title": "Service Title",
  "description": "Service description",
  "image_url": "https://example.com/image.jpg",
  "category": "production",
  "features": ["Feature 1", "Feature 2"],
  "pricing": {
    "starting": 1000,
    "currency": "USD"
  },
  "status": "active",
  "order_index": 0
}
```

#### PUT /admin/services/:id
Update service.

#### DELETE /admin/services/:id
Delete service.

#### POST /admin/services/reorder
Reorder services.

**Request:**
```json
{
  "serviceIds": ["id1", "id2", "id3"]
}
```

#### GET /admin/services/stats
Get service statistics.

### Content Management

#### GET /admin/content
Get all content with filtering.

**Query Parameters:**
- `page`, `limit`: Pagination
- `type`: Filter by type (text, json, html, markdown)
- `search`: Search in key and value

#### GET /admin/content/:key
Get content by key.

#### POST /admin/content
Create or update content (upsert).

**Request:**
```json
{
  "key": "hero_title",
  "type": "text",
  "value": "Welcome to FilmPro",
  "metadata": {
    "description": "Main hero title"
  }
}
```

#### PUT /admin/content/:key
Update content.

#### DELETE /admin/content/:key
Delete content.

#### POST /admin/content/bulk-upsert
Bulk upsert content.

**Request:**
```json
{
  "contentItems": [
    {
      "key": "title",
      "type": "text",
      "value": "New Title"
    }
  ]
}
```

#### GET /admin/content/stats
Get content statistics.

### File Uploads

#### POST /admin/uploads/single
Upload single file.

**Request:** Multipart form data
- `file`: File to upload
- `category`: File category (images, documents, videos, audio, other)
- `alt_text`: Alt text for images

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file-id",
    "filename": "uploaded-file.jpg",
    "url": "/uploads/images/uploaded-file.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg",
    "category": "images"
  }
}
```

#### POST /admin/uploads/multiple
Upload multiple files (max 5).

#### GET /admin/uploads
List uploaded files.

**Query Parameters:**
- `page`, `limit`: Pagination
- `category`: Filter by category
- `mimeType`: Filter by MIME type
- `search`: Search in filename and alt text

#### DELETE /admin/uploads/:id
Delete uploaded file.

### Audit Logs

#### GET /admin/audit
Get audit logs.

**Query Parameters:**
- `page`, `limit`: Pagination
- `action`: Filter by action
- `resourceType`: Filter by resource type
- `userId`: Filter by user ID
- `startDate`, `endDate`: Date range

### Backup Management

#### GET /admin/backup
Get backup status and list.

#### POST /admin/backup/database
Create database backup.

#### POST /admin/backup/files
Create file system backup.

#### POST /admin/backup/full
Create full system backup.

#### POST /admin/backup/restore/database
Restore database from backup.

**Request:**
```json
{
  "backupFile": "/path/to/backup.sql"
}
```

#### POST /admin/backup/restore/files
Restore files from backup.

#### DELETE /admin/backup/cleanup
Clean up old backups.

**Request:**
```json
{
  "daysToKeep": 30
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `413`: Payload Too Large
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Rate Limiting

- **Authentication**: 5 attempts per 15 minutes
- **File Uploads**: 20 uploads per hour
- **Admin API**: 200 requests per 5 minutes
- **General API**: 100 requests per 15 minutes

## Security Features

- JWT authentication with role-based access control
- Input sanitization and validation
- Rate limiting on all endpoints
- Security headers (CSP, HSTS, etc.)
- Audit logging for all operations
- File type validation for uploads
- Request size limiting

## Production Deployment

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/filmpro

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=2h

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-password

# CORS
CORS_ORIGIN=http://localhost:3000

# Data Directory
DATA_DIR=/path/to/data/directory
```

### Database Setup

1. Run migrations:
```bash
npm run migrate
```

2. The system will automatically create:
   - Database tables
   - Default admin user
   - Initial content

### Backup Strategy

- **Database**: Automated PostgreSQL dumps
- **Files**: Compressed tar archives
- **Retention**: Configurable (default: 30 days)
- **Monitoring**: Health checks and alerts

## Monitoring and Logging

- **Request Logging**: All API requests/responses
- **Error Logging**: Detailed error tracking
- **Security Events**: Failed logins, suspicious activity
- **Performance Metrics**: Response times, database queries
- **Audit Trail**: All admin operations

## Health Check

```
GET /healthz
```

Returns system status and environment information.

## Support

For issues or questions, check the logs in `/data/logs/` or contact the development team.
