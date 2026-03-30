import express from "express";
import {
  getAccessControlMetaHandler,
  getAuditLogsHandler,
  getNotificationsHandler,
  updateRolePermissionHandler,
  updateUserRoleHandler,
} from "../controllers/accessControlController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { permissionMiddleware } from "../middleware/permissionMiddleware.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get(
  "/access-control/meta",
  authMiddleware,
  permissionMiddleware("settings", "view"),
  asyncHandler(getAccessControlMetaHandler),
);
router.put(
  "/access-control/role-permissions",
  authMiddleware,
  permissionMiddleware("settings", "edit"),
  asyncHandler(updateRolePermissionHandler),
);
router.put(
  "/access-control/users/role",
  authMiddleware,
  permissionMiddleware("hr", "edit"),
  asyncHandler(updateUserRoleHandler),
);
router.get(
  "/notifications",
  authMiddleware,
  permissionMiddleware("notifications", "view"),
  asyncHandler(getNotificationsHandler),
);
router.get(
  "/audit-logs",
  authMiddleware,
  permissionMiddleware("audit_logs", "view"),
  asyncHandler(getAuditLogsHandler),
);

export default router;
