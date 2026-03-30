import { dto, createSchema } from "../../shared/validation/schema.js";
import { ATTENDANCE_STATUSES, LEAVE_STATUSES } from "../../shared/constants.js";

export const attendanceQuerySchema = createSchema({
  employee_id: dto.string({ optional: true }),
  status: dto.string({ optional: true }),
  search: dto.string({ optional: true, allowEmpty: true }),
  sortBy: dto.string({ optional: true }),
  sortOrder: dto.string({ optional: true }),
  page: dto.number({ optional: true, defaultValue: 1, min: 1 }),
  pageSize: dto.number({ optional: true, defaultValue: 10, min: 1 }),
});

export const attendanceCreateSchema = createSchema({
  employee_id: dto.string(),
  date: dto.string(),
  status: dto.enumeration(ATTENDANCE_STATUSES),
  check_in: dto.string({ optional: true }),
  check_out: dto.string({ optional: true }),
  hours_worked: dto.number({ optional: true, defaultValue: 0, min: 0 }),
});

export const leaveCreateSchema = createSchema({
  employee_id: dto.string(),
  type: dto.string(),
  start_date: dto.string(),
  end_date: dto.string(),
  days: dto.number({ min: 0.5 }),
  reason: dto.string(),
  status: dto.enumeration(LEAVE_STATUSES, { optional: true, defaultValue: "pending" }),
});

