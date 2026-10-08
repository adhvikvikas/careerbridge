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

    // Instead of deleting everything, just find the existing company for recruiter1
    // created by seed, or create one if it doesn't exist.
    const r1Company = await prisma.company.findFirst({ where: { recruiterId: recruiter1Id } });
    if (!r1Company) {
      company1 = await prisma.company.create({
        data: { name: 'Test Company', recruiterId: recruiter1Id, status: 'APPROVED' }
      });
    } else {
      company1 = r1Company;
    }
    
    // Create company for recruiter 2 if not exists
    const r2Company = await prisma.company.findFirst({ where: { recruiterId: recruiter2Id } });
    if (!r2Company) {
      company2 = await prisma.company.create({
        data: { name: 'Company Two', recruiterId: recruiter2Id, status: 'APPROVED' }
      });
    } else {
      company2 = r2Company;
    }
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
      expect(res.body.profile.companies[0].name).toBe(company1.name);
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
          deadline: '2027-12-31'
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
});
