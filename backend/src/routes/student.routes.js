const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/test', authenticate, authorizeRoles('STUDENT'), (req, res) => {
  res.json({ success: true, message: 'Student access granted' });
});

module.exports = router;
