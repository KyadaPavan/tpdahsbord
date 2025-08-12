const rateLimit = require('express-rate-limit');
const { logActivity } = require('../utils/activityLogger');

// Rate limiting for activity log endpoints
const activityLogRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests to activity logs. Please try again later.',
    error: 'Rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    // Log rate limit violations
    if (req.dashboardUser) {
      await logActivity({
        performedBy: req.dashboardUser,
        action: 'VIEW',
        resource: 'ACTIVITY_LOG',
        metadata: {
          description: 'Rate limit exceeded for activity log access',
          statusCode: 429,
          violation: 'RATE_LIMIT'
        },
        req
      });
    }

    res.status(429).json({
      success: false,
      message: 'Too many requests to activity logs. Please try again later.',
      error: 'Rate limit exceeded'
    });
  }
});

// Enhanced authentication for sensitive operations
const requireSuperAdmin = (req, res, next) => {
  if (req.dashboardUser?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required for this operation'
    });
  }

  // Additional check for sensitive operations like cleanup
  if (req.route.path.includes('cleanup')) {
    // Log the attempt
    logActivity({
      performedBy: req.dashboardUser,
      action: 'DELETE',
      resource: 'ACTIVITY_LOG',
      metadata: {
        description: 'Attempted cleanup of activity logs',
        statusCode: req.dashboardUser?.role === 'admin' ? 200 : 403,
        sensitive: true
      },
      req
    });
  }

  next();
};

// Audit middleware to log access to activity logs
const auditActivityLogAccess = async (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    // Log successful access to activity logs
    if (res.statusCode >= 200 && res.statusCode < 300) {
      setImmediate(async () => {
        const endpoint = req.originalUrl;
        let description = 'Accessed activity logs';

        if (endpoint.includes('/stats')) {
          description = 'Viewed activity statistics';
        } else if (endpoint.includes('/user/')) {
          const userId = req.params.userId;
          description = `Viewed activity logs for user ${userId}`;
        } else if (endpoint.includes('/cleanup')) {
          description = 'Performed activity log cleanup';
        }

        await logActivity({
          performedBy: req.dashboardUser,
          action: 'VIEW',
          resource: 'ACTIVITY_LOG',
          metadata: {
            description,
            statusCode: res.statusCode,
            endpoint: req.originalUrl,
            queryParams: req.query
          },
          req
        });
      });
    }

    originalSend.call(this, data);
  };

  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Prevent caching of sensitive data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  next();
};

module.exports = {
  activityLogRateLimit,
  requireSuperAdmin,
  auditActivityLogAccess,
  securityHeaders
};
