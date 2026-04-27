import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "../services/application.service";
import {
  buildApplicationFromForm,
  getPageCount,
  paginateRows,
} from "../services/erpService";
import { normalizeApplicationWorkflow } from "../utils/workflow";
import { DB_VISA_TYPES } from "../utils/visaType";

export default function Applications() {
  const navigate = useNavigate();
  const { countries: fallbackCountries } = useCountries();
  const { currentUser, canAccess } = useAuth();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showNewModal, setShowNewModal] = useState(false);
  const getApplicationDisplayId = (application) =>
    application?.applicationCode || application?.id || "";

  const loadApplications = async (preferredApplicationId = "") => {
    const nextApplications = await fetchApplications();
    console.log("Applications:", nextApplications);
    setApplications(nextApplications);

    return nextApplications;
  };

  useEffect(() => {
    let isMounted = true;

    const loadCountries = async () => {
      try {
        const nextCountries = await fetchCountries();
        console.log("Countries:", nextCountries);

        if (isMounted) {
          setCountries(Array.isArray(nextCountries) ? nextCountries : []);
        }
      } catch (loadError) {
        console.error("Failed to fetch countries:", loadError);

        if (isMounted) {
          setCountries([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const loadPageData = async () => {
      setLoading(true);
      setPageLoading(true);
      setError("");

      try {
        const nextApplications = await fetchApplications();
        console.log("Applications:", nextApplications);

        if (!isMounted) {
          return;
        }

        setApplications(nextApplications);
        setPageLoading(false);

        loadCountries();
      } catch (loadError) {
        console.error("Failed to load applications:", loadError);

        if (isMounted) {
          setApplications([]);
          setCountries([]);
          setError(loadError.message ?? "Unable to load applications from Supabase.");
        }
      } finally {
        if (isMounted) {
          setPageLoading(false);
          setLoading(false);
        }
      }
    };

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

  const filteredApplications = scopedApplications.filter((application) => {
    const matchesSearch = [
      application.id,
      application.applicationCode,
      application.customerName,
      application.destinationCountry,
      application.visaType,
      application.leadSource,
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

  const handleCreateApplication = async (values) => {
    if (!canAccess("invoicing", "create")) {
      return;
    }

    const builtApplication = buildApplicationFromForm(values);
    const newApplication = {
      ...builtApplication,
      assigned_to: builtApplication.assignedAgent || null,
    };

    try {
      const persistedApplication = await createApplicationRequest(newApplication, currentUser);
      console.log("Application insert confirmed:", persistedApplication);
      await loadApplications(persistedApplication.id ?? newApplication.id);
      setError("");
      setShowNewModal(false);
      setPage(1);
    } catch (createError) {
      console.error("Failed to create application:", createError);
      setError(createError.message ?? "Unable to create application.");
    }
  };

  const finalCountries = countries && countries.length > 0 ? countries : fallbackCountries;
  const countryOptions = finalCountries
    .map((country) => ({
      code: country.code ?? country.country_code ?? country.name ?? country.country,
      name: country.name ?? country.country ?? country.code ?? "",
    }))
    .filter((country) => country.code && country.name);
  const visaTypeOptions = DB_VISA_TYPES;

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
            <p>Filter active cases and open a file to view application details.</p>
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
            {
              key: "id",
              label: "Application ID",
              render: (row) => getApplicationDisplayId(row),
            },
            { key: "customerName", label: "Customer Name" },
            { key: "destinationCountry", label: "Destination Country" },
            { key: "visaType", label: "Visa Type" },
            { key: "leadSource", label: "Lead Source" },
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
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/applications/${row.id}`);
                  }}
                  type="button"
                >
                  Open
                </button>
              ),
            },
          ]}
          emptyMessage={pageLoading ? "Loading applications..." : "No applications match the current filters."}
          onRowClick={(row) => navigate(`/applications/${row.id}`)}
          rowKey="id"
          rows={visibleApplications}
        />

        {error && !showNewModal ? <p className="form-error">{error}</p> : null}
        <TablePagination
          itemLabel="applications"
          onNext={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))}
          onPrevious={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          page={page}
          pageCount={pageCount}
        />
      </section>

      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="New Application">
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        <NewApplicationForm
          countries={finalCountries}
          countryOptions={countryOptions}
          onSubmit={handleCreateApplication}
          submitLabel="Submit"
          visaTypeOptions={visaTypeOptions}
        />
      </Modal>
    </DashboardLayout>
  );
}
