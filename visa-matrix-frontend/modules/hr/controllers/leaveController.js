import {
  applyEmployeeLeave,
  approveEmployeeLeave,
  checkInAttendance,
  checkOutAttendance,
  listEmployeeAttendance,
  listEmployeeLeaves,
} from "../services/leaveAttendanceService.js";

export const applyLeaveHandler = async (req, res) => {
  const leaveRecord = await applyEmployeeLeave(req.body, req.user);
  res.status(201).json({
    success: true,
    data: leaveRecord,
  });
};

export const approveLeaveHandler = async (req, res) => {
  const leaveRecord = await approveEmployeeLeave(req.params.id, req.body, req.user);
  res.status(200).json({
    success: true,
    data: leaveRecord,
  });
};

export const listLeavesHandler = async (req, res) => {
  const result = await listEmployeeLeaves(req.query, req.user);
  res.status(200).json({
    success: true,
    data: result.records,
    balance: result.balance,
    count: result.records.length,
  });
};

export const checkInAttendanceHandler = async (req, res) => {
  const attendance = await checkInAttendance(req.body, req.user);
  res.status(201).json({
    success: true,
    data: attendance,
  });
};

export const checkOutAttendanceHandler = async (req, res) => {
  const attendance = await checkOutAttendance(req.body, req.user);
  res.status(200).json({
    success: true,
    data: attendance,
  });
};

export const listAttendanceHandler = async (req, res) => {
  const attendance = await listEmployeeAttendance(req.query, req.user);
  res.status(200).json({
    success: true,
    data: attendance,
    count: attendance.length,
  });
};
