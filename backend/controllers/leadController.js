import Lead from "../models/Lead.js";
import User from "../models/User.js";
import Config from "../models/Config.js";
import mongoose from "mongoose";
import { analyzeWebsite } from "../services/aiService.js";
import { sendEmail } from "../services/emailService.js";
import { logAdminAction } from "../utils/logger.js";

/* CREATE LEAD */
export const createLead = async (req, res) => {
  const lead = await Lead.create({
    ...req.body,
    user: req.user._id
  });

  res.status(201).json(lead);
};

/* GET ALL LEADS (USER-SPECIFIC) WITH PAGINATION */
export const getLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { contactName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
      ];
    }
    
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(query)
    ]);

    res.json({
      leads,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLeads: total
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Error fetching leads" });
  }
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
    const search = req.query.search || "";
    console.log(`Fetching follow-ups for user: ${userId}, search: "${search}"`);

    const query = {
      user: userId,
      nextFollowUp: { $ne: null, $exists: true }
    };

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { contactName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Lead.find(query)
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

  // Check Feature Flag
  const aiConfig = await Config.findOne({ key: "enableAIEnrichment" });
  if (aiConfig && aiConfig.value === false) {
    return res.status(403).json({ message: "AI Enrichment is currently disabled by administrator" });
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

    // Increment AI Usage Count and store lastAIUsedAt
    await User.findByIdAndUpdate(req.user._id, { 
      $inc: { aiUsageCount: 1 },
      lastAIUsedAt: new Date()
    });

    // Log successful AI Action
    await logAdminAction({
      action: "AI_ACTION",
      userId: req.user._id,
      details: { leadId: req.params.id, businessName: lead.businessName }
    });

    res.json(updatedLead);
  } catch (error) {
    console.error("Analysis failed:", error);
    
    // Log AI Error
    await logAdminAction({
      action: "AI_ERROR",
      userId: req.user._id,
      details: `Analysis failed for lead ${req.params.id}: ${error.message}`
    });

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

  // Check Feature Flag (using same AI enrichment flag for drafts)
  const aiConfig = await Config.findOne({ key: "enableAIEnrichment" });
  if (aiConfig && aiConfig.value === false) {
    return res.status(403).json({ message: "AI features are currently disabled by administrator" });
  }

  const lead = await Lead.findById(req.params.id);
  const user = await User.findById(req.user._id);

  if (!lead || lead.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: "Lead not found" });
  }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check AI usage limits
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  if (user.lastAIUsedAt && user.lastAIUsedAt.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
    // If last AI use was on a previous day, reset count
    user.aiUsageCount = 0;
  }

  if (user.aiUsageCount >= user.maxDailyAICallsPerUser) {
    return res.status(403).json({ message: `Daily AI call limit (${user.maxDailyAICallsPerUser}) exceeded.` });
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

    // Increment AI Usage Count and store lastAIUsedAt
    user.aiUsageCount += 1;
    user.lastAIUsedAt = new Date();
    await user.save();

    res.json(lead);
  } catch (error) {
    console.error("Email generation failed:", error);
    
    // Log AI Error
    await logAdminAction({
      action: "AI_ERROR",
      userId: req.user._id,
      details: `Email generation failed for lead ${req.params.id}: ${error.message}`
    });

    res.status(500).json({ message: "Failed to generate email", error: error.message });
  }
};

