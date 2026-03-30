import { attendanceService } from "../services/index.js";

export const attendanceController = {
  async listAttendance(req, res) {
    const data = await attendanceService.listAttendance(req.validated.query);
    res.json({ success: true, data });
  },
  async createAttendance(req, res) {
    const data = await attendanceService.createAttendance(req.validated.body);
    res.status(201).json({ success: true, data });
  },
  async listLeaveRequests(req, res) {
    const data = await attendanceService.listLeaveRequests(req.validated.query);
    res.json({ success: true, data });
  },
  async createLeaveRequest(req, res) {
    const data = await attendanceService.createLeaveRequest(req.validated.body, req.user?.id);
    res.status(201).json({ success: true, data });
  },
  async approveLeaveRequest(req, res) {
    const data = await attendanceService.approveLeaveRequest(req.params.leaveRequestId, req.user?.id);
    res.json({ success: true, data });
  },
};

