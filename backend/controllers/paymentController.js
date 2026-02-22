import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Config from "../models/Config.js";
import { sendEmail } from "../services/emailService.js";

export const getPaymentConfig = async (req, res) => {
  try {
    const qrConfig = await Config.findOne({ key: "upiQRCode" });
    const idConfig = await Config.findOne({ key: "upiId" });
    
    res.json({
      upiQRCode: qrConfig ? qrConfig.value : "",
      upiId: idConfig ? idConfig.value : ""
    });
  } catch (error) {
    console.error("Error fetching payment config:", error);
    res.status(500).json({ message: "Failed to fetch payment configuration" });
  }
};

export const purchaseCredits = async (req, res) => {
  try {
    const { type, credits, amount, paymentMethod, transactionId } = req.body;
    const userId = req.user.id; 

    if (!["email", "ai", "map"].includes(type)) {
      return res.status(400).json({ message: "Invalid credit type." });
    }

    if (!credits || credits <= 0) {
      return res.status(400).json({ message: "Invalid credits amount." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // For UPI, create PENDING transaction and DO NOT add credits yet
    if (paymentMethod === "upi") {
      const transaction = await Transaction.create({
        user: userId,
        type,
        amount: amount || 0, // Price
        credits, // Number of credits
        paymentMethod: "upi",
        transactionId: transactionId,
        status: "pending",
        currency: "INR"
      });

      // Notify Admins
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
                  <p><strong>Package:</strong> ${credits} ${type === 'ai' ? 'AI Calls' : type === 'map' ? 'Map Searches' : 'Email Credits'}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/transactions" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Transactions</a>
                </div>
                
                <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">ClientScout Admin Notification</p>
              </div>
            `
          });
        }
      } catch (emailError) {
        console.error("Failed to send admin notification email:", emailError);
        // Don't fail the request if email fails
      }

      return res.status(200).json({
        message: "Payment submitted for verification. Credits will be added once approved.",
        status: "pending"
      });
    }

    // For other methods (future), process immediately
    if (type === "email") {
      user.extraEmailCredits = (user.extraEmailCredits || 0) + credits;
    } else if (type === "ai") {
      user.extraAICallsCredits = (user.extraAICallsCredits || 0) + credits;
    } else if (type === "map") {
      user.extraMapSearchCredits = (user.extraMapSearchCredits || 0) + credits;
    }

    await user.save();

    await Transaction.create({
      user: userId,
      type,
      amount: amount || 0,
      credits,
      paymentMethod: paymentMethod || "other",
      transactionId: transactionId || `TXN-${Date.now()}`,
      status: "completed",
      currency: "INR"
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
