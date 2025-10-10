# FilmPro Backend (File-based CMS)

Express API with file storage for images, text, and JSON. No database.

## Features
- JWT-based admin auth: `POST /api/auth/login`, `GET /api/auth/me`
- Public content APIs:
  - `GET /api/public/text/:name` -> reads `backend/datas/text/:name.txt`
  - `GET /api/public/json/:name` -> reads `backend/datas/json/:name.json`
- Admin content APIs (require Bearer token):
  - `PUT /api/admin/text/:name` (text/plain or JSON `{ content: string }`)
  - `PUT /api/admin/json/:name` (JSON body)
  - `POST /api/admin/upload` (multipart field `file`)
  - `GET /api/admin/list` -> lists text, json, uploads
- Static uploads under `/uploads/*` (served from `backend/datas/uploads`)

## Setup
1. Copy env file and set secrets:
   ```powershell
   Copy-Item .env.example .env
   ```
   Edit `.env` to set `ADMIN_USERNAME`, `ADMIN_PASSWORD` (or `ADMIN_PASSWORD_HASH`), and `JWT_SECRET`.

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Run in dev:
   ```powershell
   npm run dev
   ```
   Server: http://localhost:4000

## Example requests
- Login:
  ```http
  POST /api/auth/login
  Content-Type: application/json
  {"username":"admin","password":"<your-password>"}
  ```
  Response: `{ "token": "..." }`

- Save text:
  ```http
  PUT /api/admin/text/hero
  Authorization: Bearer <token>
  Content-Type: text/plain
  Hello world
  ```

- Save JSON:
  ```http
  PUT /api/admin/json/site
  Authorization: Bearer <token>
  Content-Type: application/json
  {"title":"Film Production House"}
  ```

- Upload file:
  ```http
  POST /api/admin/upload
  Authorization: Bearer <token>
  (multipart/form-data with field name: file)
  ```

- Public fetch:
  - `GET /api/public/text/hero`
  - `GET /api/public/json/site`
  - `GET /uploads/<filename>`
