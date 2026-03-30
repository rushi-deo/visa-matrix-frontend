import {
  applyOrganizationScope,
  createCreatePayload,
  filterByOrganization,
  getSupabaseClient,
} from "./hrBaseModel.js";
import { cloneRecord, hrMemoryStore } from "./hrMemoryStore.js";

export const createDocument = async (payload, user) => {
  const createPayload = createCreatePayload(
    "document",
    {
      ...payload,
      uploaded_at: payload.uploaded_at || new Date().toISOString(),
    },
    user,
    "uploaded_at",
  );

  delete createPayload.updated_at;

  try {
    const { data, error } = await getSupabaseClient()
      .from("documents")
      .insert([createPayload])
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    hrMemoryStore.documents.unshift(cloneRecord(createPayload));
    return cloneRecord(createPayload);
  }
};

export const listDocumentsByEmployee = async (employeeId, user) => {
  try {
    let query = getSupabaseClient()
      .from("documents")
      .select("*")
      .eq("employee_id", employeeId)
      .order("uploaded_at", { ascending: false });

    query = applyOrganizationScope(query, user);
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data ?? [];
  } catch {
    return filterByOrganization(hrMemoryStore.documents, user)
      .filter((record) => record.employee_id === employeeId)
      .sort((left, right) => `${right.uploaded_at}`.localeCompare(`${left.uploaded_at}`));
  }
};
