import React from "react";
import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusPill from "../components/StatusPill";
import TablePagination from "../components/TablePagination";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, getPayments } from "../services/mockApi";
import {
  fetchPayments,
  updatePaymentStatus,
} from "../services/payments.service";
import {
  formatDate,
  getPageCount,
  getPaymentReminderAlerts,
  paginateRows,
} from "../services/erpService";

export default function Payments() {
  const { currentUser, canAccess } = useAuth();
  const [payments, setPayments] = useState(getPayments());
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [reminderMessage, setReminderMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadPayments = async () => {
      try {
        const nextPayments = await fetchPayments(getPayments());

        if (isMounted) {
          setPayments(nextPayments);
        }
      } catch {
        // Existing local fallback data keeps the page stable if the API fails.
      }
    };

    loadPayments();

    return () => {
      isMounted = false;
    };
  }, []);

  const scopedPayments = useMemo(() => {
    if (["super_admin", "admin", "finance"].includes(currentUser?.role)) {
      return payments;
    }

    return payments.filter((payment) => payment.paymentStatus !== "Paid");
  }, [currentUser?.role, payments]);

  const filteredPayments = scopedPayments.filter((payment) => {
    const matchesSearch = [
      payment.invoiceId,
      payment.customer,
      payment.application,
      payment.paymentMethod,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || payment.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pageSize = 5;
  const pageCount = getPageCount(filteredPayments, pageSize);
  const visiblePayments = paginateRows(filteredPayments, page, pageSize);
  const paymentAlerts = getPaymentReminderAlerts(scopedPayments);

  const handleMarkPaid = async (row) => {
    const fallbackPayment = { ...row, paymentStatus: "Paid" };

    setPayments((currentPayments) =>
      currentPayments.map((payment) =>
        payment.invoiceId === row.invoiceId ? fallbackPayment : payment,
      ),
    );
    setReminderMessage(`Invoice ${row.invoiceId} marked as paid.`);

    try {
      const updatedPayment = await updatePaymentStatus(
        row.invoiceId,
        "Paid",
        fallbackPayment,
      );

      setPayments((currentPayments) =>
        currentPayments.map((payment) =>
          payment.invoiceId === row.invoiceId
            ? { ...fallbackPayment, ...updatedPayment }
            : payment,
        ),
      );
    } catch {
      // Local optimistic state keeps current behavior if the API update fails.
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Payments & Invoices"
        description="Manage invoices, payment collection, status tracking, and reminder workflows."
      />

      {reminderMessage ? (
        <article className="alert-card alert-card--info">
          <span className="alert-card__eyebrow">Reminder Activity</span>
          <strong>{reminderMessage}</strong>
        </article>
      ) : null}

      <section className="summary-grid">
        <StatCard
          title="Total Invoiced"
          value={formatCurrency(scopedPayments.reduce((sum, payment) => sum + payment.amount, 0))}
          icon="TI"
          color="#2563EB"
        />
        <StatCard
          title="Collected Revenue"
          value={formatCurrency(
            scopedPayments
              .filter((payment) => payment.paymentStatus === "Paid")
              .reduce((sum, payment) => sum + payment.amount, 0),
          )}
          icon="CR"
          color="#22C55E"
        />
        <StatCard
          title="Overdue Invoices"
          value={scopedPayments.filter((payment) => payment.paymentStatus === "Overdue").length}
          icon="OD"
          color="#F97316"
        />
      </section>

      <section className="workflow-grid">
        <article className="panel">
          <div className="panel__header panel__header--stacked">
            <div>
              <h3>Invoice Table</h3>
              <p>Search and filter invoice activity across pending, paid, and overdue balances.</p>
            </div>
          </div>

          <div className="filter-row">
            <label className="search-toolbar">
              <span>Search invoices</span>
              <input
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by invoice, customer, or application"
                type="search"
                value={searchValue}
              />
            </label>

            <label className="filter-select">
              <span>Payment Status</span>
              <select
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                value={statusFilter}
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </label>
          </div>

          <DataTable
            caption="Invoice management"
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
              { key: "paymentMethod", label: "Payment Method" },
              {
                key: "invoiceDate",
                label: "Invoice Date",
                render: (row) => formatDate(row.invoiceDate),
              },
              {
                key: "actions",
                label: "Action",
                render: (row) =>
                  row.paymentStatus === "Paid" ? (
                    <span className="empty-state">Settled</span>
                  ) : canAccess("invoicing", "edit") ? (
                    <button
                      className="link-button"
                      onClick={() => handleMarkPaid(row)}
                      type="button"
                    >
                      Mark Paid
                    </button>
                  ) : (
                    <button
                      className="link-button"
                      onClick={() => setReminderMessage(`Reminder queued for ${row.customer}.`)}
                      type="button"
                    >
                      Send Reminder
                    </button>
                  ),
              },
            ]}
            emptyMessage="No invoices match the current filters."
            rowKey="invoiceId"
            rows={visiblePayments}
          />

          <TablePagination
            itemLabel="invoices"
            onNext={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))}
            onPrevious={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            page={page}
            pageCount={pageCount}
          />
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Payment Reminder Alerts</h3>
              <p>Smart alerts for pending and overdue invoices.</p>
            </div>
          </div>

          <div className="alert-stack">
            {paymentAlerts.map((alert) => (
              <article className={`alert-card alert-card--${alert.type}`} key={alert.id}>
                <span className="alert-card__eyebrow">{alert.title}</span>
                <strong>{alert.description}</strong>
              </article>
            ))}
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
