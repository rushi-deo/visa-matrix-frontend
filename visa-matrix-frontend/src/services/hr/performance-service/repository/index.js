import { getHrStore } from "../../shared/repository/hrStore.js";
import { generateId } from "../../shared/repository/hrRepositoryUtils.js";
import { applyQueryOptions } from "../../shared/repository/queryUtils.js";

const table = getHrStore();

export const performanceRepository = {
  async listReviews(query = {}) {
    return applyQueryOptions(table.performance_reviews, {
      filters: {
        employee_id: query.employee_id,
        department: query.department,
        status: query.status,
      },
      search: query.search,
      searchFields: ["employee_id", "department", "cycle", "feedback"],
      sortBy: query.sortBy ?? "updated_at",
      sortOrder: query.sortOrder ?? "desc",
      page: query.page,
      pageSize: query.pageSize,
    });
  },
  async createReview(payload) {
    const record = {
      id: generateId("pr"),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...payload,
    };

    table.performance_reviews.unshift(record);
    return structuredClone(record);
  },
};

