import { createNotFoundError } from "../../shared/errors.js";
import { getHrStore } from "../../shared/repository/hrStore.js";
import {
  generateId,
  insertRecord,
  selectRecords,
  selectSingleRecord,
  updateRecord,
} from "../../shared/repository/hrRepositoryUtils.js";
import { applyQueryOptions } from "../../shared/repository/queryUtils.js";

const table = getHrStore();

export const hrCoreRepository = {
  async listEmployees(query = {}) {
    const supabaseEmployees = await selectRecords("employees", query.organization_id ? { organization_id: query.organization_id } : {});
    const source = supabaseEmployees ?? table.employees;

    return applyQueryOptions(source, {
      filters: {
        organization_id: query.organization_id,
        status: query.status,
        department: query.department,
      },
      search: query.search,
      searchFields: ["name", "email", "job_title", "employee_code", "department"],
      sortBy: query.sortBy ?? "updated_at",
      sortOrder: query.sortOrder ?? "desc",
      page: query.page,
      pageSize: query.pageSize,
    });
  },
  async createEmployee(payload) {
    const record = {
      id: generateId("emp"),
      employee_code: payload.employee_code ?? `VM-${String(table.employees.length + 1).padStart(3, "0")}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...payload,
    };

    const insertedRecord = await insertRecord("employees", record);
    if (insertedRecord) {
      return insertedRecord;
    }

    table.employees.unshift(record);
    return structuredClone(record);
  },
  async getEmployeeById(employeeId) {
    const supabaseEmployee = await selectSingleRecord("employees", { id: employeeId });
    const employee = supabaseEmployee ?? table.employees.find((item) => item.id === employeeId);

    if (!employee) {
      throw createNotFoundError("Employee");
    }

    return structuredClone(employee);
  },
  async updateEmployee(employeeId, payload) {
    const updatedRecord = await updateRecord("employees", "id", employeeId, {
      ...payload,
      updated_at: new Date().toISOString(),
    });

    if (updatedRecord) {
      return updatedRecord;
    }

    const employeeIndex = table.employees.findIndex((item) => item.id === employeeId);
    if (employeeIndex === -1) {
      throw createNotFoundError("Employee");
    }

    table.employees[employeeIndex] = {
      ...table.employees[employeeIndex],
      ...payload,
      updated_at: new Date().toISOString(),
    };

    return structuredClone(table.employees[employeeIndex]);
  },
  async getSalaryStructure(employeeId) {
    const supabaseRecord = await selectSingleRecord("employee_salary_structure", { employee_id: employeeId });
    const salaryStructure =
      supabaseRecord ?? table.employee_salary_structure.find((item) => item.employee_id === employeeId);

    return salaryStructure ? structuredClone(salaryStructure) : null;
  },
  async upsertSalaryStructure(employeeId, payload) {
    const existingRecord = table.employee_salary_structure.find((item) => item.employee_id === employeeId);
    const record = {
      id: existingRecord?.id ?? generateId("salary"),
      employee_id: employeeId,
      updated_at: new Date().toISOString(),
      ...existingRecord,
      ...payload,
    };

    const persistedRecord = existingRecord
      ? await updateRecord("employee_salary_structure", "employee_id", employeeId, record)
      : await insertRecord("employee_salary_structure", record);

    if (persistedRecord) {
      return persistedRecord;
    }

    if (existingRecord) {
      const recordIndex = table.employee_salary_structure.findIndex((item) => item.employee_id === employeeId);
      table.employee_salary_structure[recordIndex] = record;
    } else {
      table.employee_salary_structure.unshift(record);
    }

    return structuredClone(record);
  },
  async listRoles() {
    const roles = (await selectRecords("roles")) ?? table.roles;
    return structuredClone(roles);
  },
  async listPermissions() {
    const permissions = (await selectRecords("permissions")) ?? table.permissions;
    return structuredClone(permissions);
  },
};

