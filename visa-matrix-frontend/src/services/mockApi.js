import { applications } from "../data/applications";
import { countries } from "../data/countries";
import { customers } from "../data/customers";
import { checklistCatalog, documents, visaDocumentChecklists } from "../data/documents";
import { leads } from "../data/leads";
import { payments } from "../data/payments";
import { tasks } from "../data/tasks";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatCurrency = (value) => currencyFormatter.format(value);

const cloneItems = (items) => items.map((item) => ({ ...item }));

export const getApplications = () => cloneItems(applications);
export const getCountries = () => cloneItems(countries);
export const getCustomers = () => cloneItems(customers);
export const getDocuments = () => cloneItems(documents);
export const getChecklistCatalog = () => [...checklistCatalog];
export const getVisaDocumentChecklists = () => ({ ...visaDocumentChecklists });
export const getLeads = () => cloneItems(leads);
export const getPayments = () => cloneItems(payments);
export const getTasks = () => cloneItems(tasks);

export const getDashboardMetrics = (
  applicationRows = applications,
  paymentRows = payments,
  leadRows = leads,
  documentRows = documents,
) => ({
  totalApplications: applicationRows.length,
  pendingApplications: applicationRows.filter((application) =>
    ["Draft", "Documents Pending", "Filed", "Embassy Processing"].includes(
      application.status,
    ),
  ).length,
  approvedVisas: applicationRows.filter(
    (application) => application.status === "Approved",
  ).length,
  totalRevenue: paymentRows
    .filter((payment) => payment.paymentStatus === "Paid")
    .reduce((sum, payment) => sum + payment.amount, 0),
  activeLeads: leadRows.filter((lead) => lead.status !== "Converted").length,
  documentsPending: applicationRows.filter((application) => {
    const required = visaDocumentChecklists[application.visaType] ?? checklistCatalog;
    const uploaded = documentRows.filter(
      (document) => document.applicationId === application.id,
    );

    return uploaded.length < required.length;
  }).length,
});

export const getRecentApplications = (applicationRows = applications) =>
  [...applicationRows].sort((first, second) =>
    second.submissionDate.localeCompare(first.submissionDate),
  );

export const getRecentPayments = (paymentRows = payments) =>
  [...paymentRows].sort((first, second) =>
    second.invoiceDate.localeCompare(first.invoiceDate),
  );

export const getRecentLeads = (leadRows = leads) =>
  [...leadRows].sort((first, second) =>
    second.consultationDate.localeCompare(first.consultationDate),
  );

export const getCountryApplicationSummary = (applicationRows = applications) => {
  const summary = applicationRows.reduce((accumulator, application) => {
    const currentTotal = accumulator[application.destinationCountry] ?? 0;

    return {
      ...accumulator,
      [application.destinationCountry]: currentTotal + 1,
    };
  }, {});

  return Object.entries(summary)
    .map(([country, total]) => ({ country, total }))
    .sort((first, second) => second.total - first.total);
};

export const getVisaTypeSummary = (applicationRows = applications) => {
  const summary = applicationRows.reduce((accumulator, application) => {
    const currentTotal = accumulator[application.visaType] ?? 0;

    return {
      ...accumulator,
      [application.visaType]: currentTotal + 1,
    };
  }, {});

  return Object.entries(summary)
    .map(([visaType, total]) => ({ visaType, total }))
    .sort((first, second) => second.total - first.total);
};

export const getMonthlyRevenue = (paymentRows = payments) => {
  const summary = paymentRows.reduce((accumulator, payment) => {
    if (payment.paymentStatus !== "Paid" || !payment.paidOn) {
      return accumulator;
    }

    const monthKey = payment.paidOn.slice(0, 7);
    const currentTotal = accumulator[monthKey] ?? 0;

    return {
      ...accumulator,
      [monthKey]: currentTotal + payment.amount,
    };
  }, {});

  return Object.entries(summary)
    .sort(([firstMonth], [secondMonth]) =>
      firstMonth.localeCompare(secondMonth),
    )
    .map(([monthKey, total]) => ({
      month: new Date(`${monthKey}-01`).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      total,
    }));
};

export const getAgentPerformance = (
  leadRows = leads,
  applicationRows = applications,
) => {
  const summary = leadRows.reduce((accumulator, lead) => {
    const previous = accumulator[lead.assignedAgent] ?? {
      agent: lead.assignedAgent,
      totalLeads: 0,
      converted: 0,
      activeCases: 0,
    };

    return {
      ...accumulator,
      [lead.assignedAgent]: {
        ...previous,
        totalLeads: previous.totalLeads + 1,
        converted: previous.converted + (lead.status === "Converted" ? 1 : 0),
      },
    };
  }, {});

  applicationRows.forEach((application) => {
    const previous = summary[application.assignedAgent] ?? {
      agent: application.assignedAgent,
      totalLeads: 0,
      converted: 0,
      activeCases: 0,
    };

    summary[application.assignedAgent] = {
      ...previous,
      activeCases: previous.activeCases + 1,
    };
  });

  return Object.values(summary).map((agent) => ({
    ...agent,
    activePipeline: agent.totalLeads - agent.converted,
  }));
};

export const getWorkflowSnapshot = (applicationRows = applications) => {
  const summary = applicationRows.reduce((accumulator, application) => {
    const currentTotal = accumulator[application.stage] ?? 0;

    return {
      ...accumulator,
      [application.stage]: currentTotal + 1,
    };
  }, {});

  return Object.entries(summary).map(([stage, total]) => ({ stage, total }));
};

export const getVisaSuccessRate = (applicationRows = applications) => {
  const finalDecisions = applicationRows.filter((application) =>
    ["Approved", "Rejected"].includes(application.status),
  );

  if (finalDecisions.length === 0) {
    return 0;
  }

  const approvedCount = finalDecisions.filter(
    (application) => application.status === "Approved",
  ).length;

  return Math.round((approvedCount / finalDecisions.length) * 100);
};
