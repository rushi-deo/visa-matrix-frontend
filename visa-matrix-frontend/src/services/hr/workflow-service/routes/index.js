import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireHrPermission } from "../../shared/middleware/hrRbacMiddleware.js";
import { validateDto } from "../../shared/middleware/validateDto.js";
import { workflowController } from "../controllers/index.js";
import {
  workflowAdvanceSchema,
  workflowDefinitionSchema,
  workflowInstanceSchema,
  workflowQuerySchema,
} from "../validations/index.js";

const router = Router();

router.get(
  "/workflows/definitions",
  requireHrPermission("workflow", "view"),
  validateDto(workflowQuerySchema, "query"),
  asyncHandler(workflowController.listDefinitions),
);
router.post(
  "/workflows/definitions",
  requireHrPermission("workflow", "create"),
  validateDto(workflowDefinitionSchema),
  asyncHandler(workflowController.createDefinition),
);
router.get(
  "/workflows/instances",
  requireHrPermission("workflow", "view"),
  validateDto(workflowQuerySchema, "query"),
  asyncHandler(workflowController.listInstances),
);
router.post(
  "/workflows/instances",
  requireHrPermission("workflow", "create"),
  validateDto(workflowInstanceSchema),
  asyncHandler(workflowController.createInstance),
);
router.post(
  "/workflows/instances/:workflowInstanceId/advance",
  requireHrPermission("workflow", "approve"),
  validateDto(workflowAdvanceSchema),
  asyncHandler(workflowController.advanceInstance),
);

export default router;
