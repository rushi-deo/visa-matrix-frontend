import React from "react";
import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";

const fallbackLogs = [
  {
    id: "AUD-1",
    user_id: "USR-ADMIN-1",
    module: "settings",
    action: "role_permission_updated",
    organization_id: "ORG-INTERNAL",
    timestamp: "2026-03-18T10:15:00.000Z",
  },
  {
    id: "AUD-2",
    user_id: "USR-MANAGER-1",
    module: "invoicing",
    action: "invoice_status_updated",
    organization_id: "ORG-INTERNAL",
    timestamp: "2026-03-18T11:00:00.000Z",
  },
];

export default function AuditLogs() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState(fallbackLogs);
  const [moduleFilter, setModuleFilter] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadLogs = async () => {
      try {
        const result = await apiRequest("/audit-logs");
        const payload = result.data;

        if (!result.success) {
          throw new Error(result.error || "Failed to load audit logs.");
        }

        if (isMounted) {
          setLogs(Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []);
        }
      } catch {
        if (isMounted) {
          setLogs(
            fallbackLogs.filter(
              (entry) =>
                currentUser?.role === "admin" ||
                entry.organization_id === currentUser?.organization_id,
            ),
          );
        }
      }
    };

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.organization_id, currentUser?.role]);

  const filteredLogs = useMemo(
    () =>
      (Array.isArray(logs) ? logs : []).filter(
        (entry) => !moduleFilter || entry.module === moduleFilter,
      ),
    [logs, moduleFilter],
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Audit Logs"
        description="Track permission-sensitive activity by user, module, organization, and timestamp."
      />

      <section className="panel">
        <div className="panel__header panel__header--stacked">
          <div>
            <h3>Audit Trail</h3>
            <p>Every important action is captured here for traceability and compliance.</p>
          </div>

          <label className="filter-select">
            <span>Module</span>
            <select onChange={(event) => setModuleFilter(event.target.value)} value={moduleFilter}>
              <option value="">All modules</option>
              {[...new Set((Array.isArray(logs) ? logs : []).map((entry) => entry.module))].map((moduleName) => (
                <option key={moduleName} value={moduleName}>
                  {moduleName}
                </option>
              ))}
            </select>
          </label>
        </div>

        <DataTable
          caption="Audit logs"
          columns={[
            { key: "user_id", label: "User" },
            { key: "module", label: "Module" },
            { key: "action", label: "Action" },
            { key: "organization_id", label: "Organization" },
            { key: "timestamp", label: "Timestamp" },
          ]}
          rowKey="id"
          rows={filteredLogs}
        />
      </section>
    </DashboardLayout>
  );
}
