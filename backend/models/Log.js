import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "USER_SIGNUP",
        "USER_DISABLED",
        "USER_ENABLED",
        "ROLE_CHANGE",
        "AI_ERROR",
        "AI_ACTION",
        "ADMIN_LOGIN",
        "CONFIG_CHANGE"
      ]
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const Log = mongoose.model("Log", logSchema);
export default Log;
