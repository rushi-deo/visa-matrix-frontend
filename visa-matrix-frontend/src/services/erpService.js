import { checklistCatalog, documents } from "../data/documents";

export const workflowStages = [
  "Lead",
  "Consultation",
  "Document Collection",
  "Application Filing",
  "Embassy Processing",
  "Visa Approved / Rejected",
];

const stageToStatusMap = {
  Lead: "Draft",
  Consultation: "Draft",
  "Document Collection": "Documents Pending",
  "Application Filing": "Filed",
  "Embassy Processing": "Embassy Processing",
  "Visa Approved / Rejected": "Approved",
};

const acceptedFileTypes = ["PDF", "JPG", "PNG", "DOCX"];

export const supportedUploadTypes = ".pdf,.jpg,.jpeg,.png,.docx";

export const getStatusFromStage = (stage, finalDecision = "Approved") => {
  if (stage === "Visa Approved / Rejected") {
    return finalDecision;
  }

  return stageToStatusMap[stage] ?? "Draft";
};

export const updateApplicationWorkflow = (
  application,
  stage,
  finalDecision = "Approved",
) => ({
  ...application,
  stage,
  status: getStatusFromStage(stage, finalDecision),
});

export const getChecklistForVisaType = (visaType, checklists) =>
  checklists?.[visaType] ?? checklistCatalog;

export const getUploadedDocumentsForApplication = (
  applicationId,
  documentRows = documents,
) =>
  documentRows.filter((document) => document.applicationId === applicationId);

export const getMissingDocuments = (
  application,
  documentRows,
  checklists,
) => {
  if (!application) {
    return [];
  }

  const required = getChecklistForVisaType(application.visaType, checklists);
  const uploadedNames = new Set(
    getUploadedDocumentsForApplication(application.id, documentRows).map(
      (document) => document.documentName,
    ),
  );

  return required.filter((documentName) => !uploadedNames.has(documentName));
};

const parseDate = (value) => new Date(`${value}T00:00:00`);

export const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const getPaymentReminderAlerts = (paymentRows) => {
  const today = new Date();

  return paymentRows
    .filter((payment) => payment.paymentStatus !== "Paid")
    .map((payment) => {
      const dueDate = parseDate(payment.dueDate);
      const diffInDays = Math.ceil((dueDate - today) / 86400000);

      return {
        id: `payment-${payment.invoiceId}`,
        type: payment.paymentStatus === "Overdue" ? "danger" : "warning",
        title:
          payment.paymentStatus === "Overdue"
            ? "Overdue invoice"
            : "Upcoming payment reminder",
        description:
          payment.paymentStatus === "Overdue"
            ? `${payment.customer} has an overdue balance for ${payment.application}.`
            : `${payment.customer} has a payment due in ${Math.max(diffInDays, 0)} day(s).`,
      };
    });
};

export const getInterviewReminderAlerts = (applicationRows) => {
  const today = new Date();

  return applicationRows
    .filter(
      (application) =>
        application.embassyInterviewDate &&
        !["Approved", "Rejected"].includes(application.status),
    )
    .map((application) => {
      const interviewDate = parseDate(application.embassyInterviewDate);
      const diffInDays = Math.ceil((interviewDate - today) / 86400000);

      return {
        id: `interview-${application.id}`,
        type: diffInDays <= 3 ? "info" : "neutral",
        title: "Embassy interview reminder",
        description: `${application.customerName} interview is scheduled for ${formatDate(
          application.embassyInterviewDate,
        )}.`,
        daysUntil: diffInDays,
      };
    })
    .filter((alert) => alert.daysUntil <= 10);
};

export const getMissingDocumentAlerts = (
  applicationRows,
  documentRows,
  checklists,
) =>
  applicationRows
    .map((application) => {
      const missingDocuments = getMissingDocuments(
        application,
        documentRows,
        checklists,
      );

      if (missingDocuments.length === 0) {
        return null;
      }

      return {
        id: `documents-${application.id}`,
        type: "warning",
        title: "Missing document alert",
        description: `${application.customerName} is still missing ${missingDocuments.join(
          ", ",
        )}.`,
      };
    })
    .filter(Boolean);

export const getAutomationAlerts = (
  applicationRows,
  documentRows,
  paymentRows,
  checklists,
) => [
  ...getMissingDocumentAlerts(applicationRows, documentRows, checklists),
  ...getPaymentReminderAlerts(paymentRows),
  ...getInterviewReminderAlerts(applicationRows),
];

export const paginateRows = (rows, page, pageSize) =>
  rows.slice((page - 1) * pageSize, page * pageSize);

export const getPageCount = (rows, pageSize) =>
  Math.max(1, Math.ceil(rows.length / pageSize));

export const buildApplicationFromForm = (values) => ({
  id: `APP-${Date.now().toString().slice(-4)}`,
  customerName: values.customerName,
  passportNumber: values.passportNumber,
  email: values.email,
  phone: values.phone,
  destinationCountry: values.destinationCountry,
  visaType: values.visaType,
  travelDate: values.travelDate,
  assignedAgent: values.agentAssigned,
  leadSource: values.leadSource ?? "Manual",
  stage: "Lead",
  status: "Draft",
  submissionDate: new Date().toISOString().slice(0, 10),
  notes: values.notes,
  embassyInterviewDate: values.travelDate,
});

export const isUploadTypeSupported = (fileName = "") =>
  acceptedFileTypes.includes(fileName.split(".").pop()?.toUpperCase() ?? "");
