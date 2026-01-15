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
    industry: String,
    businessType: String,
    websiteObservations: {
      performanceIssues: [String],
      trustIssues: [String],
      conversionIssues: [String]
    },
    painPoints: [String],
    aiSummary: String,
    leadScore: { type: Number, min: 1, max: 5 },
    leadScoreReason: String,
    aiGeneratedAt: Date,

    emailDraft: {
      subject: String,
      body: String,
      generatedAt: Date
    },
    whatsappDraft: {
      body: String,
      generatedAt: Date
    },

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
    lastContactedAt: Date,
  },
  { timestamps: true }
);

leadSchema.virtual('calculatedScore').get(function() {
  let score = this.leadScore || 0; // Start with AI leadScore

  // Adjust based on status
  switch (this.status) {
    case "New":
      score += 0;
      break;
    case "Contacted":
      score += 1;
      break;
    case "FollowUp":
      score += 2;
      break;
    case "Interested":
      score += 3;
      break;
    case "Converted":
      score += 5;
      break;
    case "Lost":
      score -= 3; // Penalize lost leads
      break;
    default:
      break;
  }

  // Adjust based on last contact date
  if (this.lastContactedAt) {
    const daysSinceLastContact = (new Date() - new Date(this.lastContactedAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceLastContact < 7) {
      score += 1; // Recently contacted
    } else if (daysSinceLastContact > 30) {
      score -= 1; // Stale contact
    }
  }

  // Adjust based on overdue follow-up
  if (this.nextFollowUp && new Date(this.nextFollowUp) < new Date()) {
    score -= 1; // Overdue follow-up
  }

  // Ensure score stays within a reasonable range, e.g., 0-10
  return Math.max(0, Math.min(10, score));
});

leadSchema.virtual('scoreCategory').get(function() {
  const calculatedScore = this.calculatedScore;
  if (calculatedScore >= 7) {
    return "Hot";
  } else if (calculatedScore >= 4) {
    return "Warm";
  } else {
    return "Cold";
  }
});

export default mongoose.model("Lead", leadSchema);
