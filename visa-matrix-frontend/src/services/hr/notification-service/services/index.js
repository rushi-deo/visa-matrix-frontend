import { notificationRepository } from "../repository/index.js";

export const notificationService = {
  async listNotifications(query) {
    return notificationRepository.listNotifications(query);
  },
  async createNotification(payload) {
    return notificationRepository.createNotification(payload);
  },
  async markAsRead(notificationId) {
    return notificationRepository.markAsRead(notificationId);
  },
};

