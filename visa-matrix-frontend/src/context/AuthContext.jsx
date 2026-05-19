import React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AUTH_STORAGE_KEY,
  ERP_MODULES,
  ERP_ROLES,
  ROLE_PERMISSIONS,
  hasModulePermission,
} from "../data/accessControl";
import { loginUser } from "../services/authService";
import {
  fetchAdminPermissions,
  fetchAdminRoles,
  fetchAdminUsers,
  fetchCurrentAccessProfile,
  fetchRolePermissions,
  updateRolePermissions,
  updateUserRole,
  updateUserStatus,
} from "../services/adminService";

const AuthContext = createContext(null);
const PERMISSION_ALIASES = {
  invoicing: ["invoices", "payments"],
  invoices: ["invoicing"],
  payments: ["invoicing"],
  notifications: ["communications"],
  communications: ["notifications"],
  workflow: ["workflows"],
  workflows: ["workflow"],
};

const normalizeRoleKey = (role = "") =>
  String(role)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const permissionName = (moduleName, action) => `${moduleName}:${action}`;

function buildPermissionMap(roles, rolePermissionPayloads) {
  return roles.reduce((permissionMap, role) => {
    const roleKey = role.name ?? role.code ?? role.id;
    const normalizedRoleKey = normalizeRoleKey(roleKey);
    const permissions = rolePermissionPayloads[role.id] ?? [];

    const moduleActions = permissions.reduce((nextMap, permission) => {
      if (!permission?.module || !permission?.action) {
        return nextMap;
      }

      nextMap[permission.module] = [
        ...new Set([...(nextMap[permission.module] ?? []), permission.action]),
      ];
      return nextMap;
    }, {});

    return {
      ...permissionMap,
      [roleKey]: moduleActions,
      [normalizedRoleKey]: moduleActions,
    };
  }, {});
}

function normalizeUser(user = {}) {
  const emailPrefix = user.email?.split("@")[0] ?? "visa-matrix-user";

  return {
    id: user.id ?? user.user_id ?? emailPrefix,
    name: user.name ?? user.full_name ?? user.email ?? emailPrefix,
    email: user.email ?? "",
    role: user.role ?? "counselor",
    roleId: user.roleId ?? user.role_id ?? null,
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
    organization_id: user.organization_id ?? user.organizationId ?? "visa-matrix",
    organization_name: user.organization_name ?? user.organizationName ?? "Visa Matrix",
    is_external: user.is_external ?? user.isExternal ?? false,
    ...user,
  };
}

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const session = rawSession ? JSON.parse(rawSession) : null;

    if (!session?.token || !session?.user) {
      return null;
    }

    return {
      token: session.token,
      user: normalizeUser(session.user),
    };
  } catch {
    return null;
  }
}

