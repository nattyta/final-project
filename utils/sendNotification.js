const Notification = require("../model/notificationModel");
const { sendEmail } = require("./emailService");

const sendNotification = async ({ userId, title, message, type = "reminder", email, actionUrl }) => {
  try {
    console.log("📣 Creating notification...");
    const savedNotification = await Notification.create({
      userId,
      title,
      message,
      type,
      isRead: false,
      actionUrl: actionUrl || null,
    });
    console.log("✅ Notification saved:", savedNotification._id);

    if (email) {
      console.log("📧 Sending email to:", email);
      await sendEmail({
        to: email,
        subject: title,
        text: `${message}${actionUrl ? `\n\n🔗 Action: ${actionUrl}` : ''}`
      });
      console.log("📨 Email sent successfully to:", email);
    } else {
      console.warn("⚠️ No email provided — skipping email sending.");
    }

  } catch (err) {
    console.error("❌ Notification error:", err.message || err);
  }
};

module.exports = { sendNotification };
