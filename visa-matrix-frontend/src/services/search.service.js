import apiClient, { extractResponseData } from "./apiClient";

export async function searchWorkspace(query, limit = 8) {
  const normalizedQuery = String(query ?? "").trim();

  if (!normalizedQuery) {
    return [];
  }

  try {
    const response = await apiClient.get("/search", {
      params: {
        q: normalizedQuery,
        limit,
      },
    });
    const results = extractResponseData(response);

    return Array.isArray(results) ? results : [];
  } catch {
    return [];
  }
}
