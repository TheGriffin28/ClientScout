import mongoose from "mongoose";

const transactionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      enum: ["email", "ai", "map", "bundle"],
    },
    amount: {
      type: Number,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
    bundleId: {
      type: String,
    },
    bundleCredits: {
      email: { type: Number },
      ai: { type: Number },
      map: { type: Number },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["upi", "card", "other"],
      default: "upi",
    },
    transactionId: {
      type: String,
      required: function () {
        return this.paymentMethod === "upi";
      },
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    currency: {
      type: String,
      default: "INR",
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
