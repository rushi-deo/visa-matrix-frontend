import React from "react";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

const placeholders = {
  customerName: ["{{customerName}}", "{{customer_name}}", "{customerName}"],
  passportNumber: ["{{passportNumber}}", "{{passport_number}}", "{passportNumber}"],
  destinationCountry: [
    "{{destinationCountry}}",
    "{{destination_country}}",
    "{destinationCountry}",
  ],
  visaType: ["{{visaType}}", "{{visa_type}}", "{visaType}"],
};

const replacePlaceholders = (templateContent = "", application = {}) => {
  let content = templateContent;
  const values = {
    customerName: application.customerName ?? application.customer_name ?? "",
    passportNumber: application.passportNumber ?? application.passport_number ?? "",
    destinationCountry:
      application.destinationCountry ?? application.destination_country ?? "",
    visaType: application.visaType ?? application.visa_type ?? "",
  };

  Object.entries(placeholders).forEach(([key, tokens]) => {
    tokens.forEach((token) => {
      content = content.replaceAll(token, values[key]);
    });
  });

  return content;
};

export default function QuotationLayout({
  application,
  template,
  pricing,
  editMode = false,
  onTemplateChange,
  onPricingChange,
}) {
  const company = template?.company ?? {};
  const templateContent =
    template?.content ??
    "Dear {{customerName}},\n\nPlease find below the quotation for your {{destinationCountry}} {{visaType}} application.";
  const resolvedBody = replacePlaceholders(templateContent, application);
  const totalAmount =
    Number(pricing.totalAmount) ||
    Number(pricing.visaFee || 0) + Number(pricing.serviceCharges || 0);

  const updatePricing = (key, value) => {
    onPricingChange?.({
      ...pricing,
      [key]: value,
      totalAmount:
        key === "totalAmount"
          ? value
          : Number(key === "visaFee" ? value : pricing.visaFee || 0) +
            Number(key === "serviceCharges" ? value : pricing.serviceCharges || 0),
    });
  };

  return (
    <article className="quotation-a4">
      <header className="quotation-header">
        <div className="quotation-brand">
          {company.logoUrl ? (
            <img alt={`${company.name ?? "Company"} logo`} src={company.logoUrl} />
          ) : null}
          <div>
            <h1>{company.name ?? "Visa Matrix"}</h1>
            <p>{company.address ?? "Visa Matrix CRM"}</p>
            <p>{company.contact ?? "contact@visamatrix.local"}</p>
          </div>
        </div>
        <div className="quotation-meta">
          <span>Quotation</span>
          <strong>{application.applicationCode ?? application.id}</strong>
        </div>
      </header>

      <section className="quotation-section quotation-client-grid">
        <div>
          <span>Customer Name</span>
          <strong>{application.customerName || "Not provided"}</strong>
        </div>
        <div>
          <span>Passport Number</span>
          <strong>{application.passportNumber || "Not provided"}</strong>
        </div>
        <div>
          <span>Destination Country</span>
          <strong>{application.destinationCountry || "Not provided"}</strong>
        </div>
        <div>
          <span>Visa Type</span>
          <strong>{application.visaType || "Not provided"}</strong>
        </div>
      </section>

      <section className="quotation-section">
        <h2>Quotation Details</h2>
        {editMode ? (
          <label className="field">
            <span>Template Content</span>
            <textarea
              onChange={(event) => onTemplateChange?.(event.target.value)}
              value={templateContent}
            />
          </label>
        ) : (
          <div className="quotation-body">
            {resolvedBody.split("\n").map((line, index) => (
              <p key={`${line}-${index}`}>{line || "\u00a0"}</p>
            ))}
          </div>
        )}
      </section>

      <section className="quotation-section">
        <h2>Pricing</h2>
        <div className="quotation-pricing">
          <div>
            <span>Visa Fee</span>
            {editMode ? (
              <input
                min="0"
                onChange={(event) => updatePricing("visaFee", event.target.value)}
                type="number"
                value={pricing.visaFee}
              />
            ) : (
              <strong>{formatCurrency(pricing.visaFee)}</strong>
            )}
          </div>
          <div>
            <span>Service Charges</span>
            {editMode ? (
              <input
                min="0"
                onChange={(event) => updatePricing("serviceCharges", event.target.value)}
                type="number"
                value={pricing.serviceCharges}
              />
            ) : (
              <strong>{formatCurrency(pricing.serviceCharges)}</strong>
            )}
          </div>
          <div className="quotation-pricing__total">
            <span>Total Amount</span>
            {editMode ? (
              <input
                min="0"
                onChange={(event) => updatePricing("totalAmount", event.target.value)}
                type="number"
                value={totalAmount}
              />
            ) : (
              <strong>{formatCurrency(totalAmount)}</strong>
            )}
          </div>
        </div>
      </section>
    </article>
  );
}
