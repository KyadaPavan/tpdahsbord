const Joi = require('joi');

// Validation schema for activity log query parameters
const activityLogQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  action: Joi.string().valid('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT'),
  resource: Joi.string().valid('USER', 'CONTRACT', 'QUERY', 'ADMIN_PAYOUT', 'DASHBOARD_USER', 'AUTH'),
  userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId pattern
  targetUserId: Joi.string(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  search: Joi.string().min(2).max(100)
});

// Validation schema for user activity log parameters
const userActivityLogQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  action: Joi.string().valid('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT'),
  resource: Joi.string().valid('USER', 'CONTRACT', 'QUERY', 'ADMIN_PAYOUT', 'DASHBOARD_USER', 'AUTH'),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
});

// Validation schema for activity stats query parameters
const activityStatsQuerySchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).default(30)
});

// Validation schema for cleanup request
const cleanupLogsSchema = Joi.object({
  olderThanDays: Joi.number().integer().min(30).max(3650).default(365)
});

module.exports = {
  activityLogQuerySchema,
  userActivityLogQuerySchema,
  activityStatsQuerySchema,
  cleanupLogsSchema
};
