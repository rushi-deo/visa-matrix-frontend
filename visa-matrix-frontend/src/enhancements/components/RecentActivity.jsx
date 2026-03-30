import React from "react";
import { useEffect, useMemo, useState } from "react";
import StatusPill from "../../components/StatusPill";
import { fetchApplications } from "../../services/application.service";
import { fetchDocuments } from "../../services/documents.service";
import { getApplications, getDocuments } from "../../services/mockApi";
import { normalizeApplicationWorkflow } from "../../utils/workflow";
import { ENABLE_ENHANCEMENTS } from "../config/ui.config";

const activityGridStyle = {
  display: "grid",
  gap: "1rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
};

const activityListStyle = {
  display: "grid",
  gap: "0.85rem",
};

const activityItemStyle = {
  display: "grid",
  gap: "0.45rem",
  padding: "0.95rem 1rem",
  borderRadius: "12px",
  background: "#f8fafc",
  border: "1px solid rgba(226, 232, 240, 0.92)",
};

const buildFallbackActivities = (applications, documents) => {
  const recentApplications = applications
    .map((application) => normalizeApplicationWorkflow(application))
    .slice(0, 4)
    .map((application) => ({
      id: `application-${application.id}`,
      category: "Recent Applications",
      title: `${application.customerName} application is active`,
      detail: `${application.destinationCountry} · ${application.stage}`,
      date: application.submissionDate,
      tone: application.status,
    }));

  const statusUpdates = applications
    .map((application) => normalizeApplicationWorkflow(application))
    .slice(0, 4)
    .map((application) => ({
      id: `status-${application.id}`,
      category: "Status Updates",
      title: `${application.id} moved into ${application.stage}`,
      detail: `${application.customerName} · ${application.status}`,
      date: application.submissionDate,
      tone: application.status,
    }));

  const documentUpdates = documents.slice(0, 4).map((document) => ({
    id: `document-${document.id}`,
    category: "Document Uploads",
    title: `${document.documentName} uploaded`,
    detail: `${document.applicationId} · ${document.uploadedBy}`,
    date: document.uploadDate,
    tone: "Uploaded",
  }));

  return {
    recentApplications,
    statusUpdates,
    documentUpdates,
  };
};

export default function RecentActivity() {
  const [applications, setApplications] = useState(getApplications());
  const [documents, setDocuments] = useState(getDocuments());

  useEffect(() => {
    let isMounted = true;

    const loadActivityData = async () => {
      try {
        const [nextApplications, nextDocuments] = await Promise.all([
          fetchApplications(getApplications()),
          fetchDocuments(getDocuments()),
        ]);

        if (!isMounted) {
          return;
        }

        setApplications(nextApplications);
        setDocuments(nextDocuments);
      } catch {
        if (isMounted) {
          setApplications(getApplications());
          setDocuments(getDocuments());
        }
      }
    };

    loadActivityData();

    return () => {
      isMounted = false;
    };
  }, []);

  const activityColumns = useMemo(
    () => buildFallbackActivities(applications, documents),
    [applications, documents],
  );

  if (!ENABLE_ENHANCEMENTS) {
    return null;
  }

  return (
    <section className="panel" style={{ display: "grid", gap: "1rem" }}>
      <div className="panel__header">
        <div>
          <span className="page-header__eyebrow">Activity Awareness</span>
          <h3>Recent operational activity</h3>
          <p>
            A lightweight feed for new applications, visible workflow motion, and
            uploaded documents.
          </p>
        </div>
      </div>

      <div style={activityGridStyle}>
        {Object.entries(activityColumns).map(([columnKey, items]) => (
          <article className="placeholder-card" key={columnKey}>
            <span className="profile-card__eyebrow">
              {items[0]?.category ?? "Activity"}
            </span>
            <strong>{items[0]?.category ?? "Activity stream"}</strong>
            <div style={activityListStyle}>
              {items.map((item) => (
                <article key={item.id} style={activityItemStyle}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                    }}
                  >
                    <strong>{item.title}</strong>
                    <StatusPill label={item.tone} />
                  </div>
                  <span className="empty-state">{item.detail}</span>
                  <span className="empty-state">{item.date}</span>
                </article>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
