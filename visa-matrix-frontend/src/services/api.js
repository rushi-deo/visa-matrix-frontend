import { normalizeVisaType } from "../utils/visaType";
import apiClient, { extractResponseData } from "./apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

const extractCollection = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

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

const normalizeLead = (lead = {}) => ({
  ...lead,
  id: lead.id ?? lead.lead_id ?? "",
  leadName: lead.leadName ?? lead.lead_name ?? "",
  email: lead.email ?? "",
  phone: lead.phone ?? "",
  interestedCountry: lead.interestedCountry ?? lead.interested_country ?? "",
  leadSource: lead.leadSource ?? lead.lead_source ?? "Website",
  status: lead.status ?? "New",
  assignedAgent: lead.assignedAgent ?? lead.assigned_agent ?? "",
  visaType: normalizeVisaType(lead.visaType ?? lead.visa_type) ?? "",
  consultationDate:
    lead.consultationDate ??
    lead.consultation_date ??
    new Date().toISOString().slice(0, 10),
});

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
  activeApplications: customer.activeApplications ?? customer.active_applications ?? 0,
});

export const fetchLeads = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/leads`);

    if (!response.ok) {
      throw new Error("Failed to fetch leads");
    }

    const payload = await response.json();

    return extractCollection(payload)
      .map(normalizeLead)
      .sort((first, second) =>
        String(second.consultationDate ?? "").localeCompare(String(first.consultationDate ?? "")),
      );
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

export const fetchCustomers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers`);

    if (!response.ok) {
      throw new Error("Failed to fetch customers");
    }

    const payload = await response.json();

    return extractCollection(payload).map(normalizeCustomer);
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

export const fetchVisaCountries = async () => {
  const response = await apiClient.get("/countries");
  const countries = extractResponseData(response);

  return Array.isArray(countries) ? countries : [];
};

export const fetchCountryQuestions = async (countryId) => {
  if (!countryId) {
    throw new Error("Select a country before loading questions.");
  }

  const response = await apiClient.get(`/countries/${countryId}/questions`);
  const payload = response?.data ?? {};

  return {
    country_id: payload.country_id ?? countryId,
    questions: Array.isArray(payload.questions) ? payload.questions : [],
  };
};
