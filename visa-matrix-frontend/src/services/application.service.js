import { supabase } from "../supabase";

const normalizeApplication = (application = {}) => ({
  ...application,
  id: application.id ?? application.application_id ?? "",
  applicationCode:
    application.applicationCode ??
    application.application_number ??
    application.application_code ??
    "",
  leadSource: application.leadSource ?? application.lead_source ?? "",
  customerName: application.customerName ?? application.customer_name ?? "",
  destinationCountry:
    application.destinationCountry ?? application.destination_country ?? "",
  visaType: application.visaType ?? application.visa_type ?? "",
  assignedAgent:
    application.assignedAgent ??
    application.assigned_agent ??
    application.agent_assigned ??
    "",
  submissionDate:
    application.submissionDate ??
    application.submission_date ??
    new Date().toISOString().slice(0, 10),
});

const compactPayload = (payload = {}) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );

const mapApplicationToDbPayload = (application = {}) =>
  compactPayload({
    application_number:
      application.applicationCode ??
      application.application_number ??
      application.application_code,
    customer_name: application.customerName ?? application.customer_name,
    passport_number: application.passportNumber ?? application.passport_number,
    email: application.email,
    phone: application.phone,
    destination_country:
      application.destinationCountry ?? application.destination_country,
    visa_type: application.visaType ?? application.visa_type,
    travel_date: application.travelDate ?? application.travel_date,
    assigned_to:
      application.assignedAgent || application.assigned_agent || null,
    lead_source: application.leadSource ?? application.lead_source,
    stage: application.stage,
    status: application.status,
    submission_date: application.submissionDate ?? application.submission_date,
    embassy_interview_date:
      application.embassyInterviewDate ??
      application.embassy_interview_date,
    organization_id: application.organization_id,
    created_by: application.created_by,
    created_at: application.created_at,
  });

const mapApplicationToNewApplicationPayload = (application = {}) =>
  compactPayload({
    customer_name: application.customerName ?? application.customer_name,
    passport_number: application.passportNumber ?? application.passport_number,
    email: application.email,
    phone: application.phone,
    destination_country:
      application.destinationCountry ?? application.destination_country,
    visa_type: application.visaType ?? application.visa_type,
    travel_date: application.travelDate ?? application.travel_date,
    agent_assigned:
      application.agentAssigned ??
      application.assigned_agent ??
      application.agent_assigned,
    lead_source: application.leadSource ?? application.lead_source,
  });

function getApplicationsTable() {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  return supabase.from("applications");
}

export function generateApplicationCode(count) {
  const now = new Date();
  const monthLetters = "ABCDEFGHIJKL";
  const monthLetter = monthLetters[now.getMonth()];
  const year = now.getFullYear().toString().slice(-2);

  return `VM${count}${monthLetter}${year}`;
}

export async function fetchApplications() {
  const { data, error } = await getApplicationsTable()
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase applications fetch error:", error);
    throw error;
  }

  console.log("Supabase applications response:", data);
  return Array.isArray(data) ? data.map(normalizeApplication) : [];
}

export async function createApplication(payload, _currentUser) {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  // ✅ SAFE payload (fix for RLS error)
  const insertPayload = {
    customer_name: payload.customerName || payload.customer_name || "",
    passport_number:
      payload.passportNumber || payload.passport_number || "NA",
    email: payload.email || "",
    phone: payload.phone || "",
    destination_country:
      payload.destinationCountry || payload.destination_country || "",
    visa_type: payload.visaType || payload.visa_type || "General Visa",
    travel_date: payload.travelDate || payload.travel_date || null,
    agent_assigned:
      payload.agentAssigned ||
      payload.assigned_agent ||
      payload.agent_assigned ||
      null,
    lead_source: payload.leadSource || payload.lead_source || null,
  };

  console.log("FINAL INSERT PAYLOAD:", insertPayload);

  const { data, error } = await supabase
    .from("new_applications")
    .insert([insertPayload])
    .select()
    .single();

  if (error) {
    console.error(
      "Insert Error:",
      error.message,
      error.details,
      error.hint,
      insertPayload
    );
    throw error;
  }

  console.log("Supabase application create response:", data);
  return normalizeApplication(data);
}

export async function updateApplication(applicationId, payload) {
  const updatePayload = mapApplicationToDbPayload(payload);

  const { data, error } = await getApplicationsTable()
    .update(updatePayload)
    .eq("id", applicationId)
    .select()
    .single();

  if (error) {
    console.error("Supabase application update error:", error);
    throw error;
  }

  console.log("Supabase application update response:", data);
  return normalizeApplication(data);
}
