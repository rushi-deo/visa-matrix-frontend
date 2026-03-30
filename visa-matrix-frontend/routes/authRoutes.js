import express from "express";
import { loginHandler, sessionHandler } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.post("/auth/login", asyncHandler(loginHandler));
router.get("/auth/session", authMiddleware, asyncHandler(sessionHandler));

export default router;
