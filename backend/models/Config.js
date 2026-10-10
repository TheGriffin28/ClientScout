import mongoose from "mongoose";

const configSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: false, // Changed from true to allow false/0 values
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      default: "general",
    }
  },
  { timestamps: true }
);

const Config = mongoose.model("Config", configSchema);
export default Config;
