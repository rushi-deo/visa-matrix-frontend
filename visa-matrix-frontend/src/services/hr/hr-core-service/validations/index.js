import { dto, createSchema } from "../../shared/validation/schema.js";
import { EMPLOYEE_STATUSES } from "../../shared/constants.js";

export const employeeQuerySchema = createSchema({
  organization_id: dto.string({ optional: true }),
  status: dto.string({ optional: true }),
  department: dto.string({ optional: true }),
  search: dto.string({ optional: true, allowEmpty: true }),
  sortBy: dto.string({ optional: true }),
  sortOrder: dto.string({ optional: true }),
  page: dto.number({ optional: true, defaultValue: 1, min: 1 }),
  pageSize: dto.number({ optional: true, defaultValue: 10, min: 1 }),
});

export const employeeCreateSchema = createSchema({
  organization_id: dto.string({ optional: true }),
  user_id: dto.string({ optional: true }),
  employee_code: dto.string({ optional: true }),
  name: dto.string(),
  email: dto.string(),
  department: dto.string(),
  department_id: dto.string({ optional: true }),
  job_title: dto.string(),
  employment_type: dto.string(),
  location: dto.string(),
  manager_id: dto.string({ optional: true }),
  status: dto.enumeration(EMPLOYEE_STATUSES, { optional: true, defaultValue: "onboarding" }),
  joining_date: dto.string({ optional: true }),
});

export const employeeUpdateSchema = createSchema({
  name: dto.string({ optional: true }),
  email: dto.string({ optional: true }),
  department: dto.string({ optional: true }),
  department_id: dto.string({ optional: true }),
  job_title: dto.string({ optional: true }),
  employment_type: dto.string({ optional: true }),
  location: dto.string({ optional: true }),
  manager_id: dto.string({ optional: true }),
  status: dto.enumeration(EMPLOYEE_STATUSES, { optional: true }),
});

export const salaryStructureSchema = createSchema({
  currency: dto.string(),
  tax_regime: dto.string(),
  salary_components: dto.json(),
  effective_from: dto.string({ optional: true }),
});

