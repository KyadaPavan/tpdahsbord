const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  notes: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const querySchema = new mongoose.Schema({
  queryId: {
    type: String,
    unique: true,
    index: true,
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  type: {
    type: String,
    enum: ['contract', 'user', 'kyc', 'other'],
    required: true,
  },
  contractId: {
    type: String,
    required: function() { return this.type === 'contract'; }
  },
  userId: {
    type: String,
    required: function() { return this.type === 'user'; }
  },
  attendedBy: { type: String, required: true },
  followUps: [followUpSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to generate a short unique queryId
querySchema.pre('save', function (next) {
  if (!this.queryId) {
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const digits = Math.floor(10000 + Math.random() * 90000).toString();
    this.queryId = letter + digits;
  }
  next();
});

module.exports = mongoose.model('Query', querySchema);