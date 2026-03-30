import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireHrPermission } from "../../shared/middleware/hrRbacMiddleware.js";
import { validateDto } from "../../shared/middleware/validateDto.js";
import { notificationController } from "../controllers/index.js";
import { notificationCreateSchema, notificationQuerySchema } from "../validations/index.js";

const router = Router();

router.get(
  "/notifications",
  requireHrPermission("notifications", "view"),
  validateDto(notificationQuerySchema, "query"),
  asyncHandler(notificationController.listNotifications),
);
router.post(
  "/notifications",
  requireHrPermission("notifications", "create"),
  validateDto(notificationCreateSchema),
  asyncHandler(notificationController.createNotification),
);
router.post(
  "/notifications/:notificationId/read",
  requireHrPermission("notifications", "edit"),
  asyncHandler(notificationController.markAsRead),
);

export default router;

