import { supabase } from "../supabase";

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeCustomer = (customer = {}) => ({
  ...customer,
  id: customer.id ?? customer.customer_id ?? "",
  name: customer.name ?? customer.customerName ?? "",
  passportNumber: customer.passportNumber ?? customer.passport_number ?? "",
  contact: customer.contact ?? customer.phone ?? "",
  email: customer.email ?? "",
  visaHistory: toArray(customer.visaHistory ?? customer.visa_history),
  documentsUploaded: toArray(customer.documentsUploaded ?? customer.documents_uploaded),
  assignedAgent: customer.assignedAgent ?? customer.assigned_agent ?? "",
  activeApplications:
    customer.activeApplications ?? customer.active_applications ?? 0,
});

function getCustomersTable() {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  return supabase.from("customers");
}

export async function fetchCustomers() {
  const { data, error } = await getCustomersTable().select("*");
  console.log("Supabase customers response:", data);

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data.map(normalizeCustomer) : [];
}
