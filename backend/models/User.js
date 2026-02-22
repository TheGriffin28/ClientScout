import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    socialLinks: {
      facebook: { type: String, default: "" },
      x: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },
    address: {
      country: { type: String, default: "" },
      cityState: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      taxId: { type: String, default: "" },
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    aiUsageCount: { type: Number, default: 0 },
    lastAIUsedAt: { type: Date },
    mapSearchCount: { type: Number, default: 0 },
    lastMapSearchAt: { type: Date },
    emailUsageCount: { type: Number, default: 0 },
    lastEmailSentAt: { type: Date },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
    otp: String,
    otpExpires: Date,
    isVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    maxMonthlyEmailsPerUser: { type: Number }, // Limit of emails per month (overrides global config)
    maxMonthlyAICallsPerUser: { type: Number }, // Limit of AI calls per month (overrides global config)
    maxMonthlyMapSearchesPerUser: { type: Number }, // Limit of map searches per month (overrides global config)
    extraEmailCredits: { type: Number, default: 0 }, // Extra credits purchased for emails
    extraAICallsCredits: { type: Number, default: 0 }, // Extra credits purchased for AI calls
    extraMapSearchCredits: { type: Number, default: 0 }, // Extra credits purchased for map searches
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
