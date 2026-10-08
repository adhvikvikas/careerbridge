const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createNotification } = require('../services/notification.service');

exports.getCompanies = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const companies = await prisma.company.findMany({
      where: filter,
      include: {
        recruiter: {
          select: {
            name: true,
            phone: true,
            user: { select: { email: true } }
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    res.json({ success: true, companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        recruiter: {
          select: {
            name: true,
            phone: true,
            user: { select: { email: true } }
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, company });
  } catch (error) {
    console.error('Error fetching company by id:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.approveCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const company = await prisma.company.findUnique({ 
      where: { id },
      include: { recruiter: true }
    });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    
    if (company.status === 'APPROVED') {
      return res.status(409).json({ success: false, message: 'Company is already approved' });
    }

    const updatedCompany = await prisma.$transaction(async (tx) => {
      const comp = await tx.company.update({
        where: { id },
        data: { status: 'APPROVED', rejectionReason: null }
      });
      
      await tx.adminActionLog.create({
        data: {
          adminId,
          action: 'COMPANY_APPROVED',
          targetType: 'COMPANY',
          targetId: comp.id
        }
      });

      await tx.notification.create({
        data: {
          userId: company.recruiter.userId,
          type: 'COMPANY_APPROVED',
          title: 'Company Approved',
          message: `Your company ${comp.name} has been approved. You can now post jobs.`
        }
      });
      
      return comp;
    });

    await createNotification({
      userId: company.recruiter.userId,
      type: 'COMPANY_APPROVAL_UPDATE',
      title: 'Company Approved',
      message: `Your company ${updatedCompany.name} has been approved. You can now post jobs.`
    });

    res.json({ success: true, company: updatedCompany });
  } catch (error) {
    console.error('Error approving company:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.rejectCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const company = await prisma.company.findUnique({ 
      where: { id },
      include: { recruiter: true }
    });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    if (company.status === 'REJECTED') {
      return res.status(409).json({ success: false, message: 'Company is already rejected' });
    }

    const updatedCompany = await prisma.$transaction(async (tx) => {
      const comp = await tx.company.update({
        where: { id },
        data: { status: 'REJECTED', rejectionReason: reason }
      });
      
      const actionStr = company.status === 'APPROVED' ? 'REVOKED' : 'REJECTED';
      const pastTense = company.status === 'APPROVED' ? 'revoked' : 'rejected';
      
      await tx.adminActionLog.create({
        data: {
          adminId,
          action: `COMPANY_${actionStr}`,
          targetType: 'COMPANY',
          targetId: comp.id,
          reason
        }
      });

      await tx.notification.create({
        data: {
          userId: company.recruiter.userId,
          type: `COMPANY_${actionStr}`,
          title: `Company ${actionStr === 'REVOKED' ? 'Revoked' : 'Rejected'}`,
          message: `Your company ${comp.name} was ${pastTense}. Reason: ${reason}`
        }
      });
      
      return comp;
    });

    await createNotification({
      userId: company.recruiter.userId,
      type: 'COMPANY_APPROVAL_UPDATE',
      title: 'Company Rejected',
      message: `Your company ${updatedCompany.name} has been rejected. Reason: ${reason}`
    });

    res.json({ success: true, company: updatedCompany });
  } catch (error) {
    console.error('Error rejecting company:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const jobs = await prisma.jobPosting.findMany({
      where: filter,
      include: {
        company: {
          select: { 
            name: true, 
            status: true,
            recruiter: {
              select: {
                name: true,
                user: { select: { email: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        company: {
          select: { name: true, status: true, recruiter: true }
        },
        applications: {
          include: {
            student: {
              include: { user: { select: { email: true } } }
            }
          },
          orderBy: { appliedAt: 'desc' }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    console.error('Error fetching job by id:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.approveJob = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const job = await prisma.jobPosting.findUnique({ 
      where: { id },
      include: { company: { include: { recruiter: true } } }
    });
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status === 'APPROVED') {
      return res.status(409).json({ success: false, message: 'Job is already approved' });
    }
    
    if (job.company.status !== 'APPROVED') {
      return res.status(409).json({ success: false, message: 'Cannot approve job. Company must be approved first.' });
    }

    const updatedJob = await prisma.$transaction(async (tx) => {
      const updated = await tx.jobPosting.update({
        where: { id },
        data: { status: 'APPROVED', rejectionReason: null }
      });
      
      await tx.adminActionLog.create({
        data: {
          adminId,
          action: 'JOB_APPROVED',
          targetType: 'JOB',
          targetId: updated.id
        }
      });

      await tx.notification.create({
        data: {
          userId: job.company.recruiter.userId,
          type: 'JOB_APPROVED',
          title: 'Job Approved',
          message: `Your job posting "${updated.title}" has been approved and is now live.`
        }
      });
      
      return updated;
    });

    await createNotification({
      userId: job.company.recruiter.userId,
      type: 'JOB_APPROVAL_UPDATE',
      title: 'Job Approved',
      message: `Your job posting "${updatedJob.title}" for ${job.company.name} has been approved.`
    });

    res.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error('Error approving job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.rejectJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const job = await prisma.jobPosting.findUnique({ 
      where: { id },
      include: { company: { include: { recruiter: true } } }
    });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status === 'REJECTED') {
      return res.status(409).json({ success: false, message: 'Job is already rejected' });
    }

    const updatedJob = await prisma.$transaction(async (tx) => {
      const updated = await tx.jobPosting.update({
        where: { id },
        data: { status: 'REJECTED', rejectionReason: reason }
      });
      
      const actionStr = job.status === 'APPROVED' ? 'REVOKED' : 'REJECTED';
      const pastTense = job.status === 'APPROVED' ? 'revoked' : 'rejected';
      
      await tx.adminActionLog.create({
        data: {
          adminId,
          action: `JOB_${actionStr}`,
          targetType: 'JOB',
          targetId: updated.id,
          reason
        }
      });

      await tx.notification.create({
        data: {
          userId: job.company.recruiter.userId,
          type: `JOB_${actionStr}`,
          title: `Job ${actionStr === 'REVOKED' ? 'Revoked' : 'Rejected'}`,
          message: `Your job posting "${updated.title}" was ${pastTense}. Reason: ${reason}`
        }
      });
      
      return updated;
    });

    await createNotification({
      userId: job.company.recruiter.userId,
      type: 'JOB_APPROVAL_UPDATE',
      title: 'Job Rejected',
      message: `Your job posting "${updatedJob.title}" for ${job.company.name} has been rejected. Reason: ${reason}`
    });

    res.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error('Error rejecting job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { targetId, targetType } = req.query;
    const filter = {};
    if (targetId) filter.targetId = targetId;
    if (targetType) filter.targetType = targetType;

    const logs = await prisma.adminActionLog.findMany({
      where: filter,
      include: {
        admin: {
          select: { email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Prevent fetching massive amounts for now
    });

    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      pendingCompanies, approvedCompanies, rejectedCompanies,
      pendingJobs, approvedJobs, rejectedJobs
    ] = await Promise.all([
      prisma.company.count({ where: { status: 'PENDING' } }),
      prisma.company.count({ where: { status: 'APPROVED' } }),
      prisma.company.count({ where: { status: 'REJECTED' } }),
      prisma.jobPosting.count({ where: { status: 'PENDING' } }),
      prisma.jobPosting.count({ where: { status: 'APPROVED' } }),
      prisma.jobPosting.count({ where: { status: 'REJECTED' } })
    ]);

    res.json({
      success: true,
      stats: {
        companies: { pending: pendingCompanies, approved: approvedCompanies, rejected: rejectedCompanies },
        jobs: { pending: pendingJobs, approved: approvedJobs, rejected: rejectedJobs }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
