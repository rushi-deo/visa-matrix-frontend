import { optionalEmail, optionalString } from "./validationHelpers.js";

export const validateSelfProfileUpdateBody = (body = {}) => ({
  name: optionalString(body.name, "name"),
  email: optionalEmail(body.email, "email"),
  phone: optionalString(body.phone, "phone"),
});
