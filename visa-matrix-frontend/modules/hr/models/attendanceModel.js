import {
  applyOrganizationScope,
  createCreatePayload,
  createUpdatePayload,
  filterByOrganization,
  getSupabaseClient,
} from "./hrBaseModel.js";
import { cloneRecord, hrMemoryStore } from "./hrMemoryStore.js";

export const createAttendance = async (payload, user) => {
  const createPayload = createCreatePayload(
    "attendance",
    {
      ...payload,
      status: payload.status || "present",
    },
    user,
    "created_at",
  );

  try {
    const { data, error } = await getSupabaseClient()
      .from("attendance")
      .insert([createPayload])
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    hrMemoryStore.attendance.unshift(cloneRecord(createPayload));
    return cloneRecord(createPayload);
  }
};

export const listAttendance = async (filters = {}, user) => {
  const { employee_id: employeeId, date, status, from, to } = filters;

  try {
    let query = getSupabaseClient()
      .from("attendance")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    query = applyOrganizationScope(query, user);

    if (employeeId) {
      query = query.eq("employee_id", employeeId);
    }

    if (date) {
      query = query.eq("date", date);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (from) {
      query = query.gte("date", from);
    }

    if (to) {
      query = query.lte("date", to);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data ?? [];
  } catch {
    return filterByOrganization(hrMemoryStore.attendance, user)
      .filter((record) => {
        const matchesEmployee = !employeeId || record.employee_id === employeeId;
        const matchesDate = !date || record.date === date;
        const matchesStatus = !status || record.status === status;
        const matchesFrom = !from || record.date >= from;
        const matchesTo = !to || record.date <= to;

        return matchesEmployee && matchesDate && matchesStatus && matchesFrom && matchesTo;
      })
      .sort((left, right) => `${right.date}`.localeCompare(`${left.date}`));
  }
};

export const getAttendanceByEmployeeAndDate = async (employeeId, date, user) => {
  try {
    let query = getSupabaseClient()
      .from("attendance")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("date", date);

    query = applyOrganizationScope(query, user);
    const { data, error } = await query.limit(1).maybeSingle();

    if (error) {
      throw error;
    }

    return data || null;
  } catch {
    return (
      filterByOrganization(hrMemoryStore.attendance, user).find(
        (record) => record.employee_id === employeeId && record.date === date,
      ) || null
    );
  }
};

export const updateAttendance = async (attendanceId, payload, user) => {
  const updatePayload = createUpdatePayload(payload);

  try {
    let query = getSupabaseClient().from("attendance").update(updatePayload).eq("id", attendanceId);
    query = applyOrganizationScope(query, user);
    const { data, error } = await query.select("*").single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    const index = hrMemoryStore.attendance.findIndex((record) => record.id === attendanceId);
    if (index === -1) {
      return null;
    }

    hrMemoryStore.attendance[index] = {
      ...hrMemoryStore.attendance[index],
      ...cloneRecord(updatePayload),
    };

    return cloneRecord(hrMemoryStore.attendance[index]);
  }
};
