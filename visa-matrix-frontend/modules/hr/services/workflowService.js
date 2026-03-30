import { createWorkflow, getWorkflowById, listWorkflows } from "../models/workflowModel.js";
import { assertOrThrow } from "./hrErrorService.js";

const normalizeApproval = (approval) => ({
  step_order: Number(approval.step_order),
  approver_role: approval.approver_role,
  decision: approval.decision,
  comment: approval.comment || null,
});

export const createWorkflowDefinition = async (payload, user) =>
  createWorkflow(
    {
      workflow: {
        name: payload.name,
        type: payload.type,
      },
      steps: payload.steps
        .map((step, index) => ({
          step_order: Number(step.step_order || index + 1),
          approver_role: step.approver_role,
        }))
        .sort((left, right) => left.step_order - right.step_order),
    },
    user,
  );

export const listWorkflowDefinitions = async (user) => listWorkflows(user);

export const executeWorkflowDefinition = async (workflowId, payload, user) => {
  const workflow = await getWorkflowById(workflowId, user);
  assertOrThrow(workflow, 404, "Workflow not found.");
  assertOrThrow(workflow.steps?.length, 400, "Workflow has no steps configured.");

  const approvals = (payload.approvals || []).map(normalizeApproval);
  const steps = [...workflow.steps].sort((left, right) => left.step_order - right.step_order);
  const trace = [];

  for (const step of steps) {
    const matchingApproval = approvals.find(
      (approval) =>
        approval.step_order === step.step_order || approval.approver_role === step.approver_role,
    );

    if (!matchingApproval) {
      return {
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        context: payload.context || null,
        status: "pending",
        current_step: step,
        trace,
      };
    }

    assertOrThrow(
      matchingApproval.approver_role === step.approver_role,
      400,
      `Approval role mismatch for step ${step.step_order}.`,
    );
    assertOrThrow(
      ["approved", "rejected"].includes(matchingApproval.decision),
      400,
      `Invalid decision supplied for step ${step.step_order}.`,
    );

    trace.push({
      ...matchingApproval,
      evaluated_at: new Date().toISOString(),
    });

    if (matchingApproval.decision === "rejected") {
      return {
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        context: payload.context || null,
        status: "rejected",
        current_step: step,
        trace,
      };
    }
  }

  return {
    workflow_id: workflow.id,
    workflow_name: workflow.name,
    context: payload.context || null,
    status: "approved",
    current_step: null,
    trace,
  };
};
