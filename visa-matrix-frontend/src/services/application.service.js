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

const compactPayload = (payload = {}) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );

const mapApplicationToDbPayload = (application = {}) =>
  compactPayload({
    id: application.id,
    customer_name: application.customerName ?? application.customer_name,
    passport_number: application.passportNumber ?? application.passport_number,
    email: application.email,
    phone: application.phone,
    destination_country:
      application.destinationCountry ?? application.destination_country,
    visa_type: application.visaType ?? application.visa_type,
    travel_date: application.travelDate ?? application.travel_date,
    assigned_agent: application.assignedAgent ?? application.assigned_agent,
    lead_source: application.leadSource ?? application.lead_source,
    stage: application.stage,
    status: application.status,
    submission_date: application.submissionDate ?? application.submission_date,
    notes: application.notes,
    embassy_interview_date:
      application.embassyInterviewDate ?? application.embassy_interview_date,
    organization_id: application.organization_id,
    created_by: application.created_by,
    created_at: application.created_at,
  });

function getApplicationsTable() {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  return supabase.from("applications");
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

export async function createApplication(
  payload,
  currentUser,
) {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  const {
    data: authData,
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("Supabase auth user lookup error:", authError);
    throw authError;
  }

  console.log("Current User:", authData);

  if (!authData?.user?.id) {
    throw new Error("Authenticated user is required before inserting applications.");
  }

  const insertPayload = compactPayload({
    ...mapApplicationToDbPayload(payload),
    created_by:
      payload.created_by ??
      payload.user_id ??
      currentUser?.id ??
      authData.user.id,
    organization_id:
      payload.organization_id ??
      currentUser?.organization_id ??
      authData.user.user_metadata?.organization_id,
    created_at: payload.created_at ?? new Date().toISOString(),
  });

  console.log("Payload:", insertPayload);

  const { data, error } = await getApplicationsTable()
    .insert([insertPayload])
    .select()
    .single();

  if (error) {
    console.error("Insert Error:", error.message, error.details, error.hint, insertPayload);
    throw error;
  }

  console.log("Supabase application create response:", data);
  return normalizeApplication(data);
}

export async function updateApplication(
  applicationId,
  payload,
) {
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
