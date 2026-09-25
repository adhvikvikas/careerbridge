const express = require('express');
const { login, getMe } = require('../controllers/auth.controller');
const { loginSchema, validateRequest } = require('../validators/auth.validator');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticate, getMe);

module.exports = router;
