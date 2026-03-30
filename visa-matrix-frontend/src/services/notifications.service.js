import apiClient, { extractResponseData } from "./apiClient";

const normalizeNotification = (notification = {}) => ({
  ...notification,
  is_read: notification.is_read ?? notification.read_status ?? false,
});

export async function fetchNotifications() {
  try {
    const response = await apiClient.get("/notifications");
    const notifications = extractResponseData(response);

    return Array.isArray(notifications)
      ? notifications.map(normalizeNotification)
      : [];
  } catch {
    return [];
  }
}
