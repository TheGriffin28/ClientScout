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
      enum: ["email", "ai", "map"],
    },
    amount: {
      type: Number,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["upi", "card", "other"],
      default: "upi",
    },
    transactionId: {
      type: String,
      required: function() {
        return this.paymentMethod === "upi";
      },
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed", // Since we are simulating instant purchase for now
    },
    currency: {
      type: String,
      default: "INR",
    }
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
