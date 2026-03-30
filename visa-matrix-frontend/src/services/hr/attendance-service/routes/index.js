import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireHrPermission } from "../../shared/middleware/hrRbacMiddleware.js";
import { validateDto } from "../../shared/middleware/validateDto.js";
import { attendanceController } from "../controllers/index.js";
import {
  attendanceCreateSchema,
  attendanceQuerySchema,
  leaveCreateSchema,
} from "../validations/index.js";

const router = Router();

router.get(
  "/attendance/records",
  requireHrPermission("attendance", "view"),
  validateDto(attendanceQuerySchema, "query"),
  asyncHandler(attendanceController.listAttendance),
);
router.post(
  "/attendance/records",
  requireHrPermission("attendance", "create"),
  validateDto(attendanceCreateSchema),
  asyncHandler(attendanceController.createAttendance),
);
router.get(
  "/attendance/leave-requests",
  requireHrPermission("attendance", "view"),
  validateDto(attendanceQuerySchema, "query"),
  asyncHandler(attendanceController.listLeaveRequests),
);
router.post(
  "/attendance/leave-requests",
  requireHrPermission("attendance", "create"),
  validateDto(leaveCreateSchema),
  asyncHandler(attendanceController.createLeaveRequest),
);
router.post(
  "/attendance/leave-requests/:leaveRequestId/approve",
  requireHrPermission("attendance", "approve", ["manager", "hr", "admin"]),
  asyncHandler(attendanceController.approveLeaveRequest),
);

export default router;

