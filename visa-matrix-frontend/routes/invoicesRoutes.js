import express from "express";
import {
  getInvoicesHandler,
  updateInvoiceStatusHandler,
} from "../controllers/invoicesController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { permissionMiddleware } from "../middleware/permissionMiddleware.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get(
  "/invoices",
  authMiddleware,
  permissionMiddleware("invoicing", "view"),
  asyncHandler(getInvoicesHandler),
);
router.put(
  "/invoices/:invoiceId/status",
  authMiddleware,
  permissionMiddleware("invoicing", "edit"),
  asyncHandler(updateInvoiceStatusHandler),
);

export default router;
