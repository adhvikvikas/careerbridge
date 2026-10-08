const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Total Companies:', await prisma.company.count());
  console.log('Total Recruiters:', await prisma.recruiterProfile.count());
  console.log('Total Students:', await prisma.studentProfile.count());
  console.log('Total Jobs:', await prisma.jobPosting.count());
  console.log('Total Applications:', await prisma.application.count());
  console.log('Total Saved Jobs:', await prisma.savedJob.count());
  console.log('Total Notifications:', await prisma.notification.count());
  console.log('Total Audit Logs:', await prisma.adminActionLog.count());

  const appStatus = await prisma.application.groupBy({ by: ['status'], _count: { status: true } });
  console.log('Application Status Distribution:', appStatus);

  const companyStatus = await prisma.company.groupBy({ by: ['status'], _count: { status: true } });
  console.log('Company Status Distribution:', companyStatus);

  const jobStatus = await prisma.jobPosting.groupBy({ by: ['status'], _count: { status: true } });
  console.log('Job Status Distribution:', jobStatus);
}
main().finally(() => prisma.$disconnect());
