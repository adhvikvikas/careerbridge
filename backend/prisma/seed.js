const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const passwordHash = await bcrypt.hash('password123', 10); // DEVELOPMENT / DEMO ONLY

  // 1. Create Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: { passwordHash },
    create: {
      email: 'student@example.com',
      passwordHash,
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
    update: { passwordHash },
    create: {
      email: 'recruiter@example.com',
      passwordHash,
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
    update: { passwordHash },
    create: {
      email: 'admin@example.com',
      passwordHash,
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
