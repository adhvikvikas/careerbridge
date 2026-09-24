# CareerBridge

Institutional Recruitment & Placement Management Platform

## 1. Project Overview

CareerBridge is a professional three-role campus recruitment platform connecting Student Applicants, Company Recruiters, and Placement Cell Administrators. It centralizes and digitizes the institutional placement workflow, replacing fragmented notices and manual approvals with a controlled, audit-friendly digital environment.

## 2. Core User Roles

- **Student:** Can discover approved opportunities, maintain an academic profile, and apply to eligible jobs.
- **Recruiter:** Can manage company profiles, publish job postings (with eligibility criteria), and review/progress applicants.
- **Placement Admin:** Oversees the institutional workflow by approving/rejecting companies and jobs, and maintains an auditable approval history.

## 3. Planned Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express
- **Database / ORM:** PostgreSQL, Prisma
- **Auth (Future Phase):** JWT, bcrypt
- **Validation (Future Phase):** Zod

## 4. Project Structure

The project is structured as a monorepo containing two main parts:

- `frontend/`: The React SPA (Single Page Application)
- `backend/`: The Express REST API
- `docs/`: Project documentation (to be expanded)

## 5. Current Development Phase

**Currently in PHASE 1 - PROJECT FOUNDATION.** 
*Note: Advanced features like Authentication, Role-Based Access Control, Eligibility Engine, and Application Tracking have NOT been implemented yet.*

## 6. Local Development Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (running locally)
- Git

## 7. Basic Setup

1. **Clone the repository.**
2. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   ```
3. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```
4. **Database Configuration:**
   Copy `backend/.env.example` to `backend/.env` and update `DATABASE_URL` with your local PostgreSQL connection string.
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

## 8. Running the Frontend

From the `frontend/` directory:
```bash
npm run dev
```

## 9. Running the Backend

From the `backend/` directory:
```bash
npm run dev
```

## 10. API Health Check

When the backend is running, verify it by visiting:
`GET http://localhost:5000/api/health`

It should return:
```json
{
  "success": true,
  "message": "CareerBridge API is running"
}
```

## 11. Development Roadmap

- **Phase 1: Foundation (Complete)**
- Phase 2: Authentication & RBAC
- Phase 3: Admin Governance
- Phase 4: Recruiter Portal
- Phase 5: Student Portal
- Phase 6: Polish & Submission
