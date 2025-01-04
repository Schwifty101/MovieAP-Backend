

// config/emailConfig.js
const nodemailer = require('nodemailer');
require('dotenv').config();

console.log(`Email: ${process.env.EMAIL_USER}, Password: ${process.env.EMAIL_PASS}`);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify the transporter connection (optional for debugging)
transporter.verify((error, success) => {
  if (error) {
    console.log('Error connecting to  email service:', error);
  } else {
    console.log('Email service connected:', success);
  }
});

module.exports = transporter;
