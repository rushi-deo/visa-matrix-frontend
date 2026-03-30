import express from "express";
import { searchWorkspaceHandler } from "../controllers/searchController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/search", authMiddleware, asyncHandler(searchWorkspaceHandler));

export default router;
