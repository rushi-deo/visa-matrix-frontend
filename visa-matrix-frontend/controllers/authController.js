import {
  buildUserContext,
  getRolePermissionsMap,
  getUserByEmail,
  listUsers,
} from "../services/accessControlService.js";
import { signToken } from "../services/authService.js";

export const loginHandler = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: "Email is required.",
    });
  }

  const user = await getUserByEmail(email);
  const enrichedUser = await buildUserContext(user);
  const token = signToken({
    sub: enrichedUser.id,
    role: enrichedUser.role,
    organization_id: enrichedUser.organization_id,
  });

  return res.status(200).json({
    success: true,
    data: {
      token,
      user: enrichedUser,
      users: await listUsers(),
      rolePermissions: await getRolePermissionsMap(),
    },
  });
};

export const sessionHandler = async (req, res) =>
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
      users: await listUsers(),
      rolePermissions: await getRolePermissionsMap(),
    },
  });
