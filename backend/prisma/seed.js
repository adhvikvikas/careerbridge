const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      passwordHash: 'dummy_hash_for_phase1', // DO NOT USE IN PROD
      role: 'STUDENT',
      studentProfile: {
        create: {
          branch: 'Computer Science',
          cgpa: 8.5,
          graduationYear: 2025,
        }
      }
    },
  });

  // 2. Create Recruiter
  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter@example.com' },
    update: {},
    create: {
      email: 'recruiter@example.com',
      passwordHash: 'dummy_hash_for_phase1', // DO NOT USE IN PROD
      role: 'RECRUITER',
      recruiterProfile: {
        create: {
          name: 'John Recruiter',
          phone: '1234567890',
        }
      }
    },
  });

  // 3. Create Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: 'dummy_hash_for_phase1', // DO NOT USE IN PROD
      role: 'ADMIN',
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
