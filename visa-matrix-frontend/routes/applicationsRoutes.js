import express from "express";
import {
  getApplicationsHandler,
  createApplicationHandler,
  getApplicationHandler,
  updateApplicationHandler,
} from "../controllers/applicationsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { permissionMiddleware } from "../middleware/permissionMiddleware.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get(
  "/applications",
  authMiddleware,
  permissionMiddleware("invoicing", "view"),
  asyncHandler(getApplicationsHandler),
);

router.post(
  "/applications",
  authMiddleware,
  permissionMiddleware("invoicing", "create"),
  asyncHandler(createApplicationHandler),
);

router.get(
  "/applications/:id",
  authMiddleware,
  permissionMiddleware("invoicing", "view"),
  asyncHandler(getApplicationHandler),
);

router.patch(
  "/applications/:id",
  authMiddleware,
  permissionMiddleware("invoicing", "edit"),
  asyncHandler(updateApplicationHandler),
);

export default router;
