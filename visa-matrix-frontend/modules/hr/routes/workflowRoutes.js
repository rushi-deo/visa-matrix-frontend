import express from "express";
import { asyncHandler } from "../../../middleware/errorHandler.js";
import { roleMiddleware } from "../../../middleware/roleMiddleware.js";
import {
  createWorkflowHandler,
  executeWorkflowHandler,
  listWorkflowsHandler,
} from "../controllers/workflowController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  validateCreateWorkflowBody,
  validateExecuteWorkflowBody,
  validateWorkflowParams,
} from "../validations/workflowValidation.js";

const router = express.Router();

router.post(
  "/workflows",
  roleMiddleware("admin", "hr"),
  validateRequest({ body: validateCreateWorkflowBody }),
  asyncHandler(createWorkflowHandler),
);

router.get("/workflows", roleMiddleware("admin", "hr"), asyncHandler(listWorkflowsHandler));

router.post(
  "/workflows/:id/execute",
  roleMiddleware("admin", "hr"),
  validateRequest({
    params: validateWorkflowParams,
    body: validateExecuteWorkflowBody,
  }),
  asyncHandler(executeWorkflowHandler),
);

export default router;
