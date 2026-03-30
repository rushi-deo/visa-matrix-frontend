import React from "react";
import { useEffect, useMemo, useState } from "react";
import StatCard from "../../components/StatCard";
import { fetchApplications } from "../../services/application.service";
import { fetchDocuments } from "../../services/documents.service";
import { fetchPayments } from "../../services/payments.service";
import {
  formatCurrency,
  getApplications,
  getDashboardMetrics,
  getDocuments,
  getPayments,
} from "../../services/mockApi";
import { ENABLE_ENHANCEMENTS } from "../config/ui.config";

const enhancedGridStyle = {
  display: "grid",
  gap: "1rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
};

const cardShellStyle = (accent) => ({
  display: "grid",
  gap: "0.9rem",
  padding: "1rem",
  borderRadius: "14px",
  border: "1px solid rgba(226, 232, 240, 0.92)",
  background:
    `linear-gradient(180deg, rgba(255, 255, 255, 0.98), ${accent.background})`,
  boxShadow: "0 14px 30px rgba(15, 23, 42, 0.06)",
});

const dayInMs = 24 * 60 * 60 * 1000;

const isWithinLastWeek = (value) => {
  if (!value) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  const now = new Date();
  return now - date <= 7 * dayInMs && now - date >= 0;
};

export default function EnhancedStatsCards() {
  const [applications, setApplications] = useState(getApplications());
  const [payments, setPayments] = useState(getPayments());
  const [documents, setDocuments] = useState(getDocuments());

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [nextApplications, nextPayments, nextDocuments] = await Promise.all([
          fetchApplications(getApplications()),
          fetchPayments(getPayments()),
          fetchDocuments(getDocuments()),
        ]);

        if (!isMounted) {
          return;
        }

        setApplications(nextApplications);
        setPayments(nextPayments);
        setDocuments(nextDocuments);
      } catch {
        if (isMounted) {
          setApplications(getApplications());
          setPayments(getPayments());
          setDocuments(getDocuments());
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const cardData = useMemo(() => {
    const metrics = getDashboardMetrics(applications, payments, [], documents);

    return [
      {
        title: "Approved Visas",
        value: metrics.approvedVisas,
        icon: "AV",
        color: "#16A34A",
        trend: `+${applications.filter((application) => application.status === "Approved" && isWithinLastWeek(application.submissionDate)).length} this week`,
        tone: "Approvals are trending positive.",
        background: "rgba(240, 253, 244, 0.96)",
      },
      {
        title: "Pending Applications",
        value: metrics.pendingApplications,
        icon: "PA",
        color: "#F59E0B",
        trend: `+${applications.filter((application) => application.status !== "Approved" && application.status !== "Rejected" && isWithinLastWeek(application.submissionDate)).length} this week`,
        tone: "Monitor movement into submission and processing.",
        background: "rgba(255, 251, 235, 0.96)",
      },
      {
        title: "Collected Revenue",
        value: formatCurrency(
          payments
            .filter((payment) => payment.paymentStatus === "Paid")
            .reduce((sum, payment) => sum + payment.amount, 0),
        ),
        icon: "RV",
        color: "#2563EB",
        trend: `+${formatCurrency(
          payments
            .filter((payment) => payment.paymentStatus === "Paid" && isWithinLastWeek(payment.paidOn))
            .reduce((sum, payment) => sum + payment.amount, 0),
        )} this week`,
        tone: "Cash collection remains visible at a glance.",
        background: "rgba(239, 246, 255, 0.96)",
      },
      {
        title: "Recent Uploads",
        value: documents.length,
        icon: "DU",
        color: "#0F172A",
        trend: `+${documents.filter((document) => isWithinLastWeek(document.uploadDate)).length} this week`,
        tone: "Document flow stays visible without replacing current cards.",
        background: "rgba(248, 250, 252, 0.98)",
      },
    ];
  }, [applications, documents, payments]);

  if (!ENABLE_ENHANCEMENTS) {
    return null;
  }

  return (
    <section className="panel" style={{ display: "grid", gap: "1rem" }}>
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">Enhanced Metrics</span>
          <h3>SaaS-style KPI layer</h3>
          <p>
            Existing stats remain untouched. These cards add trend context, stronger hierarchy,
            and faster scanability.
          </p>
        </div>
      </div>

      <div style={enhancedGridStyle}>
        {cardData.map((card) => (
          <article key={card.title} style={cardShellStyle(card)}>
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                paddingInline: "0.25rem",
              }}
            >
              <span
                className="tag"
                style={{
                  background: "#ffffff",
                  color: card.color,
                  border: "1px solid rgba(226, 232, 240, 0.95)",
                }}
              >
                {card.trend}
              </span>
              <span className="empty-state">{card.tone}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
