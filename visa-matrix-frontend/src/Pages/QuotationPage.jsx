import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import QuotationFooterActions from "../components/QuotationFooterActions";
import QuotationLayout from "../components/QuotationLayout";
import DashboardLayout from "../layout/DashboardLayout";
import {
  fetchApplicationById,
  fetchQuotationTemplate,
  sendQuotation,
} from "../services/application.service";

const buildPricing = (application = {}, template = {}) => {
  const templatePricing = template.pricing ?? {};
  const visaFee =
    application.visaFee ??
    application.visa_fee ??
    application.govt_fee ??
    templatePricing.visaFee ??
    0;
  const serviceCharges =
    application.serviceCharges ??
    application.service_charges ??
    application.service_fee ??
    templatePricing.serviceCharges ??
    0;

  return {
    visaFee,
    serviceCharges,
    totalAmount:
      application.totalAmount ??
      application.total_amount ??
      templatePricing.totalAmount ??
      Number(visaFee || 0) + Number(serviceCharges || 0),
  };
};

export default function QuotationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [template, setTemplate] = useState(null);
  const [pricing, setPricing] = useState({ visaFee: 0, serviceCharges: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadQuotation = async () => {
      setLoading(true);
      setError("");

      try {
        const [nextApplication, nextTemplate] = await Promise.all([
          fetchApplicationById(id),
          fetchQuotationTemplate(),
        ]);

        if (!isMounted) {
          return;
        }

        setApplication(nextApplication);
        setTemplate(nextTemplate);
        setPricing(buildPricing(nextApplication, nextTemplate));
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError?.response?.data?.message ??
              loadError?.message ??
              "Unable to load quotation.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadQuotation();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const pageTitle = useMemo(() => {
    if (!application?.customerName) {
      return "Quotation";
    }

    return `Quotation for ${application.customerName}`;
  }, [application]);

  const handleTemplateChange = (content) => {
    setTemplate((currentTemplate) => ({
      ...(currentTemplate ?? {}),
      content,
    }));
  };

  const handleSend = async () => {
    if (!application) {
      return;
    }

    setSending(true);
    setToast("");
    setError("");

    try {
      await sendQuotation({
        application_id: id,
        email: application.email,
      });
      setToast("Quotation sent successfully.");
    } catch (sendError) {
      setError(
        sendError?.response?.data?.message ??
          sendError?.message ??
          "Unable to send quotation.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        action={
          <button className="secondary-button" onClick={() => navigate(`/applications/${id}`)} type="button">
            Back to Lead
          </button>
        }
        description="Print-ready A4 quotation prepared from the saved template and application details."
        title={pageTitle}
      />

      {loading ? <section className="panel"><p>Loading quotation...</p></section> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {toast ? <div className="toast-success">{toast}</div> : null}

      {!loading && application && template ? (
        <>
          <QuotationLayout
            application={application}
            editMode={editMode}
            onPricingChange={setPricing}
            onTemplateChange={handleTemplateChange}
            pricing={pricing}
            template={template}
          />
          <QuotationFooterActions
            editMode={editMode}
            onEdit={() => setEditMode((currentMode) => !currentMode)}
            onSend={handleSend}
            sending={sending}
          />
        </>
      ) : null}
    </DashboardLayout>
  );
}
