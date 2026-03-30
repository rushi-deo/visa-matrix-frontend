import { listAttendance } from "../models/attendanceModel.js";
import { listLeaves } from "../models/leaveModel.js";
import { updateEmployee } from "../models/employeeModel.js";
import { calculateLeaveBalance } from "./leaveAttendanceService.js";
import { assertOrThrow } from "./hrErrorService.js";
import { resolveEmployeeForUser } from "./employeeService.js";

export const getMyProfile = async (user) => resolveEmployeeForUser(user);

export const updateMyProfile = async (payload, user) => {
  const employee = await resolveEmployeeForUser(user);
  const updatedEmployee = await updateEmployee(employee.id, payload, user);

  assertOrThrow(updatedEmployee, 404, "Employee profile not found.");
  return updatedEmployee;
};

export const getMyLeaves = async (user) => {
  const employee = await resolveEmployeeForUser(user);
  const records = await listLeaves({ employee_id: employee.id }, user);

  return {
    records,
    balance: await calculateLeaveBalance(employee.id, user),
  };
};

export const getMyAttendance = async (user) => {
  const employee = await resolveEmployeeForUser(user);
  return listAttendance({ employee_id: employee.id }, user);
};
