import apiClient, { API_ENDPOINTS, extractResponseData } from "./apiClient";

const normalizePayment = (payment = {}) => ({
  ...payment,
  invoiceId: payment.invoiceId ?? payment.id ?? payment.invoice_id ?? "",
  customer: payment.customer ?? payment.customer_name ?? "",
  application: payment.application ?? payment.application_id ?? "",
  paymentStatus: payment.paymentStatus ?? payment.payment_status ?? "Pending",
  paymentMethod: payment.paymentMethod ?? payment.payment_method ?? "",
  invoiceDate: payment.invoiceDate ?? payment.invoice_date ?? "",
  dueDate: payment.dueDate ?? payment.due_date ?? "",
  paidOn: payment.paidOn ?? payment.paid_on ?? null,
});

export async function fetchPayments() {
  try {
    const response = await apiClient.get(API_ENDPOINTS.invoices);
    const invoices = extractResponseData(response);

    return Array.isArray(invoices) ? invoices.map(normalizePayment) : [];
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    throw error;
  }
}

export async function updatePaymentStatus(
  invoiceId,
  status,
  fallbackPayment,
) {
  try {
    const response = await apiClient.put(API_ENDPOINTS.invoiceStatus(invoiceId), {
      status,
    });
    const payment = extractResponseData(response);

    return payment
      ? normalizePayment(payment)
      : { ...fallbackPayment, paymentStatus: status };
  } catch (error) {
    console.error(`Failed to update invoice ${invoiceId}:`, error);
    throw error;
  }
}

export async function createInvoice(data) {
  const response = await apiClient.post(API_ENDPOINTS.invoices, data);
  return extractResponseData(response);
}