/* SEND EMAIL VIA RESEND */
export const sendLeadEmail = async (req, res) => {
  const { id } = req.params;
  const { subject, body } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid lead ID format" });
  }

  const lead = await Lead.findById(id);

  if (!lead || lead.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: "Lead not found" });
  }

  if (!lead.email) {
    return res.status(400).json({ message: "Lead has no email address" });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check email usage limits
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  if (user.lastEmailSentAt && user.lastEmailSentAt.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)) {
    // If last email sent was on a previous day, reset count
    user.emailUsageCount = 0;
  }

  if (user.emailUsageCount >= user.maxDailyEmailsPerUser) {
    return res.status(403).json({ message: `Daily email limit (${user.maxDailyEmailsPerUser}) exceeded.` });
  }

  try {
    // Convert plain text body to simple HTML (replace newlines with <br/>)
    const htmlBody = (body || "").replace(/\n/g, "<br/>");

    // Construct Social Links HTML
    let socialLinksHtml = '';
    if (user.socialLinks) {
        const links = [];
        if (user.socialLinks.linkedin) links.push(`<a href="${user.socialLinks.linkedin}" style="color: #0077b5; text-decoration: none;">LinkedIn</a>`);
        if (user.socialLinks.x) links.push(`<a href="${user.socialLinks.x}" style="color: #000; text-decoration: none;">X (Twitter)</a>`);
        if (user.socialLinks.instagram) links.push(`<a href="${user.socialLinks.instagram}" style="color: #E1306C; text-decoration: none;">Instagram</a>`);
        if (user.socialLinks.facebook) links.push(`<a href="${user.socialLinks.facebook}" style="color: #1877F2; text-decoration: none;">Facebook</a>`);
        
        if (links.length > 0) {
            socialLinksHtml = `<p style="margin: 5px 0;"><strong>Socials:</strong> ${links.join(' | ')}</p>`;
        }
    }

    const footerHtml = `
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 20px;">
      <div style="font-size: 0.9em; color: #666; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
        <p style="margin: 0 0 10px;">This email is sent via <strong>ClientScout</strong> on behalf of:</p>
        <p style="margin: 5px 0; font-size: 1.1em; font-weight: bold; color: #333;">${user.name}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${user.email}" style="color: #2563eb; text-decoration: none;">${user.email}</a></p>
        <p style="margin: 5px 0;"><strong>Phone:</strong> ${user.mobileNumber}</p>
        ${socialLinksHtml}
        
        <p style="margin: 15px 0 5px;">
          <a href="mailto:${user.email}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 8px 15px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-right: 10px;">Email Me</a>
          <a href="tel:${user.mobileNumber}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 8px 15px; text-decoration: none; border-radius: 4px; font-weight: bold;">Call Me</a>
        </p>

        <p style="margin: 15px 0 0; font-style: italic; font-size: 0.85em;">Please reply directly to the sender using the contact details above.</p>
      </div>
    `;

    await sendEmail({
      to: lead.email,
      subject: subject || "Re: Inquiry",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          ${htmlBody}
          ${footerHtml}
        </div>
      `,
      from: `${user.name} via ClientScout <info@clientscout.xyz>`,
    });

    // Increment Email Usage Count and store lastEmailSentAt
    user.emailUsageCount += 1;
    user.lastEmailSentAt = new Date();
    await user.save();

    // Log the contact automatically after sending email
    lead.lastContactedAt = new Date();
    lead.status = "Contacted";
    
    // Suggest follow up in 3 days
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 3);
    lead.nextFollowUp = nextDate;

    await lead.save();

    res.json({ message: "Email sent successfully", lead });
  } catch (error) {
    console.error("Failed to send email:", error);
    
    let errorMessage = "Failed to send email";
    res.status(500).json({ message: errorMessage, error: error.message });
  }
};

/* GENERATE WHATSAPP DRAFT */
export const generateWhatsApp = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid lead ID format" });
  }

  // Check Feature Flag
  const waConfig = await Config.findOne({ key: "enableWhatsAppDrafts" });
  if (waConfig && waConfig.value === false) {
    return res.status(403).json({ message: "WhatsApp Drafts are currently disabled by administrator" });
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

    // Increment AI Usage Count and store lastAIUsedAt
    await User.findByIdAndUpdate(req.user._id, { 
      $inc: { aiUsageCount: 1 },
      lastAIUsedAt: new Date()
    });

    res.json(lead);
  } catch (error) {
    console.error("WhatsApp generation failed:", error);
    
    // Log AI Error
    await logAdminAction({
      action: "AI_ERROR",
      userId: req.user._id,
      details: `WhatsApp generation failed for lead ${req.params.id}: ${error.message}`
    });

    res.status(500).json({ message: "Failed to generate WhatsApp message", error: error.message });
  }
};

export const trackMapSearchUsage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastMapSearchAt && user.lastMapSearchAt.setHours(0, 0, 0, 0) < today.getTime()) {
      user.mapSearchCount = 0;
    }

    const limit = typeof user.maxDailyMapSearchesPerUser === "number" ? user.maxDailyMapSearchesPerUser : 0;

    if (limit > 0 && user.mapSearchCount >= limit) {
      return res.status(403).json({ message: `Daily Google Maps search limit (${limit}) exceeded.` });
    }

    user.mapSearchCount += 1;
    user.lastMapSearchAt = new Date();
    await user.save();

    const remaining = limit > 0 ? limit - user.mapSearchCount : null;

    res.json({
      usedToday: user.mapSearchCount,
      limit,
      remaining,
    });
  } catch (error) {
    console.error("Error tracking map search usage:", error);
    res.status(500).json({ message: "Failed to track map search usage" });
  }
};
