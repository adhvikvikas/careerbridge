require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Student Portal API', () => {
  let studentToken;
  let adminToken;
  let recruiterToken;
  let studentUserId;
  let studentProfileId;
  let testCompany;
  let approvedJob;
  let pendingJob;
  let expiredJob;

  beforeAll(async () => {
    // We expect basic users to be seeded by Phase 1/2 tests or we just login
    const studentRes = await request(app).post('/api/auth/login').send({ email: 'student@example.com', password: 'password123' });
    studentToken = studentRes.body.token;
    
    const adminRes = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminRes.body.token;

    const recruiterRes = await request(app).post('/api/auth/login').send({ email: 'recruiter@example.com', password: 'password123' });
    recruiterToken = recruiterRes.body.token;

    const studentUser = await prisma.user.findUnique({ where: { email: 'student@example.com' }, include: { studentProfile: true }});
    studentUserId = studentUser.id;
    studentProfileId = studentUser.studentProfile.id;
    
    const recruiterUser = await prisma.user.findUnique({ where: { email: 'recruiter@example.com' }, include: { recruiterProfile: true }});

    // Cleanup Phase 4 and 5 data for this specific student
    await prisma.notification.deleteMany({ where: { userId: studentUserId } });
    await prisma.savedJob.deleteMany({ where: { studentId: studentProfileId } });
    await prisma.applicationStatusHistory.deleteMany({
      where: { application: { studentId: studentProfileId } }
    });
    await prisma.application.deleteMany({ where: { studentId: studentProfileId } });

    // Ensure test company exists
    testCompany = await prisma.company.findFirst({ where: { recruiterId: recruiterUser.recruiterProfile.id } });
    if (!testCompany) {
      testCompany = await prisma.company.create({
        data: {
          name: 'Test Company',
          recruiterId: recruiterUser.recruiterProfile.id,
          status: 'APPROVED'
        }
      });
    }

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);

    approvedJob = await prisma.jobPosting.create({
      data: {
        title: 'Approved Job',
        description: 'Approved Desc',
        deadline: futureDate,
        companyId: testCompany.id,
        status: 'APPROVED',
        minCgpa: 7.0,
        departments: ['CSE', 'IT']
      }
    });

    pendingJob = await prisma.jobPosting.create({
      data: {
        title: 'Pending Job',
        description: 'Pending Desc',
        deadline: futureDate,
        companyId: testCompany.id,
        status: 'PENDING'
      }
    });
    
    expiredJob = await prisma.jobPosting.create({
      data: {
        title: 'Expired Job',
        description: 'Expired Desc',
        deadline: pastDate,
        companyId: testCompany.id,
        status: 'APPROVED'
      }
    });

    // Reset student profile state
    await prisma.studentProfile.update({
      where: { id: studentProfileId },
      data: { branch: 'CSE', cgpa: 8.5, graduationYear: 2025 }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Authorization', () => {
    it('unauthenticated request rejected', async () => {
      const res = await request(app).get('/api/student/profile');
      expect(res.status).toBe(401);
    });

    it('wrong role rejected (admin)', async () => {
      const res = await request(app).get('/api/student/profile').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(403);
    });
    
    it('wrong role rejected (recruiter)', async () => {
      const res = await request(app).get('/api/student/profile').set('Authorization', `Bearer ${recruiterToken}`);
      expect(res.status).toBe(403);
    });

    it('student role accepted', async () => {
      const res = await request(app).get('/api/student/profile').set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Profile', () => {
    it('student can read own profile', async () => {
      const res = await request(app).get('/api/student/profile').set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.profile.branch).toBe('CSE');
    });

    it('student can update own profile', async () => {
      const res = await request(app)
        .patch('/api/student/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ cgpa: 9.0, backlogs: 0 });
      expect(res.status).toBe(200);
      expect(res.body.profile.cgpa).toBe(9.0);
    });

    it('invalid profile data rejected', async () => {
      const res = await request(app)
        .patch('/api/student/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ cgpa: 11.0 }); // Over 10
      expect(res.status).toBe(400);
    });
  });

  describe('Jobs', () => {
    it('approved jobs visible', async () => {
      const res = await request(app).get('/api/student/jobs').set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      const jobs = res.body.jobs;
      expect(jobs.find(j => j.id === approvedJob.id)).toBeDefined();
    });

    it('pending jobs hidden', async () => {
      const res = await request(app).get('/api/student/jobs').set('Authorization', `Bearer ${studentToken}`);
      const jobs = res.body.jobs;
      expect(jobs.find(j => j.id === pendingJob.id)).toBeUndefined();
    });

    it('job details restricted appropriately (cannot view pending)', async () => {
      const res = await request(app).get(`/api/student/jobs/${pendingJob.id}`).set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Eligibility', () => {
    it('eligible student passes', async () => {
      const res = await request(app).get(`/api/student/jobs/${approvedJob.id}`).set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.eligibility.eligible).toBe(true);
    });

    it('ineligible CGPA rejected', async () => {
      await prisma.studentProfile.update({ where: { id: studentProfileId }, data: { cgpa: 6.0 } });
      const res = await request(app).get(`/api/student/jobs/${approvedJob.id}`).set('Authorization', `Bearer ${studentToken}`);
      expect(res.body.eligibility.eligible).toBe(false);
      expect(res.body.eligibility.reasons.some(r => r.includes('Minimum CGPA'))).toBe(true);
      // Restore
      await prisma.studentProfile.update({ where: { id: studentProfileId }, data: { cgpa: 8.5 } });
    });

    it('deadline passed rejected', async () => {
      const res = await request(app).get(`/api/student/jobs/${expiredJob.id}`).set('Authorization', `Bearer ${studentToken}`);
      expect(res.body.eligibility.eligible).toBe(false);
      expect(res.body.eligibility.reasons.some(r => r.includes('deadline has passed'))).toBe(true);
    });
  });

  describe('Applications', () => {
    it('ineligible student cannot apply', async () => {
      await prisma.studentProfile.update({ where: { id: studentProfileId }, data: { cgpa: 6.0 } });
      const res = await request(app).post(`/api/student/jobs/${approvedJob.id}/apply`).set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
      // Restore
      await prisma.studentProfile.update({ where: { id: studentProfileId }, data: { cgpa: 8.5 } });
    });

    it('expired job cannot be applied to', async () => {
      const res = await request(app).post(`/api/student/jobs/${expiredJob.id}/apply`).set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });
    
    it('unapproved job cannot be applied to', async () => {
      const res = await request(app).post(`/api/student/jobs/${pendingJob.id}/apply`).set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('eligible student can apply', async () => {
      const res = await request(app).post(`/api/student/jobs/${approvedJob.id}/apply`).set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.application.status).toBe('APPLIED');
    });

    it('duplicate application rejected', async () => {
      const res = await request(app).post(`/api/student/jobs/${approvedJob.id}/apply`).set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(409);
    });

    it('student sees only own applications', async () => {
      const res = await request(app).get('/api/student/applications').set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.applications.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Saved Jobs', () => {
    it('student can save approved job', async () => {
      const res = await request(app).post(`/api/student/jobs/${approvedJob.id}/save`).set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
    });

    it('duplicate save rejected/prevented', async () => {
      const res = await request(app).post(`/api/student/jobs/${approvedJob.id}/save`).set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(409);
    });

    it('student sees only own saved jobs', async () => {
      const res = await request(app).get('/api/student/saved-jobs').set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.savedJobs.length).toBe(1);
    });

    it('student can unsave job', async () => {
      const res = await request(app).delete(`/api/student/jobs/${approvedJob.id}/save`).set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Notifications', () => {
    it('student receives/reads only their own notifications', async () => {
      const res = await request(app).get('/api/student/notifications').set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(200);
      expect(res.body.notifications.length).toBeGreaterThan(0); // From the application submitted
      
      const notifId = res.body.notifications[0].id;
      const readRes = await request(app).patch(`/api/student/notifications/${notifId}/read`).set('Authorization', `Bearer ${studentToken}`);
      expect(readRes.status).toBe(200);
      expect(readRes.body.notification.readAt).not.toBeNull();
    });
  });
});
