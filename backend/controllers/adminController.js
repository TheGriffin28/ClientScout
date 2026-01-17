import User from "../models/User.js";
import Lead from "../models/Lead.js";
import Config from "../models/Config.js";
import Log from "../models/Log.js";
import { logAdminAction } from "../utils/logger.js";

/* 📊 DASHBOARD STATS */
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLeads = await Lead.countDocuments();
    
    // Active users in last 7 days (based on lastLoginAt)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await User.countDocuments({ 
      lastLoginAt: { $gte: sevenDaysAgo } 
    });

    // Total AI usage (sum of aiUsageCount from all users)
    const aiUsageResult = await User.aggregate([
      { $group: { _id: null, totalUsage: { $sum: "$aiUsageCount" } } }
    ]);
    const aiUsageCount = aiUsageResult.length > 0 ? aiUsageResult[0].totalUsage : 0;

    res.json({
      totalUsers,
      activeUsers,
      totalLeads,
      aiUsageCount
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: error.message });
  }
};

/* 👤 USER MANAGEMENT */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    
    // Transform to match frontend AdminUser interface if needed
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      aiUsageCount: user.aiUsageCount || 0,
      lastLoginAt: user.lastLoginAt,
      lastAIUsedAt: user.lastAIUsedAt
    }));

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = isActive;
    await user.save();

    // Log user status change
    await logAdminAction({
      action: isActive ? "USER_ENABLED" : "USER_DISABLED",
      userId: user._id,
      adminId: req.user._id,
      details: { email: user.email }
    });

    res.json({ message: `User ${user.name} status updated to ${isActive ? "active" : "suspended"}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    // Log user role change
    await logAdminAction({
      action: "ROLE_CHANGE",
      userId: user._id,
      adminId: req.user._id,
      details: { email: user.email, newRole: role }
    });

    res.json({ message: `User ${user.name} role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ⚙️ CONFIGURATION / FEATURE FLAGS */
export const getConfigs = async (req, res) => {
  try {
    const configs = await Config.find({});
    
    // Seed default configs if none exist
    if (configs.length === 0) {
      const defaults = [
        { key: "enableAIEnrichment", value: true, description: "Enable AI-powered lead enrichment", category: "features" },
        { key: "enableWhatsAppDrafts", value: true, description: "Enable WhatsApp message drafting", category: "features" },
        { key: "maxDailyAICallsPerUser", value: 50, description: "Max AI calls per user per day", category: "limits" }
      ];
      try {
        const created = await Config.insertMany(defaults);
        return res.json(created);
      } catch (insertError) {
        console.error("Failed to seed configs:", insertError);
        // Fallback: return empty array or try to proceed
        return res.json([]);
      }
    }
    
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const oldConfig = await Config.findOne({ key });
    
    const config = await Config.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true }
    );

    // Log config change
    await logAdminAction({
      action: "CONFIG_CHANGE",
      adminId: req.user._id,
      details: { 
        key, 
        oldValue: oldConfig ? oldConfig.value : null, 
        newValue: value 
      }
    });

    res.json(config);
  } catch (error) {
    console.error("Error updating config:", error);
    res.status(500).json({ message: error.message });
  }
};

/* 📊 AI USAGE DETAILS */
export const getAIUsageStats = async (req, res) => {
  try {
    const users = await User.find({})
      .select("name email aiUsageCount lastLoginAt lastAIUsedAt")
      .sort({ aiUsageCount: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 📜 ADMIN LOGS */
export const getAdminLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await Log.find({})
      .populate("userId", "name email")
      .populate("adminId", "name email")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Log.countDocuments();

    res.json({
      logs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
