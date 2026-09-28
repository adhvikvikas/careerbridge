const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get the authenticated recruiter's profile & company
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true } },
        companies: true
      }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Recruiter profile not found' });
    }

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error fetching recruiter profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Create a job posting for the recruiter's company
exports.createJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobData = req.body;

    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { companies: true }
    });

    if (!profile || profile.companies.length === 0) {
      return res.status(404).json({ success: false, message: 'Company not found for this recruiter' });
    }

    const companyId = profile.companies[0].id; // Assuming one company per recruiter for now

    const job = await prisma.jobPosting.create({
      data: {
        title: jobData.title,
        description: jobData.description,
        minCgpa: jobData.minCgpa,
        departments: jobData.departments,
        graduationYears: jobData.graduationYears,
        deadline: new Date(jobData.deadline),
        openings: jobData.openings,
        status: 'PENDING', // Always start pending
        companyId: companyId
      }
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// List jobs for the recruiter's company
exports.getJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { companies: true }
    });

    if (!profile || profile.companies.length === 0) {
      return res.json({ success: true, jobs: [] });
    }

    const companyId = profile.companies[0].id;
    const { status } = req.query;

    const filter = { companyId };
    if (status) filter.status = status;

    const jobs = await prisma.jobPosting.findMany({
      where: filter,
      include: {
        _count: {
          select: { applications: true }
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

// Get specific job details
exports.getJobDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { companies: true }
    });

    if (!profile || profile.companies.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const companyId = profile.companies[0].id;

    const job = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        _count: { select: { applications: true } }
      }
    });

    if (!job || job.companyId !== companyId) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { companies: true }
    });

    if (!profile || profile.companies.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const companyId = profile.companies[0].id;

    const job = await prisma.jobPosting.findUnique({ where: { id } });

    if (!job || job.companyId !== companyId) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Do not allow bypassing approval
    if (updateData.status && updateData.status === 'APPROVED') {
      return res.status(403).json({ success: false, message: 'Cannot set job status to APPROVED directly' });
    }

    // If job was APPROVED, set it back to PENDING since significant changes were made
    const newStatus = (job.status === 'APPROVED') ? 'PENDING' : (updateData.status || job.status);

    const updatedJob = await prisma.jobPosting.update({
      where: { id },
      data: {
        title: updateData.title,
        description: updateData.description,
        minCgpa: updateData.minCgpa,
        departments: updateData.departments,
        graduationYears: updateData.graduationYears,
        deadline: updateData.deadline ? new Date(updateData.deadline) : undefined,
        openings: updateData.openings,
        status: newStatus,
        rejectionReason: newStatus === 'PENDING' ? null : job.rejectionReason // Clear rejection reason if re-submitted
      }
    });

    res.json({ success: true, job: updatedJob });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get applicants for a job
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { companies: true }
    });

    if (!profile || profile.companies.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const companyId = profile.companies[0].id;

    const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });

    if (!job || job.companyId !== companyId) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const { status, name } = req.query;
    
    let filter = { jobId };
    if (status) filter.status = status;
    if (name) {
      filter.student = {
        user: { email: { contains: name, mode: 'insensitive' } } // We don't have a name field on student yet, fallback to email search
      };
    }

    const applications = await prisma.application.findMany({
      where: filter,
      include: {
        student: {
          include: {
            user: { select: { email: true } }
          }
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

// Get specific application details
exports.getApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { companies: true }
    });

    if (!profile || profile.companies.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const companyId = profile.companies[0].id;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        student: {
          include: {
            user: { select: { email: true } }
          }
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' }
        }
      }
    });

    if (!application || application.job.companyId !== companyId) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, application });
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const userId = req.user.id;

    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { companies: true }
    });

    if (!profile || profile.companies.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const companyId = profile.companies[0].id;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true }
    });

    if (!application || application.job.companyId !== companyId) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const updatedApplication = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: { status }
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          oldStatus: application.status,
          newStatus: status,
          changedBy: userId,
          note
        }
      });

      return app;
    });

    res.json({ success: true, application: updatedApplication });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update application notes
exports.updateApplicationNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { companies: true }
    });

    if (!profile || profile.companies.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const companyId = profile.companies[0].id;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true }
    });

    if (!application || application.job.companyId !== companyId) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { recruiterNotes: notes }
    });

    res.json({ success: true, application: updatedApplication });
  } catch (error) {
    console.error('Error updating application notes:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { companies: true }
    });

    if (!profile || profile.companies.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const companyId = profile.companies[0].id;

    // Get Jobs count
    const [pendingJobs, approvedJobs, rejectedJobs] = await Promise.all([
      prisma.jobPosting.count({ where: { companyId, status: 'PENDING' } }),
      prisma.jobPosting.count({ where: { companyId, status: 'APPROVED' } }),
      prisma.jobPosting.count({ where: { companyId, status: 'REJECTED' } })
    ]);

    // Get Applications count for jobs belonging to this company
    const jobs = await prisma.jobPosting.findMany({
      where: { companyId },
      select: { id: true }
    });
    
    const jobIds = jobs.map(j => j.id);

    const [totalApplicants, underReview, shortlisted, selected] = await Promise.all([
      prisma.application.count({ where: { jobId: { in: jobIds } } }),
      prisma.application.count({ where: { jobId: { in: jobIds }, status: 'UNDER_REVIEW' } }),
      prisma.application.count({ where: { jobId: { in: jobIds }, status: 'SHORTLISTED' } }),
      prisma.application.count({ where: { jobId: { in: jobIds }, status: 'SELECTED' } })
    ]);

    res.json({
      success: true,
      stats: {
        jobs: {
          total: pendingJobs + approvedJobs + rejectedJobs,
          pending: pendingJobs,
          approved: approvedJobs,
          rejected: rejectedJobs
        },
        applications: {
          total: totalApplicants,
          underReview,
          shortlisted,
          selected
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
