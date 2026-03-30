import {
  createEmployeeProfile,
  deleteEmployeeProfile,
  getEmployeeProfile,
  listDepartmentCatalog,
  listEmployeeProfiles,
  updateEmployeeProfile,
} from "../services/employeeService.js";

export const createEmployeeHandler = async (req, res) => {
  const employee = await createEmployeeProfile(req.body, req.user);
  res.status(201).json({
    success: true,
    data: employee,
  });
};

export const listEmployeesHandler = async (req, res) => {
  const employees = await listEmployeeProfiles(req.query, req.user);
  res.status(200).json({
    success: true,
    data: employees,
    count: employees.length,
  });
};

export const getEmployeeHandler = async (req, res) => {
  const employee = await getEmployeeProfile(req.params.id, req.user);
  res.status(200).json({
    success: true,
    data: employee,
  });
};

export const updateEmployeeHandler = async (req, res) => {
  const employee = await updateEmployeeProfile(req.params.id, req.body, req.user);
  res.status(200).json({
    success: true,
    data: employee,
  });
};

export const deleteEmployeeHandler = async (req, res) => {
  const result = await deleteEmployeeProfile(req.params.id, req.user);
  res.status(200).json({
    success: true,
    data: result,
  });
};

export const listDepartmentsHandler = async (req, res) => {
  const departments = await listDepartmentCatalog(req.user);
  res.status(200).json({
    success: true,
    data: departments,
    count: departments.length,
  });
};
