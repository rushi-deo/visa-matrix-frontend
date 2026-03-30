import express from "express";
import { asyncHandler } from "../../../middleware/errorHandler.js";
import { roleMiddleware } from "../../../middleware/roleMiddleware.js";
import { listDocumentsHandler, uploadDocumentHandler } from "../controllers/documentController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  validateDocumentParams,
  validateDocumentUploadBody,
} from "../validations/documentValidation.js";

const router = express.Router();

router.post(
  "/documents/upload",
  roleMiddleware("admin", "hr", "employee"),
  validateRequest({ body: validateDocumentUploadBody }),
  asyncHandler(uploadDocumentHandler),
);

router.get(
  "/documents/:employee_id",
  roleMiddleware("admin", "hr", "employee"),
  validateRequest({ params: validateDocumentParams }),
  asyncHandler(listDocumentsHandler),
);

export default router;
