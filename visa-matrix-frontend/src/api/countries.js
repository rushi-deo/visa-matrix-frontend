import { apiRequest } from "../services/api";

// GET ALL COUNTRIES
export const fetchCountries = async () => {
  try {
    const result = await apiRequest("/countries");

    if (!result.success) {
      throw new Error(result.error || "Error fetching countries");
    }

    // API returns: { success: true, data: [...] }
    return Array.isArray(result.data)
      ? result.data
      : Array.isArray(result.data?.data)
        ? result.data.data
        : [];
  } catch (error) {
    console.error("Error fetching countries:", error);
    throw error;
  }
};
