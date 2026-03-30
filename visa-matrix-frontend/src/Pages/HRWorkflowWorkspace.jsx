import React, { useState } from "react";
import DataTable from "../components/DataTable";
import { hrWorkspaceApi } from "../features/hr/api/hrWorkspaceApi";
import HrErrorState from "../features/hr/components/HrErrorState";
import HrLoadingState from "../features/hr/components/HrLoadingState";
import HrWorkspaceLayout from "../features/hr/components/HrWorkspaceLayout";
import { useHrResource } from "../features/hr/hooks/useHrResource";

const initialForm = {
  module: "attendance",
  name: "New Approval Workflow",
  managerRole: "manager",
  hrRole: "hr",
};

export default function HRWorkflowWorkspace() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const { data, error, loading, reload } = useHrResource(
    async () => {
      const [definitions, instances] = await Promise.all([
        hrWorkspaceApi.getWorkflowDefinitions(),
        hrWorkspaceApi.getWorkflowInstances(),
      ]);
      return { definitions, instances };
    },
    [],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    await hrWorkspaceApi.createWorkflowDefinition({
      module: form.module,
      name: form.name,
      steps: [
        { key: "employee", name: "Employee Submission", approverRole: "employee", order: 1 },
        { key: "manager", name: "Manager Approval", approverRole: form.managerRole, order: 2 },
        { key: "hr", name: "HR Approval", approverRole: form.hrRole, order: 3 },
      ],
    });
    await reload();
    setSaving(false);
  };

  return (
    <HrWorkspaceLayout title="Workflow Builder" description="DB-driven approval flows with role-based steps.">
      {loading ? <HrLoadingState message="Loading workflows..." /> : null}
      {!loading && error ? <HrErrorState message={error} onRetry={reload} /> : null}
      {!loading && !error ? (
        <>
          <section className="page-grid page-grid--two">
            <article className="panel">
              <div className="panel__header">
                <div>
                  <h3>Create Workflow</h3>
                  <p>Basic builder for module-bound approval chains.</p>
                </div>
              </div>
              <form className="form-grid" onSubmit={handleSubmit}>
                <label className="field">
                  <span>Module</span>
                  <select value={form.module} onChange={(event) => setForm((current) => ({ ...current, module: event.target.value }))}>
                    <option value="attendance">Attendance</option>
                    <option value="recruitment">Recruitment</option>
                    <option value="performance">Performance</option>
                  </select>
                </label>
                <label className="field">
                  <span>Name</span>
                  <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                </label>
                <label className="field">
                  <span>Manager Step</span>
                  <input value={form.managerRole} onChange={(event) => setForm((current) => ({ ...current, managerRole: event.target.value }))} />
                </label>
                <label className="field">
                  <span>HR Step</span>
                  <input value={form.hrRole} onChange={(event) => setForm((current) => ({ ...current, hrRole: event.target.value }))} />
                </label>
                <div className="form-actions field--full">
                  <button className="primary-button" type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Workflow"}
                  </button>
                </div>
              </form>
            </article>

            <article className="panel">
              <div className="panel__header">
                <div>
                  <h3>Active Workflow Instances</h3>
                  <p>Track live approvals and current step state.</p>
                </div>
              </div>
              <DataTable
                caption="Workflow instances"
                columns={[
                  { key: "module", label: "Module" },
                  { key: "reference_id", label: "Reference" },
                  { key: "status", label: "Status" },
                  { key: "current_step", label: "Step" },
                ]}
                rows={data.instances.items}
              />
            </article>
          </section>

          <article className="panel">
            <div className="panel__header">
              <div>
                <h3>Workflow Definitions</h3>
                <p>Reusable approval templates stored for dynamic execution.</p>
              </div>
            </div>
            <DataTable
              caption="Workflow definitions"
              columns={[
                { key: "module", label: "Module" },
                { key: "name", label: "Name" },
                {
                  key: "steps",
                  label: "Steps",
                  render: (row) => row.steps.map((step) => step.approverRole).join(" -> "),
                },
              ]}
              rows={data.definitions.items}
            />
          </article>
        </>
      ) : null}
    </HrWorkspaceLayout>
  );
}

