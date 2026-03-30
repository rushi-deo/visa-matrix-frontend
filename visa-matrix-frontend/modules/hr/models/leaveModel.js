import {
  applyOrganizationScope,
  createCreatePayload,
  createUpdatePayload,
  filterByOrganization,
  getSupabaseClient,
} from "./hrBaseModel.js";
import { cloneRecord, hrMemoryStore } from "./hrMemoryStore.js";

export const createLeave = async (payload, user) => {
  const createPayload = createCreatePayload(
    "leave",
    {
      ...payload,
      status: payload.status || "pending",
    },
    user,
    "created_at",
  );

  try {
    const { data, error } = await getSupabaseClient()
      .from("leaves")
      .insert([createPayload])
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    hrMemoryStore.leaves.unshift(cloneRecord(createPayload));
    return cloneRecord(createPayload);
  }
};

export const listLeaves = async (filters = {}, user) => {
  const { employee_id: employeeId, status, type, start_date: startDate, end_date: endDate } = filters;

  try {
    let query = getSupabaseClient().from("leaves").select("*").order("created_at", { ascending: false });
    query = applyOrganizationScope(query, user);

    if (employeeId) {
      query = query.eq("employee_id", employeeId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (type) {
      query = query.eq("type", type);
    }

    if (startDate) {
      query = query.gte("start_date", startDate);
    }

    if (endDate) {
      query = query.lte("end_date", endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data ?? [];
  } catch {
    return filterByOrganization(hrMemoryStore.leaves, user)
      .filter((leaveRecord) => {
        const matchesEmployee = !employeeId || leaveRecord.employee_id === employeeId;
        const matchesStatus = !status || leaveRecord.status === status;
        const matchesType = !type || leaveRecord.type === type;
        const matchesStart = !startDate || leaveRecord.start_date >= startDate;
        const matchesEnd = !endDate || leaveRecord.end_date <= endDate;

        return matchesEmployee && matchesStatus && matchesType && matchesStart && matchesEnd;
      })
      .sort((left, right) => `${right.created_at}`.localeCompare(`${left.created_at}`));
  }
};

export const getLeaveById = async (leaveId, user) => {
  try {
    let query = getSupabaseClient().from("leaves").select("*").eq("id", leaveId);
    query = applyOrganizationScope(query, user);
    const { data, error } = await query.single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    return (
      filterByOrganization(hrMemoryStore.leaves, user).find((record) => record.id === leaveId) || null
    );
  }
};

export const updateLeave = async (leaveId, payload, user) => {
  const updatePayload = createUpdatePayload(payload);

  try {
    let query = getSupabaseClient().from("leaves").update(updatePayload).eq("id", leaveId);
    query = applyOrganizationScope(query, user);
    const { data, error } = await query.select("*").single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    const index = hrMemoryStore.leaves.findIndex((record) => record.id === leaveId);
    if (index === -1) {
      return null;
    }

    hrMemoryStore.leaves[index] = {
      ...hrMemoryStore.leaves[index],
      ...cloneRecord(updatePayload),
    };

    return cloneRecord(hrMemoryStore.leaves[index]);
  }
};
