import React from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import { hrWorkspaceApi } from "../features/hr/api/hrWorkspaceApi";
import HrErrorState from "../features/hr/components/HrErrorState";
import HrLoadingState from "../features/hr/components/HrLoadingState";
import HrWorkspaceLayout from "../features/hr/components/HrWorkspaceLayout";
import { useHrResource } from "../features/hr/hooks/useHrResource";

const workspaceCards = [
  {
    title: "Employee Management",
    description: "Create and manage employee accounts and reporting structure.",
    path: "/hr/employees",
    meta: "Directory",
  },
  {
    title: "Roles & Permissions",
    description: "Manage role templates and access permissions.",
    path: "/hr/roles-permissions",
    meta: "Access",
  },
  {
    title: "Department Setup",
    description: "Configure departments, hierarchy, and reporting structure.",
    path: "/hr/departments",
    meta: "Structure",
  },
  {
    title: "Audit Logs",
    description: "Track employee and permission changes.",
    path: "/hr/audit-logs",
    meta: "Audit",
  },
  {
    title: "Attendance",
    description: "Attendance management module.",
    path: "/hr/attendance",
    meta: "Placeholder",
  },
  {
    title: "Payroll",
    description: "Payroll and salary management.",
    path: "/hr/payroll",
    meta: "Placeholder",
  },
];

export default function HRDashboardWorkspace() {
  const { data, error, loading, reload } = useHrResource(
    async () => {
      const [dashboard, employees] = await Promise.all([
        hrWorkspaceApi.getDashboard(),
        hrWorkspaceApi.getEmployees(),
      ]);

      return { dashboard, employees };
    },
    [],
  );

  if (loading) {
    return (
      <HrWorkspaceLayout title="HR Workspace" description="Manage employees, permissions, departments, and organization structure.">
        <HrLoadingState />
      </HrWorkspaceLayout>
    );
  }

  if (error) {
    return (
      <HrWorkspaceLayout title="HR Workspace" description="Manage employees, permissions, departments, and organization structure.">
        <HrErrorState message={error} onRetry={reload} />
      </HrWorkspaceLayout>
    );
  }

  const metrics = data.dashboard.metrics;
  const departments = new Set((data.employees.items ?? []).map((employee) => employee.department)).size;

  return (
    <HrWorkspaceLayout
      title="HR Workspace"
      description="Manage employees, permissions, departments, and organization structure."
      action={
        <div className="button-row">
          <Link className="primary-button" to="/hr/employees?create=1">
            Create Employee
          </Link>
          <Link className="secondary-button" to="/hr/settings">
            HR Settings
          </Link>
        </div>
      }
    >
      <section className="summary-grid">
        <StatCard title="Total Employees" value={metrics.totalEmployees} icon="TE" color="#2563EB" />
        <StatCard title="Active Employees" value={metrics.activeEmployees} icon="AE" color="#16A34A" />
        <StatCard title="Departments" value={metrics.departments ?? departments} icon="DS" color="#0F766E" />
        <StatCard title="Pending Approvals" value={data.dashboard.highlights.approvalsPending} icon="PA" color="#F97316" />
      </section>

      <section className="hr-workspace-grid">
        {workspaceCards.map((card) => (
          <Link className="hr-action-card" key={card.title} to={card.path}>
            <span className="tag">{card.meta}</span>
            <strong>{card.title}</strong>
            <p>{card.description}</p>
          </Link>
        ))}
      </section>

      <section className="workflow-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Workspace Sections</h3>
              <p>Core HR setup areas grouped for employee lifecycle and access operations.</p>
            </div>
          </div>
          <div className="kpi-list">
            {workspaceCards.slice(0, 4).map((card) => (
              <div className="kpi-item" key={card.title}>
                <div className="message-thread">
                  <strong>{card.title}</strong>
                  <p>{card.description}</p>
                </div>
                <Link className="ghost-button" to={card.path}>
                  Open
                </Link>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>HR Readiness</h3>
              <p>Placeholder workspaces are in place for staged backend integration.</p>
            </div>
          </div>
          <div className="kpi-list">
            {workspaceCards.slice(4).map((card) => (
              <div className="kpi-item" key={card.title}>
                <div className="message-thread">
                  <strong>{card.title}</strong>
                  <p>{card.description}</p>
                </div>
                <span className="tag">Ready</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </HrWorkspaceLayout>
  );
}
