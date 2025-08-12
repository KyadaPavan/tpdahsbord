const jwt = require('jsonwebtoken');
const Otp = require('../models/otp.model');
const DashboardUser = require('../models/dashboardUser.model');
const transporter = require('../config/mail');
const generateOtp = require('../utils/generateOtp');
const adminEmails = require('../config/adminEmails');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

exports.sendOtpToEmail = async (email) => {
  if (!email.endsWith('@trustopay.com')) {
    throw new Error('Only trustopay.com emails allowed');
  }
  const otp = generateOtp();
  await Otp.deleteMany({ email });
  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });
  transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: 'Your TrustoPay OTP For Admin Dashboard',
    text: `Your OTP is: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif;  padding: 32px;">
        <div style="max-width: 420px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 18px;">
            <img src="https://trustopay.com/assets/tp.svg" alt="TrustoPay Logo" style="height: 48px; margin-bottom: 8px;" onerror="this.style.display='none'" />
            <h2 style="color: #3b158a; margin: 0; font-size: 1.6em;">TrustoPay OTP Verification</h2>
          </div>
          <p style="color: #333; font-size: 1.1em;">Hello,</p>
          <p style="color: #333;">Your One-Time Password (OTP) for TrustoPay dashboard login is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; background: #ede7f6; color: #3b158a; font-size: 2em; letter-spacing: 8px; padding: 12px 32px; border-radius: 8px; font-weight: bold; ">${otp}</span>
          </div>
          <p style="color: #555;">This OTP is valid for <b>5 minutes</b>. Please do not share it with anyone.</p>
          <p style="color: #888; font-size: 0.95em; margin-top: 32px;">If you did not request this OTP, please ignore this email.</p>
          <div style="margin-top: 32px; text-align: center;">
            <span style="color: #3b158a; font-weight: bold;">TrustoPay Team</span>
          </div>
        </div>
      </div>
    `
  }).catch((err) => {
    console.error('Error sending OTP email:', err);
  });
};

exports.verifyOtp = async (email, otp) => {
  if (!email.endsWith('@trustopay.com')) return false;
  const record = await Otp.findOne({ email, otp });
  if (!record || record.expiresAt < new Date()) return false;
  await Otp.deleteOne({ _id: record._id });

  // Determine user role based on email configuration
  let role = null;
  if (adminEmails.admin.includes(email)) {
    role = 'admin';
  } else if (adminEmails.support.includes(email)) {
    role = 'support';
  } else {
    // Email is not authorized for access
    throw new Error('Email not authorized for dashboard access');
  }

  const dashboardUser = await DashboardUser.findOneAndUpdate(
    { email },
    { $set: { role, lastLogin: new Date() } },
    { upsert: true, new: true }
  );

  const token = jwt.sign({ email, role, id: dashboardUser._id }, JWT_SECRET, { expiresIn: '1h' });
  return { token, role, email, userId: dashboardUser._id };
};
