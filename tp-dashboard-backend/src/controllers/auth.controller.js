const authService = require('../services/auth.service');
const jwt = require('jsonwebtoken');
const DashboardUser = require('../models/dashboardUser.model');
const { logActivity } = require('../utils/activityLogger');
const JWT_SECRET = process.env.JWT_SECRET;

// to send the OTP to the user's email
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    await authService.sendOtpToEmail(email);
    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to send OTP' });
  }
};

// to verify the OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await authService.verifyOtp(email, otp);
    if (!result || !result.token) return res.status(400).json({ message: 'Invalid or expired OTP' });

    res.cookie('token', result.token, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000
    });

    // Log the login activity
    await logActivity({
      performedBy: {
        userId: result.userId,
        email: result.email,
        role: result.role
      },
      action: 'LOGIN',
      resource: 'AUTH',
      metadata: {
        description: `User ${result.email} logged in successfully`,
        statusCode: 200
      },
      req
    });

    res.json({ message: 'Login successful', role: result.role, email: result.email });
  } catch (err) {
    res.status(400).json({ message: err.message || 'OTP verification failed' });
  }
};

// Logout 
exports.logout = async (req, res) => {
  try {
    // Log the logout activity if user is authenticated
    if (req.dashboardUser) {
      await logActivity({
        performedBy: req.dashboardUser,
        action: 'LOGOUT',
        resource: 'AUTH',
        metadata: {
          description: `User ${req.dashboardUser.email} logged out`,
          statusCode: 200
        },
        req
      });
    }

    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  }
};

// Get current user from token
exports.me = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await DashboardUser.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ email: user.email, role: user.role });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
