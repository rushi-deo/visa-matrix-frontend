import React from "react";
import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import StatusPill from "../components/StatusPill";
import TablePagination from "../components/TablePagination";
import NewApplicationForm from "../forms/NewApplicationForm";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useCountries } from "../hooks/useCountries";
import { fetchCountries } from "../api/countries";
import {
  createApplication as createApplicationRequest,
  fetchApplications,
  updateApplication as updateApplicationRequest,
} from "../services/application.service";
import { fetchDocuments } from "../services/documents.service";
import {
  getApplications,
  getDocuments,
  getVisaDocumentChecklists,
} from "../services/mockApi";
import {
  buildApplicationFromForm,
  formatDate,
  getChecklistForVisaType,
  getMissingDocuments,
  getPageCount,
  paginateRows,
} from "../services/erpService";
import {
  WORKFLOW_STEPS,
  applyWorkflowTransition,
  getWorkflowStatus,
  isWorkflowTransitionAllowed,
  normalizeApplicationWorkflow,
} from "../utils/workflow";

export default function Applications() {
  const { countries: fallbackCountries } = useCountries();
  const { currentUser, canAccess } = useAuth();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState(getApplications());
  const [documents, setDocuments] = useState(getDocuments());
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(
    applications[0]?.id ?? "",
  );

  useEffect(() => {
    let isMounted = true;

    const loadCountries = async () => {
      setLoading(true);
      setError("");

      try {
        const nextCountries = await fetchCountries();

        if (isMounted) {
          setCountries(Array.isArray(nextCountries) ? nextCountries : []);
        }
      } catch (loadError) {
        console.error("Failed to fetch countries:", loadError);

        if (isMounted) {
          setError(loadError.message ?? "Failed to load countries.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const loadPageData = async () => {
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
        setSelectedApplicationId((currentId) =>
          nextApplications.some((application) => application.id === currentId)
            ? currentId
            : nextApplications[0]?.id ?? "",
        );
      } catch {
        if (isMounted) {
          setSelectedApplicationId((currentId) => currentId || applications[0]?.id || "");
        }
      }
    };

    loadCountries();
    loadPageData();

    return () => {
      isMounted = false;
    };
  }, []);

  const scopedApplications = useMemo(() => {
    const normalizedApplications = applications.map(normalizeApplicationWorkflow);

    if (currentUser?.role === "admin" || currentUser?.role === "manager") {
      return normalizedApplications;
    }

    if (currentUser?.role === "external_user") {
      return normalizedApplications.filter((application) =>
        application.customerName.toLowerCase().includes("nexa"),
      );
    }

    return normalizedApplications;
  }, [applications, currentUser?.role]);

  const checklists = getVisaDocumentChecklists();
  const filteredApplications = scopedApplications.filter((application) => {
    const matchesSearch = [
      application.id,
      application.customerName,
      application.destinationCountry,
      application.visaType,
      application.assignedAgent,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || application.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pageSize = 5;
  const pageCount = getPageCount(filteredApplications, pageSize);
  const visibleApplications = paginateRows(filteredApplications, page, pageSize);
  const selectedApplication =
    filteredApplications.find((application) => application.id === selectedApplicationId) ??
    filteredApplications[0] ??
    scopedApplications[0];

  const requiredDocuments = getChecklistForVisaType(
    selectedApplication?.visaType,
    checklists,
  );
  const missingDocuments = getMissingDocuments(
    selectedApplication,
    documents,
    checklists,
  );

  const updateWorkflowStage = async (stage, finalDecision = "Approved") => {
    if (
      !selectedApplication ||
      !canAccess("invoicing", "edit") ||
      !isWorkflowTransitionAllowed(selectedApplication, stage)
    ) {
      return;
    }

    const nextApplication = applyWorkflowTransition(
      selectedApplication,
      stage,
      finalDecision,
    );

    if (!nextApplication) {
      return;
    }

    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === selectedApplication.id
          ? nextApplication
          : application,
      ),
    );

    try {
      const persistedApplication = await updateApplicationRequest(
        selectedApplication.id,
        {
          stage: nextApplication.stage,
          status: nextApplication.status,
        },
        nextApplication,
      );

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === selectedApplication.id
            ? normalizeApplicationWorkflow({
                ...nextApplication,
                ...persistedApplication,
              })
            : application,
        ),
      );
    } catch {
      // Local optimistic state keeps the workflow usable if the API fails.
    }
  };

  const handleCreateApplication = async (values) => {
    if (!canAccess("invoicing", "create")) {
      return;
    }

    const newApplication = normalizeApplicationWorkflow(buildApplicationFromForm(values));
    setApplications((currentApplications) => [newApplication, ...currentApplications]);
    setSelectedApplicationId(newApplication.id);
    setShowNewModal(false);
    setPage(1);

    try {
      const persistedApplication = await createApplicationRequest(
        newApplication,
        newApplication,
      );

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === newApplication.id
            ? normalizeApplicationWorkflow({
                ...newApplication,
                ...persistedApplication,
              })
            : application,
        ),
      );
      setSelectedApplicationId(persistedApplication.id ?? newApplication.id);
    } catch {
      // Local fallback preserves the current flow when the API is unavailable.
    }
  };

  console.log("Countries from API:", countries);

  const finalCountries = countries && countries.length > 0 ? countries : fallbackCountries;
  console.log("Final countries used:", finalCountries.length);
  const countryOptions = finalCountries
    .map((country) => ({
      code: country.code ?? country.country_code ?? country.name ?? country.country,
      name: country.name ?? country.country ?? country.code ?? "",
    }))
    .filter((country) => country.code && country.name);
  const visaTypeOptions = [
    ...new Set(fallbackCountries.flatMap((country) => country.visa_types)),
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Visa Applications"
        description="Track every application from draft intake through document collection, filing, embassy processing, and outcome."
        action={
          canAccess("invoicing", "create") ? (
            <button className="primary-button" onClick={() => setShowNewModal(true)} type="button">
              New Application
            </button>
          ) : null
        }
      />

      <section className="panel">
        <div className="panel__header panel__header--stacked">
          <div>
            <h3>Application Tracking</h3>
            <p>Filter active cases and open a file to manage workflow stages within your access scope.</p>
          </div>
        </div>

        <div className="filter-row">
          <label className="search-toolbar">
            <span>Search applications</span>
            <input
              onChange={(event) => {
                setSearchValue(event.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, customer, destination, or agent"
              type="search"
              value={searchValue}
            />
          </label>

          <label className="filter-select">
            <span>Status</span>
            <select
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              value={statusFilter}
            >
              <option value="All">All</option>
              {["Lead", "Documents Pending", "Submitted", "Processing", "Approved", "Rejected"].map(
                (status) => (
                <option key={status} value={status}>
                  {status}
                </option>
                ),
              )}
            </select>
          </label>
        </div>

        <DataTable
          caption="Visa applications"
          columns={[
            { key: "id", label: "Application ID" },
            { key: "customerName", label: "Customer Name" },
            { key: "destinationCountry", label: "Destination Country" },
            { key: "visaType", label: "Visa Type" },
            {
              key: "status",
              label: "Status",
              render: (row) => <StatusPill label={row.status} />,
            },
            { key: "submissionDate", label: "Submission Date" },
            { key: "assignedAgent", label: "Assigned Agent" },
            {
              key: "actions",
              label: "Open",
              render: (row) => (
                <button
                  className="link-button"
                  onClick={() => setSelectedApplicationId(row.id)}
                  type="button"
                >
                  Review
                </button>
              ),
            },
          ]}
          emptyMessage="No applications match the current filters."
          rowKey="id"
          rows={visibleApplications}
        />

        <TablePagination
          itemLabel="applications"
          onNext={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))}
          onPrevious={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          page={page}
          pageCount={pageCount}
        />
      </section>

      <section className="workflow-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Application Workflow</h3>
              <p>Each workflow stage updates the application status automatically.</p>
            </div>
            {selectedApplication ? <StatusPill label={selectedApplication.status} /> : null}
          </div>

          {selectedApplication ? (
            <>
              <dl className="detail-list">
                <div>
                  <dt>Application ID</dt>
                  <dd>{selectedApplication.id}</dd>
                </div>
                <div>
                  <dt>Customer Name</dt>
                  <dd>{selectedApplication.customerName}</dd>
                </div>
                <div>
                  <dt>Destination Country</dt>
                  <dd>{selectedApplication.destinationCountry}</dd>
                </div>
                <div>
                  <dt>Visa Type</dt>
                  <dd>{selectedApplication.visaType}</dd>
                </div>
                <div>
                  <dt>Assigned Agent</dt>
                  <dd>{selectedApplication.assignedAgent}</dd>
                </div>
                <div>
                  <dt>Submission Date</dt>
                  <dd>{formatDate(selectedApplication.submissionDate)}</dd>
                </div>
              </dl>

              <div className="workflow-stages">
                {WORKFLOW_STEPS.map((stage) => {
                  const canMoveToStage = isWorkflowTransitionAllowed(
                    selectedApplication,
                    stage,
                  );

                  return (
                    <article
                      className={`workflow-stage ${
                        selectedApplication.stage === stage ? "workflow-stage--active" : ""
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
            </>
          ) : (
            <p className="empty-state">Select an application to manage workflow stages.</p>
          )}
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Document Checklist</h3>
              <p>Checklist is generated automatically from the selected visa type.</p>
            </div>
          </div>

          {selectedApplication ? (
            <>
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
                {requiredDocuments.map((documentName) => {
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
            </>
          ) : (
            <p className="empty-state">Select an application to review its checklist.</p>
          )}
        </article>
      </section>

      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="New Application">
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        <NewApplicationForm
          countries={countries}
          countryOptions={countryOptions}
          onSubmit={handleCreateApplication}
          submitLabel="Submit"
          visaTypeOptions={visaTypeOptions}
        />
      </Modal>
    </DashboardLayout>
  );
}
