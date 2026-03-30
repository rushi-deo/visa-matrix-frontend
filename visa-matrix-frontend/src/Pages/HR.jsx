import React from "react";
import { useState } from "react";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";

export default function HR() {
  const { users, roles, currentUser, assignUserRole, canAccess } = useAuth();
  const [message, setMessage] = useState("");

  const columns = [
    { key: "name", label: "User" },
    { key: "email", label: "Email" },
    { key: "organization_name", label: "Organization" },
    { key: "role", label: "Role" },
    {
      key: "actions",
      label: "Assignment",
      render: (row) =>
        canAccess("hr", "edit") ? (
          <select
            defaultValue={row.role}
            onChange={(event) => {
              assignUserRole(row.id, event.target.value, row.organization_id);
              setMessage(`Role updated for ${row.name}.`);
            }}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        ) : (
          row.role
        ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="HR & User Access"
        description="Assign ERP roles to employees and keep organization ownership aligned with access rules."
      />

      {message ? (
        <article className="alert-card alert-card--info">
          <span className="alert-card__eyebrow">HR Update</span>
          <strong>{message}</strong>
        </article>
      ) : null}

      <section className="workflow-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>User Role Assignments</h3>
              <p>Internal users and agency accounts inherit module permissions from their assigned roles.</p>
            </div>
          </div>

          <DataTable caption="HR access control table" columns={columns} rowKey="id" rows={users} />
        </article>

        <article className="settings-card">
          <span className="profile-card__eyebrow">Signed-in User</span>
          <strong>{currentUser?.name}</strong>
          <p>{currentUser?.email}</p>
          <p>Role: {currentUser?.role}</p>
          <p>Organization: {currentUser?.organization_name}</p>
        </article>
      </section>
    </DashboardLayout>
  );
}
