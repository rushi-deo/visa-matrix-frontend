import { dto, createSchema } from "../../shared/validation/schema.js";
import { WORKFLOW_STATUSES } from "../../shared/constants.js";

const workflowStepSchema = dto.object({
  key: dto.string(),
  name: dto.string(),
  approverRole: dto.string(),
  order: dto.number({ min: 1 }),
});

export const workflowQuerySchema = createSchema({
  module: dto.string({ optional: true }),
  status: dto.string({ optional: true }),
  search: dto.string({ optional: true, allowEmpty: true }),
  sortBy: dto.string({ optional: true }),
  sortOrder: dto.string({ optional: true }),
  page: dto.number({ optional: true, defaultValue: 1, min: 1 }),
  pageSize: dto.number({ optional: true, defaultValue: 10, min: 1 }),
});

export const workflowDefinitionSchema = createSchema({
  module: dto.string(),
  name: dto.string(),
  steps: dto.array(workflowStepSchema),
});

export const workflowInstanceSchema = createSchema({
  workflow_definition_id: dto.string(),
  reference_id: dto.string(),
  module: dto.string(),
  status: dto.enumeration(WORKFLOW_STATUSES, { optional: true, defaultValue: "pending" }),
});

export const workflowAdvanceSchema = createSchema({
  decision: dto.enumeration(["approved", "rejected"]),
  remarks: dto.string({ optional: true, allowEmpty: true }),
});

