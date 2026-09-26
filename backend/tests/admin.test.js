require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Admin Governance API', () => {
  let adminToken;
  let studentToken;
  let recruiterToken;
  let testCompany;
  let testJob;
  let recruiterId;

  beforeAll(async () => {
    const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminRes.body.token;

    const studentRes = await request(app).post('/api/auth/login').send({ email: 'student@example.com', password: 'password123' });
    studentToken = studentRes.body.token;

    const recruiterRes = await request(app).post('/api/auth/login').send({ email: 'recruiter@example.com', password: 'password123' });
    recruiterToken = recruiterRes.body.token;
    
    const recruiterUser = await prisma.user.findUnique({ where: { email: 'recruiter@example.com' }, include: { recruiterProfile: true }});
    recruiterId = recruiterUser.recruiterProfile.id;

    // Reset database state for tests
    await prisma.adminActionLog.deleteMany({});
    await prisma.jobPosting.deleteMany({});
    await prisma.company.deleteMany({});

    testCompany = await prisma.company.create({
      data: {
        name: 'Test Company',
        description: 'A test company',
        recruiterId,
        status: 'PENDING'
      }
    });

    testJob = await prisma.jobPosting.create({
      data: {
        title: 'Test Job',
        description: 'A test job',
        deadline: new Date('2027-12-31'),
        companyId: testCompany.id,
        status: 'PENDING'
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Authorization', () => {
    it('unauthenticated admin companies request → 401', async () => {
      const res = await request(app).get('/api/admin/companies');
      expect(res.status).toBe(401);
    });

    it('student admin request → 403', async () => {
      const res = await request(app).get('/api/admin/companies').set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('recruiter admin request → 403', async () => {
      const res = await request(app).get('/api/admin/companies').set('Authorization', `Bearer ${recruiterToken}`);
      expect(res.status).toBe(403);
    });
    
    it('unauthenticated audit log → 401', async () => {
      const res = await request(app).get('/api/admin/audit-logs');
      expect(res.status).toBe(401);
    });

    it('non-admin audit log → 403', async () => {
      const res = await request(app).get('/api/admin/audit-logs').set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });
    
    it('admin audit log → 200', async () => {
      const res = await request(app).get('/api/admin/audit-logs').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Company Governance', () => {
    it('admin can list companies', async () => {
      const res = await request(app).get('/api/admin/companies').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.companies.length).toBeGreaterThan(0);
    });
    
    it('invalid company ID → 404', async () => {
      const res = await request(app).patch('/api/admin/companies/invalid-id/approve').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it('admin can reject company', async () => {
      const res = await request(app)
        .patch(`/api/admin/companies/${testCompany.id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Incomplete profile' });
      
      expect(res.status).toBe(200);
      expect(res.body.company.status).toBe('REJECTED');
      expect(res.body.company.rejectionReason).toBe('Incomplete profile');
    });

    it('audit log created for company rejection', async () => {
      const logs = await prisma.adminActionLog.findMany({ where: { action: 'COMPANY_REJECTED' } });
      expect(logs.length).toBe(1);
      expect(logs[0].reason).toBe('Incomplete profile');
    });

    it('admin can approve company', async () => {
      const res = await request(app)
        .patch(`/api/admin/companies/${testCompany.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.company.status).toBe('APPROVED');
      expect(res.body.company.rejectionReason).toBeNull();
    });

    it('audit log created for company approval', async () => {
      const logs = await prisma.adminActionLog.findMany({ where: { action: 'COMPANY_APPROVED' } });
      expect(logs.length).toBe(1);
    });

    it('repeated invalid state transition handled', async () => {
      const res = await request(app)
        .patch(`/api/admin/companies/${testCompany.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(409); // Conflict, already approved
    });
  });

  describe('Job Governance', () => {
    it('admin can list jobs', async () => {
      const res = await request(app).get('/api/admin/jobs').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.jobs.length).toBeGreaterThan(0);
    });

    it('invalid job ID → 404', async () => {
      const res = await request(app).patch('/api/admin/jobs/invalid-id/approve').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it('admin can reject job', async () => {
      const res = await request(app)
        .patch(`/api/admin/jobs/${testJob.id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Invalid requirements' });
      
      expect(res.status).toBe(200);
      expect(res.body.job.status).toBe('REJECTED');
      expect(res.body.job.rejectionReason).toBe('Invalid requirements');
    });

    it('rejection reason stored for job', async () => {
      const dbJob = await prisma.jobPosting.findUnique({ where: { id: testJob.id } });
      expect(dbJob.rejectionReason).toBe('Invalid requirements');
    });

    it('audit log created for job action', async () => {
      const logs = await prisma.adminActionLog.findMany({ where: { action: 'JOB_REJECTED' } });
      expect(logs.length).toBe(1);
      expect(logs[0].reason).toBe('Invalid requirements');
    });

    it('admin can approve job when company approved', async () => {
      // Company was approved in earlier tests
      const res = await request(app)
        .patch(`/api/admin/jobs/${testJob.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.job.status).toBe('APPROVED');
    });

    it('admin cannot approve job when company pending/rejected', async () => {
      const pendingCompany = await prisma.company.create({
        data: { name: 'Pending Co', recruiterId, status: 'PENDING' }
      });
      const pendingJob = await prisma.jobPosting.create({
        data: { title: 'Pending Job', description: 'Desc', deadline: new Date('2027-12-31'), companyId: pendingCompany.id, status: 'PENDING' }
      });

      const res = await request(app)
        .patch(`/api/admin/jobs/${pendingJob.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(409); // Conflict, company not approved
    });
  });
});
