import React, { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { updateRole } from "../services/adminService";

const actionOptions = ["view", "create", "edit", "delete", "approve"];

const formatLabel = (value = "") =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function Admin() {
  const {
    users,
    roles,
    rbacRoles,
    modules,
    allPermissions,
    rolePermissions,
    replaceRolePermissionMap,
    assignUserRole,
    setUserStatus,
    canAccess,
  } = useAuth();
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [permissionDraft, setPermissionDraft] = useState({});
  const [roleDraft, setRoleDraft] = useState({ name: "", description: "" });
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const roleRecords = useMemo(
    () =>
      rbacRoles.length > 0
        ? rbacRoles
        : roles.map((role) => ({ id: role, name: role, description: "" })),
    [rbacRoles, roles],
  );
  const selectedRole = roleRecords.find((role) => role.id === selectedRoleId) ?? roleRecords[0];

  const permissionModules = useMemo(() => {
    const modulesWithManagedActions = allPermissions
      .filter((permission) => actionOptions.includes(permission.action))
      .map((permission) => permission.module);

    return [...new Set(modulesWithManagedActions.length > 0 ? modulesWithManagedActions : modules)];
  }, [allPermissions, modules]);

  useEffect(() => {
    if (!selectedRoleId && roleRecords[0]?.id) {
      setSelectedRoleId(roleRecords[0].id);
    }
  }, [roleRecords, selectedRoleId]);

  useEffect(() => {
    if (!selectedRole) {
      return;
    }

    const existingMap =
      rolePermissions[selectedRole.name] ??
      rolePermissions[selectedRole.code] ??
      rolePermissions[selectedRole.id] ??
      {};

    setPermissionDraft(existingMap);
    setRoleDraft({
      name: selectedRole.name ?? "",
      description: selectedRole.description ?? "",
    });
  }, [rolePermissions, selectedRole]);

  const permissionRows = permissionModules.map((moduleName) => ({
    module: moduleName,
    actions: permissionDraft[moduleName] ?? [],
  }));

  const filteredUsers = users.filter((user) => {
    const query = userSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [user.name, user.full_name, user.email, user.organization_name, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    const matchesRole = !roleFilter || user.role === roleFilter || user.roleId === roleFilter;

    return matchesSearch && matchesRole;
  });

  const togglePermission = (moduleName, action) => {
    setPermissionDraft((previousDraft) => {
      const currentActions = previousDraft[moduleName] ?? [];
      const nextActions = currentActions.includes(action)
        ? currentActions.filter((item) => item !== action)
        : [...currentActions, action];

      return {
        ...previousDraft,
        [moduleName]: nextActions,
      };
    });
  };

  const saveRolePermissions = async () => {
    if (!selectedRole) {
      return;
    }

    setStatusMessage("Saving permissions...");
    await replaceRolePermissionMap(selectedRole.id, permissionDraft);
    setStatusMessage("Permissions saved.");
  };

  const saveRoleDetails = async () => {
    if (!selectedRole?.id || selectedRole.id === selectedRole.name) {
      return;
    }

    setStatusMessage("Saving role...");
    await updateRole(selectedRole.id, roleDraft);
    setStatusMessage("Role updated.");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings & Permissions"
        description="Manage organizations, role permissions, and module-level ERP access from live RBAC data."
      />

      <section className="workflow-grid">
        <article className="panel">
          <div className="panel__header panel__header--stacked">
            <div>
              <h3>Role Permission Matrix</h3>
              <p>Permissions are grouped by module and saved to backend role assignments.</p>
            </div>

            <div className="filter-row">
              <label className="filter-select">
                <span>Role</span>
                <select
                  onChange={(event) => setSelectedRoleId(event.target.value)}
                  value={selectedRole?.id ?? ""}
                >
                  {roleRecords.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name ?? role.code}
                    </option>
                  ))}
                </select>
              </label>
              <button className="primary-button" onClick={saveRolePermissions} type="button">
                Save permissions
              </button>
            </div>
          </div>

          <DataTable
            caption="Role permission management"
            columns={[
              {
                key: "module",
                label: "Module",
                render: (row) => formatLabel(row.module),
              },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <div className="permission-toggle-grid">
                    {actionOptions.map((action) => {
                      const permissionExists =
                        allPermissions.length === 0 ||
                        allPermissions.some(
                          (permission) =>
                            permission.module === row.module && permission.action === action,
                        );
                      const isActive = row.actions.includes(action);

                      return (
                        <label
                          className={`permission-toggle ${isActive ? "permission-toggle--active" : ""}`}
                          key={action}
                        >
                          <input
                            checked={isActive}
                            disabled={!permissionExists || !canAccess("settings", "edit")}
                            onChange={() => togglePermission(row.module, action)}
                            type="checkbox"
                          />
                          <span>{action}</span>
                        </label>
                      );
                    })}
                  </div>
                ),
              },
            ]}
            emptyMessage="No permissions have been configured yet."
            rowKey="module"
            rows={permissionRows}
          />
        </article>

        <article className="panel">
          <div className="panel__header panel__header--stacked">
            <div>
              <h3>Role Editing</h3>
              <p>Update role labels and descriptions without changing the role ID.</p>
            </div>
            <button className="secondary-button" onClick={saveRoleDetails} type="button">
              Save role
            </button>
          </div>

          <div className="settings-form-grid">
            <label className="search-toolbar">
              <span>Name</span>
              <input
                onChange={(event) =>
                  setRoleDraft((draft) => ({ ...draft, name: event.target.value }))
                }
                value={roleDraft.name}
              />
            </label>
            <label className="search-toolbar">
              <span>Description</span>
              <input
                onChange={(event) =>
                  setRoleDraft((draft) => ({ ...draft, description: event.target.value }))
                }
                value={roleDraft.description ?? ""}
              />
            </label>
          </div>

          {statusMessage ? <p className="panel__body-copy">{statusMessage}</p> : null}
        </article>

        <article className="panel">
          <div className="panel__header panel__header--stacked">
            <div>
              <h3>Organization Users</h3>
              <p>Users inherit module access from their assigned role and active status.</p>
            </div>
            <div className="filter-row">
              <label className="search-toolbar">
                <span>Search</span>
                <input
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Name, email, organization"
                  value={userSearch}
                />
              </label>
              <label className="filter-select">
                <span>Role</span>
                <select onChange={(event) => setRoleFilter(event.target.value)} value={roleFilter}>
                  <option value="">All roles</option>
                  {roleRecords.map((role) => (
                    <option key={role.id} value={role.name ?? role.id}>
                      {role.name ?? role.code}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <DataTable
            caption="Settings users"
            columns={[
              { key: "name", label: "User", render: (row) => row.name ?? row.full_name },
              { key: "email", label: "Email" },
              { key: "organization_name", label: "Organization" },
              {
                key: "role",
                label: "Role",
                render: (row) => (
                  <select
                    className="table-select"
                    disabled={!canAccess("settings", "edit")}
                    onChange={(event) =>
                      assignUserRole(row.id, event.target.value, row.organization_id)
                    }
                    value={row.roleId ?? row.role}
                  >
                    {roleRecords.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name ?? role.code}
                      </option>
                    ))}
                  </select>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (row) => {
                  const isActive = row.is_active !== false && row.status !== "inactive";

                  return (
                    <label className={`status-toggle ${isActive ? "status-toggle--active" : ""}`}>
                      <input
                        checked={isActive}
                        disabled={!canAccess("settings", "edit")}
                        onChange={(event) => setUserStatus(row.id, event.target.checked)}
                        type="checkbox"
                      />
                      <span>{isActive ? "Active" : "Inactive"}</span>
                    </label>
                  );
                },
              },
            ]}
            emptyMessage="No users match the current filters."
            rowKey="id"
            rows={filteredUsers}
          />
        </article>
      </section>
    </DashboardLayout>
  );
}
