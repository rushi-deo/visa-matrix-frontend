import { aiService } from "../services/index.js";

export const aiController = {
  async getInsights(req, res) {
    const data = await aiService.getInsights();
    res.json({ success: true, data });
  },
  async scoreCandidate(req, res) {
    const data = await aiService.scoreCandidate(req.validated.body);
    res.json({ success: true, data });
  },
};

