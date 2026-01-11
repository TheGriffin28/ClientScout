import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    businessName: { type: String, required: true },
    contactName: String,
    email: String,
    phone: String,
    website: String,
    source: {
      type: String,
      default: "Manual"
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "FollowUp", "Interested", "Converted", "Lost"],
      default: "New",
    },

    notes: String,
    nextFollowUp: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
