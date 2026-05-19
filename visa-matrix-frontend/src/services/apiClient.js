import axios from "axios";
import { AUTH_STORAGE_KEY } from "../data/accessControl";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_URL ??
  "http://localhost:5000/api";

export const API_ENDPOINTS = {
  applications: "/applications",
  applicationById: (applicationId) => `/applications/${applicationId}`,
  documents: "/documents",
  documentsUpload: "/documents/upload",
  documentsByApplication: (applicationId) => `/applications/${applicationId}/documents`,
  invoices: "/invoices",
  invoiceStatus: (invoiceId) => `/invoices/${invoiceId}/status`,
};

function getStoredToken() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const session = rawSession ? JSON.parse(rawSession) : null;
    return session?.token ?? "";
  } catch {
    return "";
  }
}

export function clearStoredAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function extractResponseData(response) {
  return response?.data?.data ?? response?.data ?? null;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const nextConfig = {
    ...config,
    headers: {
      ...(config.headers ?? {}),
    },
  };
  const token = getStoredToken();

  if (token && !nextConfig.headers.Authorization) {
    nextConfig.headers.Authorization = `Bearer ${token}`;
  }

  if (
    nextConfig.data &&
    typeof FormData !== "undefined" &&
    nextConfig.data instanceof FormData
  ) {
    delete nextConfig.headers["Content-Type"];
  } else if (
    nextConfig.data &&
    !nextConfig.headers["Content-Type"] &&
    nextConfig.method &&
    nextConfig.method.toLowerCase() !== "get"
  ) {
    nextConfig.headers["Content-Type"] = "application/json";
  }

  return nextConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredAuthSession();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("visa-matrix:auth-expired"));
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
