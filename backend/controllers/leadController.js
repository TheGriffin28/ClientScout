import Lead from "../models/Lead.js";
import User from "../models/User.js";
import Config from "../models/Config.js";
import mongoose from "mongoose";
import { analyzeWebsite, generateEmailDraft, generateWhatsAppDraft, generateWebsiteLayout } from "../services/aiService.js";
import {
  suggestLayoutFromAnalysis,
  getDesignFixesFromAnalysis,
  leadHasWebsite,
} from "../services/layoutSuggestion.js";
import { sendEmail } from "../services/emailService.js";
import { logAdminAction } from "../utils/logger.js";
import { createNotification } from "./notificationController.js";
import Notification from "../models/Notification.js";
import { buildLeadPreviewUrl } from "../utils/frontendUrl.js";

// Helper to get effective limit
const getEffectiveLimit = async (user, userField, configKey, defaultVal = 100) => {
  if (typeof user[userField] === 'number') {
    return user[userField];
  }
  const config = await Config.findOne({ key: configKey });
  return config && typeof config.value === 'number' ? config.value : defaultVal;
};

/* CREATE LEAD */
export const createLead = async (req, res) => {
  const {
    emailDraft: _emailDraft,
    whatsappDraft: _whatsappDraft,
    generatedLayout: _generatedLayout,
    designsPreparedAt: _designsPreparedAt,
    ...safeBody
  } = req.body;

  const lead = await Lead.create({
    ...safeBody,
    user: req.user._id,
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

  // Check AI usage limits
  const user = await User.findById(req.user._id);
  const today = new Date();
  const lastUsed = user.lastAIUsedAt ? new Date(user.lastAIUsedAt) : null;

  // Reset if new month
  if (lastUsed && (lastUsed.getMonth() !== today.getMonth() || lastUsed.getFullYear() !== today.getFullYear())) {
    user.aiUsageCount = 0;
  }

  const monthlyLimit = await getEffectiveLimit(user, "maxMonthlyAICallsPerUser", "maxMonthlyAICallsPerUser", 100);
  const extraCredits = user.extraAICallsCredits || 0;

  if (user.aiUsageCount >= monthlyLimit && extraCredits <= 0) {
    return res.status(403).json({ message: `Monthly AI call limit (${monthlyLimit}) exceeded.` });
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
    if (user.aiUsageCount < monthlyLimit) {
      user.aiUsageCount += 1;
    } else {
      user.extraAICallsCredits -= 1;
    }
    user.lastAIUsedAt = new Date();
    await user.save();

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
  const lastUsed = user.lastAIUsedAt ? new Date(user.lastAIUsedAt) : null;

  // Reset if new month
  if (lastUsed && (lastUsed.getMonth() !== today.getMonth() || lastUsed.getFullYear() !== today.getFullYear())) {
    user.aiUsageCount = 0;
  }

  const monthlyLimit = await getEffectiveLimit(user, "maxMonthlyAICallsPerUser", "maxMonthlyAICallsPerUser", 100);
  const extraCredits = user.extraAICallsCredits || 0;

  if (user.aiUsageCount >= monthlyLimit && extraCredits <= 0) {
    return res.status(403).json({ message: `Monthly AI call limit (${monthlyLimit}) exceeded.` });
  }

  try {
    const hasDesigns = Boolean(lead.designsPreparedAt && lead.generatedLayout?.content);
    const emailDraft = await generateEmailDraft(
      lead.businessName,
      lead.industry,
      lead.contactName,
      lead.painPoints,
      lead.aiSummary,
      lead.businessType,
      lead.websiteObservations,
      hasDesigns,
      lead.website
    );

    let body = emailDraft.body;
    if (hasDesigns) {
      body +=
        "\n\nWe prepared 2 custom website design concepts for your business. Click the button in this email to review and choose your preferred design." +
        "\n\nNote: Images and content shown in the preview are sample placeholders — we will update everything with your actual photos, branding, and business details as per your reference.";
    }

    lead.emailDraft = {
      subject: emailDraft.subject,
      body,
      generatedAt: new Date()
    };
    await lead.save();

    // Increment AI Usage Count and store lastAIUsedAt
    if (user.aiUsageCount < monthlyLimit) {
      user.aiUsageCount += 1;
    } else {
      user.extraAICallsCredits -= 1;
    }
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
  const { subject, body, designPreviewUrl } = req.body;

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
  const lastUsed = user.lastEmailSentAt ? new Date(user.lastEmailSentAt) : null;

  // Reset if new month
  if (lastUsed && (lastUsed.getMonth() !== today.getMonth() || lastUsed.getFullYear() !== today.getFullYear())) {
    user.emailUsageCount = 0;
  }

  const monthlyLimit = await getEffectiveLimit(user, "maxMonthlyEmailsPerUser", "maxMonthlyEmailsPerUser", 100);
  const extraCredits = user.extraEmailCredits || 0;

  if (user.emailUsageCount >= monthlyLimit && extraCredits <= 0) {
    return res.status(403).json({ message: `Monthly email limit (${monthlyLimit}) exceeded.` });
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

    // Optional design preview button (keeps long URLs out of the email body text)
    let designButtonHtml = "";
    if (designPreviewUrl) {
      designButtonHtml = `
        <div style="margin: 28px 0; text-align: center;">
          <a href="${designPreviewUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            View Your Website Designs
          </a>
          <p style="margin: 12px 0 0; font-size: 13px; color: #666;">Review both design options and approve your favorite.</p>
          <p style="margin: 10px 0 0; font-size: 12px; color: #888; font-style: italic; max-width: 420px; margin-left: auto; margin-right: auto;">
            Images and content in the preview are sample placeholders — we will update everything with your actual photos, branding, and business details as per your reference.
          </p>
        </div>
      `;
    }

    await sendEmail({
      to: lead.email,
      subject: subject || "Re: Inquiry",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          ${htmlBody}
          ${designButtonHtml}
          ${footerHtml}
        </div>
      `,
      from: `${user.name} via ClientScout <info@clientscout.xyz>`,
    });

    // Increment Email Usage Count and store lastEmailSentAt
    if (user.emailUsageCount < monthlyLimit) {
      user.emailUsageCount += 1;
    } else {
      user.extraEmailCredits -= 1;
    }
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

  // Check AI usage limits
  const user = await User.findById(req.user._id);
  const today = new Date();
  const lastUsed = user.lastAIUsedAt ? new Date(user.lastAIUsedAt) : null;

  // Reset if new month
  if (lastUsed && (lastUsed.getMonth() !== today.getMonth() || lastUsed.getFullYear() !== today.getFullYear())) {
    user.aiUsageCount = 0;
  }

  const monthlyLimit = await getEffectiveLimit(user, "maxMonthlyAICallsPerUser", "maxMonthlyAICallsPerUser", 100);
  const extraCredits = user.extraAICallsCredits || 0;

  if (user.aiUsageCount >= monthlyLimit && extraCredits <= 0) {
    return res.status(403).json({ message: `Monthly AI call limit (${monthlyLimit}) exceeded.` });
  }

  try {
    const hasDesigns = Boolean(lead.designsPreparedAt && lead.generatedLayout?.content);
    const whatsappMsg = await generateWhatsAppDraft(
      lead.businessName,
      lead.industry,
      lead.contactName,
      lead.painPoints,
      lead.businessType,
      lead.websiteObservations,
      hasDesigns,
      lead.website
    );

    let body = whatsappMsg;
    if (hasDesigns) {
      body +=
        "\n\nWe also prepared 2 custom website design previews for you — I'll share the review link with you next." +
        "\n\nNote: Images and text in the preview are placeholders and will be updated with your real content, photos, and branding as per your reference.";
    }

    lead.whatsappDraft = {
      body,
      generatedAt: new Date()
    };
    await lead.save();

    // Increment AI Usage Count and store lastAIUsedAt
    if (user.aiUsageCount < monthlyLimit) {
      user.aiUsageCount += 1;
    } else {
      user.extraAICallsCredits -= 1;
    }
    user.lastAIUsedAt = new Date();
    await user.save();

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
    const lastUsed = user.lastMapSearchAt ? new Date(user.lastMapSearchAt) : null;

    if (lastUsed && (lastUsed.getMonth() !== today.getMonth() || lastUsed.getFullYear() !== today.getFullYear())) {
      user.mapSearchCount = 0;
    }

    const limit = await getEffectiveLimit(user, "maxMonthlyMapSearchesPerUser", "maxMonthlyMapSearchesPerUser", 100);
    const extraCredits = user.extraMapSearchCredits || 0;
    const totalLimit = limit + extraCredits;

    if (user.mapSearchCount >= limit && extraCredits <= 0) {
      return res.status(403).json({ message: `Monthly Google Maps search limit (${limit}) exceeded.` });
    }

    if (user.mapSearchCount < limit) {
      user.mapSearchCount += 1;
    } else {
      user.extraMapSearchCredits -= 1;
    }
    user.lastMapSearchAt = new Date();
    await user.save();

    const remaining = limit > user.mapSearchCount ? limit - user.mapSearchCount : 0;
    const extraRemaining = user.extraMapSearchCredits || 0;

    res.json({
      usedToday: user.mapSearchCount,
      limit,
      remaining,
      extraRemaining
    });
  } catch (error) {
    console.error("Error tracking map search usage:", error);
    res.status(500).json({ message: "Failed to track map search usage" });
  }
};

/* GENERATE WEBSITE LAYOUT */
export const generateLayout = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid lead ID format" });
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead || lead.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: "Lead not found" });
  }

  // Check AI usage limits
  const user = await User.findById(req.user._id);
  const today = new Date();
  const lastUsed = user.lastAIUsedAt ? new Date(user.lastAIUsedAt) : null;

  // Reset if new month
  if (lastUsed && (lastUsed.getMonth() !== today.getMonth() || lastUsed.getFullYear() !== today.getFullYear())) {
    user.aiUsageCount = 0;
  }

  const monthlyLimit = await getEffectiveLimit(user, "maxMonthlyAICallsPerUser", "maxMonthlyAICallsPerUser", 100);
  const extraCredits = user.extraAICallsCredits || 0;

  if (user.aiUsageCount >= monthlyLimit && extraCredits <= 0) {
    return res.status(403).json({ message: `Monthly AI call limit (${monthlyLimit}) exceeded.` });
  }

  const pickTemplateKey = (industry, businessType) => {
    const source = `${industry || ""} ${businessType || ""}`.toLowerCase();
    if (source.includes("clinic") || source.includes("dent") || source.includes("salon")) {
      return "premium-dark";
    }
    if (source.includes("cafe") || source.includes("restaurant") || source.includes("local")) {
      return "local-bright";
    }
    if (source.includes("agency") || source.includes("saas") || source.includes("tech")) {
      return "modern-business";
    }
    return "minimal-fast";
  };

  const mapCategoryServices = (industry) => {
    const category = (industry || "").toLowerCase();
    if (category.includes("salon")) return ["Haircut & Styling", "Skin & Facial Care", "Bridal & Event Makeover"];
    if (category.includes("gym") || category.includes("fitness")) return ["Personal Training", "Group Fitness Programs", "Membership Plans"];
    if (category.includes("dent")) return ["Dental Cleaning", "Teeth Whitening", "Preventive Checkups"];
    if (category.includes("cafe") || category.includes("restaurant")) return ["Dine-In Experience", "Online Ordering", "Event Catering"];
    return ["Consultation", "Core Service Delivery", "Ongoing Support"];
  };

  try {
    const hasWebsite = leadHasWebsite(lead.website);
    const hasAnalysis = Boolean(lead.aiGeneratedAt && lead.websiteObservations);

    if (hasWebsite && !hasAnalysis) {
      return res.status(400).json({
        message: "Please run Analyze with AI first so designs can address issues found on their current website.",
        code: "ANALYSIS_REQUIRED",
      });
    }

    const layoutSuggestion = suggestLayoutFromAnalysis(
      lead.industry,
      lead.businessType,
      lead.websiteObservations
    );

    const aiResult = await generateWebsiteLayout(
      lead.businessName,
      lead.industry,
      lead.businessType,
      lead.painPoints,
      lead.aiSummary,
      lead.websiteObservations,
      hasWebsite
    );

    // Extract content and design from AI result
    const content = aiResult.content || aiResult;
    const design = aiResult.design || undefined;

    const fallbackServices = mapCategoryServices(lead.industry).map((name) => ({
      name,
      description: `${name} tailored for ${lead.businessName}.`,
    }));
    const templateKey = layoutSuggestion.templateKey || pickTemplateKey(lead.industry, lead.businessType);
    const themeKey = layoutSuggestion.themeKey || "light";
    const designFixes = getDesignFixesFromAnalysis(lead.websiteObservations);
    const fixesSummary =
      designFixes.length > 0
        ? designFixes.map((f) => f.issue).slice(0, 2).join("; ")
        : null;

    const safeContent = {
      hero: content.hero || {
        headline: `${lead.businessName} - Trusted Local Service`,
        tagline: "Professional service with local trust and fast response.",
        primaryCta: "Call Now",
        secondaryCta: "Get Free Quote",
      },
      about: content.about || {
        title: `About ${lead.businessName}`,
        description: `${lead.businessName} helps customers with reliable service and a customer-first experience.`,
      },
      services: Array.isArray(content.services) && content.services.length > 0 ? content.services : fallbackServices,
      testimonials: Array.isArray(content.testimonials) && content.testimonials.length > 0 ? content.testimonials : [
        { name: "Happy Customer", quote: "Great service and very professional team." },
        { name: "Local Client", quote: "Reliable, friendly, and easy to work with." },
      ],
      contact: {
        phone: lead.phone || content.contact?.phone || "Phone available on request",
        address: lead.notes || content.contact?.address || "Local service area",
        ctaText: content.contact?.ctaText || "Call or WhatsApp Us",
      },
    };

    lead.designsPreparedAt = new Date();
    lead.generatedLayout = {
      templateKey,
      themeKey,
      design, // Save AI-generated design recipe
      designRationale: layoutSuggestion.rationale,
      analysisSnapshot: hasAnalysis
        ? {
            websiteObservations: lead.websiteObservations,
            painPoints: lead.painPoints,
            aiSummary: lead.aiSummary,
            capturedAt: lead.aiGeneratedAt || new Date(),
          }
        : undefined,
      content: safeContent,
      pitchMessage:
        aiResult.pitchMessage || content.pitchMessage ||
        (fixesSummary
          ? `Hi ${lead.businessName} team, we reviewed your website and noticed ${fixesSummary}. We created an improved design concept to fix these issues. Would you like us to make it live?`
          : `Hi ${lead.businessName} team, we noticed your business could benefit from a stronger online presence. We created a ready website preview for you. Would you like us to make it live?`),
      previewUrl: buildLeadPreviewUrl(lead._id),
      generatedAt: new Date(),
    };
    if (lead.status === "New") {
      lead.status = "FollowUp";
    }
    await lead.save();

    // Increment AI Usage Count and store lastAIUsedAt
    if (user.aiUsageCount < monthlyLimit) {
      user.aiUsageCount += 1;
    } else {
      user.extraAICallsCredits -= 1;
    }
    user.lastAIUsedAt = new Date();
    await user.save();

    // Log successful AI Action
    await logAdminAction({
      action: "AI_ACTION",
      userId: req.user._id,
      details: { leadId: req.params.id, action: "GENERATE_LAYOUT", businessName: lead.businessName }
    });

    res.json(lead);
  } catch (error) {
    console.error("Layout generation failed:", error);
    
    // Log AI Error
    await logAdminAction({
      action: "AI_ERROR",
      userId: req.user._id,
      details: `Layout generation failed for lead ${req.params.id}: ${error.message}`
    });

    res.status(500).json({ message: "Failed to generate website layout", error: error.message });
  }
};

/* GET LEAD BY ID - PUBLIC (NO AUTH REQUIRED) */
export const getLeadByIdPublic = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid lead ID format" });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Return only necessary fields for public preview
    res.json({
      _id: lead._id,
      businessName: lead.businessName,
      industry: lead.industry,
      businessType: lead.businessType,
      designsPreparedAt: lead.designsPreparedAt,
      generatedLayout: lead.designsPreparedAt ? lead.generatedLayout : undefined,
      layoutVersions: lead.layoutVersions,
      clientApproved: lead.clientApproved,
      clientApprovedAt: lead.clientApprovedAt,
      clientApprovedLayoutId: lead.clientApprovedLayoutId,
      clientApprovedLayoutName: lead.clientApprovedLayoutName,
      clientChangeRequest: lead.clientChangeRequest,
      clientChangeRequestedAt: lead.clientChangeRequestedAt,
    });
  } catch (error) {
    console.error("Error fetching public lead:", error);
    res.status(500).json({ message: "Error fetching lead" });
  }
};

/* UPDATE LEAD - PUBLIC (NO AUTH REQUIRED) - Only approval fields */
export const updateLeadPublic = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid lead ID format" });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Only allow updating client approval fields
    const allowedFields = [
      "clientApproved",
      "clientApprovedAt",
      "clientApprovedLayoutId",
      "clientApprovedLayoutName",
      "clientChangeRequest",
      "clientChangeRequestedAt"
    ];

    // Filter request body to only include allowed fields
    const updates = {};
    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    }

    // Check if this is a design approval (clientApproved changes to true)
    const wasApprovedBefore = Boolean(lead.clientApproved);
    const isApprovedNow =
      updates.clientApproved === true || updates.clientApproved === "true";
    const isNewApproval = !wasApprovedBefore && isApprovedNow;

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    // Design approved: Resend email + in-app notification
    if (isApprovedNow) {
      try {
        const user = await User.findById(lead.user);
        const designName =
          updates.clientApprovedLayoutName ||
          updated.clientApprovedLayoutName ||
          "the selected design";
        const approvedAt =
          updates.clientApprovedAt ||
          updated.clientApprovedAt ||
          new Date().toISOString();

        if (isNewApproval && user?.email) {
          const emailContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #2563eb;">🎉 Great News! Client Approved the Design!</h2>
              <p>Hi ${user.name},</p>
              <p>Your client has approved the website design for <strong>${lead.businessName}</strong>!</p>
              <p><strong>Approved Design:</strong> ${designName}</p>
              <p><strong>Approved At:</strong> ${new Date(approvedAt).toLocaleString()}</p>
              <p>You can now proceed with the next steps. Visit your lead details to see more information.</p>
              <p><a href="${process.env.FRONTEND_URL || ""}/leads/${lead._id}" style="color: #2563eb;">View lead in ClientScout</a></p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <div style="font-size: 0.9em; color: #666; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
                <p style="margin: 0;">This is an automated notification from ClientScout.</p>
                <p style="margin: 5px 0 0;">Lead: <strong>${lead.businessName}</strong></p>
              </div>
            </div>
          `;

          await sendEmail({
            to: user.email,
            subject: `✅ Design Approved - ${lead.businessName}`,
            html: emailContent,
          });
        }

        const existingApprovalNotif = await Notification.findOne({
          user: lead.user,
          lead: lead._id,
          type: "design_approved",
          isRead: false,
        });

        if (isNewApproval || !existingApprovalNotif) {
          await createNotification(
            lead.user,
            lead._id,
            "design_approved",
            "Design Approved!",
            `Client approved the design: ${designName}`,
            `/leads/${lead._id}`
          );
        }
      } catch (error) {
        console.error("Error sending approval notification:", error);
      }
    }

    // Change request notification
    if (updates.clientChangeRequest && !lead.clientChangeRequest) {
      try {
        const existingChangeNotif = await Notification.findOne({
          user: lead.user,
          lead: lead._id,
          type: "change_request",
          isRead: false,
        });

        if (!existingChangeNotif) {
          await createNotification(
            lead.user,
            lead._id,
            "change_request",
            "Change Request Received",
            `Client requested changes: ${updates.clientChangeRequest}`,
            `/leads/${lead._id}`
          );
        }
      } catch (error) {
        console.error("Error creating change request notification:", error);
      }
    }

    // Return only necessary fields
    res.json({
      _id: updated._id,
      businessName: updated.businessName,
      clientApproved: updated.clientApproved,
      clientApprovedAt: updated.clientApprovedAt,
      clientApprovedLayoutId: updated.clientApprovedLayoutId,
      clientApprovedLayoutName: updated.clientApprovedLayoutName,
      clientChangeRequest: updated.clientChangeRequest,
      clientChangeRequestedAt: updated.clientChangeRequestedAt,
    });
  } catch (error) {
    console.error("Error updating public lead:", error);
    res.status(500).json({ message: "Error updating lead" });
  }
};
