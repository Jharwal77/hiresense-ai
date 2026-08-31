# 🚀 HireSense AI

### AI-Powered Recruitment & Resume Screening Platform

**Smarter Hiring. Better Matches. Faster Decisions.**

HireSense AI is a full-stack recruitment platform that streamlines hiring for both **Candidates** and **Employers**. It combines traditional recruitment workflows with AI-powered resume analysis, candidate-job matching, skill-gap identification, candidate ranking, and interview question generation — using **Google Gemini** for AI, **MySQL** for relational business data, and **MongoDB** for flexible AI-generated data.

[![Live App](https://img.shields.io/badge/Live-App-brightgreen)](https://hiresense-ai.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-API-blue)](https://hiresense-ai-production-76e1.up.railway.app)
[![Health Check](https://img.shields.io/badge/Health-Check-success)](https://hiresense-ai-production-76e1.up.railway.app/api/health)

---

## 🌐 Live Application

| Service | URL |
|---|---|
| Frontend | https://hiresense-ai.vercel.app |
| Backend API | https://hiresense-ai-production-76e1.up.railway.app |
| Health Check | https://hiresense-ai-production-76e1.up.railway.app/api/health |

---

## 📌 Project Overview

Recruitment involves multiple steps: resume screening, candidate profile analysis, job matching, application management, candidate ranking, skill evaluation, and interview preparation. HireSense AI centralizes and automates these workflows for two user roles:

- 👤 **Candidate** — uploads a resume, receives AI-powered profile analysis, browses jobs, applies, and tracks match scores.
- 🏢 **Employer** — manages a company profile, posts jobs, reviews applications, analyzes and ranks candidates, and manages hiring status.

---

## ✨ Key Features

### 👤 Candidate

- Registration, login, JWT auth, refresh token rotation
- Google OAuth & GitHub OAuth login
- Resume upload with secure validation and Cloudinary storage
- AI-powered resume parsing → structured, editable profile
- Resume score, skills, experience, education, and work history extraction
- AI strengths and skill-gap analysis
- Browse, search, and filter jobs
- Apply for jobs with duplicate-application prevention
- Track application status and view AI match scores
- AI-generated interview questions
- Candidate dashboard with application statistics

### 🏢 Employer

- Registration, login, role-based access control
- Company profile creation and management
- Create, edit, delete, and close jobs
- View and manage applications
- AI candidate analysis: match score, strengths, skill gaps
- AI-powered candidate ranking
- Shortlist, reject, or hire candidates
- Employer dashboard with job and application statistics

### 🤖 AI Features (Google Gemini)

- Resume parsing into a structured profile
- Resume strengths and skill-gap analysis
- Resume quality scoring
- Candidate-job match scoring with AI reasoning
- Job-specific interview question generation
- AI result caching in MongoDB to reduce repeated API calls and cost

---

## 🏗️ System Architecture

```
                        ┌─────────────────────┐
                        │   React Frontend    │
                        │  React + Vite       │
                        │  Tailwind CSS       │
                        │  Axios              │
                        └──────────┬──────────┘
                                   │ REST API
                                   ▼
                        ┌─────────────────────┐
                        │  Express Backend    │
                        │  Authentication     │
                        │  Jobs / Applications│
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

### 🗄️ Hybrid Database Design

| Database | Purpose | Stores |
|---|---|---|
| **MySQL** | Structured, relational business data | users, companies, jobs, applications, refresh_tokens |
| **MongoDB** | Flexible, AI-generated data | resumeProfiles, matchResults |

**Applications** enforce `UNIQUE(job_id, candidate_id)` to prevent duplicate applications (returns `HTTP 409 Conflict`).

---

## 📄 Resume Processing Pipeline

```
Candidate Uploads Resume
        │
        ▼
File / Size / MIME / Extension Validation
        │
        ▼
Cloudinary Upload
        │
        ▼
Document Format Detection → Text Extraction → Text Normalization
        │
        ▼
Google Gemini AI
        │
        ▼
Structured Resume Profile → MongoDB Storage
```

**Supported formats:** PDF, DOC, DOCX, TXT, RTF, ODT (optional: CSV, JSON, PPT, PPTX)
**Max file size:** 10 MB

If extraction or AI processing fails, the uploaded document and any extracted raw text are preserved, AI processing can be retried, and manual review remains possible.

---

## 🏆 Candidate Ranking Formula

```
Final Score = (AI Match Score × 0.7) + (Experience Score × 0.2) + (Recency Score × 0.1)
```

| Factor | Weight | Measures |
|---|---|---|
| AI Match Score | 70% | Required skills, technologies, experience, role suitability |
| Experience Score | 20% | Candidate's relevant professional experience |
| Recency Score | 10% | Relevance and recency of experience |

Implemented in `rankingService.js`.

---

## 🔐 Authentication

- JWT Access Tokens + JWT Refresh Tokens with **rotation**
- bcrypt password hashing
- Google OAuth & GitHub OAuth
- Role-Based Access Control (`candidate`, `employer`)

**Login flow:** Validate credentials → bcrypt verification → generate access + refresh tokens → store refresh token → return auth response.

**Token refresh flow:** Access token expires → frontend detects 401 → sends refresh token → validate & rotate → issue new tokens → retry original request.

---

## 🛠️ Technology Stack

**Frontend:** React.js, Vite, React Router DOM, Axios, Tailwind CSS, Recharts
**Backend:** Node.js, Express.js, REST APIs
**Auth:** JWT, bcrypt, Passport.js, Google OAuth, GitHub OAuth
**Databases:** MySQL (mysql2), MongoDB (Mongoose)
**AI:** Google Gemini API
**File Storage:** Cloudinary
**Security:** Helmet, CORS, express-rate-limit
**Tooling:** Multer, Morgan, Postman, Git, GitHub, Vercel, Railway

---

## 📁 Project Structure

```
HIRESENSE-AI
│
├── hiresense_backend
│   ├── config              # env.js, mysql.js, mongo.js
│   ├── controllers
│   ├── middleware           # authenticate.js, passport.js, githubPassport.js, errorHandler.js
│   ├── models
│   │   ├── mysql
│   │   └── mongo
│   ├── routes                # authRoutes, candidateRoutes, companyRoutes, jobRoutes,
│   │                         # applicationRoutes, matchingRoutes, healthRoutes
│   ├── services
│   │   ├── aiService.js              # Gemini AI interactions
│   │   ├── resumeService.js          # Resume processing workflow
│   │   ├── documentParserService.js  # Text extraction
│   │   ├── cloudinaryService.js      # File storage
│   │   └── rankingService.js         # Candidate ranking
│   ├── validators
│   ├── utils
│   ├── app.js
│   └── server.js
│
├── hiresense_frontend
│   ├── public
│   └── src
│       ├── assets
│       ├── components
│       │   ├── ai
│       │   ├── common
│       │   └── employer
│       ├── context
│       ├── hooks
│       ├── pages
│       ├── services
│       ├── utils
│       ├── App.jsx
│       └── main.jsx
│
├── .gitignore
└── README.md
```

---

## 🔗 Main API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh authentication tokens |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current authenticated user |

### Candidate
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/candidates/resume` | Upload resume |
| GET | `/api/candidates/me/profile` | Get candidate profile |
| PATCH | `/api/candidates/me/profile` | Update candidate profile |
| GET | `/api/candidates/me/applications` | Get candidate applications |

### Company
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/companies` | Create company |
| GET | `/api/companies/me` | Get company |
| PATCH | `/api/companies/me` | Update company |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs` | Create job |
| GET | `/api/jobs` | Get jobs |
| GET | `/api/jobs/:id` | Get job details |
| PATCH | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs/:id/apply` | Apply for a job |
| GET | `/api/jobs/:id/applications` | Get job applications |
| PATCH | `/api/applications/:id/status` | Update application status |

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Backend health check |

```json
{
  "success": true,
  "message": "HireSense AI backend is healthy",
  "data": { "api": "up", "mysql": "up", "mongodb": "up" }
}
```

---

## ⚙️ Local Installation

### Clone the repository

```bash
git clone https://github.com/Jharwal77/hiresense-ai.git
cd hiresense-ai
```

### Backend setup

```bash
cd hiresense_backend
npm install
# create a .env file (see Environment Variables below)
npm run dev   # or: npm start
```

Backend runs on `http://localhost:5000`

### Frontend setup

```bash
cd hiresense_frontend
npm install
# create a .env file with VITE_API_URL=http://localhost:5000/api
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 🔑 Backend Environment Variables

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MYSQL_HOST=
MYSQL_PORT=3306
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=

MONGO_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GEMINI_API_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=

ADZUNA_APP_ID=
ADZUNA_APP_KEY=
```

> ⚠️ Never commit `.env`, `.env.local`, or `.env.production` files to GitHub. Keep database passwords, JWT secrets, Gemini API keys, Cloudinary secrets, and OAuth secrets private.

---

## 🚀 Deployment

| Layer | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://hiresense-ai.vercel.app |
| Backend | Railway | https://hiresense-ai-production-76e1.up.railway.app |

**Vercel environment variable:**
```env
VITE_API_URL=https://hiresense-ai-production-76e1.up.railway.app/api
```

**CORS configuration (backend):**
```env
CLIENT_URL=http://localhost:5173,https://hiresense-ai.vercel.app
```

> 🚨 If the backend returns 404, confirm the frontend's `VITE_API_URL` includes `/api` (e.g. `.../api/auth/login`, not just `.../auth/login`).

---

## 🧪 Testing

The project is currently tested manually using the VS Code terminal, PowerShell, and Postman.

```bash
# Local health check
curl http://localhost:5000/api/health

# Production health check
curl https://hiresense-ai-production-76e1.up.railway.app/api/health
```

Postman workflows cover authentication, candidate resume/profile/application flows, employer company/job flows, and application status updates (including duplicate-application prevention).

---

## 🔒 Security Features

- Password hashing with bcrypt
- JWT access + refresh tokens with rotation
- Helmet, CORS configuration, and rate limiting (stricter limits on auth endpoints)
- Role-based authorization on protected routes
- File size, MIME type, and extension validation with rejection of unsupported/dangerous files
- Database-level unique constraint preventing duplicate applications

---

## 💡 Design Principles

- **Separate frontend and backend** — independent, deployable applications
- **Thin controllers** — business logic lives in services, not controllers
- **Service-based architecture** — AI Service, Resume Service, Document Parser Service, Cloudinary Service, Ranking Service
- **Hybrid database architecture** — MySQL for structured business data (users, jobs, companies, applications), MongoDB for flexible, evolving AI data (resume profiles, match results, reasoning)

---

## 🗺️ Development Roadmap

**Completed**
- [x] Frontend & backend setup
- [x] MySQL & MongoDB integration
- [x] JWT auth with refresh token rotation
- [x] Google & GitHub OAuth
- [x] Company & job management
- [x] Resume upload, validation, and Cloudinary storage
- [x] Gemini AI resume parsing
- [x] Candidate profiles & job applications
- [x] Duplicate application prevention
- [x] AI job matching & candidate ranking
- [x] Interview question generation
- [x] Candidate & employer dashboards
- [x] Vercel & Railway deployment

**Planned**
- [ ] Automated tests (Jest, Supertest, frontend component tests)
- [ ] Swagger / OpenAPI documentation
- [ ] Email notifications
- [ ] Interview scheduling
- [ ] Advanced employer analytics & job recommendations
- [ ] Resume version management
- [ ] Admin dashboard

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

```bash
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
```

Then open a Pull Request.

---

## 📚 Links

- **Repository:** https://github.com/Jharwal77/hiresense-ai
- **Backend source:** https://github.com/Jharwal77/hiresense-ai/tree/main/hiresense_backend
- **Frontend source:** https://github.com/Jharwal77/hiresense-ai/tree/main/hiresense_frontend
- **Live app:** https://hiresense-ai.vercel.app
- **Production API:** https://hiresense-ai-production-76e1.up.railway.app

---

## 📄 License

This project is currently intended for educational and portfolio purposes. An official license (e.g. MIT) may be added in the future.

---

## 👨‍💻 Author

**Rahul Meena**
GitHub: [@Jharwal77](https://github.com/Jharwal77)

---

## ⭐ Support

If you found this project useful, consider giving the repository a ⭐ on GitHub.
