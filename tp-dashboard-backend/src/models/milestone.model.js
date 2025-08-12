const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Milestones', milestoneSchema, 'milestones'); 
