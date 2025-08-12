const mongoose = require('mongoose');

const adminpayoutSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('AdminPayout', adminpayoutSchema, 'admin_payout_approvals');

