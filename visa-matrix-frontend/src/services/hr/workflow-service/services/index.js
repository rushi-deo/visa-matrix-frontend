import { createForbiddenError, createNotFoundError } from "../../shared/errors.js";
import { workflowRepository } from "../repository/index.js";

const buildStepsForInstance = (steps = []) =>
  steps
    .sort((left, right) => left.order - right.order)
    .map((step, index) => ({
      key: step.key,
      name: step.name,
      approverRole: step.approverRole,
      status: index === 0 ? "pending" : "locked",
      acted_by: null,
      remarks: null,
      order: step.order,
    }));

export const workflowService = {
  async listDefinitions(query) {
    return workflowRepository.listDefinitions(query);
  },
  async createDefinition(payload) {
    return workflowRepository.createDefinition(payload);
  },
  async listInstances(query) {
    return workflowRepository.listInstances(query);
  },
  async createInstance(payload) {
    const definition = await workflowRepository.listDefinitions({
      module: payload.module,
      page: 1,
      pageSize: 100,
    });
    const matchedDefinition = definition.items.find((item) => item.id === payload.workflow_definition_id);

    if (!matchedDefinition) {
      throw createNotFoundError("Workflow definition");
    }

    return workflowRepository.createInstance({
      ...payload,
      current_step: 1,
      steps: buildStepsForInstance(matchedDefinition.steps),
    });
  },
  async advanceInstance(workflowInstanceId, actor, payload) {
    const workflowCollection = await workflowRepository.listInstances({ page: 1, pageSize: 500 });
    const workflowInstance = workflowCollection.items.find((item) => item.id === workflowInstanceId);

    if (!workflowInstance) {
      throw createNotFoundError("Workflow instance");
    }

    const currentStepIndex = workflowInstance.steps.findIndex((step) => step.status === "pending");
    const currentStep = workflowInstance.steps[currentStepIndex];

    if (!currentStep) {
      throw createForbiddenError("Workflow is already completed.");
    }

    if (actor.role !== "admin" && currentStep.approverRole !== actor.role) {
      throw createForbiddenError("You are not allowed to act on the current workflow step.");
    }

    const nextSteps = workflowInstance.steps.map((step, index) => {
      if (index === currentStepIndex) {
        return {
          ...step,
          status: payload.decision,
          acted_by: actor.id,
          remarks: payload.remarks ?? null,
        };
      }

      if (index === currentStepIndex + 1 && payload.decision === "approved") {
        return {
          ...step,
          status: "pending",
        };
      }

      return step;
    });

    const hasPendingStep = nextSteps.some((step) => step.status === "pending");
    const updatedStatus =
      payload.decision === "rejected"
        ? "rejected"
        : hasPendingStep
          ? "in_progress"
          : "approved";

    return workflowRepository.updateInstance(workflowInstanceId, {
      status: updatedStatus,
      current_step: hasPendingStep ? currentStepIndex + 2 : workflowInstance.steps.length,
      steps: nextSteps,
    });
  },
  async autoCreateWorkflowInstance({ module, reference_id, actor_id }) {
    const definition = await workflowRepository.findDefinitionByModule(module);
    if (!definition) {
      return null;
    }

    const existingInstance = await workflowRepository.findInstanceByReference(reference_id);
    if (existingInstance) {
      return existingInstance;
    }

    return workflowRepository.createInstance({
      workflow_definition_id: definition.id,
      module,
      reference_id,
      status: "pending",
      current_step: 1,
      created_by: actor_id ?? null,
      steps: buildStepsForInstance(definition.steps),
    });
  },
  async markWorkflowReferenceApproved(referenceId, actorId) {
    const existingInstance = await workflowRepository.findInstanceByReference(referenceId);
    if (!existingInstance) {
      return null;
    }

    const completedSteps = existingInstance.steps.map((step) => ({
      ...step,
      status: step.status === "locked" ? "approved" : step.status,
      acted_by: step.acted_by ?? actorId ?? null,
    }));

    return workflowRepository.updateInstance(existingInstance.id, {
      status: "approved",
      current_step: completedSteps.length,
      steps: completedSteps,
    });
  },
};

