import { supabase } from "../supabase";

const normalizeApplication = (application = {}) => ({
  ...application,
  id: application.id ?? application.application_id ?? "",
  customerName: application.customerName ?? application.customer_name ?? "",
  destinationCountry:
    application.destinationCountry ?? application.destination_country ?? "",
  visaType: application.visaType ?? application.visa_type ?? "",
  assignedAgent: application.assignedAgent ?? application.assigned_agent ?? "",
  submissionDate:
    application.submissionDate ??
    application.submission_date ??
    new Date().toISOString().slice(0, 10),
});

function getApplicationsTable() {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  return supabase.from("applications");
}

export async function fetchApplications() {
  const { data, error } = await getApplicationsTable().select("*");
  console.log("Supabase applications response:", data);

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data.map(normalizeApplication) : [];
}

export async function createApplication(
  payload,
) {
  const { data, error } = await getApplicationsTable().insert(payload).select().single();
  console.log("Supabase application create response:", data);

  if (error) {
    throw error;
  }

  return normalizeApplication(data);
}

export async function updateApplication(
  applicationId,
  payload,
) {
  const { data, error } = await getApplicationsTable()
    .update(payload)
    .eq("id", applicationId)
    .select()
    .single();
  console.log("Supabase application update response:", data);

  if (error) {
    throw error;
  }

  return normalizeApplication(data);
}
