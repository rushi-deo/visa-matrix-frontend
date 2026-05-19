import React from "react";
import HrWorkspaceLayout from "../features/hr/components/HrWorkspaceLayout";

const settings = [
  ["Default Branch", "Bengaluru HQ"],
  ["Employee ID Series", "VM-.###"],
  ["Manager Assignment", "Required"],
  ["Welcome Email", "Enabled"],
];

export default function HRSettingsWorkspace() {
  return (
    <HrWorkspaceLayout title="HR Settings" description="Manage HR defaults, employee setup rules, and workspace preferences.">
      <section className="workflow-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Employee Defaults</h3>
              <p>Workspace-level defaults prepared for backend configuration.</p>
            </div>
          </div>
          <div className="detail-list">
            {settings.map(([label, value]) => (
              <div className="detail-row" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Access Controls</h3>
              <p>Core HR rules are staged for API-driven policy storage.</p>
            </div>
          </div>
          <div className="kpi-list">
            <div className="kpi-item">
              <strong>Role template required</strong>
              <span className="tag">Enabled</span>
            </div>
            <div className="kpi-item">
              <strong>Manager approval required</strong>
              <span className="tag">Enabled</span>
            </div>
            <div className="kpi-item">
              <strong>Audit employee changes</strong>
              <span className="tag">Enabled</span>
            </div>
          </div>
        </article>
      </section>
    </HrWorkspaceLayout>
  );
}
