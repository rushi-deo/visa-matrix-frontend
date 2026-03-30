import supabase from "../config/supabase.js";
import { countries as mockCountries } from "../data/countries.js";

const normalizeCountry = (country, fallback = {}) => {
  const name = country.name ?? country.country ?? fallback.country;
  const codeSource = country.code ?? country.country_code ?? country.country ?? fallback.country;

  return {
    id: country.id ?? fallback.id ?? name,
    name,
    code: country.code ?? country.country_code ?? codeSource?.slice(0, 2).toUpperCase(),
    is_active: country.is_active ?? true,
    processing_time: country.processing_time ?? fallback.processingTime ?? "",
    base_price: country.base_price ?? 0,
    currency: country.currency ?? "INR",
    short_description:
      country.short_description ?? fallback.policyNote ?? "Visa services available",
  };
};

const normalizeMockCountries = () =>
  mockCountries.map((country) =>
    normalizeCountry(
      {
        name: country.country,
        code: country.country.slice(0, 2).toUpperCase(),
        is_active: true,
        processing_time: country.processingTime,
      },
      country,
    ),
  );

export const getCountries = async () => {
  if (!supabase) {
    console.warn("[CountriesService] Supabase is not configured. Returning mock countries.");
    return normalizeMockCountries();
  }

  try {
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("[CountriesService] Supabase countries query failed:", error);
      return normalizeMockCountries();
    }

    return (data ?? []).map((country) => normalizeCountry(country));
  } catch (error) {
    console.error("[CountriesService] Error in getCountries service:", error);
    return normalizeMockCountries();
  }
};

export default {
  getCountries,
};
