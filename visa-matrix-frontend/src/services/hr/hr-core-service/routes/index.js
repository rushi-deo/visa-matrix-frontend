import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireHrPermission } from "../../shared/middleware/hrRbacMiddleware.js";
import { validateDto } from "../../shared/middleware/validateDto.js";
import { hrCoreController } from "../controllers/index.js";
import {
  employeeCreateSchema,
  employeeQuerySchema,
  employeeUpdateSchema,
  salaryStructureSchema,
} from "../validations/index.js";

const router = Router();

router.get("/dashboard", requireHrPermission("hr", "view"), asyncHandler(hrCoreController.getDashboard));
router.get("/meta", requireHrPermission("hr", "view"), asyncHandler(hrCoreController.getMeta));
router.get(
  "/employees",
  requireHrPermission("hr", "view"),
  validateDto(employeeQuerySchema, "query"),
  asyncHandler(hrCoreController.listEmployees),
);
router.post(
  "/employees",
  requireHrPermission("hr", "create"),
  validateDto(employeeCreateSchema),
  asyncHandler(hrCoreController.createEmployee),
);
router.get("/employees/:employeeId", requireHrPermission("hr", "view"), asyncHandler(hrCoreController.getEmployee));
router.put(
  "/employees/:employeeId",
  requireHrPermission("hr", "edit"),
  validateDto(employeeUpdateSchema),
  asyncHandler(hrCoreController.updateEmployee),
);
router.get(
  "/employees/:employeeId/profile",
  requireHrPermission("hr", "view"),
  asyncHandler(hrCoreController.getEmployeeProfile),
);
router.get(
  "/salary-structures/:employeeId",
  requireHrPermission("payroll", "view"),
  asyncHandler(hrCoreController.getSalaryStructure),
);
router.put(
  "/salary-structures/:employeeId",
  requireHrPermission("payroll", "edit", ["finance", "admin"]),
  validateDto(salaryStructureSchema),
  asyncHandler(hrCoreController.updateSalaryStructure),
);

export default router;

