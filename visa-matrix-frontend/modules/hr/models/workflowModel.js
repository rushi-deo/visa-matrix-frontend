import {
  applyOrganizationScope,
  createCreatePayload,
  filterByOrganization,
  getSupabaseClient,
  isAdminUser,
} from "./hrBaseModel.js";
import { cloneRecord, createHrId, hrMemoryStore } from "./hrMemoryStore.js";

export const createWorkflow = async ({ workflow, steps }, user) => {
  const workflowPayload = createCreatePayload(
    "workflow",
    {
      ...workflow,
      created_by: workflow.created_by || user?.id || null,
      updated_at: undefined,
    },
    user,
    "created_at",
  );

  delete workflowPayload.updated_at;

  const stepPayloads = steps.map((step, index) => ({
    id: step.id || createHrId("workflow_step"),
    workflow_id: workflowPayload.id,
    step_order: step.step_order || index + 1,
    approver_role: step.approver_role,
    organization_id: workflowPayload.organization_id,
    created_at: new Date().toISOString(),
  }));

  try {
    const workflowClient = getSupabaseClient();
    const { data: createdWorkflow, error: workflowError } = await workflowClient
      .from("workflows")
      .insert([workflowPayload])
      .select("*")
      .single();

    if (workflowError) {
      throw workflowError;
    }

    const { data: createdSteps, error: stepError } = await workflowClient
      .from("workflow_steps")
      .insert(stepPayloads)
      .select("*");

    if (stepError) {
      throw stepError;
    }

    return {
      ...createdWorkflow,
      steps: (createdSteps || []).sort((left, right) => left.step_order - right.step_order),
    };
  } catch {
    hrMemoryStore.workflows.unshift(cloneRecord(workflowPayload));
    hrMemoryStore.workflow_steps.push(...stepPayloads.map((step) => cloneRecord(step)));

    return {
      ...cloneRecord(workflowPayload),
      steps: cloneRecord(stepPayloads).sort((left, right) => left.step_order - right.step_order),
    };
  }
};

export const listWorkflows = async (user) => {
  try {
    let workflowQuery = getSupabaseClient().from("workflows").select("*").order("created_at", {
      ascending: false,
    });
    workflowQuery = applyOrganizationScope(workflowQuery, user);

    let stepQuery = getSupabaseClient().from("workflow_steps").select("*").order("step_order", {
      ascending: true,
    });
    stepQuery = applyOrganizationScope(stepQuery, user);

    const [{ data: workflows, error: workflowError }, { data: steps, error: stepError }] =
      await Promise.all([workflowQuery, stepQuery]);

    if (workflowError || stepError) {
      throw workflowError || stepError;
    }

    const stepsByWorkflow = (steps || []).reduce((accumulator, step) => {
      accumulator[step.workflow_id] = accumulator[step.workflow_id] || [];
      accumulator[step.workflow_id].push(step);
      return accumulator;
    }, {});

    return (workflows || []).map((workflow) => ({
      ...workflow,
      steps: stepsByWorkflow[workflow.id] || [],
    }));
  } catch {
    const workflows = filterByOrganization(hrMemoryStore.workflows, user);
    const steps = filterByOrganization(hrMemoryStore.workflow_steps, user);

    return workflows.map((workflow) => ({
      ...workflow,
      steps: steps
        .filter((step) => step.workflow_id === workflow.id)
        .sort((left, right) => left.step_order - right.step_order),
    }));
  }
};

export const getWorkflowById = async (workflowId, user) => {
  const workflows = await listWorkflows(user);
  return workflows.find((workflow) => workflow.id === workflowId) || null;
};
