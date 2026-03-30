import React, { useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../components/DataTable";
import StatusPill from "../components/StatusPill";
import { hrWorkspaceApi } from "../features/hr/api/hrWorkspaceApi";
import HrErrorState from "../features/hr/components/HrErrorState";
import HrLoadingState from "../features/hr/components/HrLoadingState";
import HrWorkspaceLayout from "../features/hr/components/HrWorkspaceLayout";
import { useHrResource } from "../features/hr/hooks/useHrResource";

export default function HREmployeesWorkspace() {
  const [search, setSearch] = useState("");
  const { data, error, loading, reload } = useHrResource(() => hrWorkspaceApi.getEmployees({ search }), [search]);

  return (
    <HrWorkspaceLayout
      title="Employee Management"
      description="Directory, workforce status, and employee 360 entry points."
      action={
        <div className="search-toolbar hr-search-toolbar">
          <span>Search</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees" />
        </div>
      }
    >
      {loading ? <HrLoadingState message="Loading employees..." /> : null}
      {!loading && error ? <HrErrorState message={error} onRetry={reload} /> : null}
      {!loading && !error ? (
        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Employee Directory</h3>
              <p>Secure workforce roster with role-based access to profile details.</p>
            </div>
          </div>
          <DataTable
            caption="Employee directory"
            columns={[
              {
                key: "name",
                label: "Employee",
                render: (row) => (
                  <div className="hr-employee-cell">
                    <strong>{row.name}</strong>
                    <span>{row.employee_code}</span>
                  </div>
                ),
              },
              { key: "department", label: "Department" },
              { key: "job_title", label: "Role" },
              { key: "location", label: "Location" },
              {
                key: "status",
                label: "Status",
                render: (row) => <StatusPill label={row.status} />,
              },
              {
                key: "profile",
                label: "Profile",
                render: (row) => (
                  <Link className="ghost-button" to={`/hr/employees/${row.id}`}>
                    Open 360
                  </Link>
                ),
              },
            ]}
            rows={data?.items ?? []}
          />
        </article>
      ) : null}
    </HrWorkspaceLayout>
  );
}

