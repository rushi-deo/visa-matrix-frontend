import React from "react";
import DataTable from "../components/DataTable";
import { hrWorkspaceApi } from "../features/hr/api/hrWorkspaceApi";
import HrErrorState from "../features/hr/components/HrErrorState";
import HrLoadingState from "../features/hr/components/HrLoadingState";
import HrWorkspaceLayout from "../features/hr/components/HrWorkspaceLayout";
import { useHrResource } from "../features/hr/hooks/useHrResource";

export default function HRAuditLogsWorkspace() {
  const { data, error, loading, reload } = useHrResource(() => hrWorkspaceApi.getAuditLogs(), []);

  return (
    <HrWorkspaceLayout title="Audit Logs" description="Track employee and permission changes.">
      <article className="panel">
        <div className="panel__header">
          <div>
            <h3>HR Audit Trail</h3>
            <p>Employee, department, and permission activity captured for governance review.</p>
          </div>
        </div>

        {loading ? <HrLoadingState message="Loading audit logs..." /> : null}
        {!loading && error ? <HrErrorState message={error} onRetry={reload} /> : null}
        {!loading && !error ? (
          <DataTable
            caption="HR audit logs"
            columns={[
              { key: "created_at", label: "Time", render: (row) => new Date(row.created_at).toLocaleString() },
              { key: "actor", label: "Actor" },
              { key: "event", label: "Event" },
              { key: "target", label: "Target" },
            ]}
            rows={data.items}
          />
        ) : null}
      </article>
    </HrWorkspaceLayout>
  );
}
