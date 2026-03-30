export const createHttpError = (status, message, details = undefined) => {
  const error = new Error(message);
  error.status = status;

  if (details !== undefined) {
    error.details = details;
  }

  return error;
};

export const assertOrThrow = (condition, status, message, details = undefined) => {
  if (!condition) {
    throw createHttpError(status, message, details);
  }
};
