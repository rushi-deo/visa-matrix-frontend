const createTimestamp = () => new Date().toISOString();

const defaultDepartmentId = "dept-general";

export const hrMemoryStore = {
  departments: [
    {
      id: defaultDepartmentId,
      name: "General",
      created_at: createTimestamp(),
      organization_id: "ORG-INTERNAL",
    },
  ],
  employees: [],
  leaves: [],
  attendance: [],
  workflows: [],
  workflow_steps: [],
  polls: [],
  poll_responses: [],
  feedback: [],
  kudos: [],
  announcements: [],
  notifications: [],
  documents: [],
};

export const cloneRecord = (value) => JSON.parse(JSON.stringify(value));

export const createHrId = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const getDefaultDepartmentId = () => defaultDepartmentId;
