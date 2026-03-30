import React from "react";
import { useParams } from "react-router-dom";
import DataTable from "../components/DataTable";
import StatusPill from "../components/StatusPill";
import { hrWorkspaceApi } from "../features/hr/api/hrWorkspaceApi";
import HrErrorState from "../features/hr/components/HrErrorState";
import HrLoadingState from "../features/hr/components/HrLoadingState";
import HrWorkspaceLayout from "../features/hr/components/HrWorkspaceLayout";
import { useHrResource } from "../features/hr/hooks/useHrResource";

export default function HREmployeeProfileWorkspace() {
  const { employeeId } = useParams();
  const { data, error, loading, reload } = useHrResource(() => hrWorkspaceApi.getEmployeeProfile(employeeId), [employeeId]);

  if (loading) {
    return (
      <HrWorkspaceLayout title="Employee 360 Profile" description="Cross-functional employee view.">
        <HrLoadingState />
      </HrWorkspaceLayout>
    );
  }

  if (error) {
    return (
      <HrWorkspaceLayout title="Employee 360 Profile" description="Cross-functional employee view.">
        <HrErrorState message={error} onRetry={reload} />
      </HrWorkspaceLayout>
    );
  }

  const salaryComponents = Object.entries(data.salary?.salary_components ?? {}).filter(([key]) => key !== "deductions");
  const deductionComponents = Object.entries(data.salary?.salary_components?.deductions ?? {});

  return (
    <HrWorkspaceLayout title={`${data.employee.name} 360`} description="Profile, salary, attendance, leave, performance, and payroll context.">
      <section className="profile-layout">
        <article className="profile-card">
          <span className="profile-card__eyebrow">Employee Snapshot</span>
          <strong>{data.employee.job_title}</strong>
          <dl className="detail-list">
            <div>
              <dt>Email</dt>
              <dd>{data.employee.email}</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>{data.employee.department}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{data.employee.location}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd><StatusPill label={data.employee.status} /></dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Compensation</h3>
              <p>Structured salary components with payroll-ready deductions.</p>
            </div>
          </div>
          <div className="summary-grid">
            {salaryComponents.map(([label, value]) => (
              <article className="placeholder-card" key={label}>
                <strong>{label.replaceAll("_", " ")}</strong>
                <p>INR {value.toLocaleString()}</p>
              </article>
            ))}
            {deductionComponents.map(([label, value]) => (
              <article className="placeholder-card" key={label}>
                <strong>{label.replaceAll("_", " ")}</strong>
                <p>Deduction: INR {value.toLocaleString()}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="page-grid page-grid--two">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Attendance</h3>
              <p>Recent attendance trail with recorded hours.</p>
            </div>
          </div>
          <DataTable
            caption="Attendance records"
            columns={[
              { key: "date", label: "Date" },
              { key: "status", label: "Status", render: (row) => <StatusPill label={row.status} /> },
              { key: "hours_worked", label: "Hours" },
            ]}
            rows={data.attendance}
          />
        </article>
        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Leave History</h3>
              <p>Workflow-aware leave history.</p>
            </div>
          </div>
          <DataTable
            caption="Leave history"
            columns={[
              { key: "type", label: "Type" },
              { key: "start_date", label: "Start" },
              { key: "end_date", label: "End" },
              { key: "status", label: "Status", render: (row) => <StatusPill label={row.status} /> },
            ]}
            rows={data.leaveHistory}
          />
        </article>
      </section>
    </HrWorkspaceLayout>
  );
}

