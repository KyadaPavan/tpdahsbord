const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLog.controller');
const { authenticate, requireAdmin } = require('../middlewares/dashboardAuth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  activityLogRateLimit,
  requireSuperAdmin,
  auditActivityLogAccess,
  securityHeaders
} = require('../middlewares/activityLogSecurity.middleware');
const {
  activityLogQuerySchema,
  userActivityLogQuerySchema,
  activityStatsQuerySchema,
  cleanupLogsSchema
} = require('../validations/activityLog.validation');

// Apply security middleware to all routes
router.use(securityHeaders);
router.use(activityLogRateLimit);

// All activity log routes require admin authentication
router.use(authenticate, requireAdmin);

// Audit all access to activity logs
router.use(auditActivityLogAccess);

// Get all activity logs with pagination and filters
// GET /api/activity-logs?page=1&limit=20&action=CREATE&resource=USER&userId=123&startDate=2024-01-01&endDate=2024-12-31&search=john
router.get('/', validate(activityLogQuerySchema, 'query'), activityLogController.getActivityLogs);

// Get activity logs for a specific user
// GET /api/activity-logs/user/:userId?page=1&limit=20&action=CREATE&resource=USER&startDate=2024-01-01&endDate=2024-12-31
router.get('/user/:userId', validate(userActivityLogQuerySchema, 'query'), activityLogController.getUserActivityLogs);

// Get activity statistics
// GET /api/activity-logs/stats?days=30
router.get('/stats', validate(activityStatsQuerySchema, 'query'), activityLogController.getActivityStats);

// Clean up old logs (admin only with additional security)
// DELETE /api/activity-logs/cleanup
router.delete('/cleanup', requireSuperAdmin, validate(cleanupLogsSchema), activityLogController.cleanupLogs);

module.exports = router;
