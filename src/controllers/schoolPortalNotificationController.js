const { InAppNotification } = require("../models");

exports.listSchoolPortalNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await InAppNotification.count({
      where: { user_id: userId, is_read: false },
    });
    const notifications = await InAppNotification.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      limit: 50,
    });
    return res.json({
      success: true,
      data: {
        unread_count: unreadCount,
        notifications,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markSchoolPortalNotificationRead = async (req, res) => {
  try {
    const row = await InAppNotification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!row) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    await row.update({ is_read: true, read_at: new Date() });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllSchoolPortalNotificationsRead = async (req, res) => {
  try {
    const [n] = await InAppNotification.update(
      { is_read: true, read_at: new Date() },
      { where: { user_id: req.user.id, is_read: false } }
    );
    return res.json({ success: true, data: { updated: n } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
