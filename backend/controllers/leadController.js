import Lead from "../models/Lead.js";
import mongoose from "mongoose";

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
  const stats = await Lead.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  res.json(stats);
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
