import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../services/apiClient";
import BillingDocumentTemplate from "./BillingDocumentTemplate";

const quotationDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

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

const extractPricingPayload = (response) => {
  const payload = response?.data?.data ?? response?.data ?? null;
  return Array.isArray(payload) ? payload[0] ?? null : payload;
};

const fallbackCompany = {
  addressLines: [
    "2nd Floor, Visa Matrix Business Centre",
    "M.G. Road, Kochi, Kerala 682016",
  ],
  contactLines: [
    "+91 98765 43210 | billing@visamatrix.local | www.visamatrix.local",
  ],
  logoSrc: "/logo.png",
  name: "Visa Matrix",
  paymentMethod: {
    details: [
      { label: "Account Name", value: "Visa Matrix" },
      { label: "Bank", value: "HDFC Bank" },
      { label: "Account No", value: "0000 1234 5678 9001" },
      { label: "IFSC", value: "HDFC0001234" },
    ],
    note: "Kindly share the transfer reference after payment.",
    title: "Payment Method",
  },
  tagline: "Global visa processing and travel support",
};

const buildQuotationNumber = (application) => {
  const reference =
    application?.applicationCode ??
    application?.application_code ??
    application?.id ??
    `QUOTE-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;

  return `QT-${String(reference).replace(/\s+/g, "-").toUpperCase()}`;
};

const buildLineItemsFromPricing = (pricing) => {
  const itemCandidates = [
    {
      label: "Visa Service",
      keys: ["visa_service", "visaService", "service_fee", "serviceFee", "base_price"],
      hsnSac: "9985",
    },
    {
      label: "Appointment",
      keys: ["appointment", "appointment_fee", "appointmentFee"],
      hsnSac: "9985",
    },
    {
      label: "Embassy Fee",
      keys: ["govt_fee", "govtFee", "embassy_fee", "embassyFee", "government_fee", "governmentFee"],
      hsnSac: "9997",
      isGovernmentFee: true,
    },
    {
      label: "Consultation",
      keys: ["consultation_fee", "consultationFee"],
      hsnSac: "9983",
    },
    {
      label: "Premium Lounge",
      keys: ["premium_lounge", "premium_lounge_fee", "premiumLoungeFee", "lounge_fee"],
      hsnSac: "9985",
    },
    {
      label: "Notary",
      keys: ["notary", "notary_fee", "notaryFee"],
      hsnSac: "9982",
    },
  ];

  return itemCandidates
    .map((candidate, index) => {
      const price = candidate.keys.reduce((resolvedPrice, key) => {
        if (resolvedPrice > 0) {
          return resolvedPrice;
        }

        return toNumber(pricing?.[key]);
      }, 0);

      if (price <= 0) {
        return null;
      }

      return {
        id: `${candidate.label}-${index + 1}`,
        description: candidate.label,
        hsnSac: pricing?.hsn_sac ?? pricing?.hsnSac ?? candidate.hsnSac,
        price,
        quantity: 1,
        total: price,
        isGovernmentFee: Boolean(candidate.isGovernmentFee),
      };
    })
    .filter(Boolean);
};

export default function QuotationTemplate({ application, onClose, selectedApplication }) {
  const [items, setItems] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const activeApplication = selectedApplication ?? application;

  const customerName =
    activeApplication?.customer_name ??
    activeApplication?.customerName ??
    "Not provided";
  const country =
    activeApplication?.destination_country ??
    activeApplication?.destinationCountry ??
    "";
  const countryId = activeApplication?.country_id ?? activeApplication?.countryId ?? null;
  const visaType =
    activeApplication?.visa_type ??
    activeApplication?.visaType ??
    "Not provided";
  const visaTypeId = activeApplication?.visa_type_id ?? activeApplication?.visaTypeId ?? null;

  useEffect(() => {
    let isMounted = true;

    const loadPricing = async () => {
      if (!activeApplication || !country) {
        setPricing(null);
        setItems([]);
        return;
      }

      setLoading(true);
      setPricing(null);

      try {
        let pricingResponse = null;

        if (countryId && visaTypeId) {
          pricingResponse = await apiClient.get(`/visa-fees/${countryId}/${visaTypeId}`);
        } else {
          pricingResponse = await apiClient.get("/visa-rules", {
            params: { country },
          });
        }

        const pricingData = extractPricingPayload(pricingResponse);
        const nextItems = buildLineItemsFromPricing(pricingData);

        if (!isMounted) {
          return;
        }

        setPricing(pricingData);
        setItems(nextItems);
      } catch (error) {
        console.error("Failed to fetch quotation pricing:", error);

        if (!isMounted) {
          return;
        }

        setPricing(null);
        setItems([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPricing();

    return () => {
      isMounted = false;
    };
  }, [activeApplication, country, countryId, visaTypeId]);

  const quotationDate = activeApplication?.submissionDate || activeApplication?.submission_date
    ? new Date(activeApplication?.submissionDate ?? activeApplication?.submission_date)
    : new Date();
  const currency = pricing?.currency ?? "INR";
  const taxableValue = useMemo(
    () => items.filter((item) => !item.isGovernmentFee).reduce((sum, item) => sum + item.total, 0),
    [items],
  );
  const governmentFees = useMemo(
    () => items.filter((item) => item.isGovernmentFee).reduce((sum, item) => sum + item.total, 0),
    [items],
  );
  const govtFee = toNumber(
    pricing?.govt_fee ?? pricing?.govtFee ?? pricing?.government_fee ?? pricing?.governmentFee,
  );
  const serviceFee = toNumber(
    pricing?.service_fee ?? pricing?.serviceFee ?? pricing?.base_price,
  );
  const consultationFee = toNumber(
    pricing?.consultation_fee ?? pricing?.consultationFee,
  );
  const pricingTotal = govtFee + serviceFee + consultationFee;
  const cgst = taxableValue * 0.09;
  const sgst = taxableValue * 0.09;
  const grandTotal = taxableValue + cgst + sgst + governmentFees;
  const recipient = {
    email: activeApplication?.email ?? "",
    name: customerName,
    phone: activeApplication?.phone ?? "",
  };
  const metadata = [
    { label: "Country:", value: country || "Not provided" },
    { label: "Visa Type:", value: visaType },
  ];
  const summaryRows = [
    { label: "CGST (9%)", value: cgst },
    { label: "SGST (9%)", value: sgst },
    { label: "Government fees", value: governmentFees },
  ];
  const emptyMessage = loading
    ? "Loading pricing..."
    : "Pricing is not available yet for the selected country.";
  const thankYouMessage =
    "Thank you for choosing Visa Matrix. We appreciate the opportunity to support your travel documentation.";
  const terms = [
    "Quotation validity and service fees are subject to destination-specific requirements.",
    "Government and embassy charges are applied at actuals and may change without prior notice.",
    "Processing timelines depend on embassy approvals and document completeness.",
  ];

  if (!activeApplication) {
    return <p className="empty-state">Select an application to generate quotation</p>;
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <article className="placeholder-card">
        <span className="profile-card__eyebrow">Quotation</span>
        <p>
          <strong>Customer:</strong> {activeApplication?.customer_name ?? activeApplication?.customerName ?? "Not provided"}
        </p>
        <p>
          <strong>Application ID:</strong> {activeApplication?.id ?? "Not available"}
        </p>
        <p>
          <strong>Destination:</strong> {activeApplication?.destination_country ?? activeApplication?.destinationCountry ?? "Not provided"}
        </p>
        {pricing ? (
          <>
            <p>
              <strong>Govt Fee:</strong> {formatCurrency(govtFee, currency)}
            </p>
            <p>
              <strong>Service Fee:</strong> {formatCurrency(serviceFee, currency)}
            </p>
            <p>
              <strong>Consultation Fee:</strong> {formatCurrency(consultationFee, currency)}
            </p>
            <p>
              <strong>Total:</strong> {formatCurrency(pricingTotal, currency)}
            </p>
          </>
        ) : (
          <p>
            <strong>Pricing:</strong> Loading...
          </p>
        )}
      </article>

      <BillingDocumentTemplate
        company={fallbackCompany}
        currency={currency}
        documentLabel="QUOTATION"
        documentNumber={buildQuotationNumber(activeApplication)}
        emptyMessage={emptyMessage}
        grandTotal={grandTotal}
        issuedOn={quotationDateFormatter.format(quotationDate)}
        lineItems={items}
        metadata={metadata}
        paymentMethod={fallbackCompany.paymentMethod}
        recipient={recipient}
        summaryRows={summaryRows}
        terms={terms}
        thankYouMessage={thankYouMessage}
      />

      {pricing?.short_description ? (
        <article className="placeholder-card">
          <span className="profile-card__eyebrow">Pricing Note</span>
          <strong>{pricing.short_description}</strong>
        </article>
      ) : null}

      <div className="button-row">
        <button className="primary-button" type="button">
          Send to Customer
        </button>
        <button className="secondary-button" onClick={onClose} type="button">
          Back to Checklist
        </button>
      </div>

      {items.length > 0 ? (
        <p className="empty-state" style={{ textAlign: "left" }}>
          Totals shown in {currency} ({formatCurrency(grandTotal, currency)}).
        </p>
      ) : null}
    </div>
  );
}
