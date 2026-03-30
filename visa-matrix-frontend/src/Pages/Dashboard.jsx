import React from "react";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusPill from "../components/StatusPill";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  formatCurrency,
  getApplications,
  getChecklistCatalog,
  getDashboardMetrics,
  getDocuments,
  getLeads,
  getPayments,
  getRecentApplications,
  getRecentLeads,
  getRecentPayments,
  getVisaDocumentChecklists,
} from "../services/mockApi";
import { getAutomationAlerts } from "../services/erpService";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const applications = getApplications();
  const payments = getPayments();
  const leads = getLeads();
  const documents = getDocuments();
  const checklistCatalog = getChecklistCatalog();
  const checklists = getVisaDocumentChecklists();
  const metrics = getDashboardMetrics(applications, payments, leads, documents);
  const recentApplications = getRecentApplications(applications);
  const recentPayments = getRecentPayments(payments);
  const recentLeads = getRecentLeads(leads);
  const automationAlerts = getAutomationAlerts(applications, documents, payments, checklists);

  return (
    <DashboardLayout>
      <PageHeader
        title="Home"
        description="Modern visa consultancy dashboard"
      />

      <section className="hero-banner bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition mb-6">
        <div className="hero-banner__copy">
          <span className="page-header__eyebrow">SaaS ERP Overview</span>
          <h3>The workspace now supports roles, permissions, organizations, notifications, and audit visibility.</h3>
          <p className="text-sm text-gray-500">
            Signed in as {currentUser?.name} from {currentUser?.organization_name}. Access is enforced
            per role, module, action, and organization boundary.
          </p>
        </div>

        <div className="hero-banner__stats">
          <article className="mini-stat bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
            <span className="text-sm text-gray-500">Checklist Templates</span>
            <strong className="text-xl font-semibold">{checklistCatalog.length}</strong>
          </article>
          <article className="mini-stat bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
            <span className="text-sm text-gray-500">Automation Alerts</span>
            <strong className="text-xl font-semibold">{automationAlerts.length}</strong>
          </article>
          <article className="mini-stat bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
            <span className="text-sm text-gray-500">Pending Finance Follow-up</span>
            <strong className="text-xl font-semibold">
              {payments.filter((payment) => payment.paymentStatus !== "Paid").length}
            </strong>
          </article>
          <article className="mini-stat bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
            <span className="text-sm text-gray-500">Visible Modules</span>
            <strong className="text-xl font-semibold">
              {["settings", "hr", "invoicing", "notifications", "audit_logs"].length}
            </strong>
          </article>
        </div>
      </section>

      <section className="stats-grid gap-6 mb-6">
        <StatCard title="Total Applications" value={metrics.totalApplications} icon="TA" color="#2563EB" />
        <StatCard title="Pending Applications" value={metrics.pendingApplications} icon="PA" color="#F59E0B" />
        <StatCard title="Approved Visas" value={metrics.approvedVisas} icon="AV" color="#22C55E" />
        <StatCard title="Total Revenue" value={formatCurrency(metrics.totalRevenue)} icon="RV" color="#0F172A" />
        <StatCard title="Active Leads" value={metrics.activeLeads} icon="AL" color="#2563EB" />
        <StatCard title="Documents Pending" value={metrics.documentsPending} icon="DP" color="#F97316" />
      </section>

      <section className="page-grid page-grid--two gap-6 mb-6">
        <article className="panel bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="panel__header">
            <div>
              <h3>Recent Applications</h3>
              <p className="text-sm text-gray-500">Latest files moving through counseling, filing, and embassy processing.</p>
            </div>
          </div>
          <DataTable
            caption="Recent applications"
            columns={[
              { key: "id", label: "Application ID" },
              { key: "customerName", label: "Customer" },
              { key: "destinationCountry", label: "Destination" },
              { key: "visaType", label: "Visa Type" },
              {
                key: "status",
                label: "Status",
                render: (row) => <StatusPill label={row.status} />,
              },
            ]}
            rows={recentApplications}
          />
        </article>

        <article className="panel bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="panel__header">
            <div>
              <h3>Automation Highlights</h3>
              <p className="text-sm text-gray-500">Reminders generated from applications, documents, and invoices.</p>
            </div>
          </div>
          <div className="alert-stack">
            {automationAlerts.map((alert) => (
              <article
                className={`alert-card alert-card--${alert.type} bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition`}
                key={alert.id}
              >
                <span className="alert-card__eyebrow">{alert.title}</span>
                <strong>{alert.description}</strong>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="page-grid page-grid--two gap-6">
        <article className="panel bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="panel__header">
            <div>
              <h3>Recent Payments</h3>
              <p className="text-sm text-gray-500">Outstanding and collected invoices across active cases.</p>
            </div>
          </div>
          <DataTable
            caption="Recent payments"
            columns={[
              { key: "invoiceId", label: "Invoice ID" },
              { key: "customer", label: "Customer" },
              { key: "application", label: "Application" },
              {
                key: "amount",
                label: "Amount",
                render: (row) => formatCurrency(row.amount),
              },
              {
                key: "paymentStatus",
                label: "Payment Status",
                render: (row) => <StatusPill label={row.paymentStatus} />,
              },
            ]}
            rowKey="invoiceId"
            rows={recentPayments}
          />
        </article>

        <article className="panel bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
          <div className="panel__header">
            <div>
              <h3>Recent Leads</h3>
              <p className="text-sm text-gray-500">
                Fresh demand entering the CRM pipeline from campaigns, referrals, and walk-ins.
              </p>
            </div>
          </div>
          <DataTable
            caption="Recent leads"
            columns={[
              { key: "leadName", label: "Lead Name" },
              { key: "interestedCountry", label: "Interested Country" },
              { key: "leadSource", label: "Lead Source" },
              {
                key: "status",
                label: "Status",
                render: (row) => <StatusPill label={row.status} />,
              },
              { key: "assignedAgent", label: "Assigned Agent" },
            ]}
            rowKey="id"
            rows={recentLeads}
          />
        </article>
      </section>
    </DashboardLayout>
  );
}
