import path from "path";
import { supabase } from "../../../config/supabaseClient.js";
import { createDocument, listDocumentsByEmployee } from "../models/documentModel.js";
import { getEmployeeById } from "../models/employeeModel.js";
import { assertOrThrow } from "./hrErrorService.js";
import { resolveEmployeeForUser } from "./employeeService.js";

const buildStoragePath = (employeeId, fileName) =>
  `${employeeId}/${Date.now()}-${fileName.replace(/\s+/g, "-")}`;

const resolveDocumentEmployeeId = async (requestedEmployeeId, user) => {
  if (user.role === "employee") {
    const employee = await resolveEmployeeForUser(user);
    assertOrThrow(
      !requestedEmployeeId || requestedEmployeeId === employee.id,
      403,
      "Employees can only manage their own documents.",
    );
    return employee.id;
  }

  const employee = await getEmployeeById(requestedEmployeeId, user);
  assertOrThrow(employee, 404, "Employee not found.");
  return employee.id;
};

const uploadToStorage = async ({ bucket, storagePath, mimeType, contentBase64, fileUrl }) => {
  if (!contentBase64) {
    return fileUrl;
  }

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, Buffer.from(contentBase64, "base64"), {
        contentType: mimeType || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return data.publicUrl;
  } catch {
    return `memory://${bucket}/${storagePath}`;
  }
};

export const uploadEmployeeDocument = async (payload, user) => {
  const employeeId = await resolveDocumentEmployeeId(payload.employee_id, user);
  const bucket = payload.bucket || "hr-documents";
  const fileName = payload.file_name || path.basename(payload.file_url || "document.bin");
  const storagePath = buildStoragePath(employeeId, fileName);
  const fileUrl = await uploadToStorage({
    bucket,
    storagePath,
    mimeType: payload.mime_type,
    contentBase64: payload.content_base64,
    fileUrl: payload.file_url,
  });

  return createDocument(
    {
      employee_id: employeeId,
      type: payload.type,
      file_url: fileUrl,
      file_name: fileName,
      bucket_name: bucket,
      storage_path: storagePath,
    },
    user,
  );
};

export const getEmployeeDocuments = async (employeeId, user) => {
  const scopedEmployeeId = await resolveDocumentEmployeeId(employeeId, user);
  return listDocumentsByEmployee(scopedEmployeeId, user);
};
