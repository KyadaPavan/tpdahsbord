
// to generate 6 digit otp
module.exports = function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
