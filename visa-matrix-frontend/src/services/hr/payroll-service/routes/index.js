import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireHrPermission } from "../../shared/middleware/hrRbacMiddleware.js";
import { validateDto } from "../../shared/middleware/validateDto.js";
import { payrollController } from "../controllers/index.js";
import { payrollProcessSchema, payrollQuerySchema } from "../validations/index.js";

const router = Router();

router.get(
  "/payroll/logs",
  requireHrPermission("payroll", "view"),
  validateDto(payrollQuerySchema, "query"),
  asyncHandler(payrollController.listPayrollLogs),
);
router.post(
  "/payroll/process",
  requireHrPermission("payroll", "process", ["finance", "admin"]),
  validateDto(payrollProcessSchema),
  asyncHandler(payrollController.processPayroll),
);

export default router;
