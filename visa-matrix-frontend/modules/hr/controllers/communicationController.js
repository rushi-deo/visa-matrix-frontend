import {
  listEmployeeNotifications,
  listPublishedAnnouncements,
  publishAnnouncement,
} from "../services/communicationService.js";

export const createAnnouncementHandler = async (req, res) => {
  const announcement = await publishAnnouncement(req.body, req.user);
  res.status(201).json({
    success: true,
    data: announcement,
  });
};

export const listAnnouncementsHandler = async (req, res) => {
  const announcements = await listPublishedAnnouncements(req.user);
  res.status(200).json({
    success: true,
    data: announcements,
    count: announcements.length,
  });
};

export const listNotificationsHandler = async (req, res) => {
  const notifications = await listEmployeeNotifications(req.query, req.user);
  res.status(200).json({
    success: true,
    data: notifications,
    count: notifications.length,
  });
};
