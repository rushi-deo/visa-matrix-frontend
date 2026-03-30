import {
  canAccessOrganization,
  getRolePermissionsMap,
  hasPermission,
} from "../services/accessControlService.js";

export const permissionMiddleware = (moduleName, action) => async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required.",
    });
  }

  const rolePermissions = await getRolePermissionsMap();

  if (!hasPermission(req.user, rolePermissions, moduleName, action)) {
    return res.status(403).json({
      success: false,
      error: `Permission denied for ${moduleName}.${action}.`,
    });
  }

  const organizationId =
    req.body.organization_id || req.query.organization_id || req.params.organization_id;

  if (!canAccessOrganization(req.user, organizationId)) {
    return res.status(403).json({
      success: false,
      error: "Cross-organization access denied.",
    });
  }

  req.permission = { module: moduleName, action };
  next();
};
