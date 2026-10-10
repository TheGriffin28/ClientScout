import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../services/emailService.js";

export const generateAndSendOTP = async (user) => {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the OTP
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  // Set OTP expiration to 10 minutes
  const otpExpires = Date.now() + 10 * 60 * 1000; 

  // Save hashed OTP and expiration to user document
  user.otp = hashedOtp;
  user.otpExpires = otpExpires;
  await user.save();

  // Send OTP via email
  await sendEmail({
    to: user.email,
    subject: "Your OTP for ClientScout",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">One-Time Password (OTP)</h2>
        <p>Hello ${user.name},</p>
        <p>Your One-Time Password (OTP) for ClientScout is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #f0f0f0; color: #333; padding: 15px 25px; font-size: 24px; letter-spacing: 5px; border-radius: 5px; font-weight: bold;">${otp}</span>
        </div>
        <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">ClientScout Team</p>
      </div>
    `,
  });
};

export const verifyOTP = async (user, otp) => {
  if (!user.otp || !user.otpExpires) {
    return { success: false, message: "OTP not requested or expired." };
  }

  if (user.otpExpires < Date.now()) {
    return { success: false, message: "OTP has expired." };
  }

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  if (hashedOtp !== user.otp) {
    return { success: false, message: "Invalid OTP." };
  }

  // Clear OTP after successful verification
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return { success: true, message: "OTP verified successfully." };
};