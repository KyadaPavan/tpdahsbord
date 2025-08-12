const ActivityLog = require('../models/activityLog.model');
const moment = require('moment');

// Get all activity logs with pagination and filters
exports.getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      action,
      resource,
      userId,
      targetUserId,
      startDate,
      endDate,
      search
    } = req.query;

    // Build filter object
    const filter = {};

    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (userId) filter['performedBy.userId'] = userId;
    if (targetUserId) filter['targetUser.userId'] = targetUserId;

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Search in description, email, or target user details
    if (search) {
      filter.$or = [
        { 'metadata.description': { $regex: search, $options: 'i' } },
        { 'performedBy.email': { $regex: search, $options: 'i' } },
        { 'targetUser.email': { $regex: search, $options: 'i' } },
        { 'targetUser.phone': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const totalLogs = await ActivityLog.countDocuments(filter);

    // Get logs with pagination
    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('performedBy.userId', 'email role')
      .lean();

    // Format the response
    const formattedLogs = logs.map(log => ({
      _id: log._id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      performedBy: {
        email: log.performedBy.email,
        role: log.performedBy.role
      },
      changes: log.changes,
      metadata: log.metadata,
      targetUser: log.targetUser,
      timestamp: moment(log.timestamp).utcOffset("+05:30").format("DD/MM/YYYY, hh:mm A"),
      rawTimestamp: log.timestamp
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalLogs / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      data: {
        logs: formattedLogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalLogs,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: error.message
    });
  }
};

// Get activity logs for a specific user
exports.getUserActivityLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 20,
      action,
      resource,
      startDate,
      endDate
    } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Build filter object
    const filter = {
      $or: [
        { 'performedBy.userId': userId },
        { 'targetUser.userId': userId }
      ]
    };

    if (action) filter.action = action;
    if (resource) filter.resource = resource;

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const totalLogs = await ActivityLog.countDocuments(filter);

    // Get logs with pagination
    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('performedBy.userId', 'email role')
      .lean();

    // Format the response
    const formattedLogs = logs.map(log => ({
      _id: log._id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      performedBy: {
        email: log.performedBy.email,
        role: log.performedBy.role
      },
      changes: log.changes,
      metadata: log.metadata,
      targetUser: log.targetUser,
      timestamp: moment(log.timestamp).utcOffset("+05:30").format("DD/MM/YYYY, hh:mm A"),
      rawTimestamp: log.timestamp
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalLogs / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        logs: formattedLogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalLogs,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity logs',
      error: error.message
    });
  }
};

// Get activity statistics
exports.getActivityStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get activity counts by action
    const actionStats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get activity counts by resource
    const resourceStats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$resource',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get most active users
    const userStats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            userId: '$performedBy.userId',
            email: '$performedBy.email',
            role: '$performedBy.role'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get daily activity for the last 7 days
    const dailyStats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        actionStats,
        resourceStats,
        userStats,
        dailyStats,
        period: `Last ${days} days`
      }
    });

  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity statistics',
      error: error.message
    });
  }
};

// Delete old activity logs (for cleanup)
exports.cleanupLogs = async (req, res) => {
  try {
    const { olderThanDays = 365 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays));

    const result = await ActivityLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    res.status(200).json({
      success: true,
      message: `Cleaned up ${result.deletedCount} old activity logs`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error cleaning up logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup logs',
      error: error.message
    });
  }
};
