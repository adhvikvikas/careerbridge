const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { validateRequest } = require('../validators/auth.validator');
const { rejectSchema } = require('../validators/admin.validator');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// Middleware applied to all routes in this router
router.use(authenticate, authorizeRoles('ADMIN'));

// Test route (Phase 2)
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin access granted' });
});

// Dashboard stats
router.get('/dashboard-stats', adminController.getDashboardStats);

// Companies
router.get('/companies', adminController.getCompanies);
router.patch('/companies/:id/approve', adminController.approveCompany);
router.patch('/companies/:id/reject', validateRequest(rejectSchema), adminController.rejectCompany);

// Jobs
router.get('/jobs', adminController.getJobs);
router.patch('/jobs/:id/approve', adminController.approveJob);
router.patch('/jobs/:id/reject', validateRequest(rejectSchema), adminController.rejectJob);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
