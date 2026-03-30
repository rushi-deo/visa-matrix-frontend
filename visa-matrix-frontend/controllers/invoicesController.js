import { createAuditLog } from "../services/auditLogService.js";
import { updateInvoiceStatus, getInvoices } from "../services/invoicesService.js";
import { createNotification } from "../services/notificationService.js";

export const getInvoicesHandler = async (req, res) =>
  res.status(200).json({
    success: true,
    data: await getInvoices(req.user),
  });

export const updateInvoiceStatusHandler = async (req, res) => {
  const { invoiceId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: "status is required.",
    });
  }

  const invoice = await updateInvoiceStatus({
    invoiceId,
    status,
    user: req.user,
  });

  await createNotification({
    organization_id: invoice.organization_id ?? req.user.organization_id,
    title: "Invoice updated",
    message: `Invoice ${invoiceId} moved to ${status}.`,
    module: "invoicing",
    entity_id: invoiceId,
  });

  await createAuditLog({
    user_id: req.user.id,
    organization_id: invoice.organization_id ?? req.user.organization_id,
    action: "invoice_status_updated",
    module: "invoicing",
    entity_id: invoiceId,
    metadata: { status },
  });

  return res.status(200).json({
    success: true,
    data: invoice,
  });
};
