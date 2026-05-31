import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Config from "../models/Config.js";
import { sendEmail } from "../services/emailService.js";
import {
  resolveBundleCredits,
  applyCreditsToUser,
  formatPackageLabel,
} from "../constants/pricingDefaults.js";

export const getPaymentConfig = async (req, res) => {
  try {
    const qrConfig = await Config.findOne({ key: "upiQRCode" });
    const idConfig = await Config.findOne({ key: "upiId" });

    res.json({
      upiQRCode: qrConfig ? qrConfig.value : "",
      upiId: idConfig ? idConfig.value : "",
    });
  } catch (error) {
    console.error("Error fetching payment config:", error);
    res.status(500).json({ message: "Failed to fetch payment configuration" });
  }
};

export const purchaseCredits = async (req, res) => {
  try {
    const { type, credits, amount, paymentMethod, transactionId, bundleId, bundleCredits: rawBundleCredits } =
      req.body;
    const userId = req.user.id;

    const isBundle = type === "bundle" || (typeof type === "string" && type.startsWith("bundle_"));
    const resolvedBundleId = isBundle ? (type === "bundle" ? bundleId : type) : null;
    const bundleCredits = isBundle ? resolveBundleCredits(resolvedBundleId, rawBundleCredits) : null;

    if (isBundle) {
      if (!bundleCredits) {
        return res.status(400).json({ message: "Invalid bundle package." });
      }
    } else if (!["email", "ai", "map"].includes(type)) {
      return res.status(400).json({ message: "Invalid credit type." });
    }

    if (!isBundle && (!credits || credits <= 0)) {
      return res.status(400).json({ message: "Invalid credits amount." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transactionType = isBundle ? "bundle" : type;
    const creditCount = isBundle
      ? bundleCredits.email + bundleCredits.ai + bundleCredits.map
      : credits;

    const packageLabel = formatPackageLabel(transactionType, credits, bundleCredits, resolvedBundleId);

    const transactionPayload = {
      user: userId,
      type: transactionType,
      amount: amount || 0,
      credits: creditCount,
      paymentMethod: paymentMethod || "upi",
      transactionId,
      status: paymentMethod === "upi" ? "pending" : "completed",
      currency: "INR",
      ...(isBundle && {
        bundleId: resolvedBundleId,
        bundleCredits,
      }),
    };

    if (paymentMethod === "upi") {
      await Transaction.create(transactionPayload);

      try {
        const admins = await User.find({ role: "admin" });
        for (const admin of admins) {
          await sendEmail({
            to: admin.email,
            subject: "New UPI Payment Pending Approval",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #4f46e5; text-align: center;">New Payment Received</h2>
                <p>Hello Admin,</p>
                <p>A user has submitted a UPI payment. Please verify the transaction and approve it in the admin panel.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>User:</strong> ${user.name} (${user.email})</p>
                  <p><strong>Transaction ID:</strong> <span style="font-family: monospace; background: #eee; padding: 2px 5px; border-radius: 3px;">${transactionId}</span></p>
                  <p><strong>Amount:</strong> ₹${amount}</p>
                  <p><strong>Package:</strong> ${packageLabel}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/admin/transactions" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Transactions</a>
                </div>
                
                <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">ClientScout Admin Notification</p>
              </div>
            `,
          });
        }
      } catch (emailError) {
        console.error("Failed to send admin notification email:", emailError);
      }

      return res.status(200).json({
        message: "Payment submitted for verification. Credits will be added once approved.",
        status: "pending",
      });
    }

    applyCreditsToUser(user, transactionType, credits, bundleCredits);
    await user.save();

    await Transaction.create({
      ...transactionPayload,
      transactionId: transactionId || `TXN-${Date.now()}`,
      status: "completed",
    });

    res.status(200).json({
      message: "Credits purchased successfully",
      status: "completed",
      credits: {
        extraEmailCredits: user.extraEmailCredits,
        extraAICallsCredits: user.extraAICallsCredits,
        extraMapSearchCredits: user.extraMapSearchCredits,
      },
    });
  } catch (error) {
    console.error("Purchase error:", error);
    res.status(500).json({ message: "Server error during purchase" });
  }
};
