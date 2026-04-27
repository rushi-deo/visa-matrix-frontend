import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApplicationForm from "../components/ApplicationForm";
import PageHeader from "../components/PageHeader";
import StatusPill from "../components/StatusPill";
import DashboardLayout from "../layout/DashboardLayout";
import { fetchCountries } from "../api/countries";
import { useAuth } from "../context/AuthContext";
import { useCountries } from "../hooks/useCountries";
import {
  fetchApplicationById,
  updateApplication as updateApplicationRequest,
} from "../services/application.service";
import { fetchDocuments } from "../services/documents.service";
import { formatDate } from "../services/erpService";
import {
  WORKFLOW_STEPS,
  applyWorkflowTransition,
  getWorkflowStatus,
  isWorkflowTransitionAllowed,
  normalizeApplicationWorkflow,
} from "../utils/workflow";
import { DB_VISA_TYPES } from "../utils/visaType";

const REQUIRED_DOCUMENTS = [
  "Passport",
  "Bank Statement",
  "Photographs",
  "Travel Insurance",
];

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { countries: fallbackCountries } = useCountries();
  const { canAccess } = useAuth();
  const [application, setApplication] = useState(null);
  const [countries, setCountries] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getApplicationDisplayId = (applicationRecord) =>
    applicationRecord?.applicationCode || applicationRecord?.id || "";

  useEffect(() => {
    let isMounted = true;

    const loadDetail = async () => {
      setLoading(true);
      setError("");

      try {
        console.log("Fetching ID:", id);

        const [nextApplication, nextCountries, documentsResult] = await Promise.all([
          fetchApplicationById(id),
          fetchCountries().catch(() => []),
          fetchDocuments({ includeMeta: true }).catch(() => ({ data: [] })),
        ]);

        if (!isMounted) {
          return;
        }

        setApplication(normalizeApplicationWorkflow(nextApplication));
        setCountries(Array.isArray(nextCountries) ? nextCountries : []);
        setDocuments(Array.isArray(documentsResult?.data) ? documentsResult.data : []);
      } catch (loadError) {
        console.error("Failed to load application details:", loadError);

        if (isMounted) {
          setError(
            loadError?.response?.data?.message ??
              loadError?.message ??
              "Unable to load application details.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const finalCountries = countries.length > 0 ? countries : fallbackCountries;
  const uploadedDocumentNames = useMemo(
    () =>
      new Set(
        documents
          .filter((document) => document.applicationId === application?.id)
          .map((document) => document.documentName),
      ),
    [application?.id, documents],
  );
  const missingDocuments = REQUIRED_DOCUMENTS.filter(
    (documentName) => !uploadedDocumentNames.has(documentName),
  );

  const updateWorkflowStage = async (stage, finalDecision = "Approved") => {
    if (
      !application ||
      !canAccess("invoicing", "edit") ||
      !isWorkflowTransitionAllowed(application, stage)
    ) {
      return;
    }

    const nextApplication = applyWorkflowTransition(
      application,
      stage,
      finalDecision,
    );

    if (!nextApplication) {
      return;
    }

    setApplication(nextApplication);

    try {
      const persistedApplication = await updateApplicationRequest(application.id, {
        stage: nextApplication.stage,
        status: nextApplication.status,
      });

      setApplication(
        normalizeApplicationWorkflow({
          ...nextApplication,
          ...persistedApplication,
        }),
      );
    } catch (updateError) {
      console.error("Failed to update workflow stage:", updateError);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        action={
          <button className="secondary-button" onClick={() => navigate("/applications")} type="button">
            Back to Applications
          </button>
        }
        description="Review lead information before preparing a customer quotation."
        title="Lead Detail"
      />

      <section className="panel application-detail-panel">
        <div className="modal-card__header">
          <div>
            <span className="page-header__eyebrow">Application</span>
            <h3>{application?.customerName ?? "Lead Details"}</h3>
          </div>
        </div>

        {loading ? <p>Loading application...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        {!loading && !error && application ? (
          <ApplicationForm
            countries={finalCountries}
            footerActions={
              <button
                className="primary-button"
                onClick={() => navigate(`/applications/${id}/quotation`)}
                type="button"
              >
                Generate Quotation
              </button>
            }
            initialValues={application}
            readOnly
            showActions={false}
            visaTypeOptions={DB_VISA_TYPES}
          />
        ) : null}
      </section>

      {!loading && !error && application ? (
        <section className="workflow-grid">
          <article className="panel">
            <div className="panel__header">
              <div>
                <h3>Application Workflow</h3>
                <p>Each workflow stage updates the application status automatically.</p>
              </div>
              <StatusPill label={application.status} />
            </div>

            <dl className="detail-list">
              <div>
                <dt>Application ID</dt>
                <dd>{getApplicationDisplayId(application)}</dd>
              </div>
              <div>
                <dt>Customer Name</dt>
                <dd>{application.customerName}</dd>
              </div>
              <div>
                <dt>Destination Country</dt>
                <dd>{application.destinationCountry}</dd>
              </div>
              <div>
                <dt>Visa Type</dt>
                <dd>{application.visaType}</dd>
              </div>
              <div>
                <dt>Assigned Agent</dt>
                <dd>{application.assignedAgent}</dd>
              </div>
              <div>
                <dt>Lead Source</dt>
                <dd>{application.leadSource || "Not provided"}</dd>
              </div>
              <div>
                <dt>Submission Date</dt>
                <dd>{formatDate(application.submissionDate)}</dd>
              </div>
            </dl>

            <div className="workflow-stages">
              {WORKFLOW_STEPS.map((stage) => {
                const canMoveToStage = isWorkflowTransitionAllowed(application, stage);

                return (
                  <article
                    className={`workflow-stage ${
                      application.stage === stage ? "workflow-stage--active" : ""
                    }`}
                    key={stage}
                  >
                    <div className="workflow-stage__copy">
                      <strong>{stage}</strong>
                      <span>
                        Status update:{" "}
                        {stage === "Approved / Rejected"
                          ? "Approved or Rejected"
                          : getWorkflowStatus(stage)}
                      </span>
                    </div>

                    {canAccess("invoicing", "edit") ? (
                      stage === "Approved / Rejected" ? (
                        <div className="button-row">
                          <button
                            className="secondary-button"
                            disabled={!canMoveToStage}
                            onClick={() => updateWorkflowStage(stage, "Approved")}
                            type="button"
                          >
                            Mark Approved
                          </button>
                          <button
                            className="secondary-button"
                            disabled={!canMoveToStage}
                            onClick={() => updateWorkflowStage(stage, "Rejected")}
                            type="button"
                          >
                            Mark Rejected
                          </button>
                        </div>
                      ) : (
                        <button
                          className="secondary-button"
                          disabled={!canMoveToStage}
                          onClick={() => updateWorkflowStage(stage)}
                          type="button"
                        >
                          Move to Stage
                        </button>
                      )
                    ) : (
                      <span className="empty-state">View-only access</span>
                    )}
                  </article>
                );
              })}
            </div>
          </article>

          <div style={{ display: "grid", gap: "1.5rem" }}>
            <article className="panel">
              <div className="panel__header">
                <div>
                  <h3>Document Checklist</h3>
                  <p>Checklist is generated automatically from the selected visa type.</p>
                </div>
              </div>

              {missingDocuments.length > 0 ? (
                <article className="alert-card alert-card--warning">
                  <span className="alert-card__eyebrow">Missing Documents Alert</span>
                  <strong>{missingDocuments.join(", ")}</strong>
                </article>
              ) : (
                <article className="alert-card alert-card--info">
                  <span className="alert-card__eyebrow">Checklist Complete</span>
                  <strong>All required documents are available for this application.</strong>
                </article>
              )}

              <div className="cards-grid">
                {REQUIRED_DOCUMENTS.map((documentName) => {
                  const isMissing = missingDocuments.includes(documentName);

                  return (
                    <article className="placeholder-card" key={documentName}>
                      <span className="profile-card__eyebrow">Required Document</span>
                      <strong>{documentName}</strong>
                      <StatusPill label={isMissing ? "Missing" : "Uploaded"} />
                    </article>
                  );
                })}
              </div>
            </article>
          </div>
        </section>
      ) : null}
    </DashboardLayout>
  );
}
