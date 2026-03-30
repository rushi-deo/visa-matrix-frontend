import React from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import DashboardLayout from "../layout/DashboardLayout";
import {
  formatCurrency,
  getAgentPerformance,
  getApplications,
  getCountryApplicationSummary,
  getDashboardMetrics,
  getMonthlyRevenue,
  getVisaSuccessRate,
  getVisaTypeSummary,
} from "../services/mockApi";

export default function Reports() {
  const applications = getApplications();
  const dashboardMetrics = getDashboardMetrics();
  const countrySummary = getCountryApplicationSummary(applications);
  const monthlyRevenue = getMonthlyRevenue();
  const agentPerformance = getAgentPerformance();
  const visaTypeSummary = getVisaTypeSummary(applications);
  const visaSuccessRate = getVisaSuccessRate(applications);

  const topCountryCount = Math.max(...countrySummary.map((item) => item.total), 1);
  const topRevenue = Math.max(...monthlyRevenue.map((item) => item.total), 1);
  const topVisaTypeCount = Math.max(...visaTypeSummary.map((item) => item.total), 1);

  return (
    <DashboardLayout>
      <PageHeader
        title="Reports & Analytics"
        description="Placeholder analytics for country demand, revenue, performance, visa success rate, and visa-type mix."
      />

      <section className="summary-grid">
        <StatCard
          title="Applications in View"
          value={dashboardMetrics.totalApplications}
          icon="AR"
          color="#2563EB"
        />
        <StatCard
          title="Approved Cases"
          value={dashboardMetrics.approvedVisas}
          icon="AC"
          color="#22C55E"
        />
        <StatCard
          title="Collected Revenue"
          value={formatCurrency(dashboardMetrics.totalRevenue)}
          icon="RV"
          color="#0F172A"
        />
        <StatCard
          title="Visa Success Rate"
          value={`${visaSuccessRate}%`}
          icon="SR"
          color="#2563EB"
        />
      </section>

      <section className="page-grid page-grid--two">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Applications by Country</h3>
              <p>Current application demand by destination country.</p>
            </div>
          </div>
          <div className="metric-list">
            {countrySummary.map((item) => (
              <div className="metric-row" key={item.country}>
                <div className="metric-row__copy">
                  <strong>{item.country}</strong>
                  <span>{item.total} applications</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${(item.total / topCountryCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Monthly Revenue</h3>
              <p>Placeholder monthly revenue view from paid invoices.</p>
            </div>
          </div>
          <div className="chart-bars">
            {monthlyRevenue.map((item) => (
              <div className="chart-bar" key={item.month}>
                <div
                  className="chart-bar__column"
                  style={{ height: `${(item.total / topRevenue) * 100}%` }}
                />
                <strong>{item.month}</strong>
                <span>{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="page-grid page-grid--two">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Agent Performance</h3>
              <p>Lead conversion and active case load by consultant.</p>
            </div>
          </div>
          <div className="kpi-list">
            {agentPerformance.map((agent) => (
              <div className="kpi-item" key={agent.agent}>
                <div className="message-thread">
                  <strong>{agent.agent}</strong>
                  <p>
                    {agent.totalLeads} leads handled, {agent.activeCases} active applications
                  </p>
                </div>
                <strong>{agent.converted} converted</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Applications by Visa Type</h3>
              <p>Placeholder view of active case mix by visa category.</p>
            </div>
          </div>
          <div className="metric-list">
            {visaTypeSummary.map((item) => (
              <div className="metric-row" key={item.visaType}>
                <div className="metric-row__copy">
                  <strong>{item.visaType}</strong>
                  <span>{item.total} applications</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${(item.total / topVisaTypeCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
