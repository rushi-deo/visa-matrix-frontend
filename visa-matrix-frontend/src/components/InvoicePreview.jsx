import React from "react";

const CURRENCY_FALLBACK = "INR";

const toNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatCurrency = (value, currency = CURRENCY_FALLBACK) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(toNumber(value));

const isPresent = (value) => value !== undefined && value !== null && value !== "";

const findFirstMatchingValue = (source, keys) => {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  const queue = [source];
  const seen = new Set();
  const normalizedKeys = keys.map((key) => key.toLowerCase());

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || typeof current !== "object" || seen.has(current)) {
      continue;
    }

    seen.add(current);

    for (const [key, value] of Object.entries(current)) {
      if (normalizedKeys.includes(String(key).toLowerCase()) && isPresent(value)) {
        return value;
      }

      if (value && typeof value === "object") {
        queue.push(value);
      }
    }
  }

  return undefined;
};

const getInvoiceField = (invoiceData, keys, fallback) => {
  const resolvedValue = findFirstMatchingValue(invoiceData, keys);
  return isPresent(resolvedValue) ? resolvedValue : fallback;
};

const formatInvoiceAmount = (value, currency) =>
  isPresent(value) ? formatCurrency(value, currency) : "Not provided";

const formatPercent = (value) => (isPresent(value) ? `${value}%` : "Not provided");

const getBase64Payload = (value) =>
  String(value ?? "").replace(/^data:application\/pdf;base64,/i, "");

export default function InvoicePreview({ application, invoiceData }) {
  const country =
    getInvoiceField(invoiceData, ["country", "destinationCountry", "destination_country"]) ??
    application?.destinationCountry ??
    application?.destination_country ??
    "Not provided";
  const visaType =
    getInvoiceField(invoiceData, ["visaType", "visa_type"]) ??
    application?.visaType ??
    application?.visa_type ??
    "Not provided";
  const currency = getInvoiceField(invoiceData, ["currency"], CURRENCY_FALLBACK);
  const govtFee = getInvoiceField(invoiceData, [
    "govtFee",
    "govt_fee",
    "governmentFee",
    "government_fee",
  ]);
  const serviceFee = getInvoiceField(invoiceData, ["serviceFee", "service_fee", "baseFee", "base_fee"]);
  const consultationFee = getInvoiceField(invoiceData, ["consultationFee", "consultation_fee"]);
  const gstPercent = getInvoiceField(invoiceData, ["gstPercent", "gst_percent", "gstRate", "gst_rate"]);
  const gstAmount = getInvoiceField(invoiceData, ["gstAmount", "gst_amount", "taxAmount", "tax_amount"]);
  const totalAmount = getInvoiceField(invoiceData, ["totalAmount", "total_amount", "grandTotal", "grand_total", "amount"]);
  const pdfBase64 = getInvoiceField(invoiceData, [
    "pdfBase64",
    "pdf_base64",
    "base64",
    "fileBase64",
    "file_base64",
    "contentBase64",
    "content_base64",
  ]);
  const pdfUrl = getInvoiceField(invoiceData, [
    "pdfUrl",
    "pdf_url",
    "downloadUrl",
    "download_url",
    "fileUrl",
    "file_url",
    "url",
  ]);
  const fileName =
    getInvoiceField(invoiceData, ["pdfFileName", "pdf_filename", "fileName", "filename"]) ??
    `invoice-${String(country).replace(/\s+/g, "-").toLowerCase()}-${String(visaType)
      .replace(/\s+/g, "-")
      .toLowerCase()}.pdf`;
  const canDownload = Boolean(pdfBase64 || pdfUrl);

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (!pdfBase64) {
      return;
    }

    const byteCharacters = window.atob(getBase64Payload(pdfBase64));
    const byteNumbers = Array.from(byteCharacters, (character) => character.charCodeAt(0));
    const pdfBlob = new Blob([new Uint8Array(byteNumbers)], {
      type: "application/pdf",
    });
    const blobUrl = window.URL.createObjectURL(pdfBlob);
    const anchor = document.createElement("a");

    anchor.href = blobUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(blobUrl);
  };

  return (
    <article className="placeholder-card">
      <span className="profile-card__eyebrow">Invoice Preview</span>
      <dl className="detail-list">
        <div>
          <dt>Country</dt>
          <dd>{country}</dd>
        </div>
        <div>
          <dt>Visa Type</dt>
          <dd>{visaType}</dd>
        </div>
        <div>
          <dt>Govt Fee</dt>
          <dd>{formatInvoiceAmount(govtFee, currency)}</dd>
        </div>
        <div>
          <dt>Service Fee</dt>
          <dd>{formatInvoiceAmount(serviceFee, currency)}</dd>
        </div>
        <div>
          <dt>Consultation Fee</dt>
          <dd>{formatInvoiceAmount(consultationFee, currency)}</dd>
        </div>
        <div>
          <dt>GST %</dt>
          <dd>{formatPercent(gstPercent)}</dd>
        </div>
        <div>
          <dt>GST Amount</dt>
          <dd>{formatInvoiceAmount(gstAmount, currency)}</dd>
        </div>
        <div>
          <dt>Total Amount</dt>
          <dd>{formatInvoiceAmount(totalAmount, currency)}</dd>
        </div>
      </dl>

      {canDownload ? (
        <div className="button-row">
          <button className="primary-button" onClick={handleDownload} type="button">
            Download Invoice
          </button>
        </div>
      ) : null}
    </article>
  );
}