function persistSession(nextSession) {
  if (typeof window === "undefined") {
    return;
  }

  if (!nextSession?.token || !nextSession?.user) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [rolePermissions, setRolePermissions] = useState(ROLE_PERMISSIONS);
  const [rbacRoles, setRbacRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [managedUsers, setManagedUsers] = useState([]);

  const applySession = useCallback((nextSession) => {
    if (!nextSession?.token || !nextSession?.user) {
      setUserState(null);
      setToken("");
      setManagedUsers([]);
      persistSession(null);
      return;
    }

    const nextUser = normalizeUser(nextSession.user);

    setUserState(nextUser);
    setToken(nextSession.token);
    setManagedUsers((previousUsers) => {
      const withoutCurrent = previousUsers.filter((item) => item.id !== nextUser.id);
      return [nextUser, ...withoutCurrent];
    });
    persistSession({ token: nextSession.token, user: nextUser });
  }, []);

  useEffect(() => {
    applySession(readStoredSession());
    setLoading(false);

    const handleExpiredSession = () => {
      applySession(null);
    };

    window.addEventListener("visa-matrix:auth-expired", handleExpiredSession);

    return () => {
      window.removeEventListener("visa-matrix:auth-expired", handleExpiredSession);
    };
  }, [applySession]);

  useEffect(() => {
    if (!token || !user) {
      setRbacRoles([]);
      setAllPermissions([]);
      return;
    }

    let cancelled = false;

    async function loadAccessProfile() {
      try {
        const profile = await fetchCurrentAccessProfile();

        if (!cancelled && profile) {
          applySession({
            token,
            user: {
              ...user,
              ...profile,
              id: profile.id ?? profile.userId ?? user.id,
              roleId: profile.roleId ?? user.roleId,
            },
          });
        }
      } catch {
        // Keep the signed-in session usable when the admin profile endpoint is unavailable.
      }
    }

    loadAccessProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    let cancelled = false;

    async function loadRbacData() {
      try {
        const [roles, permissions] = await Promise.all([
          fetchAdminRoles(),
          fetchAdminPermissions(),
        ]);
        const rolePermissionEntries = await Promise.all(
          roles.map(async (role) => {
            const payload = await fetchRolePermissions(role.id);
            return [role.id, payload?.permissions ?? []];
          }),
        );
        const rolePermissionPayloads = Object.fromEntries(rolePermissionEntries);

        if (!cancelled) {
          setRbacRoles(roles);
          setAllPermissions(permissions);
          setRolePermissions((previousPermissions) => ({
            ...previousPermissions,
            ...buildPermissionMap(roles, rolePermissionPayloads),
          }));
        }
      } catch {
        // Static fallbacks are intentionally kept until the RBAC tables are seeded.
      }

      try {
        const result = await fetchAdminUsers();

        if (!cancelled) {
          setManagedUsers(result.items);
        }
      } catch {
        // Non-admin users may not be allowed to list users; keep local session user.
      }
    }

    loadRbacData();

    return () => {
      cancelled = true;
    };
  }, [token, user?.id]);

  const login = useCallback(
    async ({ email, password }) => {
      setLoading(true);

      try {
        const authSession = await loginUser({ email, password });
        applySession(authSession);
        return authSession;
      } finally {
        setLoading(false);
      }
    },
    [applySession],
  );

  const logout = useCallback(() => {
    applySession(null);
  }, [applySession]);

  const setUser = useCallback(
    (nextUser) => {
      if (!nextUser || !token) {
        return;
      }

      applySession({ token, user: nextUser });
    },
    [applySession, token],
  );

  const canAccess = useCallback(
    (moduleName, action = "view") => {
      if (!user || !moduleName) {
        return false;
      }

      const directPermission = permissionName(moduleName, action);
      const aliasPermissions = (PERMISSION_ALIASES[moduleName] ?? []).map((alias) =>
        permissionName(alias, action),
      );
      const userPermissions = user.permissions ?? [];

      if (
        userPermissions.includes("*") ||
        userPermissions.includes(directPermission) ||
        aliasPermissions.some((permission) => userPermissions.includes(permission))
      ) {
        return true;
      }

      return (
        hasModulePermission(user.role, moduleName, action, rolePermissions) ||
        hasModulePermission(normalizeRoleKey(user.role), moduleName, action, rolePermissions)
      );
    },
    [rolePermissions, user],
  );

  const hasRole = useCallback(
    (allowedRoles = []) => {
      if (!allowedRoles.length) {
        return true;
      }

      const currentRole = normalizeRoleKey(user?.role);
      return Boolean(
        currentRole && allowedRoles.map(normalizeRoleKey).includes(currentRole),
      );
    },
    [user?.role],
  );

  const switchUser = useCallback(() => undefined, []);

  const updateRolePermissionMap = useCallback(
    async (role, moduleName, actions) => {
      const roleRecord =
        rbacRoles.find((item) => item.id === role || item.name === role || item.code === role) ??
        null;
      const nextPermissions = {
        ...rolePermissions,
        [role]: {
          ...(rolePermissions[role] ?? {}),
          [moduleName]: actions,
        },
      };

      setRolePermissions(nextPermissions);

      if (!roleRecord) {
        return;
      }

      const selectedRoleMap = nextPermissions[role] ?? nextPermissions[roleRecord.name] ?? {};
      const permissionIds = allPermissions
        .filter((permission) =>
          (selectedRoleMap[permission.module] ?? []).includes(permission.action),
        )
        .map((permission) => permission.id);

      await updateRolePermissions(roleRecord.id, permissionIds);
    },
    [allPermissions, rbacRoles, rolePermissions],
  );

  const replaceRolePermissionMap = useCallback(
    async (role, nextModuleMap) => {
      const roleRecord =
        rbacRoles.find((item) => item.id === role || item.name === role || item.code === role) ??
        null;
      const roleKey = roleRecord?.name ?? role;
      const normalizedRoleKey = normalizeRoleKey(roleKey);

      setRolePermissions((previousPermissions) => ({
        ...previousPermissions,
        [roleKey]: nextModuleMap,
        [normalizedRoleKey]: nextModuleMap,
      }));

      if (!roleRecord?.id) {
        return;
      }

      const permissionIds = allPermissions
        .filter((permission) =>
          (nextModuleMap[permission.module] ?? []).includes(permission.action),
        )
        .map((permission) => permission.id);

      await updateRolePermissions(roleRecord.id, permissionIds);
    },
    [allPermissions, rbacRoles],
  );

  const assignUserRole = useCallback(
    async (userId, role, organizationId) => {
      const roleRecord =
        rbacRoles.find((item) => item.id === role || item.name === role || item.code === role) ??
        null;
      const nextRoleName = roleRecord?.name ?? role;
      setManagedUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === userId
            ? { ...item, role: nextRoleName, roleId: roleRecord?.id ?? item.roleId, organization_id: organizationId }
            : item,
        ),
      );

      if (user?.id === userId) {
        setUser({ ...user, role: nextRoleName, roleId: roleRecord?.id, organization_id: organizationId });
      }

      if (roleRecord?.id) {
        const updatedUser = await updateUserRole(userId, roleRecord.id);
        setManagedUsers((previousUsers) =>
          previousUsers.map((item) => (item.id === userId ? updatedUser : item)),
        );
      }
    },
    [rbacRoles, setUser, user],
  );

  const setUserStatus = useCallback(async (userId, isActive) => {
    setManagedUsers((previousUsers) =>
      previousUsers.map((item) =>
        item.id === userId
          ? { ...item, is_active: isActive, status: isActive ? "active" : "inactive" }
          : item,
      ),
    );

    const updatedUser = await updateUserStatus(userId, isActive);
    setManagedUsers((previousUsers) =>
      previousUsers.map((item) => (item.id === userId ? updatedUser : item)),
    );
  }, []);

  const moduleList = useMemo(() => {
    const modulesFromPermissions = [
      ...new Set(allPermissions.map((permission) => permission.module).filter(Boolean)),
    ];

    return modulesFromPermissions.length > 0 ? modulesFromPermissions : ERP_MODULES;
  }, [allPermissions]);

  const roleNames = useMemo(() => {
    const namesFromApi = rbacRoles.map((role) => role.name || role.code).filter(Boolean);
    return namesFromApi.length > 0 ? namesFromApi : ERP_ROLES;
  }, [rbacRoles]);

  const value = useMemo(
    () => ({
      user,
      currentUser: user,
      setUser,
      token,
      role: user?.role ?? "",
      loading,
      isAuthenticated: Boolean(token && user),
      session: token && user ? { token, user } : null,
      rbacRoles,
      allPermissions,
      roles: roleNames,
      modules: moduleList,
      users: managedUsers,
      rolePermissions,
      permissions: rolePermissions[user?.role] ?? {},
      login,
      logout,
      canAccess,
      hasRole,
      switchUser,
      assignUserRole,
      setUserStatus,
      updateRolePermissionMap,
      replaceRolePermissionMap,
    }),
    [
      assignUserRole,
      canAccess,
      hasRole,
      loading,
      login,
      logout,
      managedUsers,
      moduleList,
      roleNames,
      rolePermissions,
      rbacRoles,
      allPermissions,
      setUser,
      setUserStatus,
      replaceRolePermissionMap,
      switchUser,
      token,
      updateRolePermissionMap,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
