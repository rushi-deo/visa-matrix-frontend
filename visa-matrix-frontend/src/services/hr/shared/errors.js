export class HrModuleError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "HrModuleError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const createValidationError = (message, details = null) =>
  new HrModuleError(message, 400, details);

export const createUnauthorizedError = (message = "Authentication required.") =>
  new HrModuleError(message, 401);

export const createForbiddenError = (message = "You do not have access to this action.") =>
  new HrModuleError(message, 403);

export const createNotFoundError = (entityName = "Resource") =>
  new HrModuleError(`${entityName} not found.`, 404);

