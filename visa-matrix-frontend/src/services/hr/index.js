import { Router } from "express";
import { authMiddleware } from "../../../middleware/authMiddleware.js";
import attendanceRoutes from "./attendance-service/routes/index.js";
import aiRoutes from "./ai-service/routes/index.js";
import { registerHrEventSubscribers } from "./events/registerHrEventSubscribers.js";
import hrCoreRoutes from "./hr-core-service/routes/index.js";
import notificationRoutes from "./notification-service/routes/index.js";
import payrollRoutes from "./payroll-service/routes/index.js";
import performanceRoutes from "./performance-service/routes/index.js";
import recruitmentRoutes from "./recruitment-service/routes/index.js";
import { hrErrorMiddleware } from "./shared/middleware/hrErrorMiddleware.js";
import { hrRateLimiter } from "./shared/middleware/hrRateLimiter.js";
import workflowRoutes from "./workflow-service/routes/index.js";

registerHrEventSubscribers();

const router = Router();

router.use(authMiddleware);
router.use(hrRateLimiter());
router.use(hrCoreRoutes);
router.use(attendanceRoutes);
router.use(payrollRoutes);
router.use(recruitmentRoutes);
router.use(performanceRoutes);
router.use(workflowRoutes);
router.use(notificationRoutes);
router.use(aiRoutes);
router.use(hrErrorMiddleware);

export default router;

