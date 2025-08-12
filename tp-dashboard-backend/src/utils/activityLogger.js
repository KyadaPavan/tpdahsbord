const ActivityLog = require('../models/activityLog.model');

/**
 * Utility function to log activities
 * @param {Object} options - Logging options
 * @param {Object} options.performedBy - User who performed the action
 * @param {string} options.action - Action performed (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
 * @param {string} options.resource - Resource affected (USER, CONTRACT, QUERY, ADMIN_PAYOUT, DASHBOARD_USER, AUTH)
 * @param {string} options.resourceId - ID of the affected resource
 * @param {Object} options.changes - Changes made (before, after, fieldsChanged)
 * @param {Object} options.metadata - Additional metadata
 * @param {Object} options.targetUser - Target user details (for user-related operations)
 * @param {Object} options.req - Express request object (for extracting IP, user agent, etc.)
 */
const logActivity = async (options) => {
  try {
    const {
      performedBy,
      action,
      resource,
      resourceId = null,
      changes = {},
      metadata = {},
      targetUser = null,
      req = null
    } = options;

    // Validate required fields
    if (!performedBy || !performedBy.email || !performedBy.role) {
      console.error(' Activity Logger - Missing required performedBy fields. Check if authentication middleware is applied to the route.');
      return null;
    }

    if (!action || !resource) {
      console.error(' Activity Logger - Missing required action or resource:', { action, resource });
      return null;
    }

    // Extract metadata from request if provided
    const activityMetadata = {
      ...metadata,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.get('User-Agent') || null,
      method: req?.method || null,
      endpoint: req?.originalUrl || null
    };

    const activityLog = new ActivityLog({
      performedBy: {
        userId: performedBy.id || performedBy.userId || performedBy._id,
        email: performedBy.email,
        role: performedBy.role
      },
      action,
      resource,
      resourceId: resourceId?.toString(),
      changes: {
        before: changes.before || null,
        after: changes.after || null,
        fieldsChanged: changes.fieldsChanged || []
      },
      metadata: activityMetadata,
      targetUser
    });

    await activityLog.save();
    console.log(` Activity: ${action} on ${resource} by ${performedBy.email}`);
    return activityLog;
  } catch (error) {
    console.error(' Activity Logger - Error:', error.message);
    // Don't throw error to prevent breaking the main operation
    return null;
  }
};

/**
 * Compare two objects and return the changed fields
 * @param {Object} before - Original object
 * @param {Object} after - Modified object
 * @param {Array} excludeFields - Fields to exclude from comparison
 * @returns {Object} - Changes object with before, after, and fieldsChanged
 */
const getChanges = (before, after, excludeFields = ['updatedAt', '__v', '_id']) => {
  const changes = {
    before: {},
    after: {},
    fieldsChanged: []
  };

  if (!before || !after) {
    return changes;
  }

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  allKeys.forEach(key => {
    if (excludeFields.includes(key)) return;

    const beforeValue = before[key];
    const afterValue = after[key];

    // Deep comparison for objects and arrays
    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changes.before[key] = beforeValue;
      changes.after[key] = afterValue;
      changes.fieldsChanged.push(key);
    }
  });

  return changes;
};

/**
 * Sanitize sensitive data before logging
 * @param {Object} data - Data to sanitize
 * @returns {Object} - Sanitized data
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'otp'];
  const sanitized = { ...data };

  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    Object.keys(obj).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = sanitizeObject(obj[key]);
      }
    });

    return obj;
  };

  return sanitizeObject(sanitized);
};

/**
 * Middleware to automatically log activities
 * @param {string} resource - Resource being affected
 * @param {string} action - Action being performed
 * @param {Function} getResourceId - Function to extract resource ID from req
 * @param {Function} getTargetUser - Function to extract target user from req/res
 */
const activityLogger = (resource, action, getResourceId = null, getTargetUser = null) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    res.send = function (data) {
      // Only log if the operation was successful (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Parse response data if it's a string
        let responseData;
        try {
          responseData = typeof data === 'string' ? JSON.parse(data) : data;
        } catch {
          responseData = data;
        }

        // Extract resource ID and target user
        const resourceId = getResourceId ? getResourceId(req, responseData) : null;
        const targetUser = getTargetUser ? getTargetUser(req, responseData) : null;

        // Log the activity
        setImmediate(() => {
          logActivity({
            performedBy: req.dashboardUser,
            action,
            resource,
            resourceId,
            targetUser,
            metadata: {
              statusCode: res.statusCode,
              description: `${action} operation on ${resource}`
            },
            req
          });
        });
      }

      // Call original send function
      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  logActivity,
  getChanges,
  sanitizeData,
  activityLogger
};
