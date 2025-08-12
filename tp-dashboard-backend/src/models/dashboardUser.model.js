const mongoose = require('mongoose');

// for storing the dashboard user details

const dashboardUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^[\w-.]+@trustopay\.com$/, 'Only trustopay.com emails allowed']
  },
  role: {
    type: String,
    enum: ['admin', 'support'],
    required: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DashboardUser', dashboardUserSchema, 'dashboard-users');
