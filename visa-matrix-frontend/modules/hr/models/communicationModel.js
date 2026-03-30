import {
  applyOrganizationScope,
  createCreatePayload,
  filterByOrganization,
  getSupabaseClient,
  isAdminUser,
} from "./hrBaseModel.js";
import { cloneRecord, hrMemoryStore } from "./hrMemoryStore.js";

export const createAnnouncement = async (payload, user) => {
  const createPayload = createCreatePayload(
    "announcement",
    {
      ...payload,
      created_by: payload.created_by || user?.id || null,
    },
    user,
    "created_at",
  );

  try {
    const { data, error } = await getSupabaseClient()
      .from("announcements")
      .insert([createPayload])
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    hrMemoryStore.announcements.unshift(cloneRecord(createPayload));
    return cloneRecord(createPayload);
  }
};

export const listAnnouncements = async (user) => {
  try {
    let query = getSupabaseClient()
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    query = applyOrganizationScope(query, user);
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data ?? [];
  } catch {
    return filterByOrganization(hrMemoryStore.announcements, user).sort((left, right) =>
      `${right.created_at}`.localeCompare(`${left.created_at}`),
    );
  }
};

export const createNotifications = async (notifications, user) => {
  if (!notifications.length) {
    return [];
  }

  const payloads = notifications.map((notification) =>
    createCreatePayload(
      "notification",
      {
        ...notification,
        read_status: notification.read_status || false,
      },
      user,
      "created_at",
    ),
  );

  try {
    const { data, error } = await getSupabaseClient()
      .from("notifications")
      .insert(payloads)
      .select("*");

    if (error) {
      throw error;
    }

    return data ?? [];
  } catch {
    hrMemoryStore.notifications.unshift(...payloads.map((payload) => cloneRecord(payload)));
    return cloneRecord(payloads);
  }
};

export const listNotifications = async (filters = {}, user) => {
  const { employee_id: employeeId, read_status: readStatus } = filters;
  const scopedEmployeeId = employeeId;

  try {
    let query = getSupabaseClient()
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    query = applyOrganizationScope(query, user);

    if (scopedEmployeeId) {
      query = query.eq("employee_id", scopedEmployeeId);
    }

    if (readStatus !== undefined) {
      query = query.eq("read_status", readStatus);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data ?? [];
  } catch {
    return filterByOrganization(hrMemoryStore.notifications, user)
      .filter((notification) => {
        const matchesEmployee = !scopedEmployeeId || notification.employee_id === scopedEmployeeId;
        const matchesReadStatus =
          readStatus === undefined || notification.read_status === Boolean(readStatus);

        return matchesEmployee && matchesReadStatus;
      })
      .sort((left, right) => `${right.created_at}`.localeCompare(`${left.created_at}`));
  }
};
