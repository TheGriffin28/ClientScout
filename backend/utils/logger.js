import Log from "../models/Log.js";

export const logAdminAction = async ({ action, userId, adminId, details }) => {
  try {
    await Log.create({
      action,
      userId,
      adminId,
      details,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Failed to save admin log:", error);
  }
};
