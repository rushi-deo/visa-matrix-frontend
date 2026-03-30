import express from "express";
import { asyncHandler } from "../../../middleware/errorHandler.js";
import { roleMiddleware } from "../../../middleware/roleMiddleware.js";
import {
  createFeedbackHandler,
  createKudosHandler,
  createPollHandler,
  respondToPollHandler,
} from "../controllers/engagementController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  validateCreatePollBody,
  validateFeedbackBody,
  validateKudosBody,
  validatePollParams,
  validatePollResponseBody,
} from "../validations/engagementValidation.js";

const router = express.Router();

router.post(
  "/polls",
  roleMiddleware("admin", "hr"),
  validateRequest({ body: validateCreatePollBody }),
  asyncHandler(createPollHandler),
);

router.post(
  "/polls/:id/respond",
  roleMiddleware("admin", "hr", "employee"),
  validateRequest({
    params: validatePollParams,
    body: validatePollResponseBody,
  }),
  asyncHandler(respondToPollHandler),
);

router.post(
  "/feedback",
  roleMiddleware("admin", "hr", "employee"),
  validateRequest({ body: validateFeedbackBody }),
  asyncHandler(createFeedbackHandler),
);

router.post(
  "/kudos",
  roleMiddleware("admin", "hr", "employee"),
  validateRequest({ body: validateKudosBody }),
  asyncHandler(createKudosHandler),
);

export default router;
