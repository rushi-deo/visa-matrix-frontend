import { supabase } from "../supabase";

export async function getFormSchema(country, visaType) {
  if (!supabase) {
    console.error("Supabase client is not configured.");
    return null;
  }

  const { data, error } = await supabase
    .from("form_schemas")
    .select("schema")
    .ilike("country", country)
    .ilike("visa_type", visaType)
    .single();

  if (error) {
    console.error("Error fetching form schema:", error);
    return null;
  }

  return data?.schema ?? null;
}
