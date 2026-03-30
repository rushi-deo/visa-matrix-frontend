import apiClient, { API_ENDPOINTS, extractResponseData } from "./apiClient";
import {
  getApplications as getFallbackApplications,
  getChecklistCatalog,
  getDocuments as getFallbackDocuments,
  getVisaDocumentChecklists,
} from "./mockApi";

const cloneRows = (rows = []) => rows.map((row) => ({ ...row }));

const normalizeDocument = (document = {}) => ({
  ...document,
  id: document.id ?? document.document_id ?? `DOC-${Date.now()}`,
  documentName: document.documentName ?? document.document_name ?? "Document",
  applicationId: document.applicationId ?? document.application_id ?? "",
  uploadedBy: document.uploadedBy ?? document.uploaded_by ?? "Operations Team",
  uploadDate:
    document.uploadDate ??
    document.upload_date ??
    new Date().toISOString().slice(0, 10),
  fileName: document.fileName ?? document.file_name ?? "file",
  fileType: document.fileType ?? document.file_type ?? "FILE",
});

export const fallbackChecklistCatalog = getChecklistCatalog();
export const fallbackVisaDocumentChecklists = getVisaDocumentChecklists();
export const fallbackApplications = getFallbackApplications();

export async function fetchDocuments(fallbackData = getFallbackDocuments()) {
  try {
    const response = await apiClient.get(API_ENDPOINTS.documents);
    const documents = extractResponseData(response);

    return Array.isArray(documents) && documents.length > 0
      ? documents.map(normalizeDocument)
      : cloneRows(fallbackData);
  } catch {
    return cloneRows(fallbackData);
  }
}

export function buildUploadedDocumentRows({
  applicationId,
  documentName,
  uploadedBy,
  files = [],
}) {
  const today = new Date().toISOString().slice(0, 10);

  return files.map((file, index) => ({
    id: `DOC-${Date.now().toString().slice(-4)}${index}`,
    documentName,
    applicationId,
    uploadedBy,
    uploadDate: today,
    fileName: file.name,
    fileType: file.name.split(".").pop()?.toUpperCase() ?? "FILE",
  }));
}

export async function uploadDocuments({
  applicationId,
  documentName,
  uploadedBy,
  files = [],
}) {
  const fallbackDocuments = buildUploadedDocumentRows({
    applicationId,
    documentName,
    uploadedBy,
    files,
  });

  try {
    const formData = new FormData();
    formData.append("applicationId", applicationId);
    formData.append("documentName", documentName);
    formData.append("uploadedBy", uploadedBy);

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await apiClient.post(API_ENDPOINTS.documentsUpload, formData);
    const documents = extractResponseData(response);

    return Array.isArray(documents) && documents.length > 0
      ? documents.map(normalizeDocument)
      : fallbackDocuments;
  } catch {
    return fallbackDocuments;
  }
}
