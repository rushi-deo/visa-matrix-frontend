import express from "express";
import {
  getInvoicesHandler,
  updateInvoiceStatusHandler,
} from "../controllers/invoicesController.js";
import { supabase } from "../config/supabaseClient.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { permissionMiddleware } from "../middleware/permissionMiddleware.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();
const invoiceTestUser = {
  id: "invoice-test-user",
  role: "admin",
  organization_id: "ORG-INTERNAL",
};

const attachInvoiceTestUser = (req, _res, next) => {
  req.user = invoiceTestUser;
  next();
};

router.get(
  "/invoices",
  attachInvoiceTestUser,
  asyncHandler(getInvoicesHandler),
);
router.post(
  "/invoices",
  asyncHandler(async (req, res) => {
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: "Supabase is not configured.",
      });
    }

    const {
      id,
      application_id = null,
      organization_id = invoiceTestUser.organization_id,
      customer,
      amount = 0,
      currency = "INR",
      payment_status = "Pending",
      payment_method = null,
      invoice_date = null,
      due_date = null,
    } = req.body ?? {};

    if (!customer) {
      return res.status(400).json({
        success: false,
        error: "customer is required.",
      });
    }

    const invoiceId = id ?? `INV-${Date.now()}`;
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        id: invoiceId,
        application_id,
        organization_id,
        customer,
        amount,
        currency,
        payment_status,
        payment_method,
        invoice_date,
        due_date,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      data,
    });
  }),
);
router.put(
  "/invoices/:invoiceId/status",
  authMiddleware,
  permissionMiddleware("invoicing", "edit"),
  asyncHandler(updateInvoiceStatusHandler),
);

export default router;
