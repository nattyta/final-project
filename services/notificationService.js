const Notification = require("../model/notificationModel");

async function createNotification({ userId, title, message, type }) {
  try {
    // Prevent duplicates if necessary (optional logic)
    const newNotification = new Notification({
      userId,
      title,
      message,
      type,
      isRead: false,
      notified: false
    });
    await newNotification.save();
    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

module.exports = {
  createNotification
};