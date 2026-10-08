require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

describe('Recruiter Profile, Company & Notifications API', () => {
  let adminToken, studentToken, r3Token, r4Token;
  let r3Id, r4Id;
  let notifId;

  beforeAll(async () => {
    const s1Res = await request(app).post('/api/auth/login').send({ email: 'student@example.com', password: 'password123' });
    studentToken = s1Res.body.token;

    const r3User = await prisma.user.upsert({
      where: { email: 'recruiter3@example.com' },
      update: {},
      create: {
        email: 'recruiter3@example.com',
        passwordHash: 'dummy',
        role: 'RECRUITER',
        recruiterProfile: { create: { name: 'Recruiter Three' } }
      },
      include: { recruiterProfile: true }
    });
    r3Token = jwt.sign({ id: r3User.id, email: r3User.email, role: 'RECRUITER' }, process.env.JWT_SECRET || 'supersecret');
    r3Id = r3User.recruiterProfile.id;

    const r4User = await prisma.user.upsert({
      where: { email: 'recruiter4@example.com' },
      update: {},
      create: {
        email: 'recruiter4@example.com',
        passwordHash: 'dummy',
        role: 'RECRUITER',
        recruiterProfile: { create: { name: 'Recruiter Four' } }
      },
      include: { recruiterProfile: true }
    });
    r4Token = jwt.sign({ id: r4User.id, email: r4User.email, role: 'RECRUITER' }, process.env.JWT_SECRET || 'supersecret');
    r4Id = r4User.recruiterProfile.id;

    // Give r4 a company already
    const existingR4 = await prisma.company.findFirst({ where: { recruiterId: r4Id } });
    if (!existingR4) {
      await prisma.company.create({
        data: { name: 'Company Four', recruiterId: r4Id, status: 'PENDING' }
      });
    }

    // Ensure r3 has NO company for testing creation
    await prisma.company.deleteMany({ where: { recruiterId: r3Id } });

    // Create a notification for r3
    const notif = await prisma.notification.create({
      data: { userId: r3User.id, type: 'TEST', title: 'Test', message: 'Hello' }
    });
    notifId = notif.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Company Management', () => {
    it('unauthenticated request rejected', async () => {
      const res = await request(app).post('/api/recruiter/company').send({ name: 'New Co' });
      expect(res.status).toBe(401);
    });

    it('non-recruiter rejected', async () => {
      const res = await request(app).post('/api/recruiter/company').set('Authorization', `Bearer ${studentToken}`).send({ name: 'New Co' });
      expect(res.status).toBe(403);
    });

    it('recruiter can create company', async () => {
      const res = await request(app)
        .post('/api/recruiter/company')
        .set('Authorization', `Bearer ${r3Token}`)
        .send({ name: 'Company Three', description: 'desc', website: 'https://example.com' });
      expect(res.status).toBe(201);
      expect(res.body.company.name).toBe('Company Three');
      expect(res.body.company.status).toBe('PENDING');
    });

    it('recruiter cannot directly set approval status', async () => {
      const res = await request(app)
        .patch('/api/recruiter/company')
        .set('Authorization', `Bearer ${r3Token}`)
        .send({ name: 'Company Three Update', status: 'APPROVED' }); // ignoring status
      expect(res.status).toBe(200);
      expect(res.body.company.status).toBe('PENDING'); // still pending
      expect(res.body.company.name).toBe('Company Three Update');
    });

    it('recruiter cannot modify another recruiter company (update uses own company)', async () => {
      // The controller naturally only updates the authenticated user's company
      const res = await request(app)
        .patch('/api/recruiter/company')
        .set('Authorization', `Bearer ${r4Token}`)
        .send({ name: 'Hacked Name' });
      expect(res.status).toBe(200);
      expect(res.body.company.name).toBe('Hacked Name');
      // R3's company is still Company Three Update
      const r3Profile = await request(app).get('/api/recruiter/profile').set('Authorization', `Bearer ${r3Token}`);
      expect(r3Profile.body.profile.companies[0].name).toBe('Company Three Update');
    });
  });

  describe('Profile Update', () => {
    it('unauthenticated rejected', async () => {
      const res = await request(app).patch('/api/recruiter/profile').send({ name: 'Name' });
      expect(res.status).toBe(401);
    });

    it('non-recruiter rejected', async () => {
      const res = await request(app).patch('/api/recruiter/profile').set('Authorization', `Bearer ${studentToken}`).send({ name: 'Name' });
      expect(res.status).toBe(403);
    });

    it('recruiter can update own profile', async () => {
      const res = await request(app)
        .patch('/api/recruiter/profile')
        .set('Authorization', `Bearer ${r3Token}`)
        .send({ name: 'Updated Recruiter Three', phone: '999999' });
      expect(res.status).toBe(200);
      expect(res.body.profile.name).toBe('Updated Recruiter Three');
      expect(res.body.profile.phone).toBe('999999');
    });

    it('protected user fields cannot be modified through profile update', async () => {
      const res = await request(app)
        .patch('/api/recruiter/profile')
        .set('Authorization', `Bearer ${r3Token}`)
        .send({ name: 'Update', email: 'hacked@example.com', role: 'ADMIN' });
      expect(res.status).toBe(200);
      // Profile shouldn't contain email anyway (except through nested user which shouldn't be updated)
      const profile = await prisma.recruiterProfile.findUnique({ where: { id: r3Id }, include: { user: true } });
      expect(profile.user.email).toBe('recruiter3@example.com');
      expect(profile.user.role).toBe('RECRUITER');
    });
  });

  describe('Notifications', () => {
    it('unauthenticated rejected', async () => {
      const res = await request(app).get('/api/recruiter/notifications');
      expect(res.status).toBe(401);
    });

    it('non-recruiter rejected', async () => {
      const res = await request(app).get('/api/recruiter/notifications').set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('recruiter can retrieve own notifications', async () => {
      const res = await request(app).get('/api/recruiter/notifications').set('Authorization', `Bearer ${r3Token}`);
      expect(res.status).toBe(200);
      expect(res.body.notifications.length).toBeGreaterThan(0);
      expect(res.body.notifications[0].id).toBe(notifId);
    });

    it('recruiter cannot access another recruiter notification', async () => {
      const res = await request(app).patch(`/api/recruiter/notifications/${notifId}/read`).set('Authorization', `Bearer ${r4Token}`);
      expect(res.status).toBe(404);
    });

    it('recruiter can mark own notification read', async () => {
      const res = await request(app).patch(`/api/recruiter/notifications/${notifId}/read`).set('Authorization', `Bearer ${r3Token}`);
      expect(res.status).toBe(200);
      expect(res.body.notification.readAt).not.toBeNull();
    });

    it('recruiter can mark all own notifications read', async () => {
      const res = await request(app).patch('/api/recruiter/notifications/read-all').set('Authorization', `Bearer ${r3Token}`);
      expect(res.status).toBe(200);
    });
  });
});
