import Notification from "../models/Notification.js";
import mongoose from "mongoose";

/* GET NOTIFICATIONS FOR USER */
export const getNotifications = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.unreadOnly === "true") {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate("lead", "businessName _id")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

/* GET UNREAD NOTIFICATIONS COUNT */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Error fetching unread count" });
  }
};

/* MARK NOTIFICATION AS READ */
export const markAsRead = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Error updating notification" });
  }
};

/* DELETE NOTIFICATION */
export const deleteNotification = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await notification.deleteOne();
    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Error deleting notification" });
  }
};

/* CREATE NOTIFICATION (Internal function) */
export const createNotification = async (userId, leadId, type, title, message, actionUrl) => {
  const notification = new Notification({
    user: userId,
    lead: leadId,
    type,
    title,
    message,
    actionUrl,
  });
  await notification.save();
  return notification;
};
