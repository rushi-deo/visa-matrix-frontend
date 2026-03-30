import { payrollService } from "../services/index.js";

export const payrollController = {
  async listPayrollLogs(req, res) {
    const data = await payrollService.listPayrollLogs(req.validated.query);
    res.json({ success: true, data });
  },
  async processPayroll(req, res) {
    const data = await payrollService.processPayroll(req.validated.body, req.user?.id);
    res.status(201).json({ success: true, data });
  },
};

