import { createNotFoundError } from "../../shared/errors.js";
import { getHrStore } from "../../shared/repository/hrStore.js";
import { generateId } from "../../shared/repository/hrRepositoryUtils.js";
import { applyQueryOptions } from "../../shared/repository/queryUtils.js";

const table = getHrStore();

export const workflowRepository = {
  async listDefinitions(query = {}) {
    return applyQueryOptions(table.workflow_definitions, {
      filters: { module: query.module },
      search: query.search,
      searchFields: ["module", "name"],
      sortBy: query.sortBy ?? "created_at",
      sortOrder: query.sortOrder ?? "desc",
      page: query.page,
      pageSize: query.pageSize,
    });
  },
  async createDefinition(payload) {
    const record = {
      id: generateId("wfd"),
      is_active: true,
      created_at: new Date().toISOString(),
      ...payload,
    };

    table.workflow_definitions.unshift(record);
    return structuredClone(record);
  },
  async listInstances(query = {}) {
    return applyQueryOptions(table.workflow_instances, {
      filters: {
        module: query.module,
        status: query.status,
      },
      search: query.search,
      searchFields: ["module", "reference_id", "status"],
      sortBy: query.sortBy ?? "updated_at",
      sortOrder: query.sortOrder ?? "desc",
      page: query.page,
      pageSize: query.pageSize,
    });
  },
  async createInstance(payload) {
    const record = {
      id: generateId("wfi"),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...payload,
    };

    table.workflow_instances.unshift(record);
    return structuredClone(record);
  },
  async updateInstance(workflowInstanceId, payload) {
    const workflowIndex = table.workflow_instances.findIndex((item) => item.id === workflowInstanceId);
    if (workflowIndex === -1) {
      throw createNotFoundError("Workflow instance");
    }

    table.workflow_instances[workflowIndex] = {
      ...table.workflow_instances[workflowIndex],
      ...payload,
      updated_at: new Date().toISOString(),
    };

    return structuredClone(table.workflow_instances[workflowIndex]);
  },
  async findDefinitionByModule(moduleName) {
    return structuredClone(table.workflow_definitions.find((item) => item.module === moduleName && item.is_active));
  },
  async findInstanceByReference(referenceId) {
    return structuredClone(table.workflow_instances.find((item) => item.reference_id === referenceId));
  },
};

