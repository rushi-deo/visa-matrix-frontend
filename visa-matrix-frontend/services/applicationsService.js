import { supabase } from "../config/supabaseClient.js";
import { applications as mockApplications } from "../src/data/applications.js";

const fallbackApplications = mockApplications.map((application, index) => ({
  ...application,
  organization_id: index % 2 === 0 ? "ORG-INTERNAL" : "ORG-AGENCY-1",
}));

export const getApplications = async (user) => {
  try {
    let query = supabase
      .from("applications")
      .select("*")
      .order("submissionDate", { ascending: false });

    if (user?.role !== "admin") {
      query = query.eq("organization_id", user.organization_id);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data ?? [];
  } catch (error) {
    console.error("Error in getApplications service:", error);
    console.warn("Using mock data as fallback");
    return fallbackApplications.filter(
      (application) =>
        !user || user.role === "admin" || application.organization_id === user.organization_id,
    );
  }
};

export const createApplication = async (applicationData, user) => {
  try {
    const newApplication = {
      ...applicationData,
      submissionDate: applicationData.submissionDate || new Date().toISOString().split("T")[0],
      status: applicationData.status || "Submitted",
      stage: applicationData.stage || "Document Collection",
      organization_id: applicationData.organization_id || user.organization_id,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from("applications")
      .insert([newApplication])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createApplication service:", error);
    return {
      ...applicationData,
      id: `APP-${Date.now()}`,
      submissionDate: applicationData.submissionDate || new Date().toISOString().split("T")[0],
      status: applicationData.status || "Submitted",
      stage: applicationData.stage || "Document Collection",
      organization_id: applicationData.organization_id || user.organization_id,
      created_by: user.id,
    };
  }
};

export const getApplicationById = async (applicationId, user) => {
  try {
    let query = supabase.from("applications").select("*").eq("id", applicationId);

    if (user?.role !== "admin") {
      query = query.eq("organization_id", user.organization_id);
    }

    const { data, error } = await query.single();

    if (error) {
      const application = fallbackApplications.find((app) => app.id === applicationId);
      if (!application) {
        throw new Error(`Application "${applicationId}" not found`);
      }
      return application;
    }

    return data;
  } catch (error) {
    console.error("Error in getApplicationById service:", error);
    throw error;
  }
};

export const updateApplication = async (applicationId, applicationData, user) => {
  try {
    const existingApplication = await getApplicationById(applicationId, user);

    const updatedPayload = {
      ...existingApplication,
      ...applicationData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("applications")
      .update(updatedPayload)
      .eq("id", applicationId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateApplication service:", error);
    return {
      ...(await getApplicationById(applicationId, user)),
      ...applicationData,
      updated_at: new Date().toISOString(),
    };
  }
};
