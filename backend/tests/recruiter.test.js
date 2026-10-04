require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Recruiter Portal API', () => {
  let adminToken, studentToken, recruiter1Token, recruiter2Token;
  let recruiter1Id, recruiter2Id;
  let company1, company2;
  let student1Id;
  let job1;

  beforeAll(async () => {
    // Authenticate users
    const r1Res = await request(app).post('/api/auth/login').send({ email: 'recruiter@example.com', password: 'password123' });
    recruiter1Token = r1Res.body.token;

    const r2User = await prisma.user.upsert({
      where: { email: 'recruiter2@example.com' },
      update: {},
      create: {
        email: 'recruiter2@example.com',
        passwordHash: 'dummy',
        role: 'RECRUITER',
        recruiterProfile: { create: { name: 'Recruiter Two', phone: '123' } }
      },
      include: { recruiterProfile: true }
    });
    
    // Quick login simulation for r2
    const jwt = require('jsonwebtoken');
    recruiter2Token = jwt.sign({ id: r2User.id, email: r2User.email, role: 'RECRUITER' }, process.env.JWT_SECRET || 'supersecret');
    recruiter2Id = r2User.recruiterProfile.id;

    const r1User = await prisma.user.findUnique({ where: { email: 'recruiter@example.com' }, include: { recruiterProfile: true }});
    recruiter1Id = r1User.recruiterProfile.id;

    const s1Res = await request(app).post('/api/auth/login').send({ email: 'student@example.com', password: 'password123' });
    studentToken = s1Res.body.token;
    
    const s1User = await prisma.user.findUnique({ where: { email: 'student@example.com' }, include: { studentProfile: true }});
    student1Id = s1User.studentProfile.id;

    const aRes = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password123' });
    adminToken = aRes.body.token;

    // Reset data
    await prisma.applicationStatusHistory.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.jobPosting.deleteMany({});
    await prisma.company.deleteMany({});

    // Setup basic companies
    company1 = await prisma.company.create({
      data: { name: 'Company One', recruiterId: recruiter1Id, status: 'APPROVED' }
    });
    // recruiter2 has no company initially
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Authorization', () => {
    it('unauthenticated recruiter endpoint → 401', async () => {
      const res = await request(app).get('/api/recruiter/profile');
      expect(res.status).toBe(401);
    });

    it('student → recruiter endpoint → 403', async () => {
      const res = await request(app).get('/api/recruiter/profile').set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('admin → recruiter endpoint → 403', async () => {
      const res = await request(app).get('/api/recruiter/profile').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(403);
    });

    it('recruiter → recruiter endpoint → allowed (200)', async () => {
      const res = await request(app).get('/api/recruiter/profile').set('Authorization', `Bearer ${recruiter1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.profile.companies[0].name).toBe('Company One');
    });
  });

  describe('Company Management', () => {
    it('recruiter without company cannot create job', async () => {
      const res = await request(app).post('/api/recruiter/jobs').set('Authorization', `Bearer ${recruiter2Token}`).send({
        title: 'Test Title', description: 'Desc12345678901234567', departments: ['IT'], graduationYears: [2025], deadline: '2025-12-31'
      });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Company not found for this recruiter');
    });

    it('recruiter can create company', async () => {
      const res = await request(app).post('/api/recruiter/company').set('Authorization', `Bearer ${recruiter2Token}`).send({
        name: 'New Company',
        description: 'New company desc',
        website: 'https://newcomp.com'
      });
      expect(res.status).toBe(201);
      expect(res.body.company.name).toBe('New Company');
      expect(res.body.company.status).toBe('PENDING');
      company2 = res.body.company;
    });

    it('recruiter cannot create duplicate company', async () => {
      const res = await request(app).post('/api/recruiter/company').set('Authorization', `Bearer ${recruiter2Token}`).send({
        name: 'Duplicate Company'
      });
      expect(res.status).toBe(409);
    });

    it('recruiter can retrieve own company', async () => {
      const res = await request(app).get('/api/recruiter/company').set('Authorization', `Bearer ${recruiter2Token}`);
      expect(res.status).toBe(200);
      expect(res.body.company.name).toBe('New Company');
    });

    it('recruiter can update own company', async () => {
      const res = await request(app).patch('/api/recruiter/company').set('Authorization', `Bearer ${recruiter2Token}`).send({
        name: 'Updated Company'
      });
      expect(res.status).toBe(200);
      expect(res.body.company.name).toBe('Updated Company');
    });

    it('recruiter cannot create job while company is PENDING', async () => {
      const res = await request(app).post('/api/recruiter/jobs').set('Authorization', `Bearer ${recruiter2Token}`).send({
        title: 'Test Title', description: 'Desc12345678901234567', departments: ['IT'], graduationYears: [2025], deadline: '2025-12-31'
      });
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Company must be APPROVED before posting jobs');
    });
  });

  describe('Job Creation & Management', () => {
    it('recruiter can create a valid job', async () => {
      const res = await request(app)
        .post('/api/recruiter/jobs')
        .set('Authorization', `Bearer ${recruiter1Token}`)
        .send({
          title: 'Software Engineer',
          description: 'Great role for Software Engineers at our company',
          minCgpa: 7.5,
          departments: ['CS', 'IT'],
          graduationYears: [2027],
          deadline: '2027-12-31',
          employmentType: 'FULL_TIME'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.job.title).toBe('Software Engineer');
      expect(res.body.job.status).toBe('PENDING'); // Governance rule
      job1 = res.body.job;
    });

    it('invalid job payload is rejected (validation)', async () => {
      const res = await request(app)
        .post('/api/recruiter/jobs')
        .set('Authorization', `Bearer ${recruiter1Token}`)
        .send({ title: 'No' }); // Missing required fields
      
      expect(res.status).toBe(400);
    });

    it('recruiter can list own jobs', async () => {
      const res = await request(app).get('/api/recruiter/jobs').set('Authorization', `Bearer ${recruiter1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.jobs.length).toBeGreaterThan(0);
      expect(res.body.jobs[0].companyId).toBe(company1.id);
    });

    it('recruiter cannot access another company job details', async () => {
      const res = await request(app).get(`/api/recruiter/jobs/${job1.id}`).set('Authorization', `Bearer ${recruiter2Token}`);
      expect(res.status).toBe(404);
    });

    it('recruiter cannot edit another company job', async () => {
      const res = await request(app)
        .patch(`/api/recruiter/jobs/${job1.id}`)
        .set('Authorization', `Bearer ${recruiter2Token}`)
        .send({
          title: 'Hacked Title',
          description: 'Great role for Software Engineers at our company',
          departments: ['CS'],
          graduationYears: [2027],
          deadline: '2027-12-31'
        });
      expect(res.status).toBe(404);
    });

    it('recruiter cannot directly set job to APPROVED', async () => {
      const res = await request(app)
        .patch(`/api/recruiter/jobs/${job1.id}`)
        .set('Authorization', `Bearer ${recruiter1Token}`)
        .send({
          title: 'Updated Title',
          description: 'Great role for Software Engineers at our company',
          departments: ['CS'],
          graduationYears: [2027],
          deadline: '2027-12-31',
          employmentType: 'INTERNSHIP',
          status: 'APPROVED'
        });
      expect(res.status).toBe(403);
    });

    it('editing an approved job resets it to PENDING', async () => {
      // Manually set to approved first to test governance flow
      await prisma.jobPosting.update({ where: { id: job1.id }, data: { status: 'APPROVED' } });
      
      const res = await request(app)
        .patch(`/api/recruiter/jobs/${job1.id}`)
        .set('Authorization', `Bearer ${recruiter1Token}`)
        .send({
          title: 'Updated Title',
          description: 'Great role for Software Engineers at our company',
          departments: ['CS'],
          graduationYears: [2027],
          deadline: '2027-12-31'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.job.status).toBe('PENDING'); // Must require re-approval
    });
  });

  describe('Applicant Management', () => {
    let application1;

    beforeAll(async () => {
      application1 = await prisma.application.create({
        data: {
          jobId: job1.id,
          studentId: student1Id,
          status: 'APPLIED'
        }
      });
    });

    it('recruiter can view applicants for own job', async () => {
      const res = await request(app).get(`/api/recruiter/jobs/${job1.id}/applications`).set('Authorization', `Bearer ${recruiter1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.applications.length).toBe(1);
    });

    it('recruiter cannot view applicants for another company job', async () => {
      const res = await request(app).get(`/api/recruiter/jobs/${job1.id}/applications`).set('Authorization', `Bearer ${recruiter2Token}`);
      expect(res.status).toBe(404);
    });

    it('recruiter can update status for own job applicant', async () => {
      const res = await request(app)
        .patch(`/api/recruiter/applications/${application1.id}/status`)
        .set('Authorization', `Bearer ${recruiter1Token}`)
        .send({ status: 'SHORTLISTED', note: 'Good resume' });
      
      expect(res.status).toBe(200);
      expect(res.body.application.status).toBe('SHORTLISTED');
    });

    it('status history is created transactionally', async () => {
      const history = await prisma.applicationStatusHistory.findMany({
        where: { applicationId: application1.id }
      });
      expect(history.length).toBe(1);
      expect(history[0].newStatus).toBe('SHORTLISTED');
      expect(history[0].note).toBe('Good resume');
    });

    it('recruiter cannot update status of another company applicant', async () => {
      const res = await request(app)
        .patch(`/api/recruiter/applications/${application1.id}/status`)
        .set('Authorization', `Bearer ${recruiter2Token}`)
        .send({ status: 'REJECTED' });
      
      expect(res.status).toBe(404);
    });

    it('recruiter can add notes to application', async () => {
      const res = await request(app)
        .patch(`/api/recruiter/applications/${application1.id}/notes`)
        .set('Authorization', `Bearer ${recruiter1Token}`)
        .send({ notes: 'Candidate has strong DSA' });
      
      expect(res.status).toBe(200);
      expect(res.body.application.recruiterNotes).toBe('Candidate has strong DSA');
    });
  });

  describe('Notifications', () => {
    it('recruiter can retrieve own notifications', async () => {
      const res = await request(app).get('/api/recruiter/notifications').set('Authorization', `Bearer ${recruiter1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.notifications).toBeInstanceOf(Array);
    });

    it('student receives notification when recruiter changes application status', async () => {
      const studentUser = await prisma.user.findUnique({ where: { email: 'student@example.com' } });
      const notifs = await prisma.notification.findMany({ where: { userId: studentUser.id } });
      expect(notifs.length).toBeGreaterThan(0);
      expect(notifs.some(n => n.type === 'APPLICATION_STATUS_UPDATE')).toBe(true);
    });
  });
});
