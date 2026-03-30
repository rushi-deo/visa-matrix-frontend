export const ENABLE_ENHANCEMENTS = true;

export const ENABLE_GROUPED_SIDEBAR = false;

export const GROUPED_SIDEBAR_CONFIG = [
  {
    id: "overview",
    label: "Overview",
    items: ["/dashboard", "/reports", "/audit-logs"],
  },
  {
    id: "operations",
    label: "Operations",
    items: ["/customers", "/applications", "/documents", "/tasks"],
  },
  {
    id: "finance",
    label: "Finance",
    items: ["/payments", "/workflow"],
  },
  {
    id: "administration",
    label: "Administration",
    items: ["/hr", "/communication", "/admin", "/settings"],
  },
];
