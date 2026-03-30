import axios from "axios";

// ✅ Base API URL (make sure backend is running on 3001)
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Axios instance (clean + scalable)
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ GET ALL COUNTRIES
export const fetchCountries = async () => {
  try {
    const response = await api.get("/countries");

    // API returns: { success: true, data: [...] }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching countries:", error);
    throw error;
  }
};
