import mongoose from "mongoose";
import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({
      success: true,
      data: notifications.map((notification) => ({
        id: notification._id,
        type: notification.type,
        message: notification.message,
        entity: notification.entity,
        createdBy: notification.createdBy,
        createdAt: notification.createdAt,
        readAt: notification.readAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      const error = new Error("Invalid notification");
      error.statusCode = 400;
      throw error;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user._id },
      { readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      const error = new Error("Notification not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: {
        id: notification._id,
        readAt: notification.readAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    next(error);
  }
};
