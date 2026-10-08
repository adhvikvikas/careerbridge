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
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Recruiter profile not found' });
    }

    const company = await prisma.company.findFirst({
      where: { recruiterId: profile.id }
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found for this recruiter' });
    }

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
        companyId: company.id
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
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Recruiter profile not found' });
    }

    const { status } = req.query;

    const filter = { 
      company: { recruiterId: profile.id },
      deletedAt: null
    };
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
      where: { userId }
    });

    if (!profile) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const job = await prisma.jobPosting.findFirst({
      where: { 
        id,
        company: { recruiterId: profile.id }
      },
      include: {
        _count: { select: { applications: true } }
      }
    });

    if (!job) {
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
      where: { userId }
    });

    if (!profile) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const job = await prisma.jobPosting.findFirst({
      where: { 
        id,
        company: { recruiterId: profile.id }
      }
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.deletedAt) {
      return res.status(403).json({ success: false, message: 'Cannot edit an archived job' });
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

// Archive job
exports.archiveJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const job = await prisma.jobPosting.findFirst({
      where: { 
        id,
        company: { recruiterId: profile.id },
        deletedAt: null
      }
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or already archived' });
    }

    const archivedJob = await prisma.jobPosting.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    res.json({ success: true, job: archivedJob });
  } catch (error) {
    console.error('Error archiving job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all applications across all jobs for the recruiter's company
exports.getAllApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const { status, name } = req.query;
    
    let filter = { job: { company: { recruiterId: profile.id } } };
    if (status) filter.status = status;
    if (name) {
      filter.student = {
        user: { email: { contains: name, mode: 'insensitive' } }
      };
    }

    const applications = await prisma.application.findMany({
      where: filter,
      include: {
        job: { select: { title: true, id: true } },
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
    console.error('Error fetching all applications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get applicants for a job
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const job = await prisma.jobPosting.findFirst({
      where: { 
        id: jobId,
        company: { recruiterId: profile.id }
      },
      include: { company: true }
    });

    if (!job) {
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

    res.json({ success: true, applications, job });
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
      where: { userId }
    });

    if (!profile) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const application = await prisma.application.findFirst({
      where: { 
        id,
        job: { company: { recruiterId: profile.id } }
      },
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

    if (!application) {
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
      where: { userId }
    });

    if (!profile) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const application = await prisma.application.findFirst({
      where: { 
        id,
        job: { company: { recruiterId: profile.id } }
      },
      include: { job: { include: { company: true } }, student: true }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const updatedApplication = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: { status }
      });

      if (application.status !== status) {
        await tx.applicationStatusHistory.create({
          data: {
            applicationId: id,
            oldStatus: application.status,
            newStatus: status,
            changedBy: userId,
            note
          }
        });
        
        let message = `Your application for ${application.job.title} at ${application.job.company.name} `;
        switch(status) {
          case 'UNDER_REVIEW': message += 'is now under review.'; break;
          case 'SHORTLISTED': message += 'has been shortlisted.'; break;
          case 'INTERVIEW': message += 'has moved to the interview stage.'; break;
          case 'SELECTED': message += 'has been selected.'; break;
          case 'REJECTED': message += 'has been rejected.'; break;
          default: message += `status changed to ${status}.`; break;
        }

        await tx.notification.create({
          data: {
            userId: application.student.userId,
            type: 'APPLICATION_UPDATED',
            title: 'Application Updated',
            message
          }
        });
      }

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
      where: { userId }
    });

    if (!profile) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const application = await prisma.application.findFirst({
      where: { 
        id,
        job: { company: { recruiterId: profile.id } }
      },
      include: { job: true }
    });

    if (!application) {
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
      where: { userId }
    });

    if (!profile) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const company = await prisma.company.findFirst({
      where: { recruiterId: profile.id }
    });

    if (!company) {
      return res.json({
        success: true,
        profile,
        companyStatus: null,
        companyRejectionReason: null,
        recentJobs: [],
        recentApplications: [],
        stats: {
          jobs: { total: 0, pending: 0, approved: 0, rejected: 0 },
          applications: { total: 0, underReview: 0, shortlisted: 0, selected: 0 }
        }
      });
    }

    // Get Jobs count
    const [pendingJobs, approvedJobs, rejectedJobs] = await Promise.all([
      prisma.jobPosting.count({ where: { company: { recruiterId: profile.id }, status: 'PENDING', deletedAt: null } }),
      prisma.jobPosting.count({ where: { company: { recruiterId: profile.id }, status: 'APPROVED', deletedAt: null } }),
      prisma.jobPosting.count({ where: { company: { recruiterId: profile.id }, status: 'REJECTED', deletedAt: null } })
    ]);

    const [totalApplicants, underReview, shortlisted, selected] = await Promise.all([
      prisma.application.count({ where: { job: { company: { recruiterId: profile.id } } } }),
      prisma.application.count({ where: { job: { company: { recruiterId: profile.id } }, status: 'UNDER_REVIEW' } }),
      prisma.application.count({ where: { job: { company: { recruiterId: profile.id } }, status: 'SHORTLISTED' } }),
      prisma.application.count({ where: { job: { company: { recruiterId: profile.id } }, status: 'SELECTED' } })
    ]);

    // Get recent jobs
    const recentJobs = await prisma.jobPosting.findMany({
      where: { company: { recruiterId: profile.id }, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { company: { select: { name: true } } }
    });

    // Get recent applications
    const recentApplications = await prisma.application.findMany({
      where: { job: { company: { recruiterId: profile.id } } },
      orderBy: { appliedAt: 'desc' },
      take: 5,
      include: {
        job: { select: { title: true } },
        student: { include: { user: { select: { email: true } } } }
      }
    });

    res.json({
      success: true,
      profile,
      companyStatus: company.status,
      companyRejectionReason: company.rejectionReason,
      recentJobs,
      recentApplications,
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

// Update recruiter profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Recruiter profile not found' });
    }

    const updatedProfile = await prisma.recruiterProfile.update({
      where: { userId },
      data: { name, phone }
    });

    res.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Error updating recruiter profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Create recruiter company
exports.createCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, website, industry, location } = req.body;

    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { companies: true }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Recruiter profile not found' });
    }

    if (profile.companies && profile.companies.length > 0) {
      return res.status(409).json({ success: false, message: 'Company already exists for this recruiter' });
    }

    const company = await prisma.company.create({
      data: {
        name,
        description,
        website,
        industry,
        location,
        status: 'PENDING',
        recruiterId: profile.id
      }
    });

    res.status(201).json({ success: true, company });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update recruiter company
exports.updateCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, website, industry, location } = req.body;

    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Recruiter profile not found' });
    }

    const company = await prisma.company.findFirst({
      where: { recruiterId: profile.id }
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Reset status to PENDING if it was REJECTED, otherwise keep existing status (or PENDING)
    const currentStatus = company.status;
    const newStatus = (currentStatus === 'REJECTED') ? 'PENDING' : currentStatus;

    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        name,
        description,
        website,
        industry,
        location,
        status: newStatus,
        rejectionReason: newStatus === 'PENDING' ? null : company.rejectionReason
      }
    });

    res.json({ success: true, company: updatedCompany });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get recruiter notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() }
    });

    res.json({ success: true, notification: updatedNotification });
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Mark all notifications as read
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() }
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


exports.getCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { companies: true }
    });

    if (!profile || profile.companies.length === 0) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, company: profile.companies[0] });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};