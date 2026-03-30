import { dto, createSchema } from "../../shared/validation/schema.js";
import { PERFORMANCE_STATUSES } from "../../shared/constants.js";

export const performanceQuerySchema = createSchema({
  employee_id: dto.string({ optional: true }),
  department: dto.string({ optional: true }),
  status: dto.string({ optional: true }),
  search: dto.string({ optional: true, allowEmpty: true }),
  sortBy: dto.string({ optional: true }),
  sortOrder: dto.string({ optional: true }),
  page: dto.number({ optional: true, defaultValue: 1, min: 1 }),
  pageSize: dto.number({ optional: true, defaultValue: 10, min: 1 }),
});

export const performanceCreateSchema = createSchema({
  employee_id: dto.string(),
  cycle: dto.string(),
  rating: dto.number({ min: 0 }),
  goals_completed: dto.number({ min: 0 }),
  department: dto.string(),
  feedback: dto.string(),
  status: dto.enumeration(PERFORMANCE_STATUSES, { optional: true, defaultValue: "draft" }),
});

