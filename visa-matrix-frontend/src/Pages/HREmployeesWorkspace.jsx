import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DataTable from "../components/DataTable";
import StatusPill from "../components/StatusPill";
import { hrWorkspaceApi } from "../features/hr/api/hrWorkspaceApi";
import HrCreateEmployeeDrawer from "../features/hr/components/HrCreateEmployeeDrawer";
import HrErrorState from "../features/hr/components/HrErrorState";
import HrLoadingState from "../features/hr/components/HrLoadingState";
import HrWorkspaceLayout from "../features/hr/components/HrWorkspaceLayout";
import { useHrResource } from "../features/hr/hooks/useHrResource";

export default function HREmployeesWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(searchParams.get("create") === "1");

  const { data, error, loading, reload, setData } = useHrResource(
    () => hrWorkspaceApi.getEmployees({ search, department: departmentFilter, status: statusFilter }),
    [search, departmentFilter, statusFilter],
  );

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setDrawerOpen(true);
    }
  }, [searchParams]);

  const employees = data?.items ?? [];
  const departments = useMemo(
    () => [...new Set(["Executive", "Human Resources", "Operations", "Finance", ...employees.map((employee) => employee.department)].filter(Boolean))],
    [employees],
  );
  const managerOptions = useMemo(
    () => [...new Set(employees.map((employee) => employee.name).filter(Boolean))],
    [employees],
  );

  const handleCreateEmployee = async (payload) => {
    const createdEmployee = await hrWorkspaceApi.createEmployee(payload);
    setData((currentData) => ({
      ...(currentData ?? {}),
      items: [createdEmployee, ...(currentData?.items ?? [])],
      total: (currentData?.total ?? 0) + 1,
    }));
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    if (searchParams.get("create")) {
      setSearchParams({});
    }
  };

  return (
    <HrWorkspaceLayout
      title="Employee Management"
      description="Manage employee accounts, hierarchy, and organizational access."
      action={
        <button className="primary-button" type="button" onClick={() => setDrawerOpen(true)}>
          Create Employee
        </button>
      }
    >
      <article className="panel">
        <div className="panel__header panel__header--stacked">
          <div>
            <h3>Employee Directory</h3>
            <p>Search, filter, and manage employees from the HR workspace.</p>
          </div>
        </div>

        <div className="filter-row">
          <label className="search-toolbar">
            <span>Search employees</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, role, email" type="search" />
          </label>
          <label className="filter-select">
            <span>Department</span>
            <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
              <option value="All">All</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-select">
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="All">All</option>
              <option value="active">Active</option>
              <option value="restricted">Restricted</option>
              <option value="temporary">Temporary</option>
            </select>
          </label>
        </div>

        {loading ? <HrLoadingState message="Loading employees..." /> : null}
        {!loading && error ? <HrErrorState message={error} onRetry={reload} /> : null}
        {!loading && !error ? (
          <DataTable
            caption="Employee management table"
            columns={[
              { key: "employee_code", label: "Employee ID" },
              {
                key: "name",
                label: "Full Name",
                render: (row) => (
                  <div className="hr-employee-cell">
                    <strong>{row.name}</strong>
                    <span>{row.email}</span>
                  </div>
                ),
              },
              { key: "department", label: "Department" },
              { key: "designation", label: "Designation", render: (row) => row.designation ?? row.job_title },
              { key: "reporting_manager", label: "Reporting Manager" },
              { key: "status", label: "Status", render: (row) => <StatusPill label={row.status} /> },
              { key: "role_template", label: "Role Template" },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <div className="hr-table-actions">
                    <Link className="ghost-button" to={`/hr/employees/${row.id}`}>
                      Edit
                    </Link>
                    <Link className="ghost-button" to="/hr/roles-permissions">
                      Permissions
                    </Link>
                    <button className="ghost-button" type="button">
                      Suspend
                    </button>
                    <button className="ghost-button ghost-button--danger" type="button">
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
            emptyMessage="No employees match the current filters."
            rowKey="id"
            rows={employees}
          />
        ) : null}
      </article>

      {drawerOpen ? (
        <HrCreateEmployeeDrawer
          departments={departments}
          managers={managerOptions}
          onClose={closeDrawer}
          onCreate={handleCreateEmployee}
        />
      ) : null}
    </HrWorkspaceLayout>
  );
}
