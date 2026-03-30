import { supabase } from "../config/supabaseClient.js";

const fallbackNotifications = [];

export const createNotification = async ({
  user_id = null,
  organization_id,
  title,
  message,
  module,
  entity_id = null,
}) => {
  const notification = {
    id: `NTF-${Date.now()}`,
    user_id,
    organization_id,
    title,
    message,
    module,
    entity_id,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  fallbackNotifications.unshift(notification);

  try {
    await supabase.from("notifications").insert(notification);
  } catch {
    // Local fallback keeps notifications visible during development.
  }

  return notification;
};

export const getNotifications = async (user) => {
  try {
    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (user.role !== "admin") {
      query = query.eq("organization_id", user.organization_id);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return data;
  } catch {
    return fallbackNotifications.filter(
      (notification) =>
        user.role === "admin" || notification.organization_id === user.organization_id,
    );
  }
};
