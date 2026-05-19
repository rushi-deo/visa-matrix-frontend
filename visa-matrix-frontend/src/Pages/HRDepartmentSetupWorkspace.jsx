import React from "react";
import DataTable from "../components/DataTable";
import StatusPill from "../components/StatusPill";
import { hrWorkspaceApi } from "../features/hr/api/hrWorkspaceApi";
import HrErrorState from "../features/hr/components/HrErrorState";
import HrLoadingState from "../features/hr/components/HrLoadingState";
import HrWorkspaceLayout from "../features/hr/components/HrWorkspaceLayout";
import { useHrResource } from "../features/hr/hooks/useHrResource";

export default function HRDepartmentSetupWorkspace() {
  const { data, error, loading, reload } = useHrResource(() => hrWorkspaceApi.getDepartments(), []);

  return (
    <HrWorkspaceLayout title="Department Setup" description="Configure departments, hierarchy, and reporting structure.">
      {loading ? <HrLoadingState message="Loading departments..." /> : null}
      {!loading && error ? <HrErrorState message={error} onRetry={reload} /> : null}
      {!loading && !error ? (
        <section className="workflow-grid">
          <article className="panel">
            <div className="panel__header">
              <div>
                <h3>Departments</h3>
                <p>Department ownership and workforce allocation.</p>
              </div>
              <button className="secondary-button" type="button">
                Add Department
              </button>
            </div>
            <DataTable
              caption="Department setup table"
              columns={[
                { key: "name", label: "Department" },
                { key: "head", label: "Department Head" },
                { key: "employees", label: "Employees" },
                { key: "status", label: "Status", render: (row) => <StatusPill label={row.status} /> },
              ]}
              rows={data.items}
            />
          </article>

          <article className="panel">
            <div className="panel__header">
              <div>
                <h3>Hierarchy Snapshot</h3>
                <p>Reporting structure prepared for backend organization charts.</p>
              </div>
            </div>
            <div className="kpi-list">
              {data.items.map((department) => (
                <div className="kpi-item" key={department.id}>
                  <div className="message-thread">
                    <strong>{department.name}</strong>
                    <p>{department.head} owns {department.employees} employees.</p>
                  </div>
                  <span className="tag">Active</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}
    </HrWorkspaceLayout>
  );
}
