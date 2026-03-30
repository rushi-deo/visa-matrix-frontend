import express from "express";
import { asyncHandler } from "../../../middleware/errorHandler.js";
import { roleMiddleware } from "../../../middleware/roleMiddleware.js";
import {
  applyLeaveHandler,
  approveLeaveHandler,
  checkInAttendanceHandler,
  checkOutAttendanceHandler,
  listAttendanceHandler,
  listLeavesHandler,
} from "../controllers/leaveController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  validateAttendanceCheckInBody,
  validateAttendanceCheckOutBody,
  validateAttendanceListQuery,
  validateLeaveApplyBody,
  validateLeaveApprovalBody,
  validateLeaveApprovalParams,
  validateLeaveListQuery,
} from "../validations/leaveValidation.js";

const router = express.Router();

router.post(
  "/leaves/apply",
  roleMiddleware("admin", "hr", "employee"),
  validateRequest({ body: validateLeaveApplyBody }),
  asyncHandler(applyLeaveHandler),
);

router.put(
  "/leaves/:id/approve",
  roleMiddleware("admin", "hr"),
  validateRequest({
    params: validateLeaveApprovalParams,
    body: validateLeaveApprovalBody,
  }),
  asyncHandler(approveLeaveHandler),
);

router.get(
  "/leaves",
  roleMiddleware("admin", "hr"),
  validateRequest({ query: validateLeaveListQuery }),
  asyncHandler(listLeavesHandler),
);

router.post(
  "/attendance/check-in",
  roleMiddleware("admin", "hr", "employee"),
  validateRequest({ body: validateAttendanceCheckInBody }),
  asyncHandler(checkInAttendanceHandler),
);

router.post(
  "/attendance/check-out",
  roleMiddleware("admin", "hr", "employee"),
  validateRequest({ body: validateAttendanceCheckOutBody }),
  asyncHandler(checkOutAttendanceHandler),
);

router.get(
  "/attendance",
  roleMiddleware("admin", "hr"),
  validateRequest({ query: validateAttendanceListQuery }),
  asyncHandler(listAttendanceHandler),
);

export default router;
