import { applications as mockApplications } from "../src/data/applications.js";
import { customers as mockCustomers } from "../src/data/customers.js";
import { documents as mockDocuments } from "../src/data/documents.js";
import { leads as mockLeads } from "../src/data/leads.js";
import { getApplications as getScopedApplications } from "./applicationsService.js";

const INTERNAL_ORGANIZATION_ID = "ORG-INTERNAL";
const AGENCY_ORGANIZATION_ID = "ORG-AGENCY-1";

const normalizeQuery = (value) => String(value ?? "").trim().toLowerCase();

const matchesQuery = (fields, query) =>
  fields.some((field) => String(field ?? "").toLowerCase().includes(query));

const isInUserScope = (user, organizationId) =>
  user?.role === "admin" || !organizationId || user?.organization_id === organizationId;

const applicationOrganizationMap = new Map(
  mockApplications.map((application, index) => [
    application.id,
    index % 2 === 0 ? INTERNAL_ORGANIZATION_ID : AGENCY_ORGANIZATION_ID,
  ]),
);

const customerOrganizationMap = new Map(
  mockApplications
    .filter((application) => application.customerId)
    .map((application, index) => [
      application.customerId,
      index % 2 === 0 ? INTERNAL_ORGANIZATION_ID : AGENCY_ORGANIZATION_ID,
    ]),
);

const fallbackCustomers = mockCustomers.map((customer, index) => ({
  ...customer,
  organization_id:
    customerOrganizationMap.get(customer.id) ??
    (index % 2 === 0 ? INTERNAL_ORGANIZATION_ID : AGENCY_ORGANIZATION_ID),
}));

const fallbackDocuments = mockDocuments.map((document) => ({
  ...document,
  organization_id:
    applicationOrganizationMap.get(document.applicationId) ?? INTERNAL_ORGANIZATION_ID,
}));

const fallbackLeads = mockLeads.map((lead, index) => ({
  ...lead,
  organization_id: index % 2 === 0 ? INTERNAL_ORGANIZATION_ID : AGENCY_ORGANIZATION_ID,
}));

const buildLeadResult = (lead) => ({
  id: `lead:${lead.id}`,
  entityId: lead.id,
  type: "lead",
  title: lead.leadName,
  subtitle: `${lead.interestedCountry} • ${lead.visaType}`,
  description: `${lead.status} • ${lead.assignedAgent}`,
  path: "/crm",
});

const buildCustomerResult = (customer) => ({
  id: `customer:${customer.id}`,
  entityId: customer.id,
  type: "customer",
  title: customer.name,
  subtitle: `${customer.passportNumber} • ${customer.assignedAgent}`,
  description: customer.email,
  path: "/customers",
});

const buildApplicationResult = (application) => ({
  id: `application:${application.id}`,
  entityId: application.id,
  type: "application",
  title: application.customerName,
  subtitle: `${application.destinationCountry} • ${application.visaType}`,
  description: `${application.id} • ${application.status}`,
  path: "/applications",
});

const buildDocumentResult = (document) => ({
  id: `document:${document.id}`,
  entityId: document.id,
  type: "document",
  title: document.documentName,
  subtitle: `${document.applicationId} • ${document.fileType}`,
  description: document.fileName,
  path: "/documents",
});

export async function searchWorkspace({ query, user, limit = 8 }) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  const applications = await getScopedApplications(user);
  const scopedCustomers = fallbackCustomers.filter((customer) =>
    isInUserScope(user, customer.organization_id),
  );
  const scopedDocuments = fallbackDocuments.filter((document) =>
    isInUserScope(user, document.organization_id),
  );
  const scopedLeads = fallbackLeads.filter((lead) =>
    isInUserScope(user, lead.organization_id),
  );

  const results = [
    ...scopedLeads
      .filter((lead) =>
        matchesQuery(
          [
            lead.id,
            lead.leadName,
            lead.email,
            lead.phone,
            lead.interestedCountry,
            lead.visaType,
            lead.status,
            lead.assignedAgent,
          ],
          normalizedQuery,
        ),
      )
      .map(buildLeadResult),
    ...scopedCustomers
      .filter((customer) =>
        matchesQuery(
          [
            customer.id,
            customer.name,
            customer.passportNumber,
            customer.contact,
            customer.email,
            customer.assignedAgent,
          ],
          normalizedQuery,
        ),
      )
      .map(buildCustomerResult),
    ...applications
      .filter((application) =>
        matchesQuery(
          [
            application.id,
            application.customerName,
            application.email,
            application.phone,
            application.destinationCountry,
            application.visaType,
            application.assignedAgent,
            application.status,
          ],
          normalizedQuery,
        ),
      )
      .map(buildApplicationResult),
    ...scopedDocuments
      .filter((document) =>
        matchesQuery(
          [
            document.id,
            document.documentName,
            document.applicationId,
            document.uploadedBy,
            document.fileName,
            document.fileType,
          ],
          normalizedQuery,
        ),
      )
      .map(buildDocumentResult),
  ];

  return results.slice(0, Math.max(1, Number(limit) || 8));
}
