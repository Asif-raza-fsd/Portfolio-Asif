const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@asifraza.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

    const cleanInputEmail = email.trim().toLowerCase();
    const cleanAdminEmail = adminEmail.trim().toLowerCase();

    if (cleanInputEmail !== cleanAdminEmail || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const secret = process.env.JWT_SECRET || 'asif_raza_super_secret_jwt_key_2026_production';
    const token = jwt.sign(
      {
        email: cleanAdminEmail,
        role: 'admin',
      },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      admin: {
        email: cleanAdminEmail,
        name: 'Asif Raza (Admin)',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
});

// GET /api/auth/me (Verify token)
router.get('/me', authMiddleware, (req, res) => {
  return res.json({
    success: true,
    admin: req.admin,
  });
});

module.exports = router;
