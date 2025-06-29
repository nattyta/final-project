const Notification = require('../model/notificationModel');

const NotificationController = {
  getNotifications: async (req, res) => {
    try {
      const notifications = await Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 });
      res.json(notifications);
    } catch (error) {
      console.error('Notification fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }
};

module.exports = NotificationController;
