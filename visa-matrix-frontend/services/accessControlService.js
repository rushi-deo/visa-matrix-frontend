import { supabase } from "../config/supabaseClient.js";

const MODULES = ["settings", "hr", "invoicing", "notifications", "audit_logs"];
const ACTIONS = ["view", "create", "edit", "delete", "approve"];

export const seededOrganizations = [
  { id: "ORG-INTERNAL", name: "Visa Matrix Internal", is_external: false },
  { id: "ORG-AGENCY-1", name: "Nexa Travels", is_external: true },
];

export const seededUsers = [
  {
    id: "USR-ADMIN-1",
    name: "Aarav Admin",
    email: "admin@visamatrix.local",
    role: "admin",
    organization_id: "ORG-INTERNAL",
    is_external: false,
  },
  {
    id: "USR-MANAGER-1",
    name: "Meera Manager",
    email: "manager@visamatrix.local",
    role: "manager",
    organization_id: "ORG-INTERNAL",
    is_external: false,
  },
  {
    id: "USR-AGENT-1",
    name: "Rohan Agent",
    email: "agent@visamatrix.local",
    role: "agent",
    organization_id: "ORG-INTERNAL",
    is_external: false,
  },
  {
    id: "USR-EXT-1",
    name: "Nexa Travels",
    email: "agency@visamatrix.local",
    role: "external_user",
    organization_id: "ORG-AGENCY-1",
    is_external: true,
  },
];

const fallbackRolePermissions = {
  admin: {
    settings: [...ACTIONS],
    hr: [...ACTIONS],
    invoicing: [...ACTIONS],
    notifications: ["view", "create", "edit", "delete"],
    audit_logs: ["view"],
  },
  manager: {
    settings: ["view"],
    hr: ["view", "edit", "approve"],
    invoicing: ["view", "create", "edit", "approve"],
    notifications: ["view", "create"],
    audit_logs: ["view"],
  },
  agent: {
    hr: ["view"],
    invoicing: ["view", "create"],
    notifications: ["view"],
  },
  external_user: {
    invoicing: ["view"],
    notifications: ["view"],
  },
};

const getOrganizationName = (organizationId) =>
  seededOrganizations.find((organization) => organization.id === organizationId)?.name ?? "Unknown";

export const getRolePermissionsMap = async () => {
  try {
    const { data, error } = await supabase.from("role_permissions").select("*");

    if (error || !data?.length) {
      return fallbackRolePermissions;
    }

    return data.reduce((accumulator, record) => {
      const role = record.role_name || record.role || "agent";
      const currentRole = accumulator[role] ?? {};
      const actions = currentRole[record.module] ?? [];

      return {
        ...accumulator,
        [role]: {
          ...currentRole,
          [record.module]: [...new Set([...actions, record.action])],
        },
      };
    }, {});
  } catch {
    return fallbackRolePermissions;
  }
};

export const listAccessControlMeta = async () => ({
  roles: Object.keys(fallbackRolePermissions),
  modules: MODULES,
  actions: ACTIONS,
  organizations: seededOrganizations,
  rolePermissions: await getRolePermissionsMap(),
});

export const getUserByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      const fallbackUser = seededUsers.find((user) => user.email === email);
      if (!fallbackUser) {
        throw new Error("User not found.");
      }
      return fallbackUser;
    }

    return data;
  } catch {
    const fallbackUser = seededUsers.find((user) => user.email === email);
    if (!fallbackUser) {
      throw new Error("User not found.");
    }
    return fallbackUser;
  }
};

export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      const fallbackUser = seededUsers.find((user) => user.id === userId);
      if (!fallbackUser) {
        throw new Error("User not found.");
      }
      return fallbackUser;
    }

    return data;
  } catch {
    const fallbackUser = seededUsers.find((user) => user.id === userId);
    if (!fallbackUser) {
      throw new Error("User not found.");
    }
    return fallbackUser;
  }
};

export const buildUserContext = async (userRecord) => {
  const rolePermissions = await getRolePermissionsMap();

  return {
    ...userRecord,
    organization_name: userRecord.organization_name ?? getOrganizationName(userRecord.organization_id),
    permissions: rolePermissions[userRecord.role] ?? {},
  };
};

export const hasRoleAccess = (user, allowedRoles = []) =>
  allowedRoles.length === 0 || allowedRoles.includes(user.role);

export const hasPermission = (user, rolePermissions, moduleName, action) => {
  if (user.role === "admin") {
    return true;
  }

  const allowedActions = rolePermissions[user.role]?.[moduleName] ?? [];
  return allowedActions.includes(action);
};

export const canAccessOrganization = (user, organizationId) =>
  user.role === "admin" || !organizationId || user.organization_id === organizationId;

export const updateRolePermission = async ({ role, module, actions }) => {
  fallbackRolePermissions[role] = {
    ...(fallbackRolePermissions[role] ?? {}),
    [module]: actions,
  };

  try {
    await supabase.from("role_permissions").delete().eq("role_name", role).eq("module", module);

    if (actions.length > 0) {
      await supabase.from("role_permissions").insert(
        actions.map((action) => ({
          role_name: role,
          module,
          action,
        })),
      );
    }
  } catch {
    // Fallback permissions remain available in memory.
  }

  return fallbackRolePermissions;
};

export const listUsers = async () => {
  try {
    const { data, error } = await supabase.from("users").select("*").order("name");

    if (error || !data?.length) {
      return seededUsers.map((user) => ({
        ...user,
        organization_name: getOrganizationName(user.organization_id),
      }));
    }

    return data.map((user) => ({
      ...user,
      organization_name: getOrganizationName(user.organization_id),
    }));
  } catch {
    return seededUsers.map((user) => ({
      ...user,
      organization_name: getOrganizationName(user.organization_id),
    }));
  }
};

export const updateUserRoleAssignment = async ({ userId, role, organization_id }) => {
  const fallbackUserIndex = seededUsers.findIndex((user) => user.id === userId);
  if (fallbackUserIndex >= 0) {
    seededUsers[fallbackUserIndex] = {
      ...seededUsers[fallbackUserIndex],
      role,
      organization_id,
    };
  }

  try {
    await supabase
      .from("users")
      .update({
        role,
        organization_id,
      })
      .eq("id", userId);
  } catch {
    // In-memory fallback stays in sync even when the database is unavailable.
  }

  return listUsers();
};
