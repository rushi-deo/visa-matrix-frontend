import { dto, createSchema } from "../../shared/validation/schema.js";
import { PAYROLL_STATUSES } from "../../shared/constants.js";

export const payrollQuerySchema = createSchema({
  employee_id: dto.string({ optional: true }),
  status: dto.string({ optional: true }),
  pay_period: dto.string({ optional: true }),
  search: dto.string({ optional: true, allowEmpty: true }),
  sortBy: dto.string({ optional: true }),
  sortOrder: dto.string({ optional: true }),
  page: dto.number({ optional: true, defaultValue: 1, min: 1 }),
  pageSize: dto.number({ optional: true, defaultValue: 10, min: 1 }),
});

export const payrollProcessSchema = createSchema({
  employee_id: dto.string(),
  pay_period: dto.string(),
  tax_rate: dto.number({ optional: true, defaultValue: 0.12, min: 0 }),
  reimbursements: dto.number({ optional: true, defaultValue: 0, min: 0 }),
  status: dto.enumeration(PAYROLL_STATUSES, { optional: true, defaultValue: "processed" }),
});

