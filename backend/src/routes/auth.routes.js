const express = require('express');
const { login, getMe, googleLogin } = require('../controllers/auth.controller');
const { loginSchema, validateRequest } = require('../validators/auth.validator');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', validateRequest(loginSchema), login);
router.post('/google', googleLogin);
router.get('/me', authenticate, getMe);

module.exports = router;
