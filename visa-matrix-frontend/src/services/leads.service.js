import { supabase } from "../supabase";
import { normalizeVisaType } from "../utils/visaType";

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
  visaType: normalizeVisaType(lead.visaType ?? lead.visa_type ?? ""),
  consultationDate:
    lead.consultationDate ??
    lead.consultation_date ??
    new Date().toISOString().slice(0, 10),
});

const sortLeads = (rows = []) =>
  [...rows].sort((first, second) =>
    String(second.consultationDate ?? "").localeCompare(String(first.consultationDate ?? "")),
  );

function getLeadsTable() {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  return supabase.from("leads");
}

export async function fetchLeads() {
  const { data, error } = await getLeadsTable().select("*");
  console.log("Supabase leads response:", data);

  if (error) {
    throw error;
  }

  return sortLeads(Array.isArray(data) ? data.map(normalizeLead) : []);
}

export async function createLead(payload) {
  const insertPayload = { ...payload };

  if (payload.visaType !== undefined || payload.visa_type !== undefined) {
    insertPayload.visa_type = normalizeVisaType(payload.visaType ?? payload.visa_type);
  }

  delete insertPayload.visaType;

  const { data, error } = await getLeadsTable()
    .insert(insertPayload)
    .select()
    .single();
  console.log("Supabase lead create response:", data);

  if (error) {
    throw error;
  }

  return normalizeLead(data);
}

export async function updateLead(leadId, payload) {
  const updatePayload = { ...payload };

  if (payload.visaType !== undefined || payload.visa_type !== undefined) {
    updatePayload.visa_type = normalizeVisaType(payload.visaType ?? payload.visa_type);
  }

  delete updatePayload.visaType;

  const { data, error } = await getLeadsTable()
    .update(updatePayload)
    .eq("id", leadId)
    .select()
    .single();
  console.log("Supabase lead update response:", data);

  if (error) {
    throw error;
  }

  return normalizeLead(data);
}
