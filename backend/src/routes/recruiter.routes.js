const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/test', authenticate, authorizeRoles('RECRUITER'), (req, res) => {
  res.json({ success: true, message: 'Recruiter access granted' });
});

module.exports = router;
