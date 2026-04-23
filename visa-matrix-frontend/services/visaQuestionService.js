import { isSupabaseConfigured, supabase } from "../config/supabaseClient.js";

const QUESTION_TABLES = process.env.VISA_QUESTIONS_TABLE
  ? [process.env.VISA_QUESTIONS_TABLE]
  : ["questions", "visa_questions"];

const toQuestionResponse = (question) => ({
  id: question.id,
  label: question.label,
  type: question.type,
  required: Boolean(question.required),
  options: question.options ?? null,
});

const createServiceError = (message, status = 500) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const queryQuestionsFromTable = (tableName, countryId) =>
  supabase
    .from(tableName)
    .select("id, label, type, required, options")
    .eq("country_id", countryId);

export const getQuestionsByCountryId = async (countryId) => {
  if (!isSupabaseConfigured || !supabase) {
    throw createServiceError("Question service is unavailable.", 503);
  }

  let lastError = null;

  for (const tableName of QUESTION_TABLES) {
    const { data, error } = await queryQuestionsFromTable(tableName, countryId);

    if (!error) {
      return (data ?? []).map(toQuestionResponse);
    }

    lastError = error;

    if (error.code !== "PGRST205") {
      break;
    }
  }

  console.error("[VisaQuestionService] Supabase question query failed:", {
    code: lastError?.code,
    message: lastError?.message,
  });
  throw createServiceError("Unable to load country questions.", 500);
};

export default {
  getQuestionsByCountryId,
};
