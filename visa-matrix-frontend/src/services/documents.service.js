import { supabase } from "../supabase";
import { getChecklistCatalog, getVisaDocumentChecklists } from "./mockApi";

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

function getDocumentsTable() {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  return supabase.from("documents");
}

export async function fetchDocuments() {
  const { data, error } = await getDocumentsTable().select("*");
  console.log("Supabase documents response:", data);

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data.map(normalizeDocument) : [];
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
  const nextDocuments = buildUploadedDocumentRows({
    applicationId,
    documentName,
    uploadedBy,
    files,
  });

  const { data, error } = await getDocumentsTable().insert(nextDocuments).select();
  console.log("Supabase documents upload response:", data);

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data.map(normalizeDocument) : nextDocuments;
}
