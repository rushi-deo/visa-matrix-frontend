import express from "express";
import { authMiddleware } from "../../../middleware/authMiddleware.js";
import communicationRoutes from "./communicationRoutes.js";
import documentRoutes from "./documentRoutes.js";
import employeeRoutes from "./employeeRoutes.js";
import engagementRoutes from "./engagementRoutes.js";
import leaveRoutes from "./leaveRoutes.js";
import selfServiceRoutes from "./selfServiceRoutes.js";
import workflowRoutes from "./workflowRoutes.js";

const router = express.Router();

// Public routes that don't require authentication
const publicRoutes = [
  '/api/health',
  '/api/auth/login',
  '/api/auth/register'
];

// Conditional middleware: skip auth for public routes
router.use((req, res, next) => {
  if (publicRoutes.includes(req.path)) {
    return next();
  }
  return authMiddleware(req, res, next);
});

router.use(employeeRoutes);
router.use(leaveRoutes);
router.use(selfServiceRoutes);
router.use(workflowRoutes);
router.use(engagementRoutes);
router.use(communicationRoutes);
router.use(documentRoutes);

export default router;
