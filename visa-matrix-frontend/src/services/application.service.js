import { supabase } from "../supabase";

const normalizeApplication = (application = {}) => ({
  ...application,
  id: application.id ?? application.application_id ?? "",
  applicationCode:
    application.applicationCode ?? application.application_code ?? "",
  leadSource: application.leadSource ?? application.lead_source ?? "",
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
    application_code:
      application.applicationCode ?? application.application_code,
    customer_name: application.customerName ?? application.customer_name,
    passport_number: application.passportNumber ?? application.passport_number,
    email: application.email,
    phone: application.phone,
    destination_country:
      application.destinationCountry ?? application.destination_country,
    visa_type: application.visaType ?? application.visa_type,
    travel_date: application.travelDate ?? application.travel_date,
    assigned_to: application.assignedAgent || application.assigned_agent || null,
    lead_source: application.leadSource ?? application.lead_source,
    stage: application.stage,
    status: application.status,
    submission_date: application.submissionDate ?? application.submission_date,
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

export async function createApplication(
  payload,
  currentUser,
) {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  let authData = null;
  let authUserId = null;

  const { data: nextAuthData, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error("Supabase auth user lookup error:", authError);
  } else {
    authData = nextAuthData;
    authUserId = nextAuthData?.user?.id ?? null;
  }

  console.log("Current User:", authData);

  const insertPayload = compactPayload({
    ...mapApplicationToDbPayload(payload),
    created_by:
      payload.created_by ??
      payload.user_id ??
      authUserId ??
      null,
    organization_id:
      payload.organization_id ??
      currentUser?.organization_id ??
      authData?.user?.user_metadata?.organization_id,
    created_at: payload.created_at ?? new Date().toISOString(),
  });

  console.log("Payload:", insertPayload);

  const { count, error: countError } = await getApplicationsTable().select("*", {
    count: "exact",
    head: true,
  });

  if (countError) {
    console.error("Supabase applications count error:", countError);
    throw countError;
  }

  const nextCount = (count || 0) + 1;
  const applicationCode = generateApplicationCode(nextCount);

  console.log("Generated Application Code:", applicationCode);

  const { data, error } = await getApplicationsTable()
    .insert([
      {
        ...insertPayload,
        application_code: applicationCode,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Insert Error:", error.message, error.details, error.hint, {
      ...insertPayload,
      application_code: applicationCode,
    });
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
