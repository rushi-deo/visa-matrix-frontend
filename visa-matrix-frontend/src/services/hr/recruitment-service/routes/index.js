import { Router } from "express";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { requireHrPermission } from "../../shared/middleware/hrRbacMiddleware.js";
import { validateDto } from "../../shared/middleware/validateDto.js";
import { recruitmentController } from "../controllers/index.js";
import {
  candidateCreateSchema,
  candidateQuerySchema,
  candidateStageSchema,
} from "../validations/index.js";

const router = Router();

router.get(
  "/recruitment/candidates",
  requireHrPermission("recruitment", "view"),
  validateDto(candidateQuerySchema, "query"),
  asyncHandler(recruitmentController.listCandidates),
);
router.post(
  "/recruitment/candidates",
  requireHrPermission("recruitment", "create"),
  validateDto(candidateCreateSchema),
  asyncHandler(recruitmentController.createCandidate),
);
router.post(
  "/recruitment/candidates/:candidateId/stage",
  requireHrPermission("recruitment", "edit"),
  validateDto(candidateStageSchema),
  asyncHandler(recruitmentController.moveCandidateStage),
);
router.get(
  "/recruitment/funnel",
  requireHrPermission("recruitment", "view"),
  asyncHandler(recruitmentController.getHiringFunnel),
);

export default router;

