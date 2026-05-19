import React, { useMemo, useState } from "react";
import { hrWorkspaceApi } from "../features/hr/api/hrWorkspaceApi";
import HrErrorState from "../features/hr/components/HrErrorState";
import HrLoadingState from "../features/hr/components/HrLoadingState";
import HrWorkspaceLayout from "../features/hr/components/HrWorkspaceLayout";
import { useHrResource } from "../features/hr/hooks/useHrResource";

const modules = ["CRM", "Applications", "Documents", "Payments", "HR", "Reports", "Notifications", "Workflow"];
const actions = ["View", "Create", "Edit", "Delete", "Approve", "Export"];

export default function HRRolesPermissionsWorkspace() {
  const [selectedRole, setSelectedRole] = useState("Visa Officer");
  const [saving, setSaving] = useState(false);
  const { data, error, loading, reload, setData } = useHrResource(() => hrWorkspaceApi.getRoleTemplates(), []);

  const roles = data?.items ?? [];
  const activeRole = useMemo(
    () => roles.find((role) => role.name === selectedRole) ?? roles[0],
    [roles, selectedRole],
  );

  const togglePermission = async (moduleName, actionName) => {
    if (!activeRole) {
      return;
    }

    const currentActions = activeRole.permissions[moduleName] ?? [];
    const nextActions = currentActions.includes(actionName)
      ? currentActions.filter((item) => item !== actionName)
      : [...currentActions, actionName];
    const nextPermissions = {
      ...activeRole.permissions,
      [moduleName]: nextActions,
    };

    setData((currentData) => ({
      ...(currentData ?? {}),
      items: (currentData?.items ?? []).map((role) =>
        role.name === activeRole.name ? { ...role, permissions: nextPermissions } : role,
      ),
    }));

    setSaving(true);
    await hrWorkspaceApi.updateRoleTemplatePermissions(activeRole.name, nextPermissions);
    setSaving(false);
  };

  return (
    <HrWorkspaceLayout title="Roles & Permissions" description="Manage role templates and access permissions.">
      {loading ? <HrLoadingState message="Loading role templates..." /> : null}
      {!loading && error ? <HrErrorState message={error} onRetry={reload} /> : null}
      {!loading && !error ? (
        <section className="hr-permissions-layout">
          <aside className="panel">
            <div className="panel__header">
              <div>
                <h3>Roles List</h3>
                <p>Select a template to manage its ERP access.</p>
              </div>
            </div>
            <div className="hr-role-list">
              {roles.map((role) => (
                <button
                  className={activeRole?.name === role.name ? "hr-role-item hr-role-item--active" : "hr-role-item"}
                  key={role.name}
                  type="button"
                  onClick={() => setSelectedRole(role.name)}
                >
                  <strong>{role.name}</strong>
                  <span>{role.description}</span>
                </button>
              ))}
            </div>
          </aside>

          <article className="panel">
            <div className="panel__header">
              <div>
                <h3>Permission Matrix</h3>
                <p>{activeRole?.name} module permissions and action access.</p>
              </div>
              {saving ? <span className="tag">Saving</span> : <span className="tag">Mock API Ready</span>}
            </div>

            <div className="hr-permission-matrix">
              <div className="hr-permission-row hr-permission-row--header">
                <span>Module</span>
                {actions.map((action) => (
                  <span key={action}>{action}</span>
                ))}
              </div>
              {modules.map((moduleName) => (
                <div className="hr-permission-row" key={moduleName}>
                  <strong>{moduleName}</strong>
                  {actions.map((action) => {
                    const checked = activeRole?.permissions?.[moduleName]?.includes(action) ?? false;
                    return (
                      <label className={checked ? "hr-switch hr-switch--active" : "hr-switch"} key={`${moduleName}-${action}`}>
                        <input checked={checked} type="checkbox" onChange={() => togglePermission(moduleName, action)} />
                        <span />
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}
    </HrWorkspaceLayout>
  );
}
