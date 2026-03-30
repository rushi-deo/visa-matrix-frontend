import React from "react";
import { useState } from "react";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";

const actionOptions = ["view", "create", "edit", "delete", "approve"];

export default function Admin() {
  const { users, roles, modules, rolePermissions, updateRolePermissionMap, canAccess } = useAuth();
  const [selectedRole, setSelectedRole] = useState(roles[0]);

  const permissionRows = modules.map((moduleName) => ({
    module: moduleName,
    actions: rolePermissions[selectedRole]?.[moduleName] ?? [],
  }));

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings & Permissions"
        description="Manage organizations, role permissions, and module-level access without replacing existing ERP behavior."
      />

      <section className="workflow-grid">
        <article className="panel">
          <div className="panel__header panel__header--stacked">
            <div>
              <h3>Role Permission Matrix</h3>
              <p>Admin can control module and action access per role.</p>
            </div>

            <label className="filter-select">
              <span>Role</span>
              <select onChange={(event) => setSelectedRole(event.target.value)} value={selectedRole}>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <DataTable
            caption="Role permission management"
            columns={[
              { key: "module", label: "Module" },
              {
                key: "actions",
                label: "Allowed Actions",
                render: (row) =>
                  canAccess("settings", "edit") ? (
                    <div className="tag-list">
                      {actionOptions.map((action) => {
                        const isActive = row.actions.includes(action);

                        return (
                          <button
                            className={isActive ? "primary-button" : "secondary-button"}
                            key={action}
                            onClick={() => {
                              const nextActions = isActive
                                ? row.actions.filter((item) => item !== action)
                                : [...row.actions, action];
                              updateRolePermissionMap(selectedRole, row.module, nextActions);
                            }}
                            type="button"
                          >
                            {action}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    row.actions.join(", ")
                  ),
              },
            ]}
            rowKey="module"
            rows={permissionRows}
          />
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Organization Users</h3>
              <p>Users inherit permissions through their assigned role and organization.</p>
            </div>
          </div>

          <DataTable
            caption="Settings users"
            columns={[
              { key: "name", label: "User" },
              { key: "email", label: "Email" },
              { key: "organization_name", label: "Organization" },
              { key: "role", label: "Role" },
            ]}
            rowKey="id"
            rows={users}
          />
        </article>
      </section>
    </DashboardLayout>
  );
}
