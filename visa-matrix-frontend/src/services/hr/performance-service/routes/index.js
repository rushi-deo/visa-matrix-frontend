import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireHrPermission } from "../../shared/middleware/hrRbacMiddleware.js";
import { validateDto } from "../../shared/middleware/validateDto.js";
import { performanceController } from "../controllers/index.js";
import { performanceCreateSchema, performanceQuerySchema } from "../validations/index.js";

const router = Router();

router.get(
  "/performance/reviews",
  requireHrPermission("performance", "view"),
  validateDto(performanceQuerySchema, "query"),
  asyncHandler(performanceController.listReviews),
);
router.post(
  "/performance/reviews",
  requireHrPermission("performance", "create"),
  validateDto(performanceCreateSchema),
  asyncHandler(performanceController.createReview),
);
router.get(
  "/performance/dashboard",
  requireHrPermission("performance", "view"),
  asyncHandler(performanceController.getDashboard),
);

export default router;

