import {
  createEmployee,
  deleteEmployee,
  getDepartmentById,
  getEmployeeByEmail,
  getEmployeeById,
  getEmployeeByUserId,
  listDepartments,
  listEmployees,
  updateEmployee,
} from "../models/employeeModel.js";
import { assertOrThrow, createHttpError } from "./hrErrorService.js";

export const resolveEmployeeForUser = async (user) => {
  const employee = await getEmployeeByUserId(user.id, user);
  assertOrThrow(employee, 404, "Employee profile not found for the authenticated user.");
  return employee;
};

export const createEmployeeProfile = async (payload, user) => {
  const existingEmployee = await getEmployeeByEmail(payload.email, user);
  assertOrThrow(!existingEmployee, 409, "An employee with this email already exists.");

  if (payload.department_id) {
    const department = await getDepartmentById(payload.department_id, user);
    assertOrThrow(department, 400, "Invalid department_id supplied.");
  }

  return createEmployee(payload, user);
};

export const listEmployeeProfiles = async (filters, user) => listEmployees(filters, user);

export const getEmployeeProfile = async (employeeId, user) => {
  const employee = await getEmployeeById(employeeId, user);
  assertOrThrow(employee, 404, "Employee not found.");
  return employee;
};

export const updateEmployeeProfile = async (employeeId, payload, user) => {
  await getEmployeeProfile(employeeId, user);

  if (payload.email) {
    const existingEmployee = await getEmployeeByEmail(payload.email, user);
    assertOrThrow(
      !existingEmployee || existingEmployee.id === employeeId,
      409,
      "Another employee already uses this email address.",
    );
  }

  if (payload.department_id) {
    const department = await getDepartmentById(payload.department_id, user);
    assertOrThrow(department, 400, "Invalid department_id supplied.");
  }

  const employee = await updateEmployee(employeeId, payload, user);
  assertOrThrow(employee, 404, "Employee not found.");
  return employee;
};

export const deleteEmployeeProfile = async (employeeId, user) => {
  const employee = await getEmployeeProfile(employeeId, user);
  const deleted = await deleteEmployee(employee.id, user);
  assertOrThrow(deleted, 404, "Employee not found.");

  return {
    id: employee.id,
    deleted: true,
  };
};

export const listDepartmentCatalog = async (user) => listDepartments(user);
