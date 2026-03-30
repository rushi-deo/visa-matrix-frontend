import { emitLeaveApplied, emitLeaveApproved } from "../events/index.js";
import { attendanceRepository } from "../repository/index.js";

export const attendanceService = {
  async listAttendance(query) {
    return attendanceRepository.listAttendance(query);
  },
  async createAttendance(payload) {
    return attendanceRepository.createAttendanceRecord(payload);
  },
  async listLeaveRequests(query) {
    return attendanceRepository.listLeaveRequests(query);
  },
  async createLeaveRequest(payload, actorId) {
    const leaveRequest = await attendanceRepository.createLeaveRequest(payload);
    await emitLeaveApplied({
      actorId,
      organization_id: payload.organization_id ?? null,
      referenceId: leaveRequest.id,
      leaveRequest,
    });
    return leaveRequest;
  },
  async approveLeaveRequest(leaveRequestId, actorId) {
    const leaveRequest = await attendanceRepository.approveLeaveRequest(leaveRequestId, actorId);
    await emitLeaveApproved({
      actorId,
      organization_id: null,
      referenceId: leaveRequest.id,
      leaveRequest,
    });
    return leaveRequest;
  },
};

