const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { sendOtpSchema, verifyOtpSchema } = require('../validations/auth.validation');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/dashboardAuth.middleware');

router.post('/login', validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authController.me);

module.exports = router;
