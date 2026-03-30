import { createHttpError } from "../services/hrErrorService.js";

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const normalizeDate = (value, fieldName, required = false) => {
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw createHttpError(400, `${fieldName} is required.`);
    }

    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, `${fieldName} must be a valid date.`);
  }

  return date.toISOString().slice(0, 10);
};

export const requireString = (value, fieldName) => {
  if (!isNonEmptyString(value)) {
    throw createHttpError(400, `${fieldName} is required.`);
  }

  return value.trim();
};

export const optionalString = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw createHttpError(400, `${fieldName} must be a string.`);
  }

  return value.trim();
};

export const optionalEmail = (value, fieldName) => {
  const normalized = optionalString(value, fieldName);
  if (normalized === undefined) {
    return undefined;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(normalized)) {
    throw createHttpError(400, `${fieldName} must be a valid email address.`);
  }

  return normalized.toLowerCase();
};

export const requireEmail = (value, fieldName) => {
  const email = optionalEmail(value, fieldName);
  if (!email) {
    throw createHttpError(400, `${fieldName} is required.`);
  }

  return email;
};

export const optionalEnum = (value, fieldName, allowedValues) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (!allowedValues.includes(value)) {
    throw createHttpError(400, `${fieldName} must be one of: ${allowedValues.join(", ")}.`);
  }

  return value;
};

export const requireEnum = (value, fieldName, allowedValues) => {
  const normalized = optionalEnum(value, fieldName, allowedValues);
  if (!normalized) {
    throw createHttpError(400, `${fieldName} is required.`);
  }

  return normalized;
};

export const optionalDate = (value, fieldName) => normalizeDate(value, fieldName, false);

export const requireDate = (value, fieldName) => normalizeDate(value, fieldName, true);

export const optionalBoolean = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw createHttpError(400, `${fieldName} must be a boolean.`);
};

export const optionalArray = (value, fieldName) => {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw createHttpError(400, `${fieldName} must be an array.`);
  }

  return value;
};

export const ensureObject = (value, fieldName) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw createHttpError(400, `${fieldName} must be an object.`);
  }

  return value;
};

export const requireIdentifier = (value, fieldName) => requireString(value, fieldName);
