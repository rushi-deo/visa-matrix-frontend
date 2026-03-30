import React from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import DashboardLayout from "../layout/DashboardLayout";
import {
  getApplications,
  getDocuments,
  getPayments,
  getVisaDocumentChecklists,
  getWorkflowSnapshot,
} from "../services/mockApi";
import {
  getAutomationAlerts,
  getInterviewReminderAlerts,
  getMissingDocumentAlerts,
  getPaymentReminderAlerts,
  workflowStages,
} from "../services/erpService";

const playbooks = [
  {
    name: "Auto document checklist",
    description: "Generate visa-type-specific checklist coverage as soon as a case is created.",
  },
  {
    name: "Missing document alerts",
    description: "Flag cases that are missing required evidence before filing can progress.",
  },
  {
    name: "Payment reminder alerts",
    description: "Surface pending and overdue invoices directly inside the ERP workflow.",
  },
  {
    name: "Embassy interview reminders",
    description: "Warn agents ahead of interview dates so coaching and docs stay on track.",
  },
];

export default function Workflow() {
  const applications = getApplications();
  const documents = getDocuments();
  const payments = getPayments();
  const checklists = getVisaDocumentChecklists();
  const workflowSnapshot = getWorkflowSnapshot(applications);
  const automationAlerts = getAutomationAlerts(
    applications,
    documents,
    payments,
    checklists,
  );
  const missingDocumentAlerts = getMissingDocumentAlerts(
    applications,
    documents,
    checklists,
  );
  const paymentAlerts = getPaymentReminderAlerts(payments);
  const interviewAlerts = getInterviewReminderAlerts(applications);

  return (
    <DashboardLayout>
      <PageHeader
        title="Workflow Automation"
        description="Automation rules and operational alerts that keep visa applications moving end to end."
      />

      <section className="summary-grid">
        <StatCard title="Workflow Stages" value={workflowStages.length} icon="WS" color="#2563EB" />
        <StatCard
          title="Missing Doc Alerts"
          value={missingDocumentAlerts.length}
          icon="DA"
          color="#F97316"
        />
        <StatCard
          title="Payment Alerts"
          value={paymentAlerts.length}
          icon="PA"
          color="#0F172A"
        />
        <StatCard
          title="Interview Reminders"
          value={interviewAlerts.length}
          icon="IR"
          color="#22C55E"
        />
      </section>

      <section className="workflow-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Workflow Stage Coverage</h3>
              <p>Snapshot of active cases distributed across the ERP workflow stages.</p>
            </div>
          </div>

          <div className="kpi-list">
            {workflowStages.map((stage) => {
              const stageItem = workflowSnapshot.find((item) => item.stage === stage);

              return (
                <div className="kpi-item" key={stage}>
                  <div className="message-thread">
                    <strong>{stage}</strong>
                    <p>Current cases in this stage</p>
                  </div>
                  <strong>{stageItem?.total ?? 0}</strong>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Automation Alerts</h3>
              <p>Prioritized reminders generated from applications, documents, and invoices.</p>
            </div>
          </div>

          <div className="alert-stack">
            {automationAlerts.map((alert) => (
              <article className={`alert-card alert-card--${alert.type}`} key={alert.id}>
                <span className="alert-card__eyebrow">{alert.title}</span>
                <strong>{alert.description}</strong>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="cards-grid">
        {playbooks.map((playbook) => (
          <article className="panel panel--card" key={playbook.name}>
            <div className="panel__header">
              <div>
                <h3>{playbook.name}</h3>
                <p>Workflow automation playbook</p>
              </div>
            </div>
            <p className="panel__body-copy">{playbook.description}</p>
          </article>
        ))}
      </section>
    </DashboardLayout>
  );
}
