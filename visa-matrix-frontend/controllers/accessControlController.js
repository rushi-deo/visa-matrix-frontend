import {
  listAccessControlMeta,
  listUsers,
  updateRolePermission,
  updateUserRoleAssignment,
} from "../services/accessControlService.js";
import { getAuditLogs } from "../services/auditLogService.js";
import { getNotifications } from "../services/notificationService.js";

export const getAccessControlMetaHandler = async (req, res) =>
  res.status(200).json({
    success: true,
    data: {
      ...(await listAccessControlMeta()),
      users: await listUsers(),
    },
  });

export const updateRolePermissionHandler = async (req, res) => {
  const { role, module, actions } = req.body;

  if (!role || !module || !Array.isArray(actions)) {
    return res.status(400).json({
      success: false,
      error: "role, module, and actions are required.",
    });
  }

  return res.status(200).json({
    success: true,
    data: await updateRolePermission({ role, module, actions }),
  });
};

export const updateUserRoleHandler = async (req, res) => {
  const { userId, role, organization_id } = req.body;

  if (!userId || !role || !organization_id) {
    return res.status(400).json({
      success: false,
      error: "userId, role, and organization_id are required.",
    });
  }

  return res.status(200).json({
    success: true,
    data: await updateUserRoleAssignment({ userId, role, organization_id }),
  });
};

export const getNotificationsHandler = async (req, res) =>
  res.status(200).json({
    success: true,
    data: await getNotifications(req.user),
  });

export const getAuditLogsHandler = async (req, res) =>
  res.status(200).json({
    success: true,
    data: await getAuditLogs({
      user: req.user,
      filters: req.query,
    }),
  });
