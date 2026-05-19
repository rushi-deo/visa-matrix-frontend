import apiClient, { extractResponseData } from "../../../services/apiClient";
import { createHrMockState } from "../data/mockHrData";

let mockState = createHrMockState();

const withFallback = async (request, fallback) => {
  try {
    return await request();
  } catch {
    return fallback();
  }
};

const wrapCollection = (items) => ({
  items,
  total: items.length,
  page: 1,
  pageSize: items.length || 10,
  totalPages: 1,
});

export const hrWorkspaceApi = {
  async getDashboard() {
    return withFallback(
      async () => extractResponseData(await apiClient.get("/v1/hr/dashboard")),
      async () => structuredClone(mockState.dashboard),
    );
  },
  async getEmployees(params = {}) {
    return withFallback(
      async () => extractResponseData(await apiClient.get("/v1/hr/employees", { params })),
      async () => {
        const search = String(params.search ?? "").toLowerCase();
        const department = String(params.department ?? "All");
        const status = String(params.status ?? "All").toLowerCase();
        const filtered = mockState.employees.filter((employee) =>
          (!search ||
          [employee.name, employee.email, employee.department, employee.job_title, employee.role_template]
            .join(" ")
            .toLowerCase()
            .includes(search)) &&
          (department === "All" || employee.department === department) &&
          (status === "all" || employee.status === status),
        );

        return wrapCollection(structuredClone(filtered));
      },
    );
  },
  async createEmployee(payload) {
    return withFallback(
      async () => extractResponseData(await apiClient.post("/v1/hr/employees", payload)),
      async () => {
        const record = {
          id: `emp-${Date.now()}`,
          employee_code: payload.employeeCode,
          name: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          date_of_joining: payload.dateOfJoining,
          department: payload.department,
          designation: payload.designation,
          job_title: payload.designation,
          location: payload.branch,
          reporting_manager: payload.manager,
          team_lead: payload.teamLead,
          branch: payload.branch,
          role_template: payload.roleTemplate,
          status: payload.status,
          attrition_risk: "low",
        };

        mockState.employees = [record, ...mockState.employees];
        mockState.dashboard.metrics.totalEmployees += 1;
        if (record.status === "active") {
          mockState.dashboard.metrics.activeEmployees += 1;
        }
        mockState.auditLogs = [
          {
            id: `hr-audit-${Date.now()}`,
            actor: "HR Workspace",
            event: "Employee created",
            target: record.name,
            created_at: new Date().toISOString(),
          },
          ...mockState.auditLogs,
        ];

        return structuredClone(record);
      },
    );
  },
  async getRoleTemplates() {
    return withFallback(
      async () => extractResponseData(await apiClient.get("/v1/hr/role-templates")),
      async () => wrapCollection(structuredClone(mockState.roleTemplates)),
    );
  },
  async updateRoleTemplatePermissions(roleName, permissions) {
    return withFallback(
      async () => extractResponseData(await apiClient.put(`/v1/hr/role-templates/${roleName}/permissions`, { permissions })),
      async () => {
        mockState.roleTemplates = mockState.roleTemplates.map((roleTemplate) =>
          roleTemplate.name === roleName ? { ...roleTemplate, permissions } : roleTemplate,
        );
        return structuredClone(mockState.roleTemplates.find((roleTemplate) => roleTemplate.name === roleName));
      },
    );
  },
  async getDepartments() {
    return withFallback(
      async () => extractResponseData(await apiClient.get("/v1/hr/departments")),
      async () => wrapCollection(structuredClone(mockState.departments)),
    );
  },
  async getAuditLogs() {
    return withFallback(
      async () => extractResponseData(await apiClient.get("/v1/hr/audit-logs")),
      async () => wrapCollection(structuredClone(mockState.auditLogs)),
    );
  },
  async getEmployeeProfile(employeeId) {
    return withFallback(
      async () => extractResponseData(await apiClient.get(`/v1/hr/employees/${employeeId}/profile`)),
      async () => {
        const fallbackProfile =
          mockState.employeeProfiles[employeeId] ??
          (() => {
            const employee = mockState.employees.find((item) => item.id === employeeId) ?? mockState.employees[0];
            return {
              employee,
              salary: {
                currency: "INR",
                tax_regime: "new",
                salary_components: {
                  basic: 50000,
                  hra: 20000,
                  special_allowance: 10000,
                  deductions: { pf: 1800, insurance: 600 },
                },
              },
              attendance: [{ id: `att-${employee.id}`, date: "2026-03-24", status: "present", hours_worked: 8.8 }],
              leaveHistory: [],
              performance: [],
              payroll: [],
            };
          })();

        return structuredClone(fallbackProfile);
      },
    );
  },
  async getPayrollLogs() {
    return withFallback(
      async () => extractResponseData(await apiClient.get("/v1/hr/payroll/logs")),
      async () => wrapCollection(structuredClone(mockState.payrollLogs)),
    );
  },
  async processPayroll(payload) {
    return withFallback(
      async () => extractResponseData(await apiClient.post("/v1/hr/payroll/process", payload)),
      async () => {
        const record = {
          id: `pay-${Date.now()}`,
          employee_id: payload.employee_id,
          pay_period: payload.pay_period,
          gross_pay: 82500,
          tax_amount: 8250,
          net_pay: 74250,
          status: "processed",
          processed_at: new Date().toISOString(),
        };
        mockState.payrollLogs = [record, ...mockState.payrollLogs];
        return structuredClone(record);
      },
    );
  },
  async getWorkflowDefinitions() {
    return withFallback(
      async () => extractResponseData(await apiClient.get("/v1/hr/workflows/definitions")),
      async () => wrapCollection(structuredClone(mockState.workflowDefinitions)),
    );
  },
  async createWorkflowDefinition(payload) {
    return withFallback(
      async () => extractResponseData(await apiClient.post("/v1/hr/workflows/definitions", payload)),
      async () => {
        const definition = { id: `wf-${Date.now()}`, ...payload };
        mockState.workflowDefinitions = [definition, ...mockState.workflowDefinitions];
        return structuredClone(definition);
      },
    );
  },
  async getWorkflowInstances() {
    return withFallback(
      async () => extractResponseData(await apiClient.get("/v1/hr/workflows/instances")),
      async () => wrapCollection(structuredClone(mockState.workflowInstances)),
    );
  },
  async getCandidates() {
    return withFallback(
      async () => extractResponseData(await apiClient.get("/v1/hr/recruitment/candidates")),
      async () => wrapCollection(structuredClone(mockState.candidates)),
    );
  },
  async moveCandidateStage(candidateId, toStage) {
    return withFallback(
      async () => extractResponseData(await apiClient.post(`/v1/hr/recruitment/candidates/${candidateId}/stage`, { toStage })),
      async () => {
        mockState.candidates = mockState.candidates.map((candidate) =>
          candidate.id === candidateId ? { ...candidate, stage: toStage } : candidate,
        );
        return structuredClone(mockState.candidates.find((candidate) => candidate.id === candidateId));
      },
    );
  },
  async getPerformanceDashboard() {
    return withFallback(
      async () => extractResponseData(await apiClient.get("/v1/hr/performance/dashboard")),
      async () => structuredClone(mockState.performanceDashboard),
    );
  },
  async getPerformanceReviews() {
    return withFallback(
      async () => extractResponseData(await apiClient.get("/v1/hr/performance/reviews")),
      async () => wrapCollection(structuredClone(mockState.performanceReviews)),
    );
  },
  async getNotifications() {
    return withFallback(
      async () => extractResponseData(await apiClient.get("/v1/hr/notifications")),
      async () => wrapCollection(structuredClone(mockState.notifications)),
    );
  },
  async getAiInsights() {
    return withFallback(
      async () => extractResponseData(await apiClient.get("/v1/hr/ai/insights")),
      async () => structuredClone(mockState.aiInsights),
    );
  },
  resetMockState() {
    mockState = createHrMockState();
  },
};
