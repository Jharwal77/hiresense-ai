# HIRE SENSE AI
### AI-Powered Recruitment & Resume Screening Platform — Frontend

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)](https://hiresense-ai.vercel.app)
[![License](https://img.shields.io/badge/License-Educational%2FPortfolio-lightgrey)](#license)

This repository contains the **frontend application** for HIRE SENSE AI, an AI-powered recruitment and resume screening platform. It is a **React + Vite** single-page application that provides separate, role-based experiences for **Candidates** and **Employers**, and communicates with the HireSense AI backend over a REST API.

> This README documents the **frontend only**. For backend setup, API implementation, and database details, see the backend README in `hiresense_backend/`.

---

## Table of Contents

1. [Project Description](#project-description)
2. [Live Demo](#live-demo)
3. [Key Highlights](#key-highlights)
4. [Features](#features)
5. [Candidate Features](#candidate-features)
6. [Employer Features](#employer-features)
7. [Authentication and Authorization](#authentication-and-authorization)
8. [AI Features](#ai-features)
9. [UI and UX Features](#ui-and-ux-features)
10. [Tech Stack](#tech-stack)
11. [Application Architecture](#application-architecture)
12. [Folder Structure](#folder-structure)
13. [Routing Structure](#routing-structure)
14. [API Integration](#api-integration)
15. [Environment Variables](#environment-variables)
16. [Local Installation](#local-installation)
17. [Running the Development Server](#running-the-development-server)
18. [Production Build](#production-build)
19. [Authentication Flow](#authentication-flow)
20. [Axios Token Refresh Flow](#axios-token-refresh-flow)
21. [Protected Routes and RBAC](#protected-routes-and-rbac)
22. [Theme System](#theme-system)
23. [Component Architecture](#component-architecture)
24. [Screens / Pages Overview](#screens--pages-overview)
25. [Error and Loading States](#error-and-loading-states)
26. [Security Considerations](#security-considerations)
27. [Deployment](#deployment)
28. [Vercel Deployment](#vercel-deployment)
29. [Backend Integration](#backend-integration)
30. [Testing](#testing)
31. [Known Limitations / Future Improvements](#known-limitations--future-improvements)
32. [Learning Outcomes](#learning-outcomes)
33. [SDE Interview Talking Points](#sde-interview-talking-points)
34. [Project Status](#project-status)
35. [Author](#author)
36. [Repository Links](#repository-links)
37. [License](#license)

---

## Project Description

HIRE SENSE AI's frontend is a **role-based recruitment SaaS interface** built with React and Vite. It allows candidates to upload resumes, receive AI-generated profile insights, browse and apply to jobs, and track applications — while employers manage company profiles, post jobs, review applications, and view AI-powered candidate match scores and rankings.

The frontend is a pure client application: it holds no business logic beyond presentation, validation, and API orchestration. All AI results, job data, applications, and scores are fetched from the backend REST API — nothing is hardcoded.

---

## Live Demo

| Environment | URL |
|---|---|
| Frontend (Vercel) | https://hiresense-ai.vercel.app |
| Backend API (Railway) | https://hiresense-ai-production-76e1.up.railway.app |

---

## Key Highlights

- Fully role-based UI for **Candidate** and **Employer** experiences
- JWT authentication with **automatic silent token refresh** via Axios interceptors
- AI-driven resume analysis and job-matching data rendered directly from backend responses
- Dark theme by default, with a light "Sky White" theme toggle
- Reusable, composable component structure (`ai/`, `common/`, `employer/`)
- No mock or hardcoded data — every screen is backend-driven
- Production deployment on Vercel, integrated with a Railway-hosted API

---

## Features

The application is split into two role-based feature sets, described below, on top of a shared authentication and UI layer.

## Candidate Features

- Candidate dashboard with an overview of resume status, applications, and match scores
- Resume upload interface with processing status feedback
- AI-parsed resume profile display: skills, experience, education, work history
- AI insights: resume score, strengths, skill gaps, profile completeness
- Editable candidate profile
- Ability to refresh/re-run AI analysis on an existing resume
- Browse, search, and filter available jobs
- Paginated job listings
- Job detail view
- Apply to jobs directly from the platform
- Application status tracking
- View AI match score, strengths, and skill gaps per application
- View AI-generated interview questions
- Track all submitted applications from a dedicated applications view

## Employer Features

- Employer dashboard with job and application statistics
- Company profile management (create/update)
- Create, edit, delete, and close job postings
- View all posted jobs
- View applications received per job
- View candidate details, including parsed resume data
- View AI-generated candidate match score, strengths, and skill gaps
- View AI summary and screening/interview questions per candidate
- Candidate ranking view for a given job
- Update application status (shortlist, reject, hire)
- Confirmation dialogs before destructive actions (e.g. deleting a job)

---

## Authentication and Authorization

The frontend implements a complete JWT-based authentication flow:

- Login and Registration forms with client-side validation
- JWT **access token** and **refresh token** issued by the backend on login
- Access token attached automatically to outgoing API requests
- Automatic, transparent access token refresh on expiry
- Logout, which clears authentication state and stored tokens
- **Protected routes** — unauthenticated users are redirected to `/login`
- **Role-based route protection** — candidate routes are inaccessible to employers and vice versa, enforced via a `ProtectedRoute` component

See [Authentication Flow](#authentication-flow) and [Axios Token Refresh Flow](#axios-token-refresh-flow) below for implementation details.

---

## AI Features

The frontend does not call the Gemini API directly — all AI processing happens on the backend. The frontend is responsible for **rendering** AI-generated results returned by the backend API, including:

- Parsed resume profile (skills, experience, education, work history)
- Resume score and AI-identified strengths / skill gaps
- Candidate-job match score
- Match reasoning, strengths, and gaps for a given application
- AI-generated interview/screening questions
- Visual indicators (via `AIProcessingState.jsx`) while AI analysis is in progress
- `MatchScoreCard.jsx` for a consistent match-score presentation across candidate and employer views

---

## UI and UX Features

- Clean, professional recruitment SaaS interface
- Fully responsive layout for desktop and mobile
- **Dark theme enabled by default**
- Light "Sky White" theme as an alternative, switchable via `ThemeToggle.jsx`
- Animated transitions and interactions where appropriate
- Loading states for all asynchronous data fetches
- Error states for failed requests
- Empty states for lists with no data (no jobs, no applications, etc.)
- Toast notifications for success/error feedback
- Form validation on all input forms (login, register, profile, job creation, etc.)
- Reusable UI components shared across candidate and employer views
- `ConfirmDialog.jsx` for destructive actions (e.g. deleting or closing a job)
- No hardcoded jobs, users, scores, or AI results — all data is fetched from the backend

---

## Tech Stack

| Category | Technology |
|---|---|
| Library | React.js |
| Language | JavaScript |
| Build Tool | Vite |
| Routing | React Router DOM |
| HTTP Client | Axios |
| Styling | Tailwind CSS |
| Data Visualization | Recharts |

---

## Application Architecture

The frontend follows a layered, unidirectional request flow from the user to the backend API:

```
                User
                 │
                 ▼
          React Frontend
                 │
                 ▼
          React Router
                 │
                 ▼
          Protected Routes
      (auth check + role check)
                 │
                 ▼
          Axios API Layer
       (interceptors, base URL)
                 │
                 ▼
        JWT Authentication
   (Bearer token / refresh flow)
                 │
                 ▼
        Railway Backend API
```

- **React Router** owns client-side navigation and route definitions.
- **Protected Routes** wrap candidate/employer routes and enforce authentication and role checks before rendering a page.
- **Axios API Layer** centralizes all HTTP calls, base URL configuration, and interceptor logic (token attachment + refresh).
- **JWT Authentication** governs what the Axios layer attaches to each request and how 401 responses are handled.
- The **Railway Backend API** is the single source of truth for all data rendered in the UI.

---

## Folder Structure

```
hiresense_frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ai/
│   │   │   ├── AIProcessingState.jsx     # Loading/processing indicator for AI operations
│   │   │   └── MatchScoreCard.jsx        # Reusable match score display
│   │   │
│   │   ├── common/
│   │   │   ├── ConfirmDialog.jsx         # Confirmation modal for destructive actions
│   │   │   └── ThemeToggle.jsx           # Dark / light theme switcher
│   │   │
│   │   ├── employer/
│   │   │   └── EmployerNav.jsx           # Employer-specific navigation
│   │   │
│   │   ├── JobCard.jsx                   # Job listing card
│   │   ├── JobFilters.jsx                # Job search/filter controls
│   │   ├── Pagination.jsx                # Shared pagination component
│   │   └── ProtectedRoute.jsx            # Auth + role-based route guard
│   │
│   ├── context/                          # Global state (auth/theme context)
│   ├── hooks/                            # Custom React hooks
│   ├── pages/                            # Route-level page components
│   ├── services/                         # Axios instance and API service modules
│   ├── utils/                            # Helper/utility functions
│   ├── App.jsx                           # Root component and router setup
│   └── main.jsx                          # Application entry point
│
├── .env                                  # Local environment variables (not committed)
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## Routing Structure

### Public Routes

| Route | Description |
|---|---|
| `/` | Landing / home page |
| `/login` | Login page |
| `/register` | Registration page |

### Candidate Routes (protected, `candidate` role)

| Route | Description |
|---|---|
| `/candidate/dashboard` | Candidate dashboard overview |
| `/candidate/resume` | Resume upload, AI profile, insights |
| `/candidate/jobs` | Browse / search / filter jobs |
| `/candidate/jobs/:id` | Job detail view |
| `/candidate/applications` | List of submitted applications |
| `/candidate/applications/:id` | Application detail, match score, interview questions |
| `/candidate/profile` | Edit candidate profile |

### Employer Routes (protected, `employer` role)

| Route | Description |
|---|---|
| `/employer/dashboard` | Employer dashboard overview |
| `/employer/company` | Company profile management |
| `/employer/jobs` | List of posted jobs |
| `/employer/jobs/create` | Create a new job |
| `/employer/jobs/:id/edit` | Edit an existing job |
| `/employer/jobs/:id/applications` | Applications received for a job |
| `/employer/candidates/:id` | Candidate detail, AI analysis, ranking |

All candidate and employer routes are wrapped in `ProtectedRoute.jsx`, which checks for a valid authenticated session and the correct role before rendering.

---

## API Integration

All API communication is centralized through a single Axios instance configured with the backend base URL:

```js
// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

export default api;
```

Feature-specific service modules (e.g. `authService.js`, `jobService.js`, `candidateService.js`) build on top of this instance to expose typed request functions to pages and components, keeping API call logic out of the UI layer.

---

## Environment Variables

Create a `.env` file in the root of `hiresense_frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

For production (Vercel), the same variable points to the deployed backend:

```env
VITE_API_URL=https://hiresense-ai-production-76e1.up.railway.app/api
```

> All Vite environment variables must be prefixed with `VITE_` to be exposed to the client bundle.

---

## Local Installation

Clone the repository and move into the frontend directory:

```bash
git clone https://github.com/Jharwal77/hiresense-ai.git
cd hiresense-ai/hiresense_frontend
```

Install dependencies:

```bash
npm install
```

Create your `.env` file as shown in [Environment Variables](#environment-variables).

---

## Running the Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

> The backend API must be running (locally or in production) and reachable at the URL configured in `VITE_API_URL` for the app to function.

---

## Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Authentication Flow

1. User submits login credentials from `/login`.
2. Credentials are sent to `POST /api/auth/login` via the Axios API layer.
3. On success, the backend returns a JWT **access token** and **refresh token**.
4. The access token and refresh token are stored in `localStorage`.
5. The Axios instance attaches the access token as an `Authorization: Bearer <token>` header on subsequent requests.
6. Authenticated user state (role, profile info) is loaded and made available via context, driving role-based navigation and route access.
7. Logout clears the stored tokens and authentication state, and redirects to `/login`.

---

## Axios Token Refresh Flow

The Axios layer implements an interceptor-based silent refresh mechanism:

- The **access token** is stored in `localStorage` and attached to every outgoing request via an Axios request interceptor.
- The **refresh token** is also stored in `localStorage` and used only when the access token expires.
- A response interceptor watches for `401 Unauthorized` responses.
- On a `401`, the interceptor triggers a call to `POST /api/auth/refresh` using the stored refresh token.
- If multiple requests fail with `401` at the same time, they share a **single in-flight refresh request** instead of triggering multiple parallel refresh calls, avoiding redundant network calls and race conditions.
- The refresh call itself is excluded from triggering another refresh, preventing an **infinite refresh loop**.
- On successful refresh, the new tokens are stored and the original failed request(s) are retried automatically.
- If the refresh request itself fails (e.g. refresh token expired or invalid), all stored authentication data is cleared and the user is redirected to `/login`.

```
Access Token Expires
        │
        ▼
Request fails with 401
        │
        ▼
Interceptor triggers refresh
 (shared across parallel requests)
        │
        ▼
   Refresh succeeds?
     │           │
    Yes          No
     │           │
     ▼           ▼
Store new     Clear auth
tokens &      storage &
retry         redirect to
request(s)    /login
```

---

## Protected Routes and RBAC

`ProtectedRoute.jsx` enforces two checks before rendering a route:

1. **Authentication check** — is there a valid session (tokens present / user loaded)? If not, redirect to `/login`.
2. **Role check** — does the authenticated user's role (`candidate` or `employer`) match the role required by the route? If not, access is denied / the user is redirected appropriately.

This keeps candidate-only and employer-only pages fully isolated at the routing layer, in addition to any backend-side authorization.

---

## Theme System

- **Dark theme** is the default application theme.
- A **Sky White (light)** theme is available as an alternative.
- `ThemeToggle.jsx` allows the user to switch between themes at runtime.
- Theme preference is applied globally across all pages and components for a consistent experience.

---

## Component Architecture

Components are organized by responsibility rather than by page, to maximize reuse:

- **`components/ai/`** — components specifically related to rendering AI output (processing states, match score cards)
- **`components/common/`** — generic, cross-cutting UI components (dialogs, theme toggle) used across both roles
- **`components/employer/`** — components specific to the employer experience (e.g. employer navigation)
- **Top-level components** (`JobCard.jsx`, `JobFilters.jsx`, `Pagination.jsx`, `ProtectedRoute.jsx`) — shared building blocks used across candidate and employer job/application views

Pages in `src/pages/` compose these components together and connect them to data via `src/services/`.

---

## Screens / Pages Overview

| Page | Role | Purpose |
|---|---|---|
| Home | Public | Landing page introducing the platform |
| Login / Register | Public | Authentication entry points |
| Candidate Dashboard | Candidate | Resume status, applications, match score overview |
| Resume Intelligence | Candidate | Upload resume, view AI-parsed profile and insights |
| Job Listings | Candidate | Search, filter, and paginate available jobs |
| Job Detail | Candidate | Full job description and apply action |
| Applications | Candidate | List and track submitted applications |
| Application Detail | Candidate | Match score, strengths, gaps, interview questions |
| Candidate Profile | Candidate | Edit personal/profile information |
| Employer Dashboard | Employer | Job and application statistics overview |
| Company Profile | Employer | Manage company details |
| Job Management | Employer | Create, edit, delete, and close jobs |
| Job Applications | Employer | Review applications received for a job |
| Candidate Detail | Employer | View candidate resume, AI analysis, and ranking data |

---

## Error and Loading States

Every data-driven screen implements three explicit UI states in addition to the "loaded" state:

- **Loading state** — shown while a request is in flight (e.g. `AIProcessingState.jsx` for AI-related operations)
- **Error state** — shown when a request fails, with a user-facing message
- **Empty state** — shown when a request succeeds but returns no data (e.g. no jobs matching filters, no applications yet)

Toast notifications supplement these states for transient success/error feedback (e.g. "Application submitted successfully").

---

## Security Considerations

The following are implemented on the frontend:

- Access and refresh tokens are stored in `localStorage` and attached only to requests going to the configured API base URL
- Protected routes prevent unauthenticated or wrong-role users from rendering restricted pages client-side
- Form validation is performed before submitting sensitive requests (login, registration, profile updates)
- Authentication state is fully cleared on logout and on refresh-token failure

> Client-side route protection and token handling improve UX and reduce accidental exposure, but **authoritative security enforcement happens on the backend**. The frontend does not implement encryption, CSRF protection, or server-side session management — these are backend concerns.

---

## Deployment

The frontend is deployed independently from the backend, communicating purely over the REST API defined by `VITE_API_URL`.

## Vercel Deployment

The frontend is deployed on **Vercel** at:

```
https://hiresense-ai.vercel.app
```

Required Vercel environment variable:

```env
VITE_API_URL=https://hiresense-ai-production-76e1.up.railway.app/api
```

This variable should be set for the **Production** environment, and optionally for **Preview** deployments as well.

---

## Backend Integration

The frontend integrates with the HireSense AI backend (Node.js/Express, deployed on Railway) purely through its REST API. Key integration points:

- All authentication, job, application, and AI-related data is fetched via the Axios API layer described above.
- The base API URL is fully configurable via `VITE_API_URL`, allowing the same frontend build to target a local backend (`http://localhost:5000/api`) or the production backend (`https://hiresense-ai-production-76e1.up.railway.app/api`).
- The frontend does not duplicate backend business logic (e.g. AI parsing, ranking calculations) — it only renders what the API returns.

For full API endpoint documentation, request/response shapes, and backend setup, refer to the backend README in `hiresense_backend/`.

---

## Testing

The frontend has been tested **manually** across candidate and employer flows using the development server and the deployed Vercel build. There is currently no automated frontend test suite.

---

## Known Limitations / Future Improvements

- No automated frontend testing (e.g. component or end-to-end tests) yet
- No offline/PWA support
- No internationalization (i18n) support
- Potential future additions: saved jobs, resume version history, in-app notifications, advanced analytics charts for employers

---

## Learning Outcomes

Building this frontend involved:

- Structuring a multi-role React application with role-based routing and access control
- Designing a resilient Axios interceptor pattern for JWT access/refresh token handling, including shared in-flight refresh requests
- Building a component library shared across two distinct user experiences (candidate/employer)
- Rendering AI-generated, asynchronous data (resume analysis, match scores) with proper loading/error/empty states
- Implementing a runtime theme system with Tailwind CSS
- Integrating a React SPA with a separately deployed backend across different environments (local vs. production)

---

## SDE Interview Talking Points

- "The frontend is a role-based React SPA that renders AI-generated recruitment data — nothing is hardcoded, everything comes from the backend API."
- "Authentication uses JWT access and refresh tokens, with an Axios interceptor that transparently refreshes expired access tokens and retries failed requests, while sharing a single in-flight refresh call across concurrent 401s to avoid race conditions."
- "Protected routes enforce both authentication and role (candidate vs. employer) before rendering, keeping the two experiences fully isolated at the routing layer."
- "The component structure separates AI-specific, common, and role-specific components, which keeps the codebase reusable as new features are added."
- "The app supports a dark-by-default theme with a light alternative, along with explicit loading, error, and empty states across every data-driven screen."

---

## Project Status

Actively developed. Core candidate and employer flows, authentication, and AI-result rendering are implemented and deployed to production. See [Known Limitations / Future Improvements](#known-limitations--future-improvements) for planned work.

---

## Author

**Rahul Meena**
GitHub: [@Jharwal77](https://github.com/Jharwal77)

---

## Repository Links

- **Monorepo:** https://github.com/Jharwal77/hiresense-ai
- **Frontend source:** https://github.com/Jharwal77/hiresense-ai/tree/main/hiresense_frontend
- **Backend source:** https://github.com/Jharwal77/hiresense-ai/tree/main/hiresense_backend
- **Live app:** https://hiresense-ai.vercel.app
- **Production API:** https://hiresense-ai-production-76e1.up.railway.app

---

## License

This project is currently intended for educational and portfolio purposes. An official license (e.g. MIT) may be added in the future.
