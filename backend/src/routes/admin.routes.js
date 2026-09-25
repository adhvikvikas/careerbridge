const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/test', authenticate, authorizeRoles('ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Admin access granted' });
});

module.exports = router;
