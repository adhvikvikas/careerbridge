# CareerBridge

CareerBridge is a professional three-role campus recruitment platform connecting Student Applicants, Company Recruiters, and Placement Cell Administrators. It centralizes and digitizes the institutional placement workflow, replacing fragmented notices and manual approvals with a controlled, audit-friendly digital environment.

## 1. Project Overview

The platform ensures a fair, transparent, and efficient recruitment process through verified opportunities, strict eligibility constraints (CGPA, Branch, Year), and an auditable approval history.

## 2. Core User Roles

- **Student:** Can discover approved opportunities, maintain an academic profile, check eligibility before applying, and track application progress.
- **Recruiter:** Can manage company profiles, publish job postings with specific criteria, review student applicants, and manage the hiring pipeline.
- **Placement Admin:** Oversees the institutional workflow by reviewing and approving companies and jobs before they become visible to students.

## 3. Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Framer Motion
- **Backend:** Node.js, Express
- **Database / ORM:** PostgreSQL, Prisma
- **Authentication:** JWT, bcrypt, Google OAuth
- **Validation:** Zod
- **Testing:** Vitest, Supertest

## 4. Project Structure

The project is a monorepo containing:
- `frontend/`: The React SPA (Single Page Application)
- `backend/`: The Express REST API

## 5. Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (running locally or managed)
- Git

## 6. Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd careerbridge
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   - Copy `.env.example` to `.env` and fill in local variables (Database URL, JWT Secret, Google Client ID, etc.).
   - Run migrations and seed the database (do NOT run reset in production):
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
   - Start backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```
   - Copy `.env.example` to `.env` and configure `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID`.
   - Start frontend:
   ```bash
   npm run dev
   ```

## 7. Demo Credentials

If the database is seeded, the following demo credentials are available (password is `password123` for all):
- **Admin:** `admin@example.com`
- **Recruiter:** `recruiter@example.com`
- **Student:** `student@example.com`

## 8. Testing

The backend includes a comprehensive test suite covering authentication, RBAC, workflows, and edge cases.
A separate test database is used to avoid destructive operations on the development environment.

From the `backend/` directory:
```bash
npm test
```

## 9. Production Deployment Guide

CareerBridge is fully prepared for production deployment.

### Architecture Recommendation
- **Frontend:** Vercel (SPA routing is pre-configured via `vercel.json`)
- **Backend:** Render, Railway, or Heroku
- **Database:** Supabase, Neon, or Render PostgreSQL

### Deployment Steps
1. **Database:** Deploy your managed PostgreSQL instance.
2. **Backend:**
   - Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` (the deployed frontend URL), `GOOGLE_CLIENT_ID`.
   - The platform natively listens on `process.env.PORT`.
   - Build step (if any): `npm install`
   - Pre-start step: Ensure Prisma migrations are deployed safely using `npx prisma migrate deploy` (do NOT use reset).
   - Start command: `npm start` (which runs `node src/server.js`).
3. **Frontend:**
   - Set environment variables: `VITE_API_URL` (the deployed backend URL), `VITE_GOOGLE_CLIENT_ID`.
   - Build command: `npm run build`
   - Output directory: `dist`
4. **Google OAuth Configuration:**
   - Update your Google Cloud Console OAuth 2.0 Client ID.
   - Add the deployed Frontend URL to "Authorized JavaScript origins".
   - (No redirect URI required since it uses the `@react-oauth/google` popup flow).

### Safe Database Migrations
Always run:
```bash
npx prisma validate
npx prisma migrate deploy
```
*Never run `npx prisma migrate reset` in production.*
