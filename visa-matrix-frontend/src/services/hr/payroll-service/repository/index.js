import { getHrStore } from "../../shared/repository/hrStore.js";
import { generateId } from "../../shared/repository/hrRepositoryUtils.js";
import { applyQueryOptions } from "../../shared/repository/queryUtils.js";

const table = getHrStore();

export const payrollRepository = {
  async listPayrollLogs(query = {}) {
    return applyQueryOptions(table.payroll_logs, {
      filters: {
        employee_id: query.employee_id,
        status: query.status,
        pay_period: query.pay_period,
      },
      search: query.search,
      searchFields: ["employee_id", "status", "pay_period"],
      sortBy: query.sortBy ?? "processed_at",
      sortOrder: query.sortOrder ?? "desc",
      page: query.page,
      pageSize: query.pageSize,
    });
  },
  async createPayrollLog(payload) {
    const record = {
      id: generateId("pay"),
      processed_at: new Date().toISOString(),
      ...payload,
    };

    table.payroll_logs.unshift(record);
    return structuredClone(record);
  },
};

