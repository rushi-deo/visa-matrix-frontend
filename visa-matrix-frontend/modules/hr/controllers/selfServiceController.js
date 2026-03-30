import {
  getMyAttendance,
  getMyLeaves,
  getMyProfile,
  updateMyProfile,
} from "../services/selfServiceService.js";

export const getMeHandler = async (req, res) => {
  const profile = await getMyProfile(req.user);
  res.status(200).json({
    success: true,
    data: profile,
  });
};

export const updateMeHandler = async (req, res) => {
  const profile = await updateMyProfile(req.body, req.user);
  res.status(200).json({
    success: true,
    data: profile,
  });
};

export const getMyLeavesHandler = async (req, res) => {
  const result = await getMyLeaves(req.user);
  res.status(200).json({
    success: true,
    data: result.records,
    balance: result.balance,
    count: result.records.length,
  });
};

export const getMyAttendanceHandler = async (req, res) => {
  const attendance = await getMyAttendance(req.user);
  res.status(200).json({
    success: true,
    data: attendance,
    count: attendance.length,
  });
};
