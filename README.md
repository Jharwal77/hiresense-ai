# HIRE SENSE AI

AI-Powered Recruitment and Resume Screening Platform built with a separate React frontend and Node.js backend.

HireSense AI helps candidates and employers manage the recruitment process using AI-powered resume analysis, job matching, candidate ranking, skill-gap analysis, and interview question generation.

## Features

### Candidate

- Register and login with JWT authentication
- Refresh token authentication with rotation
- Upload resumes
- Support PDF, DOC, DOCX, TXT, RTF and ODT documents
- Resume validation and secure document upload
- Cloudinary document storage
- Resume text extraction
- AI-powered resume parsing
- Editable candidate profile
- Browse and search jobs
- Filter jobs
- Apply for jobs
- Duplicate application prevention
- Track application status
- View AI match scores
- View strengths and skill gaps
- View interview questions
- Candidate dashboard with application statistics

### Employer

- Register and login
- Employer role-based access
- Create and manage company profiles
- Create jobs
- Edit jobs
- Delete jobs
- Close jobs
- View job applications
- View candidate details
- View candidate resumes
- View AI-generated candidate analysis
- View match scores
- View strengths and gaps
- Rank candidates
- Update application status

### AI Features

- AI resume parsing
- Structured candidate profile generation
- Resume strengths analysis
- Resume skill-gap analysis
- Resume quality score
- Job and candidate match scoring
- AI-generated match reasoning
- Candidate strengths detection
- Candidate gaps detection
- Job-specific interview questions
- AI result caching in MongoDB

## Tech Stack

### Frontend

- React.js
- JavaScript
- Vite
- React Router DOM
- Axios
- Tailwind CSS

### Backend

- Node.js
- Express.js
- JavaScript
- REST APIs
- JWT
- bcrypt
- Passport

### Databases

- MySQL
- mysql2
- MongoDB
- Mongoose

### AI

- Google Gemini API

### Other Services

- Cloudinary
- Multer
- Helmet
- CORS
- express-rate-limit
- Morgan

## Project Architecture

```text
HIRESENSE-AI
│
├── hiresense_backend
│   │
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   │   ├── mysql
│   │   └── mongo
│   ├── routes
│   ├── services
│   ├── validators
│   ├── utils
│   ├── app.js
│   └── server.js
│
├── hiresense_frontend
│   │
│   ├── public
│   └── src
│       ├── assets
│       ├── components
│       │   ├── ai
│       │   ├── common
│       │   └── employer
│       ├── context
│       ├── pages
│       └── services
│
└── README.md