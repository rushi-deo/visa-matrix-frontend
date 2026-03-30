import {
  createWorkflowDefinition,
  executeWorkflowDefinition,
  listWorkflowDefinitions,
} from "../services/workflowService.js";

export const createWorkflowHandler = async (req, res) => {
  const workflow = await createWorkflowDefinition(req.body, req.user);
  res.status(201).json({
    success: true,
    data: workflow,
  });
};

export const listWorkflowsHandler = async (req, res) => {
  const workflows = await listWorkflowDefinitions(req.user);
  res.status(200).json({
    success: true,
    data: workflows,
    count: workflows.length,
  });
};

export const executeWorkflowHandler = async (req, res) => {
  const result = await executeWorkflowDefinition(req.params.id, req.body, req.user);
  res.status(200).json({
    success: true,
    data: result,
  });
};
