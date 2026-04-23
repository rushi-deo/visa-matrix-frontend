import { isSupabaseConfigured, supabase } from "../config/supabaseClient.js";

const toQuestionResponse = (item) => ({
  id: item.id,
  label: item.label || item.requirement || item.name || "Question",
  type: item.type || "text",
  required: item.required ?? true,
  options: item.options || [],
});

const createServiceError = (message, status = 500) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const getQuestionsByCountryId = async (countryId) => {
  if (!isSupabaseConfigured || !supabase) {
    throw createServiceError("Question service is unavailable.", 503);
  }

  const { data, error } = await supabase
    .from("visa_types")
    .select("*")
    .eq("country_id", countryId);

  if (error) {
    console.error("[VisaQuestionService] visa_type query failed:", {
      code: error.code,
      message: error.message,
    });
    throw createServiceError("Failed to fetch visa questions", 500);
  }

  return {
    questions: (data ?? []).map(toQuestionResponse),
  };
};

export default {
  getQuestionsByCountryId,
};
