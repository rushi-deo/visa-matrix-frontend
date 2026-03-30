import React from "react";
import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import FileUpload from "../components/FileUpload";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import StatusPill from "../components/StatusPill";
import TablePagination from "../components/TablePagination";
import DashboardLayout from "../layout/DashboardLayout";
import { fetchApplications } from "../services/application.service";
import {
  fallbackChecklistCatalog,
  fallbackVisaDocumentChecklists,
  fetchDocuments,
  uploadDocuments,
} from "../services/documents.service";
import {
  getChecklistForVisaType,
  getMissingDocuments,
  getPageCount,
  paginateRows,
} from "../services/erpService";

export default function Documents() {
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [applicationFilter, setApplicationFilter] = useState("All");
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [page, setPage] = useState(1);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadState, setUploadState] = useState({
    applicationId: "",
    uploadedBy: "Operations Team",
    documentName: "Passport",
  });
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadPageData = async () => {
      setLoading(true);

      try {
        const [nextApplications, nextDocuments] = await Promise.all([
          fetchApplications(),
          fetchDocuments(),
        ]);
        console.log("Documents page data:", nextApplications, nextDocuments);

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
        setUploadState((currentState) => ({
          ...currentState,
          applicationId:
            nextApplications.find(
              (application) => application.id === currentState.applicationId,
            )?.id ??
            nextApplications[0]?.id ??
            "",
        }));
        setUploadError("");
      } catch (error) {
        console.error("Failed to load documents page data:", error);

        if (isMounted) {
          setApplications([]);
          setDocuments([]);
          setUploadError(error.message ?? "Unable to load documents.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      isMounted = false;
    };
  }, []);

  const checklistCatalog = fallbackChecklistCatalog;
  const checklists = fallbackVisaDocumentChecklists;
  const selectedApplication =
    applications.find((application) => application.id === selectedApplicationId) ??
    applications[0];
  const requiredDocuments = getChecklistForVisaType(
    selectedApplication?.visaType,
    checklists,
  );
  const missingDocuments = getMissingDocuments(
    selectedApplication,
    documents,
    checklists,
  );

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = [
      document.documentName,
      document.applicationId,
      document.uploadedBy,
      document.fileName,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    const matchesApplication =
      applicationFilter === "All" || document.applicationId === applicationFilter;

    return matchesSearch && matchesApplication;
  });

  const pageSize = 5;
  const pageCount = getPageCount(filteredDocuments, pageSize);
  const visibleDocuments = paginateRows(filteredDocuments, page, pageSize);

  const handleDelete = (documentId) => {
    setDocuments((currentDocuments) =>
      currentDocuments.filter((document) => document.id !== documentId),
    );
  };

  const handleUploadSubmit = async (event) => {
    event.preventDefault();

    if (!uploadState.applicationId || !uploadState.uploadedBy.trim() || !uploadState.documentName) {
      setUploadError("Application, uploaded by, and document name are required.");
      return;
    }

    if (uploadFiles.length === 0) {
      setUploadError("Please choose at least one file to upload.");
      return;
    }

    try {
      await uploadDocuments({
        applicationId: uploadState.applicationId,
        documentName: uploadState.documentName,
        uploadedBy: uploadState.uploadedBy,
        files: uploadFiles,
      });

      const nextDocuments = await fetchDocuments();
      setDocuments(nextDocuments);
      setUploadError("");
      setUploadFiles([]);
      setShowUploadModal(false);
      setPage(1);
    } catch (error) {
      console.error("Failed to upload documents:", error);
      setUploadError(error.message ?? "Unable to upload documents.");
    }
  };

  const columns = [
    { key: "documentName", label: "Document Name" },
    { key: "applicationId", label: "Application ID" },
    { key: "uploadedBy", label: "Uploaded By" },
    { key: "uploadDate", label: "Upload Date" },
    {
      key: "download",
      label: "Download",
      render: () => (
        <button className="link-button" type="button">
          Download
        </button>
      ),
    },
    {
      key: "delete",
      label: "Delete",
      render: (row) => (
        <button className="link-button" onClick={() => handleDelete(row.id)} type="button">
          Delete
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Documents"
        description="Upload, review, and track application documents with checklist-based visibility."
        action={
          <button className="primary-button" onClick={() => setShowUploadModal(true)} type="button">
            Upload Document
          </button>
        }
      />

      <section className="workflow-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Document Checklist System</h3>
              <p>Select an application to review auto-generated required documents.</p>
            </div>
          </div>

          <div className="filter-row">
            <label className="filter-select">
              <span>Application</span>
              <select
                onChange={(event) => setSelectedApplicationId(event.target.value)}
                value={selectedApplicationId}
              >
                {applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.id} - {application.customerName}
                  </option>
                ))}
              </select>
            </label>
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

          <div className="document-type-grid">
            {requiredDocuments.map((documentName) => (
              <article className="placeholder-card" key={documentName}>
                <span className="profile-card__eyebrow">Checklist Item</span>
                <strong>{documentName}</strong>
                <StatusPill
                  label={missingDocuments.includes(documentName) ? "Missing" : "Uploaded"}
                />
              </article>
            ))}
          </div>
        </article>

        <article className="country-requirements">
          <span className="profile-card__eyebrow">Checklist Library</span>
          <h3>{selectedApplication?.visaType}</h3>
          <p>
            Base checklist includes Passport, Bank Statement, Photographs, Travel Insurance,
            Invitation Letter, and Financial Proof depending on visa type.
          </p>
          <div className="tag-list">
            {checklistCatalog.map((item) => (
              <span className="tag" key={item}>
                {item}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel__header panel__header--stacked">
          <div>
            <h3>Document Management Table</h3>
            <p>Track uploaded files by application, uploader, and upload date.</p>
          </div>
        </div>

        <div className="filter-row">
          <label className="search-toolbar">
            <span>Search documents</span>
            <input
              onChange={(event) => {
                setSearchValue(event.target.value);
                setPage(1);
              }}
              placeholder="Search by file, uploader, or application ID"
              type="search"
              value={searchValue}
            />
          </label>

          <label className="filter-select">
            <span>Application Filter</span>
            <select
              onChange={(event) => {
                setApplicationFilter(event.target.value);
                setPage(1);
              }}
              value={applicationFilter}
            >
              <option value="All">All Applications</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.id}
                </option>
              ))}
            </select>
          </label>
        </div>

        <DataTable
          caption="Document table"
          columns={columns}
          emptyMessage={loading ? "Loading documents..." : "No documents match the current filters."}
          rowKey="id"
          rows={visibleDocuments}
        />

        {uploadError && !showUploadModal ? <p className="form-error">{uploadError}</p> : null}

        <TablePagination
          itemLabel="documents"
          onNext={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))}
          onPrevious={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          page={page}
          pageCount={pageCount}
        />
      </section>

      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Documents">
        <form onSubmit={handleUploadSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>Application ID</span>
              <select
                onChange={(event) =>
                  setUploadState((currentState) => ({
                    ...currentState,
                    applicationId: event.target.value,
                  }))
                }
                value={uploadState.applicationId}
              >
                {applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.id} - {application.customerName}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Uploaded By</span>
              <input
                onChange={(event) =>
                  setUploadState((currentState) => ({
                    ...currentState,
                    uploadedBy: event.target.value,
                  }))
                }
                value={uploadState.uploadedBy}
              />
            </label>

            <label className="field field--full">
              <span>Document Name</span>
              <select
                onChange={(event) =>
                  setUploadState((currentState) => ({
                    ...currentState,
                    documentName: event.target.value,
                  }))
                }
                value={uploadState.documentName}
              >
                {checklistCatalog.map((documentName) => (
                  <option key={documentName} value={documentName}>
                    {documentName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <FileUpload onFilesChange={setUploadFiles} />
          {uploadError ? <p className="form-error">{uploadError}</p> : null}

          <div className="form-actions">
            <button className="primary-button" type="submit">
              Upload
            </button>
            <button className="secondary-button" onClick={() => setShowUploadModal(false)} type="button">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
