const Joi = require('joi');

// for verifying and sending otps

exports.sendOtpSchema = Joi.object({
  email: Joi.string().email().pattern(/@trustopay\.com$/).required()
});

exports.verifyOtpSchema = Joi.object({
  email: Joi.string().email().pattern(/@trustopay\.com$/).required(),
  otp: Joi.string().length(6).required()
});
