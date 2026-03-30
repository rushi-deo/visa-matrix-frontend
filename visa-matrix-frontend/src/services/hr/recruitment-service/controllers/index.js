import { recruitmentService } from "../services/index.js";

export const recruitmentController = {
  async listCandidates(req, res) {
    const data = await recruitmentService.listCandidates(req.validated.query);
    res.json({ success: true, data });
  },
  async createCandidate(req, res) {
    const data = await recruitmentService.createCandidate(req.validated.body);
    res.status(201).json({ success: true, data });
  },
  async moveCandidateStage(req, res) {
    const data = await recruitmentService.moveCandidateStage(
      req.params.candidateId,
      req.validated.body.toStage,
      req.user?.id,
    );
    res.json({ success: true, data });
  },
  async getHiringFunnel(req, res) {
    const data = await recruitmentService.getHiringFunnel();
    res.json({ success: true, data });
  },
};

