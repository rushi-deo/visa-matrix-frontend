import { optionalBoolean, optionalString, requireString } from "./validationHelpers.js";

export const validateCreateAnnouncementBody = (body = {}) => ({
  title: requireString(body.title, "title"),
  message: requireString(body.message, "message"),
});

export const validateListNotificationsQuery = (query = {}) => ({
  employee_id: optionalString(query.employee_id, "employee_id"),
  read_status: optionalBoolean(query.read_status, "read_status"),
});
