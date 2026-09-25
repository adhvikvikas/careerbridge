const { PrismaClient } = require('@prisma/client');
const { comparePassword, generateToken } = require('../utils/auth.util');

const prisma = new PrismaClient();

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

exports.getMe = async (req, res) => {
  // req.user is populated by authenticate middleware
  res.json({
    success: true,
    user: req.user,
  });
};
