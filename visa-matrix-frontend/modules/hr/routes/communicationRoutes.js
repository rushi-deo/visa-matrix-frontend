import express from "express";
import { asyncHandler } from "../../../middleware/errorHandler.js";
import { roleMiddleware } from "../../../middleware/roleMiddleware.js";
import {
  createAnnouncementHandler,
  listAnnouncementsHandler,
  listNotificationsHandler,
} from "../controllers/communicationController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  validateCreateAnnouncementBody,
  validateListNotificationsQuery,
} from "../validations/communicationValidation.js";

const router = express.Router();

router.post(
  "/announcements",
  roleMiddleware("admin", "hr"),
  validateRequest({ body: validateCreateAnnouncementBody }),
  asyncHandler(createAnnouncementHandler),
);

router.get(
  "/announcements",
  roleMiddleware("admin", "hr", "employee"),
  asyncHandler(listAnnouncementsHandler),
);

router.get(
  "/notifications",
  roleMiddleware("admin", "hr", "employee"),
  validateRequest({ query: validateListNotificationsQuery }),
  asyncHandler(listNotificationsHandler),
);

export default router;
