import { workflowService } from "../services/index.js";

export const workflowController = {
  async listDefinitions(req, res) {
    const data = await workflowService.listDefinitions(req.validated.query);
    res.json({ success: true, data });
  },
  async createDefinition(req, res) {
    const data = await workflowService.createDefinition(req.validated.body);
    res.status(201).json({ success: true, data });
  },
  async listInstances(req, res) {
    const data = await workflowService.listInstances(req.validated.query);
    res.json({ success: true, data });
  },
  async createInstance(req, res) {
    const data = await workflowService.createInstance(req.validated.body);
    res.status(201).json({ success: true, data });
  },
  async advanceInstance(req, res) {
    const data = await workflowService.advanceInstance(req.params.workflowInstanceId, req.user, req.validated.body);
    res.json({ success: true, data });
  },
};

