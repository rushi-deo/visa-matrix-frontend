import { supabase } from "../config/supabaseClient.js";
import { payments as mockInvoices } from "../src/data/payments.js";

const fallbackInvoices = mockInvoices.map((invoice, index) => ({
  ...invoice,
  id: invoice.invoiceId,
  organization_id: index % 2 === 0 ? "ORG-INTERNAL" : "ORG-AGENCY-1",
}));

export const getInvoices = async (user) => {
  try {
    let query = supabase.from("invoices").select("*").order("invoice_date", { ascending: false });

    if (user.role !== "admin") {
      query = query.eq("organization_id", user.organization_id);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return data;
  } catch {
    return fallbackInvoices.filter(
      (invoice) => user.role === "admin" || invoice.organization_id === user.organization_id,
    );
  }
};

export const updateInvoiceStatus = async ({ invoiceId, status, user }) => {
  const invoice = fallbackInvoices.find((item) => item.invoiceId === invoiceId);
  if (invoice) {
    invoice.paymentStatus = status;
  }

  try {
    const { data, error } = await supabase
      .from("invoices")
      .update({ payment_status: status })
      .eq("id", invoiceId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch {
    return {
      ...(invoice ?? {}),
      paymentStatus: status,
      updated_by: user.id,
    };
  }
};
