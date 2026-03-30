import { isSupabaseConfigured, supabase } from "../config/supabaseClient.js";
import { countries as mockCountries } from "../src/data/countries.js";

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
  if (!isSupabaseConfigured || !supabase) {
    console.warn("[CountriesService] Supabase is not configured. Returning mock countries.");
    return normalizeMockCountries();
  }

  console.info("[CountriesService] Fetching countries from Supabase.", {
    connectionStatus: "configured",
  });

  try {
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("[CountriesService] Supabase countries query failed:", error);

      const serviceError = new Error("Failed to fetch countries from Supabase");
      serviceError.status = 500;
      throw serviceError;
    }

    console.info("[CountriesService] Countries fetched from Supabase.", {
      rowCount: data?.length ?? 0,
    });

    return (data ?? []).map((country) => normalizeCountry(country));
  } catch (error) {
    console.error("[CountriesService] Error in getCountries service:", error);
    throw error;
  }
};

export const getCountryByName = async (countryName) => {
  try {
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .ilike("name", countryName)
      .eq("is_active", true)
      .single();

    if (error) {
      const country = mockCountries.find(
        (item) => item.country.toLowerCase() === countryName.toLowerCase(),
      );

      if (!country) {
        throw new Error(`Country "${countryName}" not found`);
      }

      return normalizeCountry(
        {
          name: country.country,
          code: country.country.slice(0, 2).toUpperCase(),
          is_active: true,
          processing_time: country.processingTime,
        },
        country,
      );
    }

    return normalizeCountry(data);
  } catch (error) {
    console.error("Error in getCountryByName service:", error);
    throw error;
  }
};
