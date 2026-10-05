const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { validateRequest } = require('../validators/auth.validator');
const { jobSchema, applicationStatusSchema, applicationNotesSchema } = require('../validators/recruiter.validator');
const recruiterController = require('../controllers/recruiter.controller');

const router = express.Router();

router.use(authenticate, authorizeRoles('RECRUITER'));

// Test
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Recruiter access granted' });
});

// Dashboard
router.get('/dashboard-stats', recruiterController.getDashboardStats);

// Profile
router.get('/profile', recruiterController.getProfile);
router.patch('/profile', validateRequest(require('../validators/recruiter.validator').profileSchema), recruiterController.updateProfile);

// Company
router.post('/company', validateRequest(require('../validators/recruiter.validator').companySchema), recruiterController.createCompany);
router.patch('/company', validateRequest(require('../validators/recruiter.validator').companySchema), recruiterController.updateCompany);

// Jobs
router.get('/jobs', recruiterController.getJobs);
router.post('/jobs', validateRequest(jobSchema), recruiterController.createJob);
router.get('/jobs/:id', recruiterController.getJobDetails);
router.patch('/jobs/:id', validateRequest(jobSchema), recruiterController.updateJob);
router.get('/jobs/:jobId/applications', recruiterController.getJobApplications);

// Applications
router.get('/applications/:id', recruiterController.getApplicationDetails);
router.patch('/applications/:id/status', validateRequest(applicationStatusSchema), recruiterController.updateApplicationStatus);
router.patch('/applications/:id/notes', validateRequest(applicationNotesSchema), recruiterController.updateApplicationNotes);

// Notifications
router.get('/notifications', recruiterController.getNotifications);
router.patch('/notifications/read-all', recruiterController.markAllNotificationsRead);
router.patch('/notifications/:id/read', recruiterController.markNotificationRead);

module.exports = router;
