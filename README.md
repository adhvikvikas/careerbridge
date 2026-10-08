# CareerBridge

**Institutional Recruitment & Placement Management Platform**

CareerBridge is a comprehensive, role-based placement management system designed to streamline the campus recruitment workflow. It serves as a unified bridge connecting student applicants, company recruiters, and institutional placement administrators. The platform manages the entire lifecycle of university placements, from company and job approvals to student applications, candidate review, and automated audit logging.

---

## Overview

Traditional campus recruitment workflows often suffer from fragmentation—relying on disconnected spreadsheets, scattered emails, external forms, and manual verification processes. CareerBridge centralizes and automates this workflow into a single, cohesive system.

**The Main Workflow:**
1. **Recruiter** registers a Company profile.
2. **Administrator** approves the Company.
3. **Recruiter** posts a Job opening.
4. **Administrator** approves the Job opening.
5. **System** enforces strict eligibility (CGPA, department, graduation year) server-side.
6. **Student** views and applies to the approved, eligible Job.
7. **Recruiter** reviews candidates and updates application statuses.
8. **Student** tracks real-time progress via their dashboard.

---

## Core Features

### Student
- **Authentication:** Secure login and session management.
- **Profile Management:** Manage branch, CGPA, graduation year, and resume link.
- **Job Discovery:** Browse only institution-approved job openings.
- **Server-Side Eligibility:** Automatic enforcement of job requirements before application.
- **Application Tracking:** Apply to jobs, track statuses, and view historical timelines.
- **Saved Jobs:** Bookmark jobs for later consideration.
- **Notifications:** Receive alerts when application statuses change.

### Recruiter
- **Authentication:** Secure access to company-specific workflows.
- **Company Management:** Create and update company profiles (subject to admin approval).
- **Job Management:** Post jobs with specific eligibility criteria (CGPA, departments, grad years).
- **Candidate Pipeline:** View applications, review student profiles, and update candidate statuses (e.g., Shortlisted, Interview, Selected).
- **Recruiter Notes:** Attach internal notes to applications for team tracking.
- **Dashboard:** Track company-wide job and application statistics.

### Placement Administrator
- **Authentication:** High-level access for institutional governance.
- **Company Governance:** Review, approve, or reject new company registrations with actionable feedback.
- **Job Governance:** Review, approve, or reject job postings to ensure they meet institutional standards.
- **Audit Logging:** Immutable timestamped audit trails of all administrative decisions.
- **System Overview:** High-level dashboard statistics monitoring platform activity.

---

## Key Business Rules

### Eligibility Gate
A student can successfully apply to a job **only** when all of the following are true (enforced server-side):
- The job is globally `APPROVED` by an admin.
- The application deadline has not passed.
- The student meets the minimum CGPA requirement.
- The student's department matches the job requirements (including robust department normalization, e.g., treating "Computer Science and Engineering" as "CSE").
- The student's graduation year falls within the accepted range.

### Approval Workflow
- **Company Status:** `PENDING` → `APPROVED` / `REJECTED`
- **Job Status:** `PENDING` → `APPROVED` / `REJECTED`
- *Note:* A job cannot be approved unless its parent company is also approved. Students only interact with approved entities.

### Application Workflow
Candidate progress moves through a strict set of states:
`APPLIED` → `UNDER_REVIEW` → `SHORTLISTED` → `INTERVIEW` → `SELECTED` (or `REJECTED`)
Every transition is logged immutably in the `ApplicationStatusHistory`.

### Auditability
All administrative governance actions (approvals and rejections) are captured in the `AdminActionLog` with the acting admin, the target entity, the exact timestamp, and the justification.

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React (v19), Vite, Tailwind CSS (v4), React Router, Framer Motion, Lucide |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL, Prisma ORM |
| **Security** | JWT (JSON Web Tokens), bcrypt (password hashing) |
| **Validation** | Zod |
| **Testing** | Vitest, Supertest |

---

## Architecture

CareerBridge follows a clean three-tier architecture:

1. **Frontend (React UI):** Handles declarative UI, routing, authentication context, role-specific dashboards, and interactions with the REST API.
2. **Backend (Express REST API):** Acts as the secure boundary enforcing authentication, role-based authorization, Zod request validation, business logic, and eligibility gates.
3. **Database (PostgreSQL via Prisma):** Provides a strongly typed schema representing users, complex polymorphic relationships, status histories, notifications, and immutable audit logs.

---

## Authentication & Authorization

CareerBridge uses **JSON Web Tokens (JWT)** for stateless authentication, with passwords securely hashed via **bcrypt**.

**Role-Based Access Control (RBAC):**
There are three fundamental roles: `STUDENT`, `RECRUITER`, and `ADMIN`.
While the frontend conditionally renders UX pathways based on role context, the **actual security boundary is strictly enforced on the backend**. Protected routes explicitly verify the JWT and assert that the user holds the correct database-level role before authorizing the request. Cross-role impersonation is programmatically blocked.

---

## Data Model

