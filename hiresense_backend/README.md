# HireSense AI — Backend

Phase 1 establishes the backend foundation only.

## Current scope

- Node.js + Express API
- CommonJS JavaScript
- Environment configuration with dotenv
- MySQL connection pool with mysql2
- MongoDB connection with Mongoose
- Helmet
- CORS
- Morgan request logging
- Centralized 404/error handling
- Database-aware health endpoint
- Graceful shutdown

## Architecture

```text
React client (later)
       |
       | HTTP/JSON
       v
Express application
       |
       +---- middleware
       |
       +---- routes
       |
       +---- MySQL pool
       |
       +---- MongoDB/Mongoose
       |
       +---- services (added in later phases)
```

MySQL will own relational business data such as users, companies, jobs and applications.

MongoDB will own flexible resume/AI documents such as parsed resume profiles and match results.

The two databases are intentionally separate. There is no assumption of an automatic cross-database transaction.

## Requirements

- Node.js 20+
- MySQL 8+
- MongoDB 7+ (or a compatible MongoDB deployment)

## Setup

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and set your local MySQL and MongoDB values.

Create the MySQL database:

```sql
CREATE DATABASE hiresense;
```

Then start the API:

```bash
npm run dev
```

Or:

```bash
npm start
```

## Test

Root endpoint:

```text
GET http://localhost:5000/
```

Health endpoint:

```text
GET http://localhost:5000/api/health
```

Expected healthy response:

```json
{
  "success": true,
  "message": "HireSense AI backend is healthy",
  "data": {
    "api": "up",
    "mysql": "up",
    "mongodb": "up"
  }
}
```

If a dependency is unavailable, the health endpoint returns HTTP 503 instead of falsely reporting the backend as healthy.

## Next phase

Authentication with:

- users table
- bcrypt
- access JWT
- refresh-token rotation
- RBAC middleware
- auth routes/controllers/services
