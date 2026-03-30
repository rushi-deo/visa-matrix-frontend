import apiClient, { API_ENDPOINTS, extractResponseData } from "./apiClient";
import { getApplications as getFallbackApplications } from "./mockApi";

const cloneRows = (rows = []) => rows.map((row) => ({ ...row }));

const normalizeApplication = (application = {}) => ({
  ...application,
  id: application.id ?? application.application_id ?? "",
});

export async function fetchApplications(fallbackData = getFallbackApplications()) {
  try {
    const response = await apiClient.get(API_ENDPOINTS.applications);
    const applications = extractResponseData(response);

    return Array.isArray(applications) && applications.length > 0
      ? applications.map(normalizeApplication)
      : cloneRows(fallbackData);
  } catch {
    return cloneRows(fallbackData);
  }
}

export async function createApplication(
  payload,
  fallbackApplication = payload,
) {
  try {
    const response = await apiClient.post(API_ENDPOINTS.applications, payload);
    const application = extractResponseData(response);

    return application ? normalizeApplication(application) : { ...fallbackApplication };
  } catch {
    return { ...fallbackApplication };
  }
}

export async function updateApplication(
  applicationId,
  payload,
  fallbackApplication,
) {
  try {
    const response = await apiClient.patch(
      API_ENDPOINTS.applicationById(applicationId),
      payload,
    );
    const application = extractResponseData(response);

    return application
      ? normalizeApplication(application)
      : { ...fallbackApplication, ...payload };
  } catch {
    return { ...fallbackApplication, ...payload };
  }
}
