import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('Recruiter Job Archiving Endpoints', () => {
  let recruiterToken;
  let otherRecruiterToken;
  let studentToken;
  let recruiterId;
  let otherRecruiterId;
  let companyId;
  let otherCompanyId;
  let studentId;
  let studentProfileId;

  const generateToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'supersecret_test', { expiresIn: '1h' });
  };

  beforeAll(async () => {
    const testEmails = ['recruiter1_archive@test.com', 'recruiter2_archive@test.com', 'student_archive@test.com'];
    
    // Clean up only our test users
    await prisma.applicationStatusHistory.deleteMany({
      where: { application: { student: { user: { email: { in: testEmails } } } } }
    });
    await prisma.application.deleteMany({
      where: { student: { user: { email: { in: testEmails } } } }
    });
    await prisma.savedJob.deleteMany({
      where: { student: { user: { email: { in: testEmails } } } }
    });
    await prisma.jobPosting.deleteMany({
      where: { company: { recruiter: { user: { email: { in: testEmails } } } } }
    });
    await prisma.company.deleteMany({
      where: { recruiter: { user: { email: { in: testEmails } } } }
    });
    await prisma.recruiterProfile.deleteMany({
      where: { user: { email: { in: testEmails } } }
    });
    await prisma.studentProfile.deleteMany({
      where: { user: { email: { in: testEmails } } }
    });
    await prisma.notification.deleteMany({
      where: { user: { email: { in: testEmails } } }
    });
    await prisma.user.deleteMany({
      where: { email: { in: testEmails } }
    });

    // Create Recruiter 1
    const recruiter1 = await prisma.user.create({
      data: {
        email: 'recruiter1_archive@test.com',
        passwordHash: 'hash',
        role: 'RECRUITER',
        recruiterProfile: {
          create: {
            name: 'Recruiter One',
            companies: {
              create: {
                name: 'Company One',
                status: 'APPROVED'
              }
            }
          }
        }
      },
      include: { recruiterProfile: { include: { companies: true } } }
    });
    recruiterId = recruiter1.id;
    companyId = recruiter1.recruiterProfile.companies[0].id;
    recruiterToken = generateToken(recruiterId, 'RECRUITER');

    // Create Recruiter 2
    const recruiter2 = await prisma.user.create({
      data: {
        email: 'recruiter2_archive@test.com',
        passwordHash: 'hash',
        role: 'RECRUITER',
        recruiterProfile: {
          create: {
            name: 'Recruiter Two',
            companies: {
              create: {
                name: 'Company Two',
                status: 'APPROVED'
              }
            }
          }
        }
      },
      include: { recruiterProfile: { include: { companies: true } } }
    });
    otherRecruiterId = recruiter2.id;
    otherCompanyId = recruiter2.recruiterProfile.companies[0].id;
    otherRecruiterToken = generateToken(otherRecruiterId, 'RECRUITER');

    // Create Student
    const student = await prisma.user.create({
      data: {
        email: 'student_archive@test.com',
        passwordHash: 'hash',
        role: 'STUDENT',
        studentProfile: {
          create: {
            branch: 'CSE',
            cgpa: 8.5,
            graduationYear: 2025
          }
        }
      },
      include: { studentProfile: true }
    });
    studentId = student.id;
    studentProfileId = student.studentProfile.id;
    studentToken = generateToken(studentId, 'STUDENT');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  let jobWithoutApplicants;
  let jobWithApplicants;

  it('Setup jobs for tests', async () => {
    jobWithoutApplicants = await prisma.jobPosting.create({
      data: {
        title: 'Empty Job',
        description: 'Test',
        deadline: new Date('2026-12-31'),
        departments: ['CSE'],
        graduationYears: [2025],
        companyId,
        status: 'APPROVED'
      }
    });

    jobWithApplicants = await prisma.jobPosting.create({
      data: {
        title: 'Popular Job',
        description: 'Test',
        deadline: new Date('2026-12-31'),
        departments: ['CSE'],
        graduationYears: [2025],
        companyId,
        status: 'APPROVED'
      }
    });

    // Apply to Popular Job
    const app = await prisma.application.create({
      data: {
        studentId: studentProfileId,
        jobId: jobWithApplicants.id,
        status: 'APPLIED'
      }
    });

    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: app.id,
        newStatus: 'APPLIED',
        changedBy: 'STUDENT'
      }
    });
  });

  it('Unauthenticated recruiter job deletion is rejected', async () => {
    const res = await request(app)
      .delete(`/api/recruiter/jobs/${jobWithoutApplicants.id}`);
    expect(res.status).toBe(401);
  });

  it('Student cannot archive a job', async () => {
    const res = await request(app)
      .delete(`/api/recruiter/jobs/${jobWithoutApplicants.id}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it('Recruiter cannot archive another recruiter\'s job', async () => {
    const res = await request(app)
      .delete(`/api/recruiter/jobs/${jobWithoutApplicants.id}`)
      .set('Authorization', `Bearer ${otherRecruiterToken}`);
    expect(res.status).toBe(404);
  });

  it('Recruiter can archive own job (without applicants)', async () => {
    const res = await request(app)
      .delete(`/api/recruiter/jobs/${jobWithoutApplicants.id}`)
      .set('Authorization', `Bearer ${recruiterToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.job.deletedAt).not.toBeNull();
  });

  it('Archived job no longer appears in active recruiter job list', async () => {
    const res = await request(app)
      .get(`/api/recruiter/jobs`)
      .set('Authorization', `Bearer ${recruiterToken}`);
    expect(res.status).toBe(200);
    const jobs = res.body.jobs;
    expect(jobs.find(j => j.id === jobWithoutApplicants.id)).toBeUndefined();
  });

  it('Archived job no longer appears as an active student job', async () => {
    const res = await request(app)
      .get(`/api/student/jobs`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    const jobs = res.body.jobs;
    expect(jobs.find(j => j.id === jobWithoutApplicants.id)).toBeUndefined();
  });

  it('Jobs with applicants are archived without deleting applications', async () => {
    const res = await request(app)
      .delete(`/api/recruiter/jobs/${jobWithApplicants.id}`)
      .set('Authorization', `Bearer ${recruiterToken}`);
    expect(res.status).toBe(200);
    expect(res.body.job.deletedAt).not.toBeNull();
  });

  it('Applications and status history remain after archive', async () => {
    const applicationsCount = await prisma.application.count({
      where: { jobId: jobWithApplicants.id }
    });
    expect(applicationsCount).toBe(1);

    const appRecord = await prisma.application.findFirst({
      where: { jobId: jobWithApplicants.id }
    });
    
    const historyCount = await prisma.applicationStatusHistory.count({
      where: { applicationId: appRecord.id }
    });
    expect(historyCount).toBe(1);
  });

  it('Recruiter can still access preserved application history where appropriate', async () => {
    const res = await request(app)
      .get(`/api/recruiter/jobs/${jobWithApplicants.id}/applications`)
      .set('Authorization', `Bearer ${recruiterToken}`);
    expect(res.status).toBe(200);
    expect(res.body.applications.length).toBe(1);
  });
});
