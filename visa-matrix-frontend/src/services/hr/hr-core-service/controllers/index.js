import { hrCoreService } from "../services/index.js";

export const hrCoreController = {
  async getDashboard(req, res) {
    const data = await hrCoreService.getDashboard();
    res.json({ success: true, data });
  },
  async listEmployees(req, res) {
    const data = await hrCoreService.listEmployees(req.validated.query);
    res.json({ success: true, data });
  },
  async createEmployee(req, res) {
    const data = await hrCoreService.createEmployee(req.validated.body, req.user?.id);
    res.status(201).json({ success: true, data });
  },
  async getEmployee(req, res) {
    const data = await hrCoreService.getEmployee(req.params.employeeId);
    res.json({ success: true, data });
  },
  async updateEmployee(req, res) {
    const data = await hrCoreService.updateEmployee(req.params.employeeId, req.validated.body);
    res.json({ success: true, data });
  },
  async getEmployeeProfile(req, res) {
    const data = await hrCoreService.getEmployeeProfile(req.params.employeeId);
    res.json({ success: true, data });
  },
  async getMeta(req, res) {
    const data = await hrCoreService.getMeta();
    res.json({ success: true, data });
  },
  async getSalaryStructure(req, res) {
    const data = await hrCoreService.getSalaryStructure(req.params.employeeId);
    res.json({ success: true, data });
  },
  async updateSalaryStructure(req, res) {
    const data = await hrCoreService.updateSalaryStructure(req.params.employeeId, req.validated.body);
    res.json({ success: true, data });
  },
};

