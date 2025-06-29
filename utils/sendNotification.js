const Notification = require("../model/notificationModel");
const { sendEmail } = require("./emailService");

const sendNotification = async ({ userId, title, message, type = "reminder", email }) => {
  try {
    await Notification.create({
      userId,
      title,
      message,
      type,
      isRead: false
    });

    if (email) {
      await sendEmail({
        to: email,
        subject: title,
        text: message
      });
    }
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};

module.exports = { sendNotification };
