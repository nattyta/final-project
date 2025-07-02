const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, text, html }) {
  try {
    console.log("✉️ Preparing to send email:", { to, subject });

    await transporter.sendMail({
      from: `"Library Notifier" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html, // 👈 Add this
    });

    console.log("✅ Email sent!");
  } catch (err) {
    console.error("❌ sendEmail failed:", err);
    throw err;
  }
}

module.exports = { sendEmail };
