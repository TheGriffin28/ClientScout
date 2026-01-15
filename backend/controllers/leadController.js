import Lead from "../models/Lead.js";
import mongoose from "mongoose";
import { analyzeWebsite } from "../services/aiService.js";

/* CREATE LEAD */
export const createLead = async (req, res) => {
  const lead = await Lead.create({
    ...req.body,
    user: req.user._id
  });

  res.status(201).json(lead);
};

/* GET ALL LEADS (USER-SPECIFIC) */
export const getLeads = async (req, res) => {
  const leads = await Lead.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(leads);
};

/* GET SINGLE LEAD BY ID */
export const getLeadById = async (req, res) => {
  // Prevent common route conflicts
  if (req.params.id === "stats" || req.params.id === "followups") {
    return res.status(404).json({ message: "Route not found" });
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid lead ID format" });
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  if (lead.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.json(lead);
};

/* UPDATE LEAD */
export const updateLead = async (req, res) => {
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid lead ID format" });
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  if (lead.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const updated = await Lead.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
};

/* DELETE LEAD */
export const deleteLead = async (req, res) => {
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid lead ID format" });
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  if (lead.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await lead.deleteOne();
  res.json({ message: "Lead deleted" });
};

export const updateLeadStatus = async (req, res) => {
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid lead ID format" });
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead || lead.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: "Lead not found" });
  }

  lead.status = req.body.status;
  await lead.save();

  res.json(lead);
};

export const leadStats = async (req, res) => {
  try {
    const stats = await Lead.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Calculate overdue follow-ups
    const today = new Date();
    const overdueCount = await Lead.countDocuments({
      user: req.user._id,
      nextFollowUp: { $lt: today },
      status: { $nin: ["Converted", "Lost", "Contacted"] } // Assuming 'Contacted' might clear it, or maybe strictly overdue
    });

    res.json({ stats, overdueCount });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
};

/* GET FOLLOW-UPS (LEADS WITH nextFollowUp DATE) */
export const getFollowUps = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user._id;
    console.log("Fetching follow-ups for user:", userId);

    // Simplified query - find all leads for user, then filter in memory if needed
    // But better to filter in database
    const leads = await Lead.find({
      user: userId,
      nextFollowUp: { $ne: null, $exists: true }
    })
      .sort({ nextFollowUp: 1 }) // Sort by follow-up date ascending
      .select("_id businessName contactName email phone nextFollowUp status")
      .lean(); // Use lean() for better performance

    console.log(`Found ${leads.length} follow-ups`);
    res.json(leads);
  } catch (error) {
    console.error("Error fetching follow-ups:", error);
    res.status(500).json({ message: "Error fetching follow-ups", error: error.message });
  }
};

/* ANALYZE LEAD (REAL AI) */
export const analyzeLead = async (req, res) => {
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid lead ID format" });
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  if (lead.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "Gemini API key not configured" });
    }

    // Call Gemini Service
    const aiResult = await analyzeWebsite(lead.website || "", lead.businessName);

    // Map AI result to DB schema
    const updates = {
      industry: aiResult.industry,
      businessType: aiResult.businessType,
      websiteObservations: aiResult.websiteObservations,
      painPoints: aiResult.keyPainPoints,
      aiSummary: aiResult.suggestedPitch,
      leadScore: aiResult.leadScore?.value,
      leadScoreReason: aiResult.leadScore?.reason,
      aiGeneratedAt: new Date()
    };

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json(updatedLead);
  } catch (error) {
    console.error("Analysis failed:", error);
    res.status(500).json({ message: "AI Analysis failed", error: error.message });
  }
};

/* LOG CONTACT & SUGGEST FOLLOW-UP */
export const logContact = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid lead ID format" });
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead || lead.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: "Lead not found" });
  }

  try {
    const today = new Date();
    lead.lastContactedAt = today;
    lead.status = "Contacted";

    // Simple rule-based suggestion: +3 days for standard leads
    // Could be enhanced with AI or industry-specific logic later
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + 3);
    lead.nextFollowUp = nextDate;

    await lead.save();
    res.json(lead);
  } catch (error) {
    console.error("Log contact failed:", error);
    res.status(500).json({ message: "Failed to log contact", error: error.message });
  }
};

/* GENERATE EMAIL DRAFT */
export const generateEmail = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid lead ID format" });
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead || lead.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: "Lead not found" });
  }

  try {
    const { generateEmailDraft } = await import("../services/aiService.js");
    const emailDraft = await generateEmailDraft(
      lead.businessName,
      lead.industry,
      lead.contactName,
      lead.painPoints,
      lead.aiSummary,
      lead.businessType,
      lead.websiteObservations
    );

    lead.emailDraft = {
      subject: emailDraft.subject,
      body: emailDraft.body,
      generatedAt: new Date()
    };
    await lead.save();

    res.json(lead);
  } catch (error) {
    console.error("Email generation failed:", error);
    res.status(500).json({ message: "Failed to generate email", error: error.message });
  }
};

/* GENERATE WHATSAPP DRAFT */
export const generateWhatsApp = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid lead ID format" });
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead || lead.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: "Lead not found" });
  }

  try {
    const { generateWhatsAppDraft } = await import("../services/aiService.js");
    const whatsappMsg = await generateWhatsAppDraft(
      lead.businessName,
      lead.industry,
      lead.contactName,
      lead.painPoints,
      lead.businessType,
      lead.websiteObservations
    );

    lead.whatsappDraft = {
      body: whatsappMsg,
      generatedAt: new Date()
    };
    await lead.save();

    res.json(lead);
  } catch (error) {
    console.error("WhatsApp generation failed:", error);
    res.status(500).json({ message: "Failed to generate WhatsApp message", error: error.message });
  }
};
