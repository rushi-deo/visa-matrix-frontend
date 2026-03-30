import { countries as fallbackCountries } from "../data/countries";
import { supabase } from "../supabase";

const defaultVisaType = "General Visa";

const toLegacyCountryShape = (country, fallback = {}) => {
  const name = country.name ?? fallback.country ?? "Unknown";
  const visaTypes =
    Array.isArray(country.visa_types) && country.visa_types.length > 0
      ? country.visa_types
      : fallback.visaType
        ? [fallback.visaType]
        : [defaultVisaType];
  const primaryVisaType = visaTypes[0];

  return {
    id: country.id ?? fallback.id ?? name.toLowerCase().replace(/\s+/g, "-"),
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    country_code: country.code ?? fallback.country_code ?? "",
    flag_image: country.flag_image ?? fallback.flag_image ?? "🌍",
    hero_image: country.hero_image ?? fallback.hero_image ?? "/images/default.jpg",
    short_description:
      country.short_description ?? fallback.policyNote ?? "Visa services available",
    visa_types: visaTypes,
    processing_time:
      country.processing_time ?? fallback.processingTime ?? "",
    is_active: country.is_active ?? true,
    base_price: country.base_price ?? fallback.base_price ?? 0,
    currency: country.currency ?? fallback.currency ?? "INR",
    country: name,
    visaType: primaryVisaType,
    processingTime: country.processing_time ?? fallback.processingTime ?? "",
    approvalRate: fallback.approvalRate ?? "N/A",
    policyNote:
      country.short_description ?? fallback.policyNote ?? "Visa services available",
    lastUpdated:
      country.updated_at?.slice(0, 10) ??
      fallback.lastUpdated ??
      new Date().toISOString().slice(0, 10),
    interviewRequired: fallback.interviewRequired ?? "Depends on visa type",
    requirements: fallback.requirements ?? [],
  };
};

const normalizeFallbackCountries = () =>
  fallbackCountries.map((country, index) =>
    toLegacyCountryShape(
      {
        id: `fallback-${index + 1}`,
        name: country.country,
        code: country.country.slice(0, 2).toUpperCase(),
        is_active: true,
        processing_time: country.processingTime,
      },
      country,
    ),
  );

export const fetchCountriesFromDB = async () => {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return null;
  }

  return data.map((country) =>
    toLegacyCountryShape({
      id: country.id,
      name: country.name,
      code: country.code,
      flag_image: "🌍",
      hero_image: "/images/default.jpg",
      short_description: "Visa services available",
      visa_types: country.visa_types ?? [],
      processing_time: country.processing_time || "",
      is_active: country.is_active,
      base_price: country.base_price ?? 0,
      currency: country.currency ?? "INR",
      updated_at: country.updated_at,
    }),
  );
};

export const getAllCountries = async () => {
  const countriesFromDB = await fetchCountriesFromDB();
  return countriesFromDB?.length ? countriesFromDB : normalizeFallbackCountries();
};

export const getCountryOptions = async () => {
  const countries = await getAllCountries();

  return {
    countries,
    countryOptions: [...new Set(countries.map((country) => country.country))],
    visaTypeOptions: [...new Set(countries.flatMap((country) => country.visa_types))],
  };
};
