const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["payment", "reminder", "warning","fine","info"],
    default: "payment"
  },
  isRead: {
    type: Boolean,
    default: false
  },
  title: String,
  notified: { type: Boolean, default: false },

  sent: {
    inApp: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  }
  

}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
