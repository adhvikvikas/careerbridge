const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { validateRequest } = require('../validators/auth.validator');
const { updateProfileSchema } = require('../validators/student.validator');
const studentController = require('../controllers/student.controller');

const router = express.Router();

// Middleware applied to all routes in this router
router.use(authenticate, authorizeRoles('STUDENT'));

// Test route (Phase 2)
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Student access granted' });
});

// Profile
router.get('/profile', studentController.getProfile);
router.patch('/profile', validateRequest(updateProfileSchema), studentController.updateProfile);

// Dashboard
router.get('/dashboard-stats', studentController.getDashboardStats);

// Jobs
router.get('/jobs', studentController.getJobs);
router.get('/jobs/:id', studentController.getJobDetails);
router.post('/jobs/:jobId/apply', studentController.applyToJob);
router.post('/jobs/:jobId/save', studentController.saveJob);
router.delete('/jobs/:jobId/save', studentController.unsaveJob);

// Applications
router.get('/applications', studentController.getApplications);
router.get('/applications/:id', studentController.getApplicationDetails);

// Saved Jobs
router.get('/saved-jobs', studentController.getSavedJobs);

// Notifications
router.get('/notifications', studentController.getNotifications);
router.patch('/notifications/:id/read', studentController.markNotificationRead);

module.exports = router;
