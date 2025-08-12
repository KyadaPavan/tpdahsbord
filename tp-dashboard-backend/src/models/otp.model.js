const mongoose = require('mongoose');

// for storing the opt for verifaction (temperory)

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 300 } }
});

module.exports = mongoose.model('Otp', otpSchema);
