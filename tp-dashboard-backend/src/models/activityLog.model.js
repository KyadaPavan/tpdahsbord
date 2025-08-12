const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  // User who performed the action
  performedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DashboardUser',
      required: true
    },
    email: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'support'],
      required: true
    }
  },

  // Action details
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'],
    required: true
  },

  // Resource that was affected
  resource: {
    type: String,
    enum: ['USER', 'CONTRACT', 'QUERY', 'ADMIN_PAYOUT', 'DASHBOARD_USER', 'AUTH'],
    required: true
  },

  // Resource ID (if applicable)
  resourceId: {
    type: String,
    default: null
  },

  // Details of what changed
  changes: {
    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    fieldsChanged: [{
      type: String
    }]
  },

  // Additional metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    method: String,
    endpoint: String,
    statusCode: Number,
    description: String
  },

  // Target user (for user-related operations)
  targetUser: {
    userId: String,
    email: String,
    phone: String
  },

  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activityLogSchema.index({ 'performedBy.userId': 1, timestamp: -1 });
activityLogSchema.index({ resource: 1, timestamp: -1 });
activityLogSchema.index({ resourceId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ 'targetUser.userId': 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema, 'activity-logs');
