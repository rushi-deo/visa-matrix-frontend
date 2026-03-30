import { performanceService } from "../services/index.js";

export const performanceController = {
  async listReviews(req, res) {
    const data = await performanceService.listReviews(req.validated.query);
    res.json({ success: true, data });
  },
  async createReview(req, res) {
    const data = await performanceService.createReview(req.validated.body);
    res.status(201).json({ success: true, data });
  },
  async getDashboard(req, res) {
    const data = await performanceService.getDashboard();
    res.json({ success: true, data });
  },
};

