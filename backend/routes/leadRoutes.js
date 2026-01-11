import express from "express";
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  updateLeadStatus,
  leadStats,
  getFollowUps
} from "../controllers/leadController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createLead)
  .get(protect, getLeads);

// Specific routes must come before parameterized routes
router.get("/stats", protect, leadStats);
router.get("/followups", protect, getFollowUps);
router.put("/:id/status", protect, updateLeadStatus);

router.route("/:id")
  .get(protect, getLeadById)
  .put(protect, updateLead)
  .delete(protect, deleteLead);

export default router;
