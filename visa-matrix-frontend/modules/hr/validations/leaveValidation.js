import {
  optionalDate,
  optionalEnum,
  optionalString,
  requireDate,
  requireIdentifier,
  requireString,
} from "./validationHelpers.js";

const leaveStatuses = ["pending", "approved", "rejected"];
const attendanceStatuses = ["present", "absent", "remote", "half_day", "leave"];

export const validateLeaveApprovalParams = (params) => ({
  id: requireIdentifier(params.id, "id"),
});

export const validateLeaveApplyBody = (body = {}) => ({
  employee_id: optionalString(body.employee_id, "employee_id"),
  type: requireString(body.type, "type"),
  start_date: requireDate(body.start_date, "start_date"),
  end_date: requireDate(body.end_date, "end_date"),
});

export const validateLeaveApprovalBody = (body = {}) => ({
  status: optionalEnum(body.status, "status", ["approved", "rejected"]),
});

export const validateLeaveListQuery = (query = {}) => ({
  employee_id: optionalString(query.employee_id, "employee_id"),
  type: optionalString(query.type, "type"),
  status: optionalEnum(query.status, "status", leaveStatuses),
  start_date: optionalDate(query.start_date, "start_date"),
  end_date: optionalDate(query.end_date, "end_date"),
});

export const validateAttendanceCheckInBody = (body = {}) => ({
  employee_id: optionalString(body.employee_id, "employee_id"),
  date: optionalDate(body.date, "date"),
  status: optionalEnum(body.status, "status", attendanceStatuses),
  check_in: optionalString(body.check_in, "check_in"),
});

export const validateAttendanceCheckOutBody = (body = {}) => ({
  employee_id: optionalString(body.employee_id, "employee_id"),
  date: optionalDate(body.date, "date"),
  check_out: optionalString(body.check_out, "check_out"),
});

export const validateAttendanceListQuery = (query = {}) => ({
  employee_id: optionalString(query.employee_id, "employee_id"),
  date: optionalDate(query.date, "date"),
  status: optionalEnum(query.status, "status", attendanceStatuses),
  from: optionalDate(query.from, "from"),
  to: optionalDate(query.to, "to"),
});
