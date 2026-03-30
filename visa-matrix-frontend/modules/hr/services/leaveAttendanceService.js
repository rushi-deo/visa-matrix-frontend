import {
  createAttendance,
  getAttendanceByEmployeeAndDate,
  listAttendance,
  updateAttendance,
} from "../models/attendanceModel.js";
import { createLeave, getLeaveById, listLeaves, updateLeave } from "../models/leaveModel.js";
import { getEmployeeById } from "../models/employeeModel.js";
import { assertOrThrow } from "./hrErrorService.js";
import { resolveEmployeeForUser } from "./employeeService.js";

const MS_IN_A_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_ANNUAL_LEAVE_DAYS = 24;

const getDateOnly = (value = new Date().toISOString()) => value.slice(0, 10);

const calculateInclusiveDays = (startDate, endDate) =>
  Math.floor((new Date(endDate) - new Date(startDate)) / MS_IN_A_DAY) + 1;

const getEffectiveEmployeeId = async (requestedEmployeeId, user) => {
  if (requestedEmployeeId && user.role !== "employee") {
    const employee = await getEmployeeById(requestedEmployeeId, user);
    assertOrThrow(employee, 404, "Employee not found.");
    return employee.id;
  }

  const employee = await resolveEmployeeForUser(user);
  return employee.id;
};

export const calculateLeaveBalance = async (employeeId, user) => {
  const leaveRecords = await listLeaves(
    {
      employee_id: employeeId,
      status: "approved",
    },
    user,
  );

  const used = leaveRecords.reduce(
    (total, leaveRecord) => total + calculateInclusiveDays(leaveRecord.start_date, leaveRecord.end_date),
    0,
  );

  return {
    allocated: DEFAULT_ANNUAL_LEAVE_DAYS,
    used,
    remaining: Math.max(DEFAULT_ANNUAL_LEAVE_DAYS - used, 0),
  };
};

export const applyEmployeeLeave = async (payload, user) => {
  const employeeId = await getEffectiveEmployeeId(payload.employee_id, user);

  assertOrThrow(
    new Date(payload.start_date) <= new Date(payload.end_date),
    400,
    "start_date must be less than or equal to end_date.",
  );

  const leaveRecord = await createLeave(
    {
      employee_id: employeeId,
      type: payload.type,
      start_date: payload.start_date,
      end_date: payload.end_date,
      status: "pending",
      approved_by: null,
      approved_role: null,
      approved_at: null,
    },
    user,
  );

  return {
    ...leaveRecord,
    balance: await calculateLeaveBalance(employeeId, user),
  };
};

export const approveEmployeeLeave = async (leaveId, payload, user) => {
  const leaveRecord = await getLeaveById(leaveId, user);
  assertOrThrow(leaveRecord, 404, "Leave request not found.");
  assertOrThrow(leaveRecord.status === "pending", 409, "Only pending leave requests can be updated.");

  const status = payload.status || "approved";
  assertOrThrow(["approved", "rejected"].includes(status), 400, "Invalid leave status supplied.");

  const updatedLeave = await updateLeave(
    leaveId,
    {
      status,
      approved_by: user.id,
      approved_role: user.role,
      approved_at: new Date().toISOString(),
    },
    user,
  );

  assertOrThrow(updatedLeave, 404, "Leave request not found.");

  return {
    ...updatedLeave,
    balance: await calculateLeaveBalance(updatedLeave.employee_id, user),
  };
};

export const listEmployeeLeaves = async (filters, user) => {
  const scopedFilters =
    user.role === "employee"
      ? {
          ...filters,
          employee_id: await getEffectiveEmployeeId(filters.employee_id, user),
        }
      : filters;

  const leaveRecords = await listLeaves(scopedFilters, user);

  if (!scopedFilters.employee_id) {
    return {
      records: leaveRecords,
      balance: null,
    };
  }

  return {
    records: leaveRecords,
    balance: await calculateLeaveBalance(scopedFilters.employee_id, user),
  };
};

export const checkInAttendance = async (payload, user) => {
  const employeeId = await getEffectiveEmployeeId(payload.employee_id, user);
  const date = payload.date || getDateOnly();
  const existingAttendance = await getAttendanceByEmployeeAndDate(employeeId, date, user);

  assertOrThrow(!existingAttendance, 409, "Attendance is already marked for this employee and date.");

  return createAttendance(
    {
      employee_id: employeeId,
      date,
      status: payload.status || "present",
      check_in: payload.check_in || new Date().toISOString(),
      check_out: null,
    },
    user,
  );
};

export const checkOutAttendance = async (payload, user) => {
  const employeeId = await getEffectiveEmployeeId(payload.employee_id, user);
  const date = payload.date || getDateOnly();
  const attendanceRecord = await getAttendanceByEmployeeAndDate(employeeId, date, user);

  assertOrThrow(attendanceRecord, 404, "No attendance record exists for the supplied employee and date.");
  assertOrThrow(!attendanceRecord.check_out, 409, "Attendance is already checked out for this date.");

  const updatedAttendance = await updateAttendance(
    attendanceRecord.id,
    {
      check_out: payload.check_out || new Date().toISOString(),
    },
    user,
  );

  assertOrThrow(updatedAttendance, 404, "Attendance record not found.");
  return updatedAttendance;
};

export const listEmployeeAttendance = async (filters, user) => {
  const scopedFilters =
    user.role === "employee"
      ? {
          ...filters,
          employee_id: await getEffectiveEmployeeId(filters.employee_id, user),
        }
      : filters;

  return listAttendance(scopedFilters, user);
};
