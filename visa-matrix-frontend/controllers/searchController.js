import { searchWorkspace } from "../services/searchService.js";

export const searchWorkspaceHandler = async (req, res) =>
  res.status(200).json({
    success: true,
    data: await searchWorkspace({
      query: req.query.q,
      user: req.user,
      limit: req.query.limit,
    }),
  });
