import { createNotFoundError } from "../../shared/errors.js";
import { getHrStore } from "../../shared/repository/hrStore.js";
import { generateId } from "../../shared/repository/hrRepositoryUtils.js";
import { applyQueryOptions } from "../../shared/repository/queryUtils.js";

const table = getHrStore();

export const attendanceRepository = {
  async listAttendance(query = {}) {
    return applyQueryOptions(table.attendance_records, {
      filters: {
        employee_id: query.employee_id,
        status: query.status,
      },
      search: query.search,
      searchFields: ["employee_id", "status", "date"],
      sortBy: query.sortBy ?? "date",
      sortOrder: query.sortOrder ?? "desc",
      page: query.page,
      pageSize: query.pageSize,
    });
  },
  async createAttendanceRecord(payload) {
    const record = {
      id: generateId("att"),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...payload,
    };

    table.attendance_records.unshift(record);
    return structuredClone(record);
  },
  async listLeaveRequests(query = {}) {
    return applyQueryOptions(table.leave_requests, {
      filters: {
        employee_id: query.employee_id,
        status: query.status,
      },
      search: query.search,
      searchFields: ["type", "reason", "employee_id"],
      sortBy: query.sortBy ?? "created_at",
      sortOrder: query.sortOrder ?? "desc",
      page: query.page,
      pageSize: query.pageSize,
    });
  },
  async createLeaveRequest(payload) {
    const record = {
      id: generateId("leave"),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...payload,
    };

    table.leave_requests.unshift(record);
    return structuredClone(record);
  },
  async approveLeaveRequest(leaveRequestId, approvedBy) {
    const leaveRequestIndex = table.leave_requests.findIndex((item) => item.id === leaveRequestId);
    if (leaveRequestIndex === -1) {
      throw createNotFoundError("Leave request");
    }

    table.leave_requests[leaveRequestIndex] = {
      ...table.leave_requests[leaveRequestIndex],
      status: "approved",
      approved_by: approvedBy,
      updated_at: new Date().toISOString(),
    };

    return structuredClone(table.leave_requests[leaveRequestIndex]);
  },
};

