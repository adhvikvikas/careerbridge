import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OAuth2Client } from 'google-auth-library';
import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Google Authentication Endpoints', () => {
  const MOCK_PASSWORD = 'password123';
  let studentUser;
  let recruiterUser;
  let adminUser;

  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ['google.student@example.com', 'google.recruiter@example.com', 'google.admin@example.com'] } }
    });

    const passwordHash = await bcrypt.hash(MOCK_PASSWORD, 10);

    studentUser = await prisma.user.create({
      data: {
        email: 'google.student@example.com',
        passwordHash,
        role: 'STUDENT',
      }
    });

    recruiterUser = await prisma.user.create({
      data: {
        email: 'google.recruiter@example.com',
        passwordHash,
        role: 'RECRUITER',
      }
    });

    adminUser = await prisma.user.create({
      data: {
        email: 'google.admin@example.com',
        passwordHash,
        role: 'ADMIN',
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('unauthenticated Google endpoint can be called / malformed request rejected', async () => {
    const response = await request(app)
      .post('/api/auth/google')
      .send({});
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Missing Google credential');
  });

  it('invalid Google credential rejected', async () => {
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockRejectedValue(new Error('Invalid token'));

    const response = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'bad_token' });
    
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid Google credential');
  });

  it('valid Google identity matching an existing user succeeds and receives normal CareerBridge JWT', async () => {
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({ sub: 'google-sub-1', email: studentUser.email })
    });

    const response = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'valid_token' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(studentUser.email);
  });

  it('existing user\'s database role is preserved (STUDENT remains STUDENT)', async () => {
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({ sub: 'google-sub-student', email: studentUser.email })
    });

    const response = await request(app).post('/api/auth/google').send({ credential: 'valid' });
    expect(response.body.user.role).toBe('STUDENT');
  });

  it('RECRUITER remains RECRUITER', async () => {
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({ sub: 'google-sub-recruiter', email: recruiterUser.email })
    });

    const response = await request(app).post('/api/auth/google').send({ credential: 'valid' });
    expect(response.body.user.role).toBe('RECRUITER');
  });

  it('ADMIN remains ADMIN', async () => {
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({ sub: 'google-sub-admin', email: adminUser.email })
    });

    const response = await request(app).post('/api/auth/google').send({ credential: 'valid' });
    expect(response.body.user.role).toBe('ADMIN');
  });

  it('unknown Google email is rejected', async () => {
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({ sub: 'google-sub-unknown', email: 'unknown@example.com' })
    });

    const response = await request(app).post('/api/auth/google').send({ credential: 'valid' });
    expect(response.status).toBe(404);
    expect(response.body.message).toContain('Account not found');
  });

  it('first successful Google login links googleId, subsequent login with same googleId succeeds', async () => {
    const sub = 'google-sub-link-test';
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({ sub, email: studentUser.email })
    });

    // First login
    await request(app).post('/api/auth/google').send({ credential: 'valid' });

    // Check DB
    const dbUser = await prisma.user.findUnique({ where: { id: studentUser.id } });
    expect(dbUser.googleId).toBe(sub);

    // Subsequent login (will lookup by googleId now)
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({ sub, email: 'changed-email@google.com' }) // even if email changed, sub matches
    });

    const res2 = await request(app).post('/api/auth/google').send({ credential: 'valid2' });
    expect(res2.status).toBe(200);
    expect(res2.body.user.id).toBe(studentUser.id);
  });

  it('conflicting googleId is rejected', async () => {
    // First link the user to a sub
    await prisma.user.update({
      where: { id: studentUser.id },
      data: { googleId: 'google-sub-original' }
    });

    // Try to login with the same email but a DIFFERENT sub
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({ sub: 'google-sub-different', email: studentUser.email })
    });

    const response = await request(app).post('/api/auth/google').send({ credential: 'valid' });
    expect(response.status).toBe(409);
    expect(response.body.message).toContain('different Google identity');
  });

  it('existing password login still works', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: studentUser.email, password: MOCK_PASSWORD });
    
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(studentUser.email);
  });
});
