import { getHrStore } from "../../shared/repository/hrStore.js";

const table = getHrStore();

export const aiRepository = {
  async getContext() {
    return structuredClone({
      employees: table.employees,
      candidates: table.candidates,
      leave_requests: table.leave_requests,
      payroll_logs: table.payroll_logs,
      performance_reviews: table.performance_reviews,
    });
  },
};

