import { hrCoreRepository } from "../../hr-core-service/repository/index.js";
import { createNotFoundError } from "../../shared/errors.js";
import { emitPayrollProcessed } from "../events/index.js";
import { payrollRepository } from "../repository/index.js";

const summarizeSalary = (salaryComponents = {}) => {
  const deductions = salaryComponents.deductions ?? {};
  const earningsTotal = Object.entries(salaryComponents).reduce((total, [key, value]) => {
    if (key === "deductions" || typeof value !== "number") {
      return total;
    }

    return total + value;
  }, 0);

  const deductionTotal = Object.values(deductions).reduce((total, value) => total + Number(value || 0), 0);
  return { earningsTotal, deductionTotal };
};

export const payrollService = {
  async listPayrollLogs(query) {
    return payrollRepository.listPayrollLogs(query);
  },
  async processPayroll(payload, actorId) {
    const employee = await hrCoreRepository.getEmployeeById(payload.employee_id);
    const salaryStructure = await hrCoreRepository.getSalaryStructure(payload.employee_id);

    if (!salaryStructure) {
      throw createNotFoundError("Salary structure");
    }

    const { earningsTotal, deductionTotal } = summarizeSalary(salaryStructure.salary_components);
    const taxAmount = Number((earningsTotal * payload.tax_rate).toFixed(2));
    const grossPay = Number((earningsTotal + payload.reimbursements).toFixed(2));
    const netPay = Number((grossPay - taxAmount - deductionTotal).toFixed(2));

    const payrollLog = await payrollRepository.createPayrollLog({
      employee_id: employee.id,
      pay_period: payload.pay_period,
      gross_pay: grossPay,
      tax_amount: taxAmount,
      net_pay: netPay,
      status: payload.status,
      payslip: {
        employee: {
          id: employee.id,
          name: employee.name,
          employee_code: employee.employee_code,
          job_title: employee.job_title,
        },
        earnings: Object.entries(salaryStructure.salary_components)
          .filter(([key, value]) => key !== "deductions" && typeof value === "number")
          .map(([label, value]) => ({ label, value })),
        deductions: [
          ...Object.entries(salaryStructure.salary_components.deductions ?? {}).map(([label, value]) => ({
            label,
            value,
          })),
          { label: "tax", value: taxAmount },
        ],
        summary: {
          grossPay,
          totalDeductions: Number((taxAmount + deductionTotal).toFixed(2)),
          netPay,
        },
      },
    });

    await emitPayrollProcessed({
      actorId,
      referenceId: payrollLog.id,
      organization_id: employee.organization_id ?? null,
      payrollLog,
    });

    return payrollLog;
  },
};

