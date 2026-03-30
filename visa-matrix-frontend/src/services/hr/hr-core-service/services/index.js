import { getHrStore } from "../../shared/repository/hrStore.js";
import { emitEmployeeCreated } from "../events/index.js";
import { hrCoreRepository } from "../repository/index.js";

const table = getHrStore();

const calculatePayrollCost = () =>
  table.payroll_logs.reduce((totalCost, payrollLog) => totalCost + (payrollLog.net_pay ?? 0), 0);

const calculateLeaveTrends = () => ({
  pending: table.leave_requests.filter((leaveRequest) => leaveRequest.status === "pending").length,
  approved: table.leave_requests.filter((leaveRequest) => leaveRequest.status === "approved").length,
  rejected: table.leave_requests.filter((leaveRequest) => leaveRequest.status === "rejected").length,
});

const calculateHiringFunnel = () =>
  table.candidates.reduce((result, candidate) => {
    result[candidate.stage] = (result[candidate.stage] ?? 0) + 1;
    return result;
  }, {});

const calculateAttritionRate = () => {
  const highRiskEmployees = table.employees.filter((employee) => employee.attrition_risk === "high").length;
  return Number(((highRiskEmployees / Math.max(1, table.employees.length)) * 100).toFixed(1));
};

export const hrCoreService = {
  async listEmployees(query) {
    return hrCoreRepository.listEmployees(query);
  },
  async createEmployee(payload, actorId) {
    const employee = await hrCoreRepository.createEmployee(payload);
    await emitEmployeeCreated({
      actorId,
      organization_id: payload.organization_id ?? null,
      employee,
    });

    return employee;
  },
  async getEmployee(employeeId) {
    return hrCoreRepository.getEmployeeById(employeeId);
  },
  async updateEmployee(employeeId, payload) {
    return hrCoreRepository.updateEmployee(employeeId, payload);
  },
  async getEmployeeProfile(employeeId) {
    const employee = await hrCoreRepository.getEmployeeById(employeeId);
    const salary = await hrCoreRepository.getSalaryStructure(employeeId);
    const attendance = table.attendance_records.filter((record) => record.employee_id === employeeId).slice(0, 10);
    const leaveHistory = table.leave_requests.filter((record) => record.employee_id === employeeId).slice(0, 10);
    const performance = table.performance_reviews.filter((record) => record.employee_id === employeeId).slice(0, 5);
    const payroll = table.payroll_logs.filter((record) => record.employee_id === employeeId).slice(0, 6);

    return {
      employee,
      salary,
      attendance,
      leaveHistory,
      performance,
      payroll,
    };
  },
  async getMeta() {
    const [roles, permissions] = await Promise.all([
      hrCoreRepository.listRoles(),
      hrCoreRepository.listPermissions(),
    ]);

    return { roles, permissions };
  },
  async getSalaryStructure(employeeId) {
    return hrCoreRepository.getSalaryStructure(employeeId);
  },
  async updateSalaryStructure(employeeId, payload) {
    return hrCoreRepository.upsertSalaryStructure(employeeId, payload);
  },
  async getDashboard() {
    const departmentPerformance = table.performance_reviews.reduce((result, review) => {
      const currentScore = result[review.department] ?? { total: 0, count: 0 };
      currentScore.total += review.rating;
      currentScore.count += 1;
      result[review.department] = currentScore;
      return result;
    }, {});

    return {
      metrics: {
        totalEmployees: table.employees.length,
        activeEmployees: table.employees.filter((employee) => employee.status === "active").length,
        openPositions: table.candidates.filter((candidate) => candidate.stage !== "hired").length,
        payrollCost: calculatePayrollCost(),
        attritionRate: calculateAttritionRate(),
      },
      analytics: {
        hiringFunnel: calculateHiringFunnel(),
        leaveTrends: calculateLeaveTrends(),
        departmentPerformance: Object.entries(departmentPerformance).map(([department, value]) => ({
          department,
          score: Number((value.total / Math.max(1, value.count)).toFixed(1)),
        })),
      },
      highlights: {
        approvalsPending: table.workflow_instances.filter((workflow) => workflow.status === "pending").length,
        unreadNotifications: table.notifications.filter((notification) => !notification.read_status).length,
      },
    };
  },
};

