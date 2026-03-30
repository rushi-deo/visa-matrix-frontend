import {
  optionalString,
  requireIdentifier,
  requireString,
} from "./validationHelpers.js";

export const validatePollParams = (params) => ({
  id: requireIdentifier(params.id, "id"),
});

export const validateCreatePollBody = (body = {}) => ({
  question: requireString(body.question, "question"),
});

export const validatePollResponseBody = (body = {}) => ({
  answer: requireString(body.answer, "answer"),
  employee_id: optionalString(body.employee_id, "employee_id"),
});

export const validateFeedbackBody = (body = {}) => ({
  from_employee: optionalString(body.from_employee, "from_employee"),
  to_employee: requireIdentifier(body.to_employee, "to_employee"),
  message: requireString(body.message, "message"),
});

export const validateKudosBody = (body = {}) => ({
  from_employee: optionalString(body.from_employee, "from_employee"),
  to_employee: requireIdentifier(body.to_employee, "to_employee"),
  message: requireString(body.message, "message"),
});
