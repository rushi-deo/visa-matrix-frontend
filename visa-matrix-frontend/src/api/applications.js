import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ GET ALL APPLICATIONS
export async function fetchApplications() {
  const response = await axios.get(`${BASE_URL}/applications`);
  return response.data.data;
}

// ✅ CREATE APPLICATION
export async function createApplication(payload) {
  const response = await axios.post(`${BASE_URL}/applications`, payload);
  return response.data;
}
