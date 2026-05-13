import React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = "visa-matrix-auth";
const fallbackRoles = ["admin", "manager", "agent", "external_user"];
const fallbackModules = {
  settings: ["view", "create", "edit", "delete", "approve"],
  hr: ["view", "create", "edit", "delete", "approve"],
  invoicing: ["view", "create", "edit", "delete", "approve"],
  notifications: ["view", "create", "edit", "delete"],
  audit_logs: ["view"],
};

const fallbackPermissions = {
  admin: fallbackModules,
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

const fallbackUsers = [
  {
    id: "USR-ADMIN-1",
    name: "Aarav Admin",
    email: "admin@visamatrix.local",
    role: "admin",
    organization_id: "ORG-INTERNAL",
    organization_name: "Visa Matrix Internal",
    is_external: false,
  },
  {
    id: "USR-MANAGER-1",
    name: "Meera Manager",
    email: "manager@visamatrix.local",
    role: "manager",
    organization_id: "ORG-INTERNAL",
    organization_name: "Visa Matrix Internal",
    is_external: false,
  },
  {
    id: "USR-AGENT-1",
    name: "Rohan Agent",
    email: "agent@visamatrix.local",
    role: "agent",
    organization_id: "ORG-INTERNAL",
    organization_name: "Visa Matrix Internal",
    is_external: false,
  },
  {
    id: "USR-EXT-1",
    name: "Nexa Travels",
    email: "agency@visamatrix.local",
    role: "external_user",
    organization_id: "ORG-AGENCY-1",
    organization_name: "Nexa Travels",
    is_external: true,
  },
];

const buildPermissionMap = (role) => fallbackPermissions[role] ?? {};

function getStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
}

function setStoredSession(nextSession) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (!nextSession?.token) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
  } catch {
    // Local persistence is optional; auth state still lives in memory.
  }
}

function buildCurrentUser(authUser) {
  if (!authUser) {
    return null;
  }

  const matchedUser = fallbackUsers.find((user) => user.email === authUser.email);
  const metadata = authUser.user_metadata ?? {};
  const emailPrefix = authUser.email?.split("@")[0] ?? "visa-matrix-user";

  return {
    id: authUser.id ?? matchedUser?.id ?? emailPrefix,
    name: metadata.full_name ?? metadata.name ?? matchedUser?.name ?? emailPrefix,
    email: authUser.email ?? matchedUser?.email ?? "",
    role: metadata.role ?? matchedUser?.role ?? "agent",
    organization_id:
      metadata.organization_id ?? matchedUser?.organization_id ?? "ORG-INTERNAL",
    organization_name:
      metadata.organization_name ?? matchedUser?.organization_name ?? "Visa Matrix",
    is_external: metadata.is_external ?? matchedUser?.is_external ?? false,
  };
}

function mergeUsers(existingUsers, nextUser) {
  if (!nextUser) {
    return existingUsers;
  }

  const userExists = existingUsers.some((user) => user.email === nextUser.email);

  if (!userExists) {
    return [nextUser, ...existingUsers];
  }

  return existingUsers.map((user) =>
    user.email === nextUser.email ? { ...user, ...nextUser } : user,
  );
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState("");
  const [users, setUsers] = useState(fallbackUsers);
  const [rolePermissions, setRolePermissions] = useState(fallbackPermissions);
  const [loading, setLoading] = useState(true);

  const setUser = (nextUser) => {
    setCurrentUser(nextUser);
    setUsers((previousUsers) => mergeUsers(previousUsers, nextUser));
    setStoredSession({
      ...(getStoredSession() ?? {}),
      token,
      user: nextUser,
    });
  };

  useEffect(() => {
    let isMounted = true;

    const applySession = (nextSession) => {
      if (!isMounted) {
        return;
      }

      const nextUser = buildCurrentUser(nextSession?.user ?? null);

      setSession(nextSession ?? null);
      setToken(nextSession?.access_token ?? "");
      setCurrentUser(nextUser);
      setUsers((previousUsers) => mergeUsers(previousUsers, nextUser));
      setStoredSession({
        token: nextSession?.access_token ?? "",
        user: nextUser,
      });
      setLoading(false);
    };

    if (!supabase) {
      const storedSession = getStoredSession();

      if (storedSession?.user) {
        setToken(storedSession.token ?? "");
        setCurrentUser(storedSession.user);
        setUsers((previousUsers) => mergeUsers(previousUsers, storedSession.user));
      }

      setLoading(false);
      return undefined;
    }

    const initializeSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        applySession(data.session ?? null);
      } catch {
        applySession(null);
      }
    };

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      console.log("Auth Event:", event);

      if (nextSession) {
        console.log("Authenticated");
      } else {
        console.log("No Session");
      }

      applySession(nextSession ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const switchUser = async (email) => {
    const selectedUser = users.find((user) => user.email === email);

    if (selectedUser) {
      setCurrentUser(selectedUser);
      setStoredSession({
        ...(getStoredSession() ?? {}),
        token,
        user: selectedUser,
      });
    }
  };

  const updateRolePermissionMap = async (role, moduleName, actions) => {
    const nextPermissions = {
      ...rolePermissions,
      [role]: {
        ...(rolePermissions[role] ?? {}),
        [moduleName]: actions,
      },
    };

    setRolePermissions(nextPermissions);

    try {
      await apiRequest("/access-control/role-permissions", {
        method: "PUT",
        body: JSON.stringify({
          role,
          module: moduleName,
          actions,
        }),
      });
    } catch {
      // Frontend fallback keeps the UI responsive when the API is unavailable.
    }
  };

  const assignUserRole = async (userId, role, organizationId) => {
    const nextUsers = users.map((user) =>
      user.id === userId ? { ...user, role, organization_id: organizationId } : user,
    );

    setUsers(nextUsers);

    if (currentUser?.id === userId) {
      setCurrentUser((previousUser) =>
        previousUser ? { ...previousUser, role, organization_id: organizationId } : previousUser,
      );
    }

    try {
      await apiRequest("/access-control/users/role", {
        method: "PUT",
        body: JSON.stringify({
          userId,
          role,
          organization_id: organizationId,
        }),
      });
    } catch {
      // Frontend fallback keeps the UI responsive when the API is unavailable.
    }
  };

  const value = useMemo(() => {
    const permissions = buildPermissionMap(currentUser?.role);

    return {
      session,
      user: currentUser,
      setUser,
      isAuthenticated: Boolean(currentUser),
      loading,
      token,
      currentUser,
      users,
      roles: fallbackRoles,
      modules: Object.keys(fallbackModules),
      rolePermissions,
      permissions,
      canAccess(moduleName, action = "view") {
        const moduleActions =
          rolePermissions[currentUser?.role]?.[moduleName] ??
          permissions[moduleName] ??
          [];

        return moduleActions.includes(action);
      },
      switchUser,
      assignUserRole,
      updateRolePermissionMap,
    };
  }, [currentUser, loading, rolePermissions, session, token, users]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
