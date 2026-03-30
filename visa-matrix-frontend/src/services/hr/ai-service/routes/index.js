import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireHrPermission } from "../../shared/middleware/hrRbacMiddleware.js";
import { validateDto } from "../../shared/middleware/validateDto.js";
import { aiController } from "../controllers/index.js";
import { candidateScoreSchema } from "../validations/index.js";

const router = Router();

router.get("/ai/insights", requireHrPermission("ai", "view"), asyncHandler(aiController.getInsights));
router.post(
  "/ai/candidate-score",
  requireHrPermission("ai", "view"),
  validateDto(candidateScoreSchema),
  asyncHandler(aiController.scoreCandidate),
);

export default router;

