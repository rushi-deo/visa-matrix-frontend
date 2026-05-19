import React, { useState } from "react";
import DataTable from "../components/DataTable";
import { useAuth } from "../context/AuthContext";
import { hrWorkspaceApi } from "../features/hr/api/hrWorkspaceApi";
import HrErrorState from "../features/hr/components/HrErrorState";
import HrLoadingState from "../features/hr/components/HrLoadingState";
import HrWorkspaceLayout from "../features/hr/components/HrWorkspaceLayout";
import { useHrResource } from "../features/hr/hooks/useHrResource";

export default function HRPayrollWorkspace() {
  const { canAccess } = useAuth();
  const [processing, setProcessing] = useState(false);
  const { data, error, loading, reload } = useHrResource(() => hrWorkspaceApi.getPayrollLogs(), []);

  const handleProcessPayroll = async () => {
    setProcessing(true);
    await hrWorkspaceApi.processPayroll({
      employee_id: "emp-1003",
      pay_period: "2026-03",
      tax_rate: 0.1,
      reimbursements: 2500,
    });
    await reload();
    setProcessing(false);
  };

  return (
    <HrWorkspaceLayout
      title="Payroll Console"
      description="Payroll processing, audit-ready logs, and payslip-ready output."
      action={
        canAccess("hr", "edit") || canAccess("invoicing", "approve") ? (
          <button className="primary-button" type="button" disabled={processing} onClick={handleProcessPayroll}>
            {processing ? "Processing..." : "Run Monthly Payroll"}
          </button>
        ) : null
      }
    >
      {loading ? <HrLoadingState message="Loading payroll logs..." /> : null}
      {!loading && error ? <HrErrorState message={error} onRetry={reload} /> : null}
      {!loading && !error ? (
        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Payroll Logs</h3>
              <p>Secure, auditable payroll runs with structured summaries.</p>
            </div>
          </div>
          <DataTable
            caption="Payroll logs"
            columns={[
              { key: "employee_id", label: "Employee" },
              { key: "pay_period", label: "Pay Period" },
              { key: "gross_pay", label: "Gross", render: (row) => `INR ${Number(row.gross_pay).toLocaleString()}` },
              { key: "tax_amount", label: "Tax", render: (row) => `INR ${Number(row.tax_amount).toLocaleString()}` },
              { key: "net_pay", label: "Net", render: (row) => `INR ${Number(row.net_pay).toLocaleString()}` },
              { key: "status", label: "Status" },
            ]}
            rows={data.items}
          />
        </article>
      ) : null}
    </HrWorkspaceLayout>
  );
}
