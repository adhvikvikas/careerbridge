require('dotenv').config();
const { generateToken, verifyToken } = require('./src/utils/auth.util');

const token = generateToken({ id: 'test-123', role: 'STUDENT' });
console.log('Token:', token);

const decoded = verifyToken(token);
console.log('Expires at:', new Date(decoded.exp * 1000).toLocaleString());
console.log('Valid for (minutes):', (decoded.exp - decoded.iat) / 60);
