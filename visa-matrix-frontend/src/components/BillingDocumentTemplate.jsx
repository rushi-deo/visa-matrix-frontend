import React from "react";
import "./BillingDocumentTemplate.css";

const toNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatCurrency = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(toNumber(value));

const toTitleCase = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const toLines = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
};

function DetailLines({ lines }) {
  return lines.map((line) => (
    <p key={line}>{line}</p>
  ));
}

export default function BillingDocumentTemplate({
  company = {},
  currency = "INR",
  documentLabel = "INVOICE",
  documentNumber = "",
  emptyMessage = "No line items available.",
  grandTotal = 0,
  issuedOn = "",
  lineItems = [],
  metadata = [],
  paymentMethod = {},
  recipient = {},
  summaryRows = [],
  terms = [],
  thankYouMessage = "Thank you for choosing our services.",
}) {
  const heading = String(documentLabel || "INVOICE").toUpperCase();
  const headingTitle = toTitleCase(heading);
  const companyName = company.name ?? "Visa Matrix";
  const recipientLines = [
    ...toLines(recipient.addressLines),
    recipient.email ? `Email: ${recipient.email}` : "",
    recipient.phone ? `Phone: ${recipient.phone}` : "",
  ].filter(Boolean);
  const contactLines = toLines(
    company.contactLines ??
      [company.phone, company.email, company.website].filter(Boolean).join(" | "),
  );
  const addressLines = toLines(company.addressLines);
  const paymentDetails = Array.isArray(paymentMethod.details) ? paymentMethod.details : [];
  const renderedTerms =
    terms.length > 0
      ? terms
      : [
          "Service charges are based on the selected package and supporting scope.",
          "Government fees are processed as applicable at the time of submission.",
          "Please verify all passenger and passport details before confirmation.",
        ];

  return (
    <section className="billing-doc" aria-label={`${headingTitle} document`}>
      <article className="billing-doc__sheet">
        <header className="billing-doc__header">
          <div className="billing-doc__brand">
            {company.logoSrc ? (
              <img
                alt={company.logoAlt ?? companyName}
                className="billing-doc__logo"
                src={company.logoSrc}
              />
            ) : (
              <div className="billing-doc__logo-fallback" aria-hidden="true">
                {companyName.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="billing-doc__brand-copy">
              <span>{company.tagline ?? "Visa & travel documentation services"}</span>
              <strong>{companyName}</strong>
            </div>
          </div>

          <div className="billing-doc__title-block">
            <span className="billing-doc__eyebrow">Customer Document</span>
            <h1>{heading}</h1>
          </div>
        </header>

        <section className="billing-doc__party-grid">
          <div className="billing-doc__info-card">
            <span className="billing-doc__section-label">{headingTitle} to:</span>
            <strong>{recipient.name ?? "Customer Name"}</strong>
            <DetailLines lines={recipientLines} />
          </div>

          <div className="billing-doc__info-card billing-doc__info-card--meta">
            <div className="billing-doc__meta-row">
              <span>{headingTitle} no:</span>
              <strong>{documentNumber || "Auto Generated"}</strong>
            </div>
            <div className="billing-doc__meta-row">
              <span>Date:</span>
              <strong>{issuedOn || "To be assigned"}</strong>
            </div>
            {metadata.map((item) => (
              <div className="billing-doc__meta-row" key={`${item.label}-${item.value}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <div className="billing-doc__table-wrap">
          <table className="billing-doc__table">
            <caption className="sr-only">{headingTitle} line items</caption>
            <thead>
              <tr>
                <th>No</th>
                <th>Description</th>
                <th>HSN/SAC</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.length > 0 ? (
                lineItems.map((item, index) => (
                  <tr key={item.id ?? `${item.description}-${index + 1}`}>
                    <td>{index + 1}</td>
                    <td>{item.description}</td>
                    <td>{item.hsnSac ?? "-"}</td>
                    <td>{item.quantity ?? item.qty ?? 0}</td>
                    <td className="billing-doc__numeric">{formatCurrency(item.price, currency)}</td>
                    <td className="billing-doc__numeric">{formatCurrency(item.total, currency)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="billing-doc__empty" colSpan={6}>
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <section className="billing-doc__summary">
          {summaryRows.map((row) => (
            <div className="billing-doc__summary-row" key={row.label}>
              <span>{row.label}</span>
              <strong>{formatCurrency(row.value, currency)}</strong>
            </div>
          ))}
        </section>

        <section className="billing-doc__footer-panels">
          <div className="billing-doc__panel billing-doc__panel--payment">
            <span className="billing-doc__panel-label">
              {paymentMethod.title ?? "Payment Method"}
            </span>
            {paymentDetails.map((item) => (
              <div className="billing-doc__panel-row" key={`${item.label}-${item.value}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="billing-doc__panel billing-doc__panel--total">
            <span className="billing-doc__panel-label">Grand Total</span>
            <strong className="billing-doc__grand-total">
              {formatCurrency(grandTotal, currency)}
            </strong>
            {paymentMethod.note ? <p>{paymentMethod.note}</p> : null}
          </div>
        </section>

        <section className="billing-doc__closing">
          <div className="billing-doc__closing-card">
            <span className="billing-doc__section-label">Thank you</span>
            <p>{thankYouMessage}</p>
          </div>

          <div className="billing-doc__closing-card">
            <span className="billing-doc__section-label">Terms and Conditions</span>
            <ul>
              {renderedTerms.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="billing-doc__footer">
          <div>
            <span className="billing-doc__section-label">Contact Information</span>
            <DetailLines lines={contactLines} />
          </div>

          <div>
            <span className="billing-doc__section-label">Company Address</span>
            <DetailLines lines={addressLines} />
          </div>
        </footer>
      </article>
    </section>
  );
}
