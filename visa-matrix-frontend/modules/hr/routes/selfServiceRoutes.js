import express from "express";
import { asyncHandler } from "../../../middleware/errorHandler.js";
import { roleMiddleware } from "../../../middleware/roleMiddleware.js";
import {
  getMeHandler,
  getMyAttendanceHandler,
  getMyLeavesHandler,
  updateMeHandler,
} from "../controllers/selfServiceController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { validateSelfProfileUpdateBody } from "../validations/selfServiceValidation.js";

const router = express.Router();

router.get("/me", roleMiddleware("employee"), asyncHandler(getMeHandler));

router.put(
  "/me",
  roleMiddleware("employee"),
  validateRequest({ body: validateSelfProfileUpdateBody }),
  asyncHandler(updateMeHandler),
);

router.get("/me/leaves", roleMiddleware("employee"), asyncHandler(getMyLeavesHandler));
router.get("/me/attendance", roleMiddleware("employee"), asyncHandler(getMyAttendanceHandler));

export default router;
