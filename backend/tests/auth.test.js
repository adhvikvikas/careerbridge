require('dotenv').config();
const request = require('supertest');

const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

describe('Authentication API', () => {
  let studentToken;
  let recruiterToken;
  let adminToken;

  beforeAll(async () => {
    // We already have seeded data, but we can verify login to get tokens
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@example.com', password: 'password123' });
    studentToken = studentRes.body.token;

    const recruiterRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'recruiter@example.com', password: 'password123' });
    recruiterToken = recruiterRes.body.token;

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminRes.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('Login with valid credentials succeeds', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student@example.com', password: 'password123' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('Login with invalid password fails', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student@example.com', password: 'wrongpassword' });
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('Login with unknown email fails safely', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'unknown@example.com', password: 'password123' });
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('Rejects unauthenticated requests', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('Succeeds with a valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('student@example.com');
    });
  });

  describe('RBAC Protected Routes', () => {
    it('Student can access student-protected route', async () => {
      const res = await request(app)
        .get('/api/student/test')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
    });

    it('Student cannot access recruiter-protected route', async () => {
      const res = await request(app)
        .get('/api/recruiter/test')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('Student cannot access admin-protected route', async () => {
      const res = await request(app)
        .get('/api/admin/test')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('Recruiter cannot access admin-protected route', async () => {
      const res = await request(app)
        .get('/api/admin/test')
        .set('Authorization', `Bearer ${recruiterToken}`);
      expect(res.status).toBe(403);
    });

    it('Admin can access admin-protected route', async () => {
      const res = await request(app)
        .get('/api/admin/test')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });
});
