import express from "express";
import {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  updateUserLimits,
  getAIUsageStats,
  getConfigs,
  updateConfig,
  getAdminLogs,
  getDashboardCharts
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes here are protected and require admin role
router.use(protect);
router.use(admin);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/limits", updateUserLimits);
router.get("/ai-usage", getAIUsageStats);
router.get("/charts", getDashboardCharts);
router.get("/config", getConfigs);
router.patch("/config/:key", updateConfig);
router.get("/logs", getAdminLogs);

export default router;
