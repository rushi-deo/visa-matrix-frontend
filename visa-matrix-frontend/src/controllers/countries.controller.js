import { getCountries } from "../services/countries.service.js";

export const fetchCountries = async (req, res) => {
  try {
    console.log("Countries API (Production) HIT");
    const countries = await getCountries();
    return res.status(200).json({
      success: true,
      data: countries,
      count: countries.length,
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch countries",
      message: error.message,
    });
  }
};

export default {
  fetchCountries,
};
