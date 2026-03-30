import React from "react";
import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import TablePagination from "../components/TablePagination";
import DashboardLayout from "../layout/DashboardLayout";
import { fetchCustomers } from "../services/customers.service";
import { getPageCount, paginateRows } from "../services/erpService";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCustomers = async () => {
      setLoading(true);

      try {
        const nextCustomers = await fetchCustomers();

        if (!isMounted) {
          return;
        }

        setCustomers(nextCustomers);
        setSelectedCustomerId((currentId) =>
          nextCustomers.some((customer) => customer.id === currentId)
            ? currentId
            : nextCustomers[0]?.id ?? "",
        );
        setError("");
      } catch (loadError) {
        console.error("Failed to fetch customers:", loadError);

        if (isMounted) {
          setCustomers([]);
          setSelectedCustomerId("");
          setError(loadError.message ?? "Unable to load customers.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    [
      customer.name,
      customer.passportNumber,
      customer.contact,
      customer.email,
      customer.assignedAgent,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchValue.toLowerCase()),
  );

  const pageSize = 4;
  const pageCount = getPageCount(filteredCustomers, pageSize);
  const visibleCustomers = paginateRows(filteredCustomers, page, pageSize);
  const selectedCustomer =
    filteredCustomers.find((customer) => customer.id === selectedCustomerId) ??
    filteredCustomers[0] ??
    customers[0];

  const columns = [
    { key: "name", label: "Name" },
    { key: "passportNumber", label: "Passport Number" },
    { key: "contact", label: "Contact" },
    { key: "email", label: "Email" },
    { key: "activeApplications", label: "Active Applications" },
    {
      key: "actions",
      label: "Profile",
      render: (row) => (
        <button className="link-button" onClick={() => setSelectedCustomerId(row.id)} type="button">
          View Profile
        </button>
      ),
    },
  ];

  const totalDocuments = customers.reduce(
    (sum, customer) => sum + (customer.documentsUploaded?.length ?? 0),
    0,
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Customers"
        description="Customer profiles, passport data, visa history, and uploaded document context in one view."
      />

      <section className="summary-grid">
        <StatCard title="Total Customers" value={customers.length} icon="CU" color="#2563EB" />
        <StatCard
          title="Active Accounts"
          value={customers.filter((customer) => customer.activeApplications > 0).length}
          icon="AA"
          color="#22C55E"
        />
        <StatCard title="Documents Uploaded" value={totalDocuments} icon="DU" color="#0F172A" />
      </section>

      <section className="profile-layout">
        <article className="panel">
          <div className="panel__header panel__header--stacked">
            <div>
              <h3>Customer Directory</h3>
              <p>Search by customer name, passport number, or assigned consultant.</p>
            </div>
            <label className="search-toolbar">
              <span>Search customers</span>
              <input
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  setPage(1);
                }}
                placeholder="Search customers"
                type="search"
                value={searchValue}
              />
            </label>
          </div>

          <DataTable
            caption="Customer directory"
            columns={columns}
            emptyMessage={loading ? "Loading customers..." : "No customers match the current search."}
            rowKey="id"
            rows={visibleCustomers}
          />

          <TablePagination
            itemLabel="customer profiles"
            onNext={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))}
            onPrevious={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            page={page}
            pageCount={pageCount}
          />
        </article>

        <div className="page-grid">
          <article className="profile-card">
            <span className="profile-card__eyebrow">Customer Profile</span>
            <h3>{selectedCustomer?.name}</h3>

            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{selectedCustomer?.name}</dd>
              </div>
              <div>
                <dt>Passport Number</dt>
                <dd>{selectedCustomer?.passportNumber}</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{selectedCustomer?.contact}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{selectedCustomer?.email}</dd>
              </div>
              <div>
                <dt>Assigned Agent</dt>
                <dd>{selectedCustomer?.assignedAgent}</dd>
              </div>
              <div>
                <dt>Active Applications</dt>
                <dd>{selectedCustomer?.activeApplications}</dd>
              </div>
            </dl>

            <div>
              <span className="profile-card__eyebrow">Visa History</span>
              <div className="tag-list">
                {(selectedCustomer?.visaHistory ?? []).map((item) => (
                  <span className="tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="profile-card__eyebrow">Documents Uploaded</span>
              <div className="tag-list">
                {(selectedCustomer?.documentsUploaded ?? []).map((item) => (
                  <span className="tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <article className="placeholder-card">
            <span className="profile-card__eyebrow">Client Portal Preparation</span>
            <strong>Client document upload</strong>
            <p>Placeholder for secure customer uploads linked to this customer profile.</p>
            <strong>Application status tracking</strong>
            <p>Placeholder for real-time customer-facing progress visibility.</p>
            <strong>Client communication</strong>
            <p>Placeholder for portal messages, document comments, and appointment reminders.</p>
          </article>
        </div>
      </section>
      {error ? <p className="form-error">{error}</p> : null}
    </DashboardLayout>
  );
}
