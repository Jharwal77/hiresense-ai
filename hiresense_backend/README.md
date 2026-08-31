# HIRE SENSE AI
### AI-Powered Recruitment & Resume Screening Platform — Backend

[![Node.js](https://img.shields.io/badge/Node.js-Runtime-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-Relational%20DB-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-AI%20Data-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Deployed on Railway](https://img.shields.io/badge/Deployed-Railway-0B0D0E?logo=railway&logoColor=white)](https://hiresense-ai-production-76e1.up.railway.app)
[![License](https://img.shields.io/badge/License-Educational%2FPortfolio-lightgrey)](#license)

This repository contains the **backend API** for HIRE SENSE AI, an AI-powered recruitment and resume screening platform. It is a **Node.js / Express.js** REST API using a **polyglot persistence architecture** (MySQL + MongoDB), JWT authentication, and Google Gemini for AI-powered resume parsing, candidate-job matching, and interview question generation.

> This README documents the **backend only**. For the frontend application, see the README in `hiresense_frontend/`.

---

## Table of Contents

1. [Project Description](#project-description)
2. [Live API](#live-api)
3. [Health Check](#health-check)
4. [Key Features](#key-features)
5. [Backend Architecture](#backend-architecture)
6. [System Architecture Diagram](#system-architecture-diagram)
7. [Tech Stack](#tech-stack)
8. [Folder Structure](#folder-structure)
9. [Database Architecture](#database-architecture)
10. [Why MySQL and MongoDB](#why-mysql-and-mongodb)
11. [Authentication Architecture](#authentication-architecture)
12. [JWT Flow](#jwt-flow)
13. [Refresh Token Rotation](#refresh-token-rotation)
14. [RBAC](#rbac)
15. [API Documentation](#api-documentation)
16. [Authentication APIs](#authentication-apis)
17. [Candidate APIs](#candidate-apis)
18. [Company APIs](#company-apis)
19. [Job APIs](#job-apis)
20. [Application APIs](#application-apis)
21. [Resume Upload Flow](#resume-upload-flow)
22. [Document Processing Pipeline](#document-processing-pipeline)
23. [AI Architecture](#ai-architecture)
24. [Gemini Integration](#gemini-integration)
25. [Resume Parsing](#resume-parsing)
26. [Job Matching](#job-matching)
27. [Candidate Ranking](#candidate-ranking)
28. [Interview Question Generation](#interview-question-generation)
29. [AI Result Caching](#ai-result-caching)
30. [File Upload Validation](#file-upload-validation)
31. [Services Architecture](#services-architecture)
32. [Middleware](#middleware)
33. [Security Features](#security-features)
34. [Error Handling](#error-handling)
35. [HTTP Status Codes](#http-status-codes)
36. [Environment Variables](#environment-variables)
37. [Local Installation](#local-installation)
38. [Database Setup](#database-setup)
39. [Running the Backend](#running-the-backend)
40. [API Testing](#api-testing)
41. [Postman Testing](#postman-testing)
42. [Manual Terminal Testing](#manual-terminal-testing)
43. [Deployment](#deployment)
44. [Railway Deployment](#railway-deployment)
45. [CORS Configuration](#cors-configuration)
46. [Production URLs](#production-urls)
47. [Health Monitoring](#health-monitoring)
48. [Graceful Shutdown](#graceful-shutdown)
49. [Future Improvements](#future-improvements)
50. [SDE Interview Talking Points](#sde-interview-talking-points)
51. [Project Status](#project-status)
52. [Author](#author)
53. [Repository Links](#repository-links)
54. [License](#license)

---

## Project Description

The HIRE SENSE AI backend is a REST API built with **Node.js and Express.js** that powers both the candidate and employer experiences of the platform. It handles authentication, job and application management, resume upload and processing, and orchestrates AI-powered resume parsing, candidate-job matching, and interview question generation via the **Google Gemini API**.

The backend follows a **polyglot persistence** approach: structured, relational business data lives in **MySQL**, while flexible, AI-generated data lives in **MongoDB**.

---

## Live API

```
https://hiresense-ai-production-76e1.up.railway.app
```

Frontend consuming this API:

```
https://hiresense-ai.vercel.app
```

## Health Check

```
GET https://hiresense-ai-production-76e1.up.railway.app/api/health
```

Example response:

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

The root endpoint also responds with basic API metadata:

```
GET https://hiresense-ai-production-76e1.up.railway.app/
```

```json
{
  "success": true,
  "message": "Welcome to HireSense AI API",
  "version": "v1"
}
```

---

## Key Features

- JWT authentication with access + refresh tokens and refresh token rotation
- Role-based access control (RBAC) for `candidate` and `employer` roles
- Google OAuth and GitHub OAuth login via Passport strategies
- Resume upload pipeline with file validation, Cloudinary storage, text extraction, and AI parsing
- Google Gemini–powered resume parsing, candidate-job matching, and interview question generation
- Weighted candidate ranking algorithm
- AI result caching in MongoDB to avoid redundant AI calls
- Duplicate application prevention via a database-level unique constraint
- Security middleware: Helmet, CORS, rate limiting
- Polyglot persistence: MySQL for relational data, MongoDB for flexible AI data

---

## Backend Architecture

The backend is organized around a **layered, service-based architecture**:

- **Routes** define HTTP endpoints and map them to controllers.
- **Controllers** handle request/response concerns only (thin controllers).
- **Services** contain the actual business logic (AI orchestration, resume processing, ranking, file storage).
- **Models** define MySQL (relational) and MongoDB (document) schemas.
- **Middleware** handles cross-cutting concerns: authentication, RBAC, security headers, rate limiting, and error handling.

## System Architecture Diagram

```
                        ┌─────────────────────┐
                        │   React Frontend    │
                        │      (Vercel)       │
                        └──────────┬──────────┘
                                   │ REST API (HTTPS)
                                   ▼
                        ┌─────────────────────┐
                        │  Express Backend    │
                        │      (Railway)      │
                        │  Auth / Jobs /      │
                        │  Applications /     │
                        │  AI Services        │
                        └───────┬───────┬─────┘
                                │       │
                    ┌───────────┘       └───────────┐
                    ▼                               ▼
             ┌─────────────┐                 ┌─────────────┐
             │    MySQL    │                 │   MongoDB   │
             │ Users       │                 │ Resumes     │
             │ Jobs        │                 │ AI Results  │
             │ Companies   │                 │ Matches     │
             │ Applications│                 │             │
             │RefreshTokens│                 │             │
             └─────────────┘                 └─────────────┘

                                │
                                ▼
                       ┌────────────────┐
                       │ Google Gemini  │
                       │  AI Analysis   │
                       └────────────────┘
                                │
                                ▼
                       ┌────────────────┐
                       │   Cloudinary   │
                       │ Resume Storage │
                       └────────────────┘
```

---

## Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | JavaScript |
| Relational DB | MySQL (via `mysql2`) |
| Document DB | MongoDB (via Mongoose) |
| Authentication | JWT, bcrypt, Passport |
| OAuth | Google OAuth, GitHub OAuth |
| AI | Google Gemini API |
| File Storage | Cloudinary |
| File Uploads | Multer |
| Security | Helmet, CORS, express-rate-limit |
| Logging | Morgan |
| Cookies | cookie-parser |

---

## Folder Structure

```
hiresense_backend/
│
├── config/                     # env.js, mysql.js, mongo.js — configuration & connections
├── controllers/                 # Thin request/response handlers
├── middleware/
│   ├── authenticate.js          # JWT verification middleware
│   ├── passport.js              # Google OAuth strategy
│   ├── githubPassport.js        # GitHub OAuth strategy
│   └── errorHandler.js          # Centralized error handling middleware
│
├── models/
│   ├── mysql/                   # Relational models (users, jobs, companies, applications, refresh_tokens)
│   └── mongo/                   # MongoDB schemas (resumeProfiles, matchResults)
│
├── routes/
│   ├── authRoutes.js
│   ├── candidateRoutes.js
│   ├── companyRoutes.js
│   ├── jobRoutes.js
│   ├── applicationRoutes.js
│   ├── matchingRoutes.js
│   └── healthRoutes.js
│
├── services/
│   ├── aiService.js              # All Google Gemini AI interactions
│   ├── resumeService.js          # Resume processing business logic
│   ├── documentParserService.js  # Document text extraction
│   ├── cloudinaryService.js      # File storage operations
│   └── rankingService.js         # Candidate ranking calculations
│
├── validators/                   # Request validation schemas/logic
├── utils/                        # Shared helper functions
├── app.js                        # Express app configuration (middleware, routes)
└── server.js                     # Server startup, DB connections, graceful shutdown
```

---

## Database Architecture

HIRE SENSE AI uses a **hybrid / polyglot persistence** model:

```
                    HIRE SENSE AI
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
       MySQL                        MongoDB
 Relational Data              AI / Flexible Data

 users                        resumeProfiles
 companies                    matchResults
 jobs
 applications
 refresh_tokens
```

### MySQL — Relational Business Data

| Table | Stores |
|---|---|
| `users` | Email, password hash, role, authentication info |
| `companies` | Company name, description, industry, location |
| `jobs` | Title, description, location, employment type, requirements, status |
| `applications` | Candidate job applications, status, `UNIQUE(job_id, candidate_id)` |
| `refresh_tokens` | Refresh token records used for rotation |

Duplicate applications are prevented at the **database level** using:

```sql
UNIQUE(job_id, candidate_id)
```

A duplicate application attempt returns **`HTTP 409 Conflict`**.

### MongoDB — Flexible AI / Resume Data

| Collection | Stores |
|---|---|
| `resumeProfiles` | Parsed resume data: skills, education, work history, AI resume insights |
| `matchResults` | Candidate-job match score, strengths, gaps, AI reasoning, interview questions |

## Why MySQL and MongoDB

Recruitment data naturally splits into two categories:

- **Structured business data** (users, jobs, companies, applications) has a fixed, well-defined schema and benefits from relational integrity, constraints (like the duplicate-application unique index), and joins — a natural fit for **MySQL**.
- **AI-generated data** (resume profiles, match reasoning, skills, interview questions) is inherently flexible and evolves as AI output formats change — a natural fit for **MongoDB**'s schema-flexible document model.

This polyglot approach avoids forcing evolving, semi-structured AI output into rigid relational tables, while keeping core business entities under strong relational guarantees.

---

## Authentication Architecture

Authentication is built around JWT access/refresh tokens, bcrypt password hashing, and Passport-based OAuth.

## JWT Flow

```
User Login
    │
    ▼
Validate Credentials
    │
    ▼
bcrypt Password Verification
    │
    ▼
Generate Access Token
    │
    ▼
Generate Refresh Token
    │
    ▼
Store Refresh Token
    │
    ▼
Return Authentication Response
```

## Refresh Token Rotation

```
Access Token Expired
        │
        ▼
Frontend Detects 401
        │
        ▼
Send Refresh Token
        │
        ▼
Validate Refresh Token
        │
        ▼
Rotate Refresh Token
        │
        ▼
Generate New Tokens
        │
        ▼
Retry Original Request
```

On each refresh, the previous refresh token is invalidated and a new one is issued and stored, reducing the risk of a leaked refresh token being reused indefinitely.

## RBAC

The platform supports two roles:

- `candidate`
- `employer`

Role-based middleware protects routes:

```js
router.get("/candidate/resume", authenticate, requireRole("candidate"), candidateController.getResume);
router.post("/jobs", authenticate, requireRole("employer"), jobController.createJob);
```

- `authenticate` verifies the JWT access token and attaches the authenticated user to the request.
- `requireRole("candidate")` / `requireRole("employer")` restrict a route to a specific role.

---

## API Documentation

Base path (local): `http://localhost:5000/api`
Base path (production): `https://hiresense-ai-production-76e1.up.railway.app/api`

Route prefixes:

```
/api/health
/api/auth
/api/candidates
/api/companies
/api/jobs
/api/applications
/api/employer/candidates
```

## Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive access + refresh tokens |
| POST | `/api/auth/refresh` | Refresh authentication tokens |
| POST | `/api/auth/logout` | Logout and invalidate refresh token |
| GET | `/api/auth/me` | Get the currently authenticated user |

## Candidate APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/candidates/resume` | Upload a resume for processing |
| GET | `/api/candidates/me/profile` | Get the authenticated candidate's profile |
| PATCH | `/api/candidates/me/profile` | Update the authenticated candidate's profile |
| GET | `/api/candidates/me/applications` | Get the authenticated candidate's applications |

## Company APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/companies` | Create a company profile |
| GET | `/api/companies/me` | Get the authenticated employer's company |
| PATCH | `/api/companies/me` | Update the authenticated employer's company |

## Job APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs` | Create a job posting |
| GET | `/api/jobs` | List/search/filter jobs |
| GET | `/api/jobs/:id` | Get details for a specific job |
| PATCH | `/api/jobs/:id` | Update a job |
| DELETE | `/api/jobs/:id` | Delete a job |

## Application APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs/:id/apply` | Apply to a job |
| GET | `/api/jobs/:id/applications` | Get applications for a job (employer) |
| PATCH | `/api/applications/:id/status` | Update an application's status (shortlist/reject/hire) |

Employer access to individual candidate details (resume data, AI analysis, and ranking context) for a given job is exposed under the `/api/employer/candidates` route prefix.

---

## Resume Upload Flow

```
Candidate Uploads Resume
        │
        ▼
File Validation
        │
        ▼
Size Validation
        │
        ▼
MIME Type Validation
        │
        ▼
Extension Validation
        │
        ▼
Cloudinary Upload
        │
        ▼
Document Format Detection
        │
        ▼
Text Extraction
        │
        ▼
Text Normalization
        │
        ▼
Google Gemini AI
        │
        ▼
Structured Resume Profile
        │
        ▼
MongoDB Storage
```

## Document Processing Pipeline

Document text extraction is handled by `documentParserService.js`, which is designed to be **extensible** — new document formats can be added without rewriting the core resume processing workflow.

**Supported formats (priority):** PDF, DOC, DOCX, TXT, RTF, ODT
**Optional formats:** CSV, JSON, PPT, PPTX
**Maximum file size:** 10 MB

> Important rule: raw uploaded files are never sent directly to the LLM. Text is extracted and normalized first, and only the resulting text is passed to Gemini.

If document extraction or AI processing fails:

- The uploaded document is preserved
- Extracted raw text is preserved when available
- AI processing can be retried
- Manual review remains possible

---

## AI Architecture

All AI interactions are centralized inside `aiService.js`, which is the single point of integration with the Google Gemini API. Responsibilities include resume parsing, resume analysis, candidate-job matching, skill gap analysis, and interview question generation.

## Gemini Integration

The AI system is designed with the following rules:

- Never fabricate information not present in the source resume/job data
- Always return structured JSON
- AI output is validated before being saved to MongoDB

## Resume Parsing

The resume parser returns structured data in a shape similar to:

```json
{
  "name": "Candidate Name",
  "skills": [],
  "experienceYears": 0,
  "education": [],
  "workHistory": []
}
```

## Job Matching

Candidates are compared against job requirements, considering skills, relevant experience, and role level. The AI returns:

```json
{
  "matchScore": 85,
  "reasoning": "Candidate has strong backend development experience.",
  "strengths": [],
  "gaps": []
}
```

## Candidate Ranking

Candidate ranking uses a weighted scoring formula, implemented in `rankingService.js`:

```
finalScore =
  (AI match score × 0.7) +
  (experience score × 0.2) +
  (recency score × 0.1)
```

| Factor | Weight | Measures |
|---|---|---|
| AI Match Score | 70% | Required skills, technologies, experience, role suitability |
| Experience Score | 20% | Candidate's relevant professional experience |
| Recency Score | 10% | Relevance and recency of candidate experience |

This produces a single comparable score employers can use to rank candidates for a job, weighted most heavily toward AI-assessed fit.

## Interview Question Generation

The AI service generates **five** job-specific screening/interview questions based on the candidate profile, candidate skills, job requirements, and role responsibilities.

## AI Result Caching

AI-generated results (resume analysis, match results) are cached in MongoDB, keyed by resume and candidate-job combination. This avoids repeated AI calls for the same resume or the same candidate-job pair, reducing API usage, response times, and AI API costs.

---

## File Upload Validation

Uploaded resumes are validated before any processing occurs:

- **File size validation** — maximum 10 MB
- **MIME type validation**
- **File extension validation**
- Unsupported or potentially dangerous files are rejected before upload proceeds

File handling is implemented using **Multer** for multipart form parsing, with uploads forwarded to Cloudinary only after passing validation.

---

## Services Architecture

| Service | Responsibility |
|---|---|
| `aiService.js` | All Google Gemini AI interactions (parsing, matching, gap analysis, interview questions) |
| `resumeService.js` | Resume processing business logic, profile generation, analysis workflow |
| `documentParserService.js` | Document text extraction, designed to support multiple file formats |
| `cloudinaryService.js` | Resume upload, document storage, file management |
| `rankingService.js` | Candidate ranking using the weighted scoring formula |

Keeping AI, parsing, storage, and ranking logic in dedicated services (rather than controllers) keeps controllers thin and makes each concern independently testable and replaceable.

---

## Middleware

- **Helmet** — sets secure HTTP headers
- **CORS** — restricts allowed origins via `CLIENT_URL`
- **express-rate-limit** — global and authentication-specific rate limiting
- **Morgan** — HTTP request logging
- **cookie-parser** — cookie parsing support
- **Passport** — authentication strategy management
  - Google OAuth strategy (`passport.js`)
  - GitHub OAuth strategy (`githubPassport.js`)
- **`authenticate`** — verifies JWT access tokens on protected routes
- **`requireRole("candidate")` / `requireRole("employer")`** — enforces RBAC
- **`errorHandler.js`** — centralized error handling middleware

---

## Security Features

Only implemented/configured measures are listed:

- **Helmet** for secure HTTP headers
- **CORS** configuration restricted to allowed origins via `CLIENT_URL`
- **Rate limiting** via `express-rate-limit`:
  - A **global limiter** applied across the API with a 15-minute window and a configured request limit
  - A **stricter authentication limiter** applied to auth endpoints specifically, to reduce brute-force and credential-stuffing risk
- **bcrypt** password hashing
- **JWT authentication** with access and refresh tokens
- **Refresh token rotation** on every refresh
- **Role-Based Access Control (RBAC)** via middleware
- **Input validation** at the request/validator layer
- **File upload validation** (size, MIME type, extension)
- **Protected routes** requiring a valid JWT
- **Duplicate application prevention** via a MySQL unique constraint (`UNIQUE(job_id, candidate_id)`)

### Railway Reverse Proxy Configuration

Because Railway sits in front of the backend as a reverse proxy, incoming requests carry `X-Forwarded-For` headers rather than the client's raw IP. For `express-rate-limit` to correctly identify client IPs behind this trusted proxy, Express is configured with:

```js
app.set("trust proxy", 1);
```

Without this, rate limiting could either be bypassed or applied incorrectly, since Express would otherwise see the proxy's IP rather than the actual client IP.

---

## Error Handling

Errors are handled centrally via `errorHandler.js`, which formats error responses consistently across the API rather than leaking raw stack traces or inconsistent shapes from individual controllers.

## HTTP Status Codes

| Status | Meaning in this API |
|---|---|
| `200 OK` | Successful request |
| `201 Created` | Resource created (e.g. registration, job creation) |
| `400 Bad Request` | Validation failure |
| `401 Unauthorized` | Missing/invalid/expired access token |
| `403 Forbidden` | Authenticated but not authorized (role mismatch) |
| `404 Not Found` | Resource does not exist |
| `409 Conflict` | Duplicate application (`UNIQUE(job_id, candidate_id)` violation) |
| `500 Internal Server Error` | Unhandled server-side error |

---

## Environment Variables

Create a `.env` file in `hiresense_backend/` based on the example below.

```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# MySQL
MYSQL_HOST=
MYSQL_PORT=3306
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=

# MongoDB
MONGO_URI=

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Google Gemini
GEMINI_API_KEY=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=

# Adzuna (job data integration, if enabled)
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
```

> Never commit `.env`, `.env.local`, or `.env.production` files. Keep database credentials, JWT secrets, Gemini API keys, Cloudinary secrets, and OAuth secrets private at all times.

---

## Local Installation

Clone the repository and move into the backend directory:

```bash
git clone https://github.com/Jharwal77/hiresense-ai.git
cd hiresense-ai/hiresense_backend
```

Install dependencies:

```bash
npm install
```

Create your `.env` file as shown in [Environment Variables](#environment-variables).

## Database Setup

- Provision a **MySQL** database and set `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, and `MYSQL_PASSWORD` accordingly. The `users`, `companies`, `jobs`, `applications`, and `refresh_tokens` tables are used by the application.
- Provision a **MongoDB** database (e.g. MongoDB Atlas or a local instance) and set `MONGO_URI`. The `resumeProfiles` and `matchResults` collections are used by the application.

## Running the Backend

Start in development mode:

```bash
npm run dev
```

Start in standard mode:

```bash
npm start
```

The backend runs by default on:

```
http://localhost:5000
```

Server startup sequence:

1. Load environment configuration
2. Connect to MySQL
3. Connect to MongoDB
4. Initialize the Express application (middleware, routes)
5. Start the HTTP server
6. Listen for `SIGINT` / `SIGTERM` for graceful shutdown
7. Close MySQL and MongoDB connections on shutdown

---

## API Testing

## Postman Testing

The following flows can be tested via Postman:

**Authentication:** Register, Login, Refresh Token, Logout, Get Current User
**Candidate:** Upload Resume, Get Profile, Update Profile, Get Applications
**Employer:** Create Company, Update Company, Create Job, Edit Job, Delete Job, Close Job
**Applications:** Apply to Job, Prevent Duplicate Application, Get Applications, Update Application Status

## Manual Terminal Testing

Local:

```bash
curl http://localhost:5000/
curl http://localhost:5000/api/health
```

Production:

```bash
curl https://hiresense-ai-production-76e1.up.railway.app/
curl https://hiresense-ai-production-76e1.up.railway.app/api/health
```

The project has been tested **manually** using the VS Code terminal, PowerShell terminal, and Postman. There is currently no automated test suite (no Jest/Supertest tests implemented yet).

---

## Deployment

The backend is deployed independently from the frontend and exposes a versioned REST API consumed over HTTPS.

## Railway Deployment

The backend is deployed on **Railway** at:

```
https://hiresense-ai-production-76e1.up.railway.app
```

Railway acts as a reverse proxy in front of the Express server — see [Security Features](#security-features) for the related `trust proxy` configuration required for accurate rate limiting.

## CORS Configuration

Allowed origins are configured via the `CLIENT_URL` environment variable, which supports comma-separated values for multiple origins:

```env
CLIENT_URL=http://localhost:5173,https://hiresense-ai.vercel.app
```

In production, this should include the deployed frontend origin:

```
https://hiresense-ai.vercel.app
```

## Production URLs

| Service | URL |
|---|---|
| Backend API | https://hiresense-ai-production-76e1.up.railway.app |
| Health Check | https://hiresense-ai-production-76e1.up.railway.app/api/health |
| Frontend | https://hiresense-ai.vercel.app |

## Health Monitoring

`GET /api/health` reports the status of the API process along with MySQL and MongoDB connectivity, making it suitable for use as a Railway health check / uptime monitoring endpoint.

## Graceful Shutdown

On receiving `SIGINT` or `SIGTERM`, the server stops accepting new connections and closes the MySQL and MongoDB connections cleanly before exiting, avoiding dangling connections during redeploys or restarts.

---

## Future Improvements

- Automated testing with Jest and Supertest
- Swagger / OpenAPI documentation
- Email notifications
- Interview scheduling
- Advanced employer analytics
- Additional document format support
- Advanced AI insights and interview feedback management

---

## SDE Interview Talking Points

- "The backend uses a polyglot persistence model — MySQL for relational business data with referential integrity and unique constraints, MongoDB for flexible, evolving AI-generated data like resume profiles and match results."
- "Authentication is JWT-based with refresh token rotation: every refresh invalidates the previous refresh token and issues a new one, limiting the blast radius of a leaked token."
- "AI orchestration is fully centralized in `aiService.js`, with strict rules that the model never fabricates data and all AI output is validated before being persisted."
- "Duplicate applications are prevented at the database layer with a unique constraint on `(job_id, candidate_id)`, returning a proper `409 Conflict` rather than relying solely on application-level checks."
- "Candidate ranking combines AI match score, experience, and recency into a single weighted formula (70/20/10), giving employers a consistent way to compare candidates."
- "Because Railway sits in front of the app as a reverse proxy, `trust proxy` is explicitly configured so that rate limiting correctly identifies real client IPs from `X-Forwarded-For` headers."

---

## Project Status

Actively developed. Core authentication, job/application management, resume processing, and AI-powered matching and ranking are implemented and deployed to production on Railway. See [Future Improvements](#future-improvements) for planned work.

---

## Author

**Rahul Meena**
GitHub: [@Jharwal77](https://github.com/Jharwal77)

---

## Repository Links

- **Monorepo:** https://github.com/Jharwal77/hiresense-ai
- **Backend source:** https://github.com/Jharwal77/hiresense-ai/tree/main/hiresense_backend
- **Frontend source:** https://github.com/Jharwal77/hiresense-ai/tree/main/hiresense_frontend
- **Production API:** https://hiresense-ai-production-76e1.up.railway.app
- **Live app:** https://hiresense-ai.vercel.app

---

## License

This project is currently intended for educational and portfolio purposes. An official license (e.g. MIT) may be added in the future.
