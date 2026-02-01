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

    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
