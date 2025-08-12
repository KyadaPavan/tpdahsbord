const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to check if user is authenticated
function authenticate(req, res, next) {
  const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.dashboardUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Middleware to check for admin role (can also update)
function requireAdmin(req, res, next) {
  if (req.dashboardUser?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// Middleware to check for support or admin role (read-only)
function requireSupportOrAdmin(req, res, next) {
  if (!['admin', 'support'].includes(req.dashboardUser?.role)) {
    return res.status(403).json({ message: 'Support or admin access required' });
  }
  next();
}

module.exports = { authenticate, requireAdmin, requireSupportOrAdmin };
