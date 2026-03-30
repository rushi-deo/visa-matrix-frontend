import { createNotFoundError } from "../../shared/errors.js";
import { getHrStore } from "../../shared/repository/hrStore.js";
import { generateId } from "../../shared/repository/hrRepositoryUtils.js";
import { applyQueryOptions } from "../../shared/repository/queryUtils.js";

const table = getHrStore();

export const notificationRepository = {
  async listNotifications(query = {}) {
    return applyQueryOptions(table.notifications, {
      filters: {
        user_id: query.user_id,
        type: query.type,
      },
      search: query.search,
      searchFields: ["message", "type", "user_id"],
      sortBy: query.sortBy ?? "created_at",
      sortOrder: query.sortOrder ?? "desc",
      page: query.page,
      pageSize: query.pageSize,
    });
  },
  async createNotification(payload) {
    const record = {
      id: generateId("hrn"),
      read_status: false,
      created_at: new Date().toISOString(),
      ...payload,
    };

    table.notifications.unshift(record);
    return structuredClone(record);
  },
  async markAsRead(notificationId) {
    const notificationIndex = table.notifications.findIndex((item) => item.id === notificationId);
    if (notificationIndex === -1) {
      throw createNotFoundError("Notification");
    }

    table.notifications[notificationIndex] = {
      ...table.notifications[notificationIndex],
      read_status: true,
    };

    return structuredClone(table.notifications[notificationIndex]);
  },
};

