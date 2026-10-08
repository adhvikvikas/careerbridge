const { PrismaClient } = require('@prisma/client');
const { comparePassword, generateToken } = require('../utils/auth.util');
const { OAuth2Client } = require('google-auth-library');

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    // Omit passwordHash from the response
    const { passwordHash, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Missing Google credential' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;

    // Look for user by googleId
    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    // If not found by googleId, look up by email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'Account not found. Please register through your institution first.' });
      }

      // If user exists but googleId is different (shouldn't happen if it was null, but we check to be safe)
      if (user.googleId && user.googleId !== googleId) {
        return res.status(409).json({ success: false, message: 'Account is already linked to a different Google identity.' });
      }

      // Link the Google account safely
      user = await prisma.user.update({
        where: { email },
        data: { googleId },
      });
    }

    const token = generateToken(user);
    const { passwordHash, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Google Login error:', error);
    res.status(401).json({ success: false, message: 'Invalid Google credential' });
  }
};

exports.getMe = async (req, res) => {
  // req.user is populated by authenticate middleware
  res.json({
    success: true,
    user: req.user,
  });
};
