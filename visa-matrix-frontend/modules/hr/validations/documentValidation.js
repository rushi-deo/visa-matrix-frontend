import {
  optionalString,
  requireIdentifier,
  requireString,
} from "./validationHelpers.js";
import { createHttpError } from "../services/hrErrorService.js";

export const validateDocumentParams = (params) => ({
  employee_id: requireIdentifier(params.employee_id, "employee_id"),
});

export const validateDocumentUploadBody = (body = {}) => {
  const payload = {
    employee_id: requireIdentifier(body.employee_id, "employee_id"),
    type: requireString(body.type, "type"),
    file_name: optionalString(body.file_name, "file_name"),
    mime_type: optionalString(body.mime_type, "mime_type"),
    bucket: optionalString(body.bucket, "bucket"),
    file_url: optionalString(body.file_url, "file_url"),
    content_base64: optionalString(body.content_base64, "content_base64"),
  };

  if (!payload.file_url && !payload.content_base64) {
    throw createHttpError(400, "Either file_url or content_base64 is required.");
  }

  return payload;
};
