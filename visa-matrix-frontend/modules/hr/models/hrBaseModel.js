import { supabase } from "../../../config/supabaseClient.js";
import { cloneRecord, createHrId } from "./hrMemoryStore.js";

export const getSupabaseClient = () => supabase;

export const isAdminUser = (user) => user?.role === "admin";

export const applyOrganizationScope = (query, user) => {
  if (!isAdminUser(user) && user?.organization_id) {
    return query.eq("organization_id", user.organization_id);
  }

  return query;
};

export const filterByOrganization = (records, user) => {
  if (isAdminUser(user) || !user?.organization_id) {
    return cloneRecord(records);
  }

  return cloneRecord(
    records.filter(
      (record) => !record.organization_id || record.organization_id === user.organization_id,
    ),
  );
};

export const createCreatePayload = (prefix, payload, user, timestampField = "created_at") => {
  const timestamp = new Date().toISOString();

  return {
    id: payload.id || createHrId(prefix),
    ...payload,
    organization_id: payload.organization_id || user?.organization_id || null,
    [timestampField]: payload[timestampField] || timestamp,
    updated_at: payload.updated_at || timestamp,
  };
};

export const createUpdatePayload = (payload) => ({
  ...payload,
  updated_at: new Date().toISOString(),
});
