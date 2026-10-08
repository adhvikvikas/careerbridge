const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // Helper for Recruiter & Company
  async function ensureCompanyAndRecruiter(email, recruiterName, companyData) {
    let user = await prisma.user.findUnique({
      where: { email },
      include: { recruiterProfile: { include: { companies: true } } }
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'RECRUITER',
          recruiterProfile: {
            create: {
              name: recruiterName,
              companies: {
                create: companyData
              }
            }
          }
        },
        include: { recruiterProfile: { include: { companies: true } } }
      });
    } else if (user.recruiterProfile.companies.length === 0) {
      const newCompany = await prisma.company.create({
        data: {
          ...companyData,
          recruiterId: user.recruiterProfile.id
        }
      });
      user.recruiterProfile.companies.push(newCompany);
    }
    return { user, company: user.recruiterProfile.companies[0] };
  }

  // Preserve existing Microsoft recruiter or create it
  const { company: msCompany } = await ensureCompanyAndRecruiter('recruiter@example.com', 'Rahul Mehta', {
    name: 'Microsoft',
    industry: 'Technology',
    location: 'Redmond, Washington, USA',
    website: 'https://www.microsoft.com',
    description: 'Microsoft is a global technology company developing software, cloud services, devices, and digital solutions used by organizations and individuals worldwide.',
    status: 'APPROVED',
  });

  const { company: deloitteCompany } = await ensureCompanyAndRecruiter('priya.sharma@deloitte.com', 'Priya Sharma', {
    name: 'Deloitte',
    industry: 'Consulting',
    location: 'New York, USA',
    website: 'https://www.deloitte.com',
    description: 'Deloitte provides audit, consulting, financial advisory, risk advisory, tax and related services.',
    status: 'APPROVED'
  });

  const { company: accentureCompany } = await ensureCompanyAndRecruiter('arjun.nair@accenture.com', 'Arjun Nair', {
    name: 'Accenture',
    industry: 'Information Technology',
    location: 'Dublin, Ireland',
    website: 'https://www.accenture.com',
    description: 'Accenture is a leading global professional services company, providing a broad range of services and solutions in strategy, consulting, digital, technology and operations.',
    status: 'APPROVED'
  });

  const { company: tcsCompany } = await ensureCompanyAndRecruiter('neha.kapoor@tcs.com', 'Neha Kapoor', {
    name: 'TCS',
    industry: 'Information Technology',
    location: 'Mumbai, India',
    website: 'https://www.tcs.com',
    description: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company.',
    status: 'APPROVED'
  });

  const { company: infosysCompany } = await ensureCompanyAndRecruiter('vikram.shah@infosys.com', 'Vikram Shah', {
    name: 'Infosys',
    industry: 'Information Technology',
    location: 'Bangalore, India',
    website: 'https://www.infosys.com',
    description: 'Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.',
    status: 'PENDING'
  });

  // 3. Students
  async function ensureStudent(email, profileData) {
    return prisma.user.upsert({
      where: { email },
      update: {}, // Don't overwrite existing
      create: {
        email,
        passwordHash,
        role: 'STUDENT',
        studentProfile: {
          create: profileData
        }
      },
      include: { studentProfile: true }
    });
  }

  const studentsData = [
    { email: 'aditi.sharma@example.com', name: 'Aditi Sharma', branch: 'Computer Science', cgpa: 9.1, graduationYear: 2027 },
    { email: 'rohan.mehta@example.com', name: 'Rohan Mehta', branch: 'Electronics and Communication', cgpa: 8.5, graduationYear: 2027 },
    { email: 'student@example.com', name: 'Aarav Menon', branch: 'Computer Science', cgpa: 8.7, graduationYear: 2027 }, // Aarav Menon uses the main demo email
    { email: 'ananya.nair@example.com', name: 'Ananya Nair', branch: 'Information Technology', cgpa: 8.9, graduationYear: 2026 },
    { email: 'kabir.shah@example.com', name: 'Kabir Shah', branch: 'Mechanical', cgpa: 7.8, graduationYear: 2027 },
    { email: 'ishita.rao@example.com', name: 'Ishita Rao', branch: 'Computer Science', cgpa: 9.3, graduationYear: 2026 }
  ];

  const students = {};
  const studentUserIds = {};
  for (const s of studentsData) {
    const user = await ensureStudent(s.email, { name: s.name, branch: s.branch, cgpa: s.cgpa, graduationYear: s.graduationYear });
    students[s.name] = user.studentProfile.id;
    studentUserIds[s.name] = user.id;
  }

  // 4. Jobs
  async function ensureJob(title, companyId, data) {
    let job = await prisma.jobPosting.findFirst({
      where: { title, companyId }
    });
    if (!job) {
      job = await prisma.jobPosting.create({
        data: {
          title,
          companyId,
          ...data
        }
      });
    }
    return job;
  }

  const jobsData = [
    // Microsoft
    { companyId: msCompany.id, title: 'Software Engineering Intern', description: 'Join our dynamic team for a 6-month internship focusing on cloud infrastructure and scalable distributed systems.', minCgpa: 8.0, departments: ['Computer Science', 'Information Technology'], graduationYears: [2026, 2027], deadline: new Date(Date.now() + 30 * 86400000), openings: 5, status: 'APPROVED' },
    { companyId: msCompany.id, title: 'Software Engineer', description: 'Full-time software engineering role focusing on full-stack development. Experience with React, Node.js, and PostgreSQL is preferred.', minCgpa: 7.5, departments: ['Computer Science', 'Information Technology', 'Electronics and Communication'], graduationYears: [2025, 2026], deadline: new Date(Date.now() + 15 * 86400000), openings: 10, status: 'APPROVED' },
    { companyId: msCompany.id, title: 'Cloud Engineering Intern', description: 'Internship role focusing on Azure cloud deployments, containerization, and Kubernetes management.', minCgpa: 8.5, departments: ['Computer Science'], graduationYears: [2026], deadline: new Date(Date.now() + 45 * 86400000), openings: 2, status: 'PENDING' },
    
    // Deloitte
    { companyId: deloitteCompany.id, title: 'Technology Analyst', description: 'Join Deloitte as a Technology Analyst to build next-generation enterprise solutions.', minCgpa: 8.0, departments: ['Computer Science', 'Information Technology', 'Electronics and Communication'], graduationYears: [2026, 2027], deadline: new Date(Date.now() + 20 * 86400000), openings: 15, status: 'APPROVED' },
    { companyId: deloitteCompany.id, title: 'Software Engineering Intern', description: 'Help our clients build scalable backend microservices.', minCgpa: 7.5, departments: ['Computer Science'], graduationYears: [2027], deadline: new Date(Date.now() + 25 * 86400000), openings: 4, status: 'APPROVED' },

    // Accenture
    { companyId: accentureCompany.id, title: 'Associate Software Engineer', description: 'Entry-level position for software development across varied technology stacks.', minCgpa: 7.0, departments: ['Computer Science', 'Information Technology', 'Mechanical', 'Civil'], graduationYears: [2026, 2027], deadline: new Date(Date.now() + 10 * 86400000), openings: 30, status: 'APPROVED' },
    { companyId: accentureCompany.id, title: 'Data Engineering Intern', description: 'Work on massive data pipelines using Hadoop, Spark, and cloud technologies.', minCgpa: 8.0, departments: ['Computer Science', 'Information Technology'], graduationYears: [2027], deadline: new Date(Date.now() + 40 * 86400000), openings: 8, status: 'REJECTED', rejectionReason: 'Incomplete job description provided.' },

    // TCS
    { companyId: tcsCompany.id, title: 'Graduate Software Engineer', description: 'Join the TCS Digital team working on cutting-edge AI and ML projects.', minCgpa: 8.5, departments: ['Computer Science', 'Electronics and Communication'], graduationYears: [2027], deadline: new Date(Date.now() + 15 * 86400000), openings: 25, status: 'APPROVED' },
    { companyId: tcsCompany.id, title: 'Cloud Engineering Associate', description: 'Manage and optimize AWS and Azure cloud deployments for our enterprise clients.', minCgpa: 7.5, departments: ['Computer Science', 'Information Technology'], graduationYears: [2026], deadline: new Date(Date.now() + 35 * 86400000), openings: 10, status: 'APPROVED' },

    // Infosys
    { companyId: infosysCompany.id, title: 'Software Engineer', description: 'Full-stack development using MEAN/MERN stack.', minCgpa: 7.0, departments: ['Computer Science', 'Information Technology', 'Electronics and Communication'], graduationYears: [2026, 2027], deadline: new Date(Date.now() + 60 * 86400000), openings: 40, status: 'PENDING' },
    { companyId: infosysCompany.id, title: 'Technology Intern', description: 'Summer internship program for pre-final year students.', minCgpa: 7.5, departments: ['Computer Science', 'Information Technology'], graduationYears: [2027], deadline: new Date(Date.now() + 50 * 86400000), openings: 20, status: 'PENDING' },
  ];

  const jobs = {};
  for (const j of jobsData) {
    const job = await ensureJob(j.title, j.companyId, j);
    jobs[`${j.companyId}_${j.title}`] = job;
  }

  // 5. Applications & History
  async function applyStudent(studentName, companyId, jobTitle, status, historyStages) {
    const studentId = students[studentName];
    const job = jobs[`${companyId}_${jobTitle}`];
    if (!studentId || !job) return;

    let app = await prisma.application.findUnique({
      where: {
        studentId_jobId: { studentId, jobId: job.id }
      }
    });

    if (!app) {
      app = await prisma.application.create({
        data: {
          studentId,
          jobId: job.id,
          status,
          appliedAt: new Date(Date.now() - Math.floor(Math.random() * 10 + 2) * 86400000),
          recruiterNotes: historyStages[historyStages.length - 1]?.note || null
        }
      });
      
      // Add history
      for (let i = 0; i < historyStages.length; i++) {
        const stage = historyStages[i];
        await prisma.applicationStatusHistory.create({
          data: {
            applicationId: app.id,
            oldStatus: i === 0 ? null : historyStages[i - 1].status,
            newStatus: stage.status,
            changedBy: 'recruiter',
            changedAt: new Date(app.appliedAt.getTime() + (i + 1) * 86400000),
            note: stage.note || null
          }
        });

        // Add Notification
        if (stage.status !== 'APPLIED') {
          await prisma.notification.create({
            data: {
              userId: studentUserIds[studentName],
              type: 'APPLICATION_UPDATE',
              title: 'Application Status Updated',
              message: `Your application for ${jobTitle} has been updated to ${stage.status.replace('_', ' ')}.`,
              createdAt: new Date(app.appliedAt.getTime() + (i + 1) * 86400000)
            }
          });
        }
      }
    }
  }

  // Create Applications
  await applyStudent('Aarav Menon', msCompany.id, 'Software Engineering Intern', 'UNDER_REVIEW', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW', note: 'Strong resume, moving to review.' }
  ]);
  await applyStudent('Aarav Menon', deloitteCompany.id, 'Technology Analyst', 'SHORTLISTED', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }, { status: 'SHORTLISTED', note: 'Good aptitude score.' }
  ]);
  await applyStudent('Aarav Menon', accentureCompany.id, 'Associate Software Engineer', 'INTERVIEW', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }, { status: 'SHORTLISTED' }, { status: 'INTERVIEW', note: 'Scheduled for technical round.' }
  ]);
  
  await applyStudent('Aditi Sharma', msCompany.id, 'Software Engineering Intern', 'SELECTED', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }, { status: 'SHORTLISTED' }, { status: 'INTERVIEW' }, { status: 'SELECTED', note: 'Excellent performance in all rounds. Offer extended.' }
  ]);
  await applyStudent('Aditi Sharma', tcsCompany.id, 'Graduate Software Engineer', 'SHORTLISTED', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }, { status: 'SHORTLISTED' }
  ]);
  
  await applyStudent('Rohan Mehta', msCompany.id, 'Software Engineering Intern', 'REJECTED', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }, { status: 'REJECTED', note: 'Does not meet technical requirements at this time.' }
  ]);
  await applyStudent('Rohan Mehta', deloitteCompany.id, 'Software Engineering Intern', 'UNDER_REVIEW', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }
  ]);

  await applyStudent('Ananya Nair', msCompany.id, 'Software Engineer', 'APPLIED', [
    { status: 'APPLIED' }
  ]);
  await applyStudent('Ananya Nair', accentureCompany.id, 'Associate Software Engineer', 'INTERVIEW', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }, { status: 'SHORTLISTED' }, { status: 'INTERVIEW' }
  ]);

  await applyStudent('Kabir Shah', accentureCompany.id, 'Associate Software Engineer', 'UNDER_REVIEW', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }
  ]);
  
  await applyStudent('Ishita Rao', msCompany.id, 'Software Engineer', 'SELECTED', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }, { status: 'SHORTLISTED' }, { status: 'INTERVIEW' }, { status: 'SELECTED' }
  ]);
  await applyStudent('Ishita Rao', tcsCompany.id, 'Graduate Software Engineer', 'SHORTLISTED', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }, { status: 'SHORTLISTED' }
  ]);
  await applyStudent('Ishita Rao', deloitteCompany.id, 'Technology Analyst', 'INTERVIEW', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }, { status: 'SHORTLISTED' }, { status: 'INTERVIEW' }
  ]);
  await applyStudent('Kabir Shah', deloitteCompany.id, 'Technology Analyst', 'REJECTED', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }, { status: 'REJECTED' }
  ]);
  await applyStudent('Rohan Mehta', tcsCompany.id, 'Graduate Software Engineer', 'INTERVIEW', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }, { status: 'SHORTLISTED' }, { status: 'INTERVIEW' }
  ]);
  await applyStudent('Ananya Nair', msCompany.id, 'Cloud Engineering Intern', 'SHORTLISTED', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }, { status: 'SHORTLISTED' }
  ]);
  await applyStudent('Aditi Sharma', accentureCompany.id, 'Associate Software Engineer', 'SELECTED', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }, { status: 'SHORTLISTED' }, { status: 'INTERVIEW' }, { status: 'SELECTED' }
  ]);
  await applyStudent('Kabir Shah', tcsCompany.id, 'Cloud Engineering Associate', 'UNDER_REVIEW', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }
  ]);
  await applyStudent('Aarav Menon', infosysCompany.id, 'Software Engineer', 'APPLIED', [
    { status: 'APPLIED' }
  ]);
  await applyStudent('Rohan Mehta', infosysCompany.id, 'Software Engineer', 'SHORTLISTED', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }, { status: 'SHORTLISTED' }
  ]);
  await applyStudent('Aditi Sharma', msCompany.id, 'Software Engineer', 'INTERVIEW', [
    { status: 'APPLIED' }, { status: 'UNDER_REVIEW' }, { status: 'SHORTLISTED' }, { status: 'INTERVIEW' }
  ]);


  // Saved Jobs
  async function saveJob(studentName, companyId, jobTitle) {
    const studentId = students[studentName];
    const job = jobs[`${companyId}_${jobTitle}`];
    if (!studentId || !job) return;

    const existing = await prisma.savedJob.findUnique({
      where: {
        studentId_jobId: { studentId, jobId: job.id }
      }
    });

    if (!existing) {
      await prisma.savedJob.create({
        data: {
          studentId,
          jobId: job.id
        }
      });
    }
  }

  await saveJob('Aarav Menon', msCompany.id, 'Software Engineer');
  await saveJob('Aarav Menon', tcsCompany.id, 'Cloud Engineering Associate');
  await saveJob('Aditi Sharma', deloitteCompany.id, 'Technology Analyst');
  await saveJob('Rohan Mehta', accentureCompany.id, 'Associate Software Engineer');
  
  // Create Admin Logs conditionally
  const msJob = jobs[`${msCompany.id}_Software Engineering Intern`];
  if (msJob) {
    const logExists = await prisma.adminActionLog.findFirst({
      where: { action: 'APPROVE_JOB', targetId: msJob.id }
    });
    if (!logExists) {
      await prisma.adminActionLog.create({
        data: {
          adminId: adminUser.id,
          action: 'APPROVE_JOB',
          targetType: 'JOB',
          targetId: msJob.id,
          reason: 'Meets criteria'
        }
      });
    }
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
