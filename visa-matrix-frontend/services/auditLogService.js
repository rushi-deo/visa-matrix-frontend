import { supabase } from "../config/supabaseClient.js";

const fallbackAuditLogs = [];

export const createAuditLog = async ({
  user_id,
  organization_id,
  action,
  module,
  entity_id = null,
  metadata = {},
}) => {
  const entry = {
    id: `AUD-${Date.now()}`,
    user_id,
    organization_id,
    action,
    module,
    entity_id,
    metadata,
    timestamp: new Date().toISOString(),
  };

  fallbackAuditLogs.unshift(entry);

  try {
    await supabase.from("audit_logs").insert({
      user_id,
      organization_id,
      action,
      module,
      entity_id,
      metadata,
    });
  } catch {
    // Fallback storage remains available for local development.
  }

  return entry;
};

export const getAuditLogs = async ({ user, filters = {} }) => {
  try {
    let query = supabase.from("audit_logs").select("*").order("timestamp", { ascending: false });

    if (user.role !== "admin") {
      query = query.eq("organization_id", user.organization_id);
    }

    if (filters.user_id) {
      query = query.eq("user_id", filters.user_id);
    }

    if (filters.module) {
      query = query.eq("module", filters.module);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return data;
  } catch {
    return fallbackAuditLogs.filter((entry) => {
      if (user.role !== "admin" && entry.organization_id !== user.organization_id) {
        return false;
      }

      if (filters.user_id && entry.user_id !== filters.user_id) {
        return false;
      }

      if (filters.module && entry.module !== filters.module) {
        return false;
      }

      return true;
    });
  }
};
