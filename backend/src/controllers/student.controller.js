const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { checkEligibility } = require('../services/eligibility.service');

exports.getProfile = async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: { select: { email: true, createdAt: true } } }
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    res.json({ success: true, profile: student });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const data = req.body;
    
    // Ensure the resumeUrl is null if it's empty string
    if (data.resumeUrl === '') {
      data.resumeUrl = null;
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: req.user.id },
      data
    });
    res.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    
    const [
      approvedJobsCount,
      totalApplications,
      underReviewApplications,
      shortlistedApplications,
      selectedApplications,
      rejectedApplications,
      savedJobsCount
    ] = await Promise.all([
      prisma.jobPosting.count({ where: { status: 'APPROVED', deletedAt: null } }),
      prisma.application.count({ where: { studentId: student.id } }),
      prisma.application.count({ where: { studentId: student.id, status: 'UNDER_REVIEW' } }),
      prisma.application.count({ where: { studentId: student.id, status: 'SHORTLISTED' } }),
      prisma.application.count({ where: { studentId: student.id, status: 'SELECTED' } }),
      prisma.application.count({ where: { studentId: student.id, status: 'REJECTED' } }),
      prisma.savedJob.count({ where: { studentId: student.id } })
    ]);

    const recentNotifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      success: true,
      stats: {
        approvedJobsCount,
        applications: {
          total: totalApplications,
          underReview: underReviewApplications,
          shortlisted: shortlistedApplications,
          selected: selectedApplications,
          rejected: rejectedApplications
        },
        savedJobsCount
      },
      recentNotifications
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const { search, department, employmentType, minCgpa } = req.query;
    
    const filter = { status: 'APPROVED', deletedAt: null };
    
    if (search) {
      filter.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (department) {
      filter.departments = { has: department };
    }
    
    if (minCgpa) {
      filter.minCgpa = { lte: parseFloat(minCgpa) };
    }

    const jobs = await prisma.jobPosting.findMany({
      where: filter,
      include: {
        company: { select: { name: true, location: true, industry: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Determine eligibility for each job to assist UI
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const savedJobs = await prisma.savedJob.findMany({ where: { studentId: student.id } });
    const appliedJobs = await prisma.application.findMany({ where: { studentId: student.id } });

    const savedJobIds = new Set(savedJobs.map(sj => sj.jobId));
    const appliedJobIds = new Set(appliedJobs.map(aj => aj.jobId));

    const jobsWithStatus = jobs.map(job => {
      const eligibility = checkEligibility(job, student);
      return {
        ...job,
        isEligible: eligibility.eligible,
        isSaved: savedJobIds.has(job.id),
        hasApplied: appliedJobIds.has(job.id)
      };
    });

    res.json({ success: true, jobs: jobsWithStatus });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getJobDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await prisma.jobPosting.findFirst({
      where: { id, status: 'APPROVED', deletedAt: null },
      include: {
        company: {
          select: { name: true, description: true, website: true, location: true, industry: true }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or not approved' });
    }

    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const eligibility = checkEligibility(job, student);
    
    const savedJob = await prisma.savedJob.findUnique({
      where: { studentId_jobId: { studentId: student.id, jobId: id } }
    });
    
    const application = await prisma.application.findUnique({
      where: { studentId_jobId: { studentId: student.id, jobId: id } }
    });

    res.json({
      success: true,
      job,
      eligibility,
      isSaved: !!savedJob,
      hasApplied: !!application,
      applicationStatus: application?.status
    });
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });

    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId }
    });

    if (!job || job.deletedAt) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.status !== 'APPROVED') return res.status(403).json({ success: false, message: 'Job is not approved' });

    const eligibility = checkEligibility(job, student);
    if (!eligibility.eligible) {
      return res.status(403).json({ success: false, message: 'Not eligible', reasons: eligibility.reasons });
    }

    const existingApplication = await prisma.application.findUnique({
      where: { studentId_jobId: { studentId: student.id, jobId } }
    });

    if (existingApplication) {
      return res.status(409).json({ success: false, message: 'Already applied to this job' });
    }

    const newApplication = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          studentId: student.id,
          jobId,
          status: 'APPLIED'
        }
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: app.id,
          newStatus: 'APPLIED',
          changedBy: 'STUDENT',
          note: 'Initial application'
        }
      });
      
      await tx.notification.create({
        data: {
          userId: req.user.id,
          type: 'APPLICATION_SUBMITTED',
          title: 'Application Submitted',
          message: `You have successfully applied to ${job.title}`
        }
      });

      return app;
    });

    res.json({ success: true, application: newApplication });
  } catch (error) {
    console.error('Error applying to job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    
    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        job: {
          select: { title: true, company: { select: { name: true } } }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    
    const application = await prisma.application.findFirst({
      where: { id, studentId: student.id },
      include: {
        job: {
          include: { company: { select: { name: true, location: true } } }
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, application });
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.saveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });

    const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'APPROVED' || job.deletedAt) {
      return res.status(404).json({ success: false, message: 'Approved job not found' });
    }

    const savedJob = await prisma.savedJob.create({
      data: {
        studentId: student.id,
        jobId
      }
    });

    res.json({ success: true, savedJob });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Job already saved' });
    }
    console.error('Error saving job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });

    await prisma.savedJob.delete({
      where: { studentId_jobId: { studentId: student.id, jobId } }
    });

    res.json({ success: true, message: 'Job unsaved' });
  } catch (error) {
    console.error('Error unsaving job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getSavedJobs = async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    
    const savedJobs = await prisma.savedJob.findMany({
      where: { studentId: student.id },
      include: {
        job: {
          include: { company: { select: { name: true, location: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, savedJobs });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id }
    });
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() }
    });

    res.json({ success: true, notification: updated });
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
