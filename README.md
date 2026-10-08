# CareerBridge

Institutional Recruitment & Placement Management Platform

## Overview

CareerBridge is a professional three-role campus recruitment platform connecting Student Applicants, Company Recruiters, and Placement Cell Administrators. It centralizes and digitizes the institutional placement workflow, replacing fragmented notices and manual approvals with a controlled, audit-friendly digital environment.

## Core Roles

- **Student:** Can discover approved opportunities, maintain an academic profile, check their eligibility programmatically, and apply to jobs seamlessly.
- **Recruiter:** Can manage company profiles, publish job postings (with strict eligibility criteria), and review/progress applicants through various recruitment stages.
- **Placement Admin:** Oversees the institutional workflow by approving/rejecting companies and jobs, providing governance, and maintaining an auditable action history.

## Key Features

- **Role-Based Access Control (RBAC):** Strict security boundaries isolating Students, Recruiters, and Admins.
- **Server-Side Eligibility Engine:** Programmatically calculates and enforces job requirements (CGPA, Branches, Graduation Year, Deadlines) on the backend.
- **Governance Workflow:** Admin approval is required for all new companies and job postings before they go live to students.
- **Application Tracking:** Students can track their application statuses (Under Review, Shortlisted, Selected, Rejected) as recruiters update them.
- **Audit Logging:** All critical admin governance actions are logged for institutional transparency.
- **Duplicate Application Prevention:** Robust constraints prevent students from submitting multiple applications to the same job.

## Technology Stack

Frontend:
- React
- Vite
- Tailwind CSS
- React Router
- lucide-react (Icons)

Backend:
- Node.js
- Express

Database:
- PostgreSQL
- Prisma (ORM)

Authentication:
- JWT (JSON Web Tokens)
- bcrypt (Password Hashing)

Validation:
- Zod

Testing:
- Vitest
- Supertest

## Architecture

The system operates on a decoupled client-server architecture:

React (SPA)
↓
Express API (RESTful endpoints)
↓
Authentication/RBAC Middleware
↓
Controllers/Services/Validation
↓
Prisma ORM
↓
PostgreSQL

## Project Structure

- `frontend/`: The React Single Page Application (Vite-based).
  - `src/pages/`: Contains role-specific directories (`admin`, `recruiter`, `student`, `auth`).
  - `src/components/`: Shared UI components and Role-based Layouts.
  - `src/services/`: API configuration and networking.
- `backend/`: The Express Node.js Server.
  - `src/controllers/`: Route handlers per module.
  - `src/routes/`: Express router definitions.
  - `src/validators/`: Zod validation schemas.
  - `src/middleware/`: Auth and Error handling logic.
  - `prisma/`: Database schema and migrations.
  - `tests/`: Extensive API test suites.

## User Workflows

**Student:**
Register/login → Profile → Browse Jobs → Eligibility → Apply → Track Application

**Recruiter:**
Login → Company/Profile → Create Job → Admin Approval → Manage Applicants → Update Status

**Admin:**
Login → Dashboard → Approve Companies → Approve Jobs → Audit Actions

## Installation

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (running locally)
- Git

### 1. Clone the repository
```bash
git clone <repository_url>
cd careerbridge
```

### 2. Setup Backend & Database
```bash
cd backend
npm install
```

Copy the environment variables template and configure your local PostgreSQL connection string:
```bash
cp .env.example .env
```
Update `DATABASE_URL` inside `.env`.

Initialize the database schema and seed default users:
```bash
npx prisma migrate dev
npx prisma db seed
```

### 3. Setup Frontend
In a new terminal window:
```bash
cd frontend
npm install
```

### 4. Running the Application
Start the backend API (runs on port 5000):
```bash
cd backend
npm run dev
```

Start the frontend Vite server (runs on port 5173):
```bash
cd frontend
npm run dev
```

## Testing

Run the full backend regression suite sequentially:
```bash
cd backend
npx vitest run tests/auth.test.js && npx vitest run tests/admin.test.js && npx vitest run tests/recruiter.test.js && npx vitest run tests/student.test.js
```

Build the frontend for production:
```bash
cd frontend
npm run build
```

## Security

- **JWT & bcrypt:** Passwords are never stored in plaintext. JWTs are used for stateless session management.
- **RBAC:** Middleware validates the active role attached to the JWT, rejecting unauthorized access with HTTP 403.
- **Ownership Checks (IDOR Prevention):** Lookups for jobs, profiles, and applications are tightly tethered to the authenticated `user.id` on the backend, preventing data traversal.
- **Server-Side Eligibility:** Eligibility validation happens strictly on the server-side before persisting an application, regardless of UI manipulation.
- **Duplicate Constraints:** Database-level `@@unique` composite constraints physically prevent multiple applications.

## Current Scope

This submission encapsulates Phase 6 (Final Polish & Submission) of the CareerBridge roadmap. All core flows—Foundation, Auth/RBAC, Admin Governance, Recruiter Portal, and Student Portal—are fully implemented, functionally integrated, styled, and extensively tested.

## Future Enhancements

- Interview scheduling integrations
- Richer analytics and exportable reporting
- Actual resume file storage (AWS S3 / Cloudinary integration)
- Production Deployment (Dockerization / Vercel / Railway)
- Advanced notifications (Email integration via SendGrid/AWS SES)
