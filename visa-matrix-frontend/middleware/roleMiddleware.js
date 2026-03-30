import { hasRoleAccess } from "../services/accessControlService.js";

export const roleMiddleware = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required.",
    });
  }

  if (!hasRoleAccess(req.user, allowedRoles)) {
    return res.status(403).json({
      success: false,
      error: "Role access denied.",
    });
  }

  next();
};
