import express from "express";
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  updateLeadStatus,
  leadStats,
  getFollowUps,
  analyzeLead,
  generateEmail,
  generateWhatsApp,
  logContact
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
router.post("/:id/analyze", protect, analyzeLead);
router.post("/:id/generate-email", protect, generateEmail);
router.post("/:id/generate-whatsapp", protect, generateWhatsApp);
router.post("/:id/log-contact", protect, logContact);

router.route("/:id")
  .get(protect, getLeadById)
  .put(protect, updateLead)
  .delete(protect, deleteLead);

export default router;