| Model | Purpose |
|-------|---------|
| `User` | Core identity containing credentials, email, and the assigned global `Role`. |
| `StudentProfile` | Extensions for student data (CGPA, branch, resume, graduation year). |
| `RecruiterProfile` | Extensions for recruiter data and contact information. |
| `Company` | Represents an organization; heavily tied to approval statuses. |
| `JobPosting` | Job criteria, descriptions, and deadlines; tied to a parent Company. |
| `Application` | The relational bridge between a Student and a Job. |
| `ApplicationStatusHistory` | Immutable ledger of application state changes and recruiter notes. |
| `Notification` | System alerts dispatched to users (e.g., status updates, governance actions). |
| `SavedJob` | Simple bookmarking relation for students. |
| `AdminActionLog` | Immutable ledger for institutional governance auditing. |

---

## API Overview

The REST API is strictly namespaced by role and capability.

| Area | Purpose |
|------|---------|
| **Auth** | Identity, login (`POST /api/auth/login`), JWT validation (`GET /api/auth/me`), Google Auth. |
| **Student** | Fetch eligible jobs, submit applications, manage saved jobs, update profiles. |
| **Recruiter** | Manage companies, post jobs, fetch candidate pipelines, advance application statuses. |
| **Admin** | Execute governance actions (approve/reject), fetch system audit logs. |

---

## Project Structure

```text
careerbridge/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI elements and AppShell
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Role-segregated views (admin/, recruiter/, student/)
│   │   ├── services/        # API integration layer
│   │   └── App.jsx          # Protected route configurations
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route logic (admin, auth, recruiter, student)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Reusable business logic (e.g., Eligibility, Notifications)
│   │   └── validators/      # Zod schemas
│   ├── prisma/
│   │   ├── schema.prisma    # PostgreSQL database schema
│   │   └── seed.js          # Realistic dummy data generator
│   ├── tests/               # Vitest + Supertest suites
│   └── package.json
│
└── README.md
```

---

## Running Locally

This project is configured to run locally for development and portfolio demonstration purposes.

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally or via Docker)
- npm

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory (see `.env.example`):
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/careerbridge?schema=public"
JWT_SECRET="your_local_secret_key"
```

### 3. Database Initialization
Use Prisma to sync the schema to your local PostgreSQL instance:
```bash
npx prisma db push
```

### 4. Seed Demo Data
Populate the database with a realistic baseline of companies, jobs, students, and application history:
```bash
npx prisma db seed
```

### 5. Start Backend
```bash
npm run dev
```

### 6. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## Demo Accounts

The `prisma db seed` command provisions several accounts to quickly demonstrate the platform's multi-role capabilities. 

*Note: Demo credentials are defined purely in the local seed configuration and are safe for local development testing.*

| Role | Email | Password | Context |
|------|-------|----------|---------|
| **Student** | `student@example.com` | `password123` | Pre-seeded with a profile (Aarav Menon) and realistic application history. |
| **Recruiter** | `recruiter@example.com` | `password123` | Linked to Microsoft, with existing job postings and active candidates. |
| **Admin** | `admin@example.com` | `password123` | Full governance access over pending companies and jobs. |

---

## Testing

CareerBridge includes a robust automated API test suite leveraging **Vitest** and **Supertest**. 

The backend tests run against an explicitly isolated test database (`careerbridge_test`) to ensure that development data is never contaminated. 

To run the suite:
```bash
cd backend
npm test
```
**Current Status:** 106/106 backend tests passing (testing RBAC boundaries, validation, complex application rules, and status lifecycles).

---

## Design

The frontend utilizes a clean, modern aesthetic tailored for institutional software:
- Ivory background with deep navy primary colors and muted terracotta accents.
- Editorial typography emphasizing readability and hierarchy.
- Fully responsive role-specific dashboards.
- Clear visual states for errors, loading, and empty pipelines.

---

## Engineering Practices

- **Security First:** Strict JWT verification, bcrypt hashing, and Zod validation protecting against malformed requests.
- **Server-Side Enforcement:** Business rules (like application eligibility) are aggressively evaluated on the backend rather than trusting the client.
- **Relational Integrity:** Leveraging Prisma to enforce strict foreign key constraints and cascaded safety.
- **Test Isolation:** Dedicated testing databases and environments.
- **Audit Trails:** Immutable logging designed for real-world institutional accountability.

---

## What This Project Demonstrates

- **Full-Stack Competency:** End-to-end implementation from React UI to PostgreSQL data modeling.
- **Complex Transactional Workflows:** Managing states across entities (Company → Job → Application → History).
- **Role-Based Access Control:** Secure, multi-tenant-like data segregation.
- **Automated Quality:** Extensive API testing and edge-case handling.

---

## Future Improvements

*The following features are conceptually planned but intentionally out-of-scope for the current portfolio iteration:*
- Cloud-hosted database migration and production Vercel/Render deployment.
- CI/CD pipeline automation via GitHub Actions.
- Real-time email notifications (e.g., SendGrid integration) replacing in-app-only alerts.
- AWS S3 integration for direct resume PDF uploads.
- Integrated interview scheduling calendar.

---

## Project Status

> CareerBridge is currently maintained as a local portfolio/interview project. The core student, recruiter, and placement administration workflows are successfully implemented and rigorously tested. Public deployment is intentionally not part of the current project scope.

---

## Author

**Adhvik Vikas**  
Integrated M.Tech — Software Engineering
