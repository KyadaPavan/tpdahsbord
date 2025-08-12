const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Contract', contractSchema, 'contract');

