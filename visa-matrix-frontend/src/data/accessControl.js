export const AUTH_STORAGE_KEY = "visa-matrix-auth";

export const ERP_ROLES = [
  "super_admin",
  "admin",
  "counselor",
  "finance",
  "hr",
  "operations",
];

export const ERP_MODULES = [
  "dashboard",
  "customers",
  "applications",
  "countries",
  "documents",
  "invoicing",
  "hr",
  "notifications",
  "audit_logs",
  "workflow",
  "visa_questions",
  "tasks",
  "reports",
  "settings",
];

const ALL_ACTIONS = ["view", "create", "edit", "delete", "approve"];
const VIEW_ONLY = ["view"];
const STANDARD_WRITE = ["view", "create", "edit"];
const APPROVAL_WRITE = ["view", "create", "edit", "approve"];

export const ROLE_PERMISSIONS = {
  super_admin: ERP_MODULES.reduce((permissions, moduleName) => {
    permissions[moduleName] = ALL_ACTIONS;
    return permissions;
  }, {}),
  admin: {
    dashboard: VIEW_ONLY,
    customers: STANDARD_WRITE,
    applications: APPROVAL_WRITE,
    countries: STANDARD_WRITE,
    documents: STANDARD_WRITE,
    invoicing: APPROVAL_WRITE,
    notifications: STANDARD_WRITE,
    workflow: APPROVAL_WRITE,
    visa_questions: STANDARD_WRITE,
    tasks: STANDARD_WRITE,
    reports: VIEW_ONLY,
    settings: VIEW_ONLY,
  },
  counselor: {
    dashboard: VIEW_ONLY,
    customers: STANDARD_WRITE,
    applications: STANDARD_WRITE,
    countries: VIEW_ONLY,
    documents: STANDARD_WRITE,
    notifications: VIEW_ONLY,
    workflow: VIEW_ONLY,
    visa_questions: STANDARD_WRITE,
    tasks: STANDARD_WRITE,
    reports: VIEW_ONLY,
  },
  finance: {
    dashboard: VIEW_ONLY,
    customers: VIEW_ONLY,
    applications: VIEW_ONLY,
    documents: VIEW_ONLY,
    invoicing: APPROVAL_WRITE,
    hr: VIEW_ONLY,
    notifications: VIEW_ONLY,
    reports: VIEW_ONLY,
  },
  hr: {
    dashboard: VIEW_ONLY,
    hr: STANDARD_WRITE,
    notifications: VIEW_ONLY,
    reports: VIEW_ONLY,
  },
  operations: {
    dashboard: VIEW_ONLY,
    customers: VIEW_ONLY,
    applications: APPROVAL_WRITE,
    countries: VIEW_ONLY,
    documents: STANDARD_WRITE,
    notifications: STANDARD_WRITE,
    workflow: STANDARD_WRITE,
    visa_questions: VIEW_ONLY,
    tasks: STANDARD_WRITE,
    reports: VIEW_ONLY,
  },
};

export function hasModulePermission(role, moduleName, action = "view", permissionMap = ROLE_PERMISSIONS) {
  if (!role || !moduleName) {
    return false;
  }

  const allowedActions = permissionMap[role]?.[moduleName] ?? [];
  return allowedActions.includes(action);
}
