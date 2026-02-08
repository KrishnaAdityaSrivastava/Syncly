import Notification from "../models/notification.model.js";

export const createNotification = async ({
  userId,
  type,
  message,
  entity = null,
  createdBy = null
}) => {
  if (!userId || !type || !message) {
    return null;
  }

  return Notification.create({
    userId,
    type,
    message,
    entity,
    createdBy
  });
};
