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
    enum: ["payment", "reminder", "warning"],
    default: "payment"
  },
  isRead: {
    type: Boolean,
    default: false
  },
  title: String,
  notified: { type: Boolean, default: false }

}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
