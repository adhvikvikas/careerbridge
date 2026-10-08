require('dotenv').config({ path: './backend/.env' });
const { generateToken, verifyToken } = require('./backend/src/utils/auth.util');

const token = generateToken({ id: 'test-123', role: 'STUDENT' });
console.log('Token:', token);

const decoded = verifyToken(token);
console.log('Decoded:', decoded);
console.log('Expires at:', new Date(decoded.exp * 1000).toLocaleString());
console.log('Current time:', new Date().toLocaleString());
console.log('Valid for (minutes):', (decoded.exp - decoded.iat) / 60);
