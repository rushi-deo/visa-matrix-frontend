import { createForbiddenError, createUnauthorizedError } from "../errors.js";

const normalizePermissions = (user) => user?.permissions ?? {};

export const requireHrPermission =
  (moduleName = "hr", action = "view", allowedRoles = []) =>
  (req, res, next) => {
    if (!req.user) {
      next(createUnauthorizedError());
      return;
    }

    if (req.user.role === "admin") {
      next();
      return;
    }

    if (allowedRoles.length > 0 && allowedRoles.includes(req.user.role)) {
      next();
      return;
    }

    const allowedActions = normalizePermissions(req.user)[moduleName] ?? [];
    if (!allowedActions.includes(action) && !(normalizePermissions(req.user).hr ?? []).includes(action)) {
      next(createForbiddenError(`Missing permission for ${moduleName}.${action}.`));
      return;
    }

    next();
  };

