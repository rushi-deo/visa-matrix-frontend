import {
  optionalDate,
  optionalEmail,
  optionalEnum,
  optionalString,
  requireEmail,
  requireIdentifier,
  requireString,
} from "./validationHelpers.js";

const employeeStatuses = ["onboarding", "active", "exit"];

export const validateEmployeeParams = (params) => ({
  id: requireIdentifier(params.id, "id"),
});

export const validateCreateEmployeeBody = (body = {}) => ({
  name: requireString(body.name, "name"),
  email: requireEmail(body.email, "email"),
  phone: optionalString(body.phone, "phone"),
  role: optionalString(body.role, "role"),
  user_id: optionalString(body.user_id, "user_id"),
  department_id: optionalString(body.department_id, "department_id"),
  status: optionalEnum(body.status, "status", employeeStatuses),
  joining_date: optionalDate(body.joining_date, "joining_date"),
  exit_date: optionalDate(body.exit_date, "exit_date"),
  organization_id: optionalString(body.organization_id, "organization_id"),
});

export const validateListEmployeesQuery = (query = {}) => ({
  search: optionalString(query.search, "search"),
  department: optionalString(query.department, "department"),
  status: optionalEnum(query.status, "status", employeeStatuses),
});

export const validateUpdateEmployeeBody = (body = {}) => ({
  name: optionalString(body.name, "name"),
  email: optionalEmail(body.email, "email"),
  phone: optionalString(body.phone, "phone"),
  role: optionalString(body.role, "role"),
  user_id: optionalString(body.user_id, "user_id"),
  department_id: optionalString(body.department_id, "department_id"),
  status: optionalEnum(body.status, "status", employeeStatuses),
  joining_date: optionalDate(body.joining_date, "joining_date"),
  exit_date: optionalDate(body.exit_date, "exit_date"),
  organization_id: optionalString(body.organization_id, "organization_id"),
});
