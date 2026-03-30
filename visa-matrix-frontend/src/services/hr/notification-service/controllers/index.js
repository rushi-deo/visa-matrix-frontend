import { notificationService } from "../services/index.js";

export const notificationController = {
  async listNotifications(req, res) {
    const data = await notificationService.listNotifications(req.validated.query);
    res.json({ success: true, data });
  },
  async createNotification(req, res) {
    const data = await notificationService.createNotification(req.validated.body);
    res.status(201).json({ success: true, data });
  },
  async markAsRead(req, res) {
    const data = await notificationService.markAsRead(req.params.notificationId);
    res.json({ success: true, data });
  },
};

